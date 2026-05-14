<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ─── Cloudflare Stream ────────────────────────────────────────────────────
    'cloudflare_stream' => [
        'account_id'          => env('CLOUDFLARE_ACCOUNT_ID'),
        'signing_key_id'      => env('CLOUDFLARE_STREAM_SIGNING_KEY_ID'),
        // Base64-encoded RSA private key used for signed URL token generation.
        // Generate via: openssl genrsa | base64 (then register the public key in Cloudflare).
        'signing_private_key' => env('CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY'),
        'signed_url_ttl_seconds' => (int) env('CLOUDFLARE_STREAM_SIGNED_URL_TTL_SECONDS', 3600),
    ],

];
