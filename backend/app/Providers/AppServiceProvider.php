<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->configureRateLimiters();
    }

    private function configureRateLimiters(): void
    {
        // Login: 10 attempts per minute per IP (DB-level block handles per-account)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Registration: 5 attempts per minute per IP
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Email code verification: 10 attempts per minute per email+IP
        RateLimiter::for('verify-code', function (Request $request) {
            $key = $request->input('email', '') . '|' . $request->ip();
            return Limit::perMinute(10)->by($key);
        });

        // Resend code: 3 attempts per 10 minutes per email+IP
        RateLimiter::for('resend-code', function (Request $request) {
            $key = $request->input('email', '') . '|' . $request->ip();
            return Limit::perMinutes(10, 3)->by($key);
        });

        // Forgot password: 3 requests per 10 minutes per email+IP
        RateLimiter::for('forgot-password', function (Request $request) {
            $key = $request->input('email', '') . '|' . $request->ip();
            return Limit::perMinutes(10, 3)->by($key);
        });

        // Reset password: 5 attempts per minute per IP
        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Change password (authenticated): 5 attempts per minute per user ID
        RateLimiter::for('change-password', function (Request $request) {
            $key = $request->user()?->id ?? $request->ip();
            return Limit::perMinute(5)->by($key);
        });

        // Request email change: 3 attempts per 10 minutes per user ID
        RateLimiter::for('request-email-change', function (Request $request) {
            $key = $request->user()?->id ?? $request->ip();
            return Limit::perMinutes(10, 3)->by($key);
        });

        // Confirm email change: 10 attempts per minute per user ID
        RateLimiter::for('confirm-email-change', function (Request $request) {
            $key = $request->user()?->id ?? $request->ip();
            return Limit::perMinute(10)->by($key);
        });

        // Delete account: 3 attempts per 10 minutes per user ID
        RateLimiter::for('delete-account', function (Request $request) {
            $key = $request->user()?->id ?? $request->ip();
            return Limit::perMinutes(10, 3)->by($key);
        });
    }
}
