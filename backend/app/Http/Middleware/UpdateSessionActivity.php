<?php

namespace App\Http\Middleware;

use App\Models\UserSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateSessionActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $currentToken = $user->currentAccessToken();

        if (! $currentToken) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalid.',
            ], 401);
        }

        $session = UserSession::where('sanctum_token_id', $currentToken->id)
            ->where('user_id', $user->id)
            ->first();

        // Session was revoked from another device or by an admin
        if (! $session || ! $session->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea a expirat. Te rugam sa te autentifici din nou.',
                'code'    => 'SESSION_REVOKED',
            ], 401);
        }

        // Keep last_active_at fresh (throttled: only write if > 60s old to save DB writes)
        if ($session->last_active_at->diffInSeconds(now()) > 60) {
            $session->update(['last_active_at' => now()]);
        }

        // Make session available to downstream controllers without a second query
        $request->attributes->set('user_session', $session);

        return $next($request);
    }
}
