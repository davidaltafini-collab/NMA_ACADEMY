<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\DeleteAccountRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Mail\AccountDeletedMail;
use App\Models\EmailLog;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Profil incarcat cu succes.',
            'data'    => [
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update($request->only(['name', 'phone']));
        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Profilul a fost actualizat cu succes.',
            'data'    => [
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
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

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all sessions and tokens except the current one
        $currentTokenId   = $user->currentAccessToken()->id;
        $currentSession   = $request->attributes->get('user_session');

        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('id', '!=', $currentSession->id)
            ->update(['is_active' => false, 'revoked_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Parola a fost schimbata cu succes.',
        ]);
    }

    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Date invalide.',
                'errors'  => [
                    'password' => ['Parola este incorecta.'],
                ],
            ], 422);
        }

        // Capture email and name before wiping state
        $userEmail = $user->email;
        $userName  = $user->name;

        // Revoke all tokens and sessions first
        $user->tokens()->delete();
        UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false, 'revoked_at' => now()]);

        // Clear sensitive pending/security fields
        $user->update([
            'status'                                   => 'suspended',
            'email_verification_code'                  => null,
            'email_verification_expires_at'            => null,
            'email_verification_attempts'              => 0,
            'email_verification_blocked_until'         => null,
            'failed_login_attempts'                    => 0,
            'login_blocked_until'                      => null,
            'pending_email'                            => null,
            'pending_email_verification_code'          => null,
            'pending_email_verification_expires_at'    => null,
            'pending_email_verification_attempts'      => 0,
            'pending_email_verification_blocked_until' => null,
        ]);

        // Soft-delete the user record
        $user->delete();

        // Send notification email (best-effort)
        $this->sendAccountDeletedEmail($userEmail, $userName);

        return response()->json([
            'success' => true,
            'message' => 'Contul tau a fost sters cu succes.',
        ]);
    }

    private function sendAccountDeletedEmail(string $email, string $name): void
    {
        $subject      = 'Contul tau a fost sters';
        $status       = 'sent';
        $errorMessage = null;

        try {
            Mail::to($email)->send(new AccountDeletedMail($name));
        } catch (\Throwable $e) {
            $status       = 'failed';
            $errorMessage = $e->getMessage();
        }

        // user_id is NULL here since the user is soft-deleted — log without FK
        EmailLog::create([
            'user_id'         => null,
            'email_type'      => 'account_deleted',
            'recipient_email' => $email,
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
}
