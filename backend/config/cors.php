<?php

return [

    /*
     * Paths that should be handled by CORS.
     * 'api/*' covers all API routes. 'sanctum/csrf-cookie' is for SPA cookie auth (unused here).
     */
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    /*
     * Specific origin from FRONTEND_URL in .env.
     * Never use '*' in production — the frontend URL must be explicit.
     */
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false because we use Bearer tokens, not cookies
    'supports_credentials' => false,

];
