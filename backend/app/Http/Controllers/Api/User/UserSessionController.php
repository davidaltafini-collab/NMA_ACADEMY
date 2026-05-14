<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user           = $request->user();
        $currentSession = $request->attributes->get('user_session');

        $sessions = UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('last_active_at', 'desc')
            ->get()
            ->map(fn (UserSession $s) => $this->formatSession($s, $currentSession));

        return response()->json([
            'success' => true,
            'message' => 'Sesiuni incarcate cu succes.',
            'data'    => [
                'sessions' => $sessions,
            ],
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user           = $request->user();
        $currentSession = $request->attributes->get('user_session');

        $session = UserSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (! $session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea nu a fost gasita.',
            ], 404);
        }

        $isCurrentSession = $currentSession && $session->id === $currentSession->id;

        $session->revoke();

        return response()->json([
            'success' => true,
            'message' => $isCurrentSession
                ? 'Sesiunea curenta a fost revocata. Te rugam sa te autentifici din nou.'
                : 'Dispozitivul a fost deconectat cu succes.',
            'data'    => [
                'revoked_current_session' => $isCurrentSession,
            ],
        ]);
    }

    private function formatSession(UserSession $session, ?UserSession $current): array
    {
        return [
            'id'                 => $session->id,
            'device'             => $session->device_info ?: 'Unknown',
            'ip_address'         => $session->ip_address,
            'last_active_at'     => $session->last_active_at?->toISOString(),
            'created_at'         => $session->created_at->toISOString(),
            'is_current_session' => $current !== null && $session->id === $current->id,
        ];
    }
}
