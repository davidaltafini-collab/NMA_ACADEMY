<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Pure Bearer-token API — no Sanctum stateful (cookie) middleware needed.
        // CORS is handled globally by HandleCors via config/cors.php.
        $middleware->alias([
            'session.activity' => \App\Http\Middleware\UpdateSessionActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // 404 — return JSON instead of HTML for API routes
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resursa nu a fost gasita.',
                ], 404);
            }
        });

        // 422 — validation errors as consistent JSON
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Date invalide.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        // 429 — throttle errors as JSON (frontend may not send Accept: application/json)
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*')) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
                return response()->json([
                    'success' => false,
                    'message' => 'Prea multe cereri. Incearca din nou mai tarziu.',
                    'retry_after' => (int) $retryAfter,
                ], 429);
            }
        });

    })->create();
