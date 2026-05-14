<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Mail\PasswordResetMail;
use App\Models\EmailLog;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    // ─── Forgot password ──────────────────────────────────────────────────────

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $generic = response()->json([
            'success' => true,
            'message' => 'Daca adresa exista in sistem, vei primi instructiuni pentru resetarea parolei.',
        ]);

        $user = User::where('email', $request->email)
            ->where('status', 'active')
            ->whereNotNull('email_verified_at')
            ->first();

        if (! $user) {
            return $generic;
        }

        // Use Laravel's broker to create and store the token (hashed internally)
        $token = Password::broker()->createToken($user);

        $resetUrl = rtrim(config('app.frontend_url'), '/') . '/reset-password'
            . '?email=' . urlencode($user->email)
            . '&token=' . $token;

        $this->sendResetEmail($user, $resetUrl);

        return $generic;
    }

    // ─── Reset password ───────────────────────────────────────────────────────

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker()->reset(
            [
                'email'                 => $request->email,
                'token'                 => $request->token,
                'password'              => $request->password,
                'password_confirmation' => $request->password_confirmation,
            ],
            function (User $user, string $password) {
                $user->update(['password' => Hash::make($password)]);
                $this->revokeAllSessions($user);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Parola a fost resetata cu succes. Te poti autentifica.',
            ]);
        }

        $message = match ($status) {
            Password::INVALID_TOKEN => 'Token-ul este invalid sau a expirat.',
            Password::INVALID_USER  => 'Nu am gasit un cont cu aceasta adresa.',
            Password::RESET_THROTTLED => 'Prea multe cereri. Incearca din nou mai tarziu.',
            default                 => 'A aparut o eroare. Incearca din nou.',
        };

        return response()->json([
            'success' => false,
            'message' => $message,
        ], 422);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function revokeAllSessions(User $user): void
    {
        // Delete all Sanctum tokens — DB ON DELETE SET NULL clears the FK in user_sessions
        $user->tokens()->delete();

        // Mark all active sessions as revoked
        UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false, 'revoked_at' => now()]);
    }

    private function sendResetEmail(User $user, string $resetUrl): void
    {
        $subject      = 'Resetarea parolei — NMA Academy';
        $status       = 'sent';
        $errorMessage = null;

        try {
            Mail::to($user->email)->send(new PasswordResetMail($resetUrl, $user->name));
        } catch (\Throwable $e) {
            $status       = 'failed';
            $errorMessage = $e->getMessage();
        }

        EmailLog::create([
            'user_id'         => $user->id,
            'email_type'      => 'password_reset',
            'recipient_email' => $user->email,
            'subject'         => $subject,
            'status'          => $status,
            'error_message'   => $errorMessage,
            'sent_at'         => now(),
        ]);
    }
}
