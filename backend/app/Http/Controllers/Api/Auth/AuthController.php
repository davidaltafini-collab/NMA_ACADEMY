<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationCodeRequest;
use App\Http\Requests\Auth\VerifyEmailCodeRequest;
use App\Mail\VerificationCodeMail;
use App\Models\EmailLog;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // ─── Register ─────────────────────────────────────────────────────────────

    public function register(RegisterRequest $request): JsonResponse
    {
        $code       = $this->generateVerificationCode();
        $hashedCode = hash('sha256', $code);

        $user = User::create([
            'name'                          => $request->name,
            'email'                         => $request->email,
            'phone'                         => $request->phone,
            'password'                      => $request->password,
            'status'                        => 'unverified',
            'email_verification_code'       => $hashedCode,
            'email_verification_expires_at' => now()->addHour(),
            'email_verification_attempts'   => 0,
        ]);

        $this->sendVerificationCode($user, $code);

        return response()->json([
            'success' => true,
            'message' => 'Contul a fost creat. Te rugam sa verifici adresa de email folosind codul primit.',
            'data'    => [
                'email'                => $user->email,
                'requires_verification' => true,
            ],
        ], 201);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        // Generic message for unknown email — no information leak
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Date de autentificare incorecte.',
            ], 401);
        }

        // Per-account brute-force block (set after 5 wrong passwords)
        if ($user->isLoginBlocked()) {
            $retryAfter = (int) now()->diffInSeconds($user->login_blocked_until, false);

            return response()->json([
                'success'     => false,
                'message'     => 'Prea multe incercari esuate. Contul este blocat temporar.',
                'retry_after' => max(0, $retryAfter),
            ], 429);
        }

        // Verify password
        if (! Hash::check($request->password, $user->password)) {
            $user->increment('failed_login_attempts');
            $user->refresh();

            if ($user->failed_login_attempts >= 5) {
                $user->update(['login_blocked_until' => now()->addMinutes(15)]);

                return response()->json([
                    'success'     => false,
                    'message'     => 'Prea multe incercari esuate. Contul este blocat pentru 15 minute.',
                    'retry_after' => 900,
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => 'Date de autentificare incorecte.',
            ], 401);
        }

        // Credentials correct — now check account state

        if ($user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'Contul tau a fost suspendat. Contacteaza suportul.',
            ], 403);
        }

        if (! $user->isVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Adresa de email nu este verificata. Verifica-ti inbox-ul.',
                'data'    => [
                    'requires_verification' => true,
                    'email'                 => $user->email,
                ],
            ], 403);
        }

        // Enforce 3-session limit — evict oldest active session
        $this->enforceSessionLimit($user);

        // Reset brute-force counters
        $user->update([
            'failed_login_attempts' => 0,
            'login_blocked_until'   => null,
            'last_login_at'         => now(),
        ]);

        // Issue Sanctum token
        $tokenResult = $user->createToken('auth');
        $plainToken  = $tokenResult->plainTextToken;
        $tokenId     = $tokenResult->accessToken->id;

        // Record the session
        // config() returns strings from .env — cast explicitly before passing to Carbon
        $expirationMinutes = (int) config('sanctum.expiration', 0) ?: null;

        UserSession::create([
            'user_id'            => $user->id,
            'sanctum_token_id'   => $tokenId,
            'ip_address'         => $request->ip(),
            'user_agent'         => $request->userAgent() ?? '',
            'device_fingerprint' => $request->input('device_fingerprint'),
            'device_info'        => $this->parseDeviceInfo($request->userAgent()),
            'is_active'          => true,
            'last_active_at'     => now(),
            'expires_at'         => $expirationMinutes ? now()->addMinutes($expirationMinutes) : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Autentificare reusita.',
            'data'    => [
                'token'      => $plainToken,
                'token_type' => 'Bearer',
                'user'       => $this->formatUser($user),
            ],
        ]);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        // Revoke session and delete Sanctum token
        $session = UserSession::where('sanctum_token_id', $token->id)
            ->where('user_id', $request->user()->id)
            ->first();

        $session?->revoke();

        // Ensure token is deleted even if no session row found
        if ($session === null) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Te-ai deconectat cu succes.',
        ]);
    }

    // ─── Current user ─────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'user' => $this->formatUser($request->user()),
            ],
        ]);
    }

    // ─── Verify email code ────────────────────────────────────────────────────

    public function verifyEmailCode(VerifyEmailCodeRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Cod sau adresa de email invalide.',
            ], 422);
        }

        if ($user->isVerified()) {
            return response()->json([
                'success' => true,
                'message' => 'Adresa de email este deja verificata.',
            ]);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'Acest cont a fost suspendat.',
            ], 403);
        }

        if ($user->isVerificationBlocked()) {
            return response()->json([
                'success' => false,
                'message' => 'Prea multe incercari incorecte. Incearca din nou mai tarziu.',
            ], 429);
        }

        if (
            ! $user->email_verification_code ||
            ! $user->email_verification_expires_at ||
            $user->email_verification_expires_at->isPast()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Codul a expirat sau nu a fost generat. Solicita un nou cod.',
            ], 422);
        }

        $inputCode   = strtoupper(trim($request->code));
        $hashedInput = hash('sha256', $inputCode);

        if (! hash_equals($user->email_verification_code, $hashedInput)) {
            $user->increment('email_verification_attempts');
            $user->refresh();

            if ($user->email_verification_attempts >= 5) {
                $user->update([
                    'email_verification_blocked_until' => now()->addMinutes(15),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Prea multe incercari incorecte. Contul este blocat temporar pentru 15 minute.',
                ], 429);
            }

            $remaining = 5 - $user->email_verification_attempts;

            return response()->json([
                'success' => false,
                'message' => "Cod incorect. Mai ai {$remaining} " . ($remaining === 1 ? 'incercare' : 'incercari') . '.',
            ], 422);
        }

        $user->update([
            'email_verified_at'                => now(),
            'status'                           => 'active',
            'email_verification_code'          => null,
            'email_verification_expires_at'    => null,
            'email_verification_attempts'      => 0,
            'email_verification_blocked_until' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Adresa de email a fost verificata cu succes. Te poti autentifica.',
        ]);
    }

    // ─── Resend verification code ─────────────────────────────────────────────

    public function resendVerificationCode(ResendVerificationCodeRequest $request): JsonResponse
    {
        $genericResponse = response()->json([
            'success' => true,
            'message' => 'Daca adresa exista si necesita verificare, a fost trimis un nou cod.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || $user->isVerified() || $user->isSuspended()) {
            return $genericResponse;
        }

        $code       = $this->generateVerificationCode();
        $hashedCode = hash('sha256', $code);

        $user->update([
            'email_verification_code'          => $hashedCode,
            'email_verification_expires_at'    => now()->addHour(),
            'email_verification_attempts'      => 0,
            'email_verification_blocked_until' => null,
        ]);

        $this->sendVerificationCode($user, $code);

        return $genericResponse;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Enforce maximum 3 active sessions. Evicts the oldest if already at limit.
     * Eviction (not rejection) gives better UX — user stays logged in on current device
     * while stale/forgotten sessions are silently cleaned up.
     */
    private function enforceSessionLimit(User $user): void
    {
        $activeSessions = $user->activeSessions()->orderBy('last_active_at', 'asc')->get();

        if ($activeSessions->count() >= 3) {
            $oldest = $activeSessions->first();
            $oldest->revoke();
        }
    }

    /** Safe subset of user fields for API responses. */
    private function formatUser(User $user): array
    {
        return [
            'id'               => $user->id,
            'name'             => $user->name,
            'email'            => $user->email,
            'phone'            => $user->phone,
            'role'             => $user->role,
            'status'           => $user->status,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
        ];
    }

    /** Minimal user-agent parse — no external dependencies. */
    private function parseDeviceInfo(?string $ua): string
    {
        if (! $ua) {
            return 'Unknown';
        }

        $browser = match (true) {
            str_contains($ua, 'Edg')                                     => 'Edge',
            str_contains($ua, 'Chrome') && ! str_contains($ua, 'Chromium') => 'Chrome',
            str_contains($ua, 'Firefox')                                 => 'Firefox',
            str_contains($ua, 'Safari') && ! str_contains($ua, 'Chrome') => 'Safari',
            default                                                      => 'Browser',
        };

        $os = match (true) {
            str_contains($ua, 'Windows') => 'Windows',
            str_contains($ua, 'iPhone') || str_contains($ua, 'iPad') => 'iOS',
            str_contains($ua, 'Android') => 'Android',
            str_contains($ua, 'Mac')     => 'macOS',
            str_contains($ua, 'Linux')   => 'Linux',
            default                      => 'Unknown OS',
        };

        return "{$browser} on {$os}";
    }

    /**
     * Generate a 6-character uppercase alphanumeric code.
     * Guarantees at least one letter and one digit.
     * Excludes visually ambiguous characters (0, O, 1, I).
     */
    private function generateVerificationCode(): string
    {
        $letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        $digits  = '23456789';
        $all     = $letters . $digits;

        $chars = [
            $letters[random_int(0, strlen($letters) - 1)],
            $digits[random_int(0, strlen($digits) - 1)],
        ];

        for ($i = 0; $i < 4; $i++) {
            $chars[] = $all[random_int(0, strlen($all) - 1)];
        }

        shuffle($chars);

        return implode('', $chars);
    }

    /** Send the verification code email and write an email_logs row. */
    private function sendVerificationCode(User $user, string $code): void
    {
        $subject      = 'Codul tău de verificare — NMA Academy';
        $status       = 'sent';
        $errorMessage = null;

        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Throwable $e) {
            $status       = 'failed';
            $errorMessage = $e->getMessage();
        }

        EmailLog::create([
            'user_id'         => $user->id,
            'email_type'      => 'verification_code',
            'recipient_email' => $user->email,
            'subject'         => $subject,
            'status'          => $status,
            'error_message'   => $errorMessage,
            'sent_at'         => now(),
        ]);
    }
}
