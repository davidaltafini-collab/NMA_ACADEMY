<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Admin\AdminCourseController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Course\PublicCourseController;
use App\Http\Controllers\Api\Course\UserCourseController;
use App\Http\Controllers\Api\Course\VideoEventController;
use App\Http\Controllers\Api\Course\VideoPlaybackController;
use App\Http\Controllers\Api\Course\VideoProgressController;
use App\Http\Controllers\Api\Course\WatchSessionController;
use App\Http\Controllers\Api\User\EmailChangeController;
use App\Http\Controllers\Api\User\UserProfileController;
use App\Http\Controllers\Api\User\UserSessionController;
use Illuminate\Support\Facades\Route;

// ─── Health check ─────────────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'version' => '1.0']));

// ─── Public course endpoints ──────────────────────────────────────────────────
Route::get('/courses',        [PublicCourseController::class, 'index']);
Route::get('/courses/{slug}', [PublicCourseController::class, 'show']);

// ─── Video playback access (optionally authenticated) ─────────────────────────
// Free preview videos are accessible without a token.
// Paid videos require a Bearer token + active course access (controller handles 401/403).
Route::get('/videos/{video}/playback', [VideoPlaybackController::class, 'show']);

// ─── Public auth endpoints ────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    Route::post('/verify-email-code', [AuthController::class, 'verifyEmailCode'])
        ->middleware('throttle:verify-code');

    Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode'])
        ->middleware('throttle:resend-code');

    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
        ->middleware('throttle:forgot-password');

    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:reset-password');

});

// ─── Protected auth endpoints (token required) ────────────────────────────────
Route::middleware(['auth:sanctum', 'session.activity'])->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ── User profile ────────────────────────────────────────────────────────
    Route::get('/user/profile',  [UserProfileController::class, 'show']);
    Route::put('/user/profile',  [UserProfileController::class, 'update']);
    Route::post('/user/change-password', [UserProfileController::class, 'changePassword'])
        ->middleware('throttle:change-password');

    // ── User sessions ────────────────────────────────────────────────────────
    Route::get('/user/sessions',        [UserSessionController::class, 'index']);
    Route::delete('/user/sessions/{id}', [UserSessionController::class, 'destroy']);

    // ── Account deletion ─────────────────────────────────────────────────────
    Route::delete('/user/account', [UserProfileController::class, 'deleteAccount'])
        ->middleware('throttle:delete-account');

    // ── Email change ─────────────────────────────────────────────────────────
    Route::post('/user/request-email-change', [EmailChangeController::class, 'request'])
        ->middleware('throttle:request-email-change');
    Route::post('/user/confirm-email-change',  [EmailChangeController::class, 'confirm'])
        ->middleware('throttle:confirm-email-change');
    Route::post('/user/cancel-email-change',   [EmailChangeController::class, 'cancel']);

    // ── User course access ────────────────────────────────────────────────────
    Route::get('/user/courses',                                  [UserCourseController::class, 'index']);
    Route::get('/user/courses/{slug}',                           [UserCourseController::class, 'show']);
    Route::post('/user/courses/{slug}/enroll-test',              [UserCourseController::class, 'enrollTest']);

    // ── Video progress ────────────────────────────────────────────────────────
    Route::post('/user/videos/{video}/progress',                 [VideoProgressController::class, 'save']);
    Route::get('/user/videos/{video}/progress',                  [VideoProgressController::class, 'show']);

    // ── Video player event log ────────────────────────────────────────────────
    Route::post('/user/videos/{video}/event',                    [VideoEventController::class, 'store']);

    // ── Video watch sessions ──────────────────────────────────────────────────
    Route::post('/user/videos/{video}/watch-session/start',      [WatchSessionController::class, 'start']);
    Route::post('/user/videos/{video}/watch-session/heartbeat',  [WatchSessionController::class, 'heartbeat']);
    Route::post('/user/videos/{video}/watch-session/end',        [WatchSessionController::class, 'end']);

    // â”€â”€ Admin course management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Route::get('/admin/courses',                    [AdminCourseController::class, 'index']);
    Route::post('/admin/courses',                   [AdminCourseController::class, 'store']);
    Route::get('/admin/courses/{course}',           [AdminCourseController::class, 'show']);
    Route::put('/admin/courses/{course}',           [AdminCourseController::class, 'update']);
    Route::post('/admin/courses/{course}/duplicate', [AdminCourseController::class, 'duplicate']);
    Route::post('/admin/courses/{course}/archive',   [AdminCourseController::class, 'archive']);

    Route::get('/admin/stats',                       [AdminDashboardController::class, 'stats']);
    Route::get('/admin/users',                       [AdminDashboardController::class, 'users']);
    Route::get('/admin/users/{user}',                [AdminDashboardController::class, 'user']);
    Route::put('/admin/users/{user}/status',         [AdminDashboardController::class, 'updateUserStatus']);
    Route::get('/admin/leads',                       [AdminDashboardController::class, 'leads']);
    Route::post('/admin/email-campaigns',            [AdminDashboardController::class, 'sendEmailCampaign']);

});
