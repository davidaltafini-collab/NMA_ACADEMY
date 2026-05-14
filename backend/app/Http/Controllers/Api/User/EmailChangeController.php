<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ConfirmEmailChangeRequest;
use App\Http\Requests\User\RequestEmailChangeRequest;
use App\Mail\EmailChangeMail;
use App\Models\EmailLog;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailChangeController extends Controller
{
    // ─── Request email change ─────────────────────────────────────────────────

    public function request(RequestEmailChangeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Date invalide.',
                'errors'  => [
                    'current_password' => ['Parola curenta este incorecta.'],
                ],
            ], 422);
        }

        $code       = $this->generateCode();
        $hashedCode = hash('sha256', $code);

        $user->update([
            'pending_email'                            => $request->new_email,
            'pending_email_verification_code'          => $hashedCode,
            'pending_email_verification_expires_at'    => now()->addHour(),
            'pending_email_verification_attempts'      => 0,
            'pending_email_verification_blocked_until' => null,
        ]);

        $this->sendVerificationEmail($user, $request->new_email, $code);

        return response()->json([
            'success' => true,
            'message' => 'Ti-am trimis un cod de verificare pe noua adresa de email.',
        ]);
    }

    // ─── Confirm email change ─────────────────────────────────────────────────

    public function confirm(ConfirmEmailChangeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->pending_email) {
            return response()->json([
                'success' => false,
                'message' => 'Nu exista o cerere de schimbare a emailului in curs.',
            ], 422);
        }

        if (
            $user->pending_email_verification_blocked_until !== null &&
            $user->pending_email_verification_blocked_until->isFuture()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Prea multe incercari incorecte. Incearca din nou mai tarziu.',
            ], 429);
        }

        if (
            ! $user->pending_email_verification_expires_at ||
            $user->pending_email_verification_expires_at->isPast()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Codul a expirat. Solicita un nou cod.',
            ], 422);
        }

        $inputCode   = strtoupper(trim($request->code));
        $hashedInput = hash('sha256', $inputCode);

        if (! hash_equals($user->pending_email_verification_code, $hashedInput)) {
            $user->increment('pending_email_verification_attempts');
            $user->refresh();

            if ($user->pending_email_verification_attempts >= 5) {
                $user->update([
                    'pending_email_verification_blocked_until' => now()->addMinutes(15),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Prea multe incercari incorecte. Incearca din nou dupa 15 minute.',
                ], 429);
            }

            $remaining = 5 - $user->pending_email_verification_attempts;

            return response()->json([
                'success' => false,
                'message' => "Cod incorect. Mai ai {$remaining} " . ($remaining === 1 ? 'incercare' : 'incercari') . '.',
            ], 422);
        }

        // Code is correct — apply the email change
        $newEmail = $user->pending_email;

        $user->update([
            'email'                                    => $newEmail,
            'email_verified_at'                        => now(),
            'pending_email'                            => null,
            'pending_email_verification_code'          => null,
            'pending_email_verification_expires_at'    => null,
            'pending_email_verification_attempts'      => 0,
            'pending_email_verification_blocked_until' => null,
        ]);

        // Revoke all other sessions — email change is a significant event
        $currentTokenId = $user->currentAccessToken()->id;
        $currentSession = $request->attributes->get('user_session');

        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('id', '!=', $currentSession->id)
            ->update(['is_active' => false, 'revoked_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Adresa de email a fost schimbata cu succes.',
            'data'    => [
                'user' => $this->formatUser($user->fresh()),
            ],
        ]);
    }

    // ─── Cancel email change ──────────────────────────────────────────────────

    public function cancel(Request $request): JsonResponse
    {
        $request->user()->update([
            'pending_email'                            => null,
            'pending_email_verification_code'          => null,
            'pending_email_verification_expires_at'    => null,
            'pending_email_verification_attempts'      => 0,
            'pending_email_verification_blocked_until' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schimbarea adresei de email a fost anulata.',
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function sendVerificationEmail($user, string $newEmail, string $code): void
    {
        $subject      = 'Codul tau pentru schimbarea emailului';
        $status       = 'sent';
        $errorMessage = null;

        try {
            Mail::to($newEmail)->send(new EmailChangeMail($code, $user->name));
        } catch (\Throwable $e) {
            $status       = 'failed';
            $errorMessage = $e->getMessage();
        }

        EmailLog::create([
            'user_id'         => $user->id,
            'email_type'      => 'email_change_verification',
            'recipient_email' => $newEmail,
            'subject'         => $subject,
            'status'          => $status,
            'error_message'   => $errorMessage,
            'sent_at'         => now(),
        ]);
    }

    private function formatUser($user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'phone'             => $user->phone,
            'status'            => $user->status,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'created_at'        => $user->created_at->toISOString(),
        ];
    }

    /** 6-character uppercase alphanumeric code — excludes visually ambiguous chars. */
    private function generateCode(): string
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
}
