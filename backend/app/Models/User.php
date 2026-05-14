<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'email_verified_at',
        'email_verification_code',
        'email_verification_expires_at',
        'email_verification_attempts',
        'email_verification_blocked_until',
        'failed_login_attempts',
        'login_blocked_until',
        'marketing_consent',
        'terms_accepted_at',
        'last_login_at',
        'pending_email',
        'pending_email_verification_code',
        'pending_email_verification_expires_at',
        'pending_email_verification_attempts',
        'pending_email_verification_blocked_until',
    ];

    protected $hidden = [
        'password',
        'email_verification_code',
        'pending_email_verification_code',
    ];

    protected function casts(): array
    {
        return [
            'password'                         => 'hashed',
            'email_verified_at'                => 'datetime',
            'email_verification_expires_at'    => 'datetime',
            'email_verification_blocked_until' => 'datetime',
            'login_blocked_until'              => 'datetime',
            'terms_accepted_at'                => 'datetime',
            'last_login_at'                    => 'datetime',
            'marketing_consent'                => 'boolean',
            'pending_email_verification_expires_at'    => 'datetime',
            'pending_email_verification_blocked_until' => 'datetime',
        ];
    }

    // ─── Relations ───────────────────────────────────────────────────────────

    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    public function userCourses(): HasMany
    {
        return $this->hasMany(UserCourse::class);
    }

    public function videoProgress(): HasMany
    {
        return $this->hasMany(UserVideoProgress::class);
    }

    public function videoWatchSessions(): HasMany
    {
        return $this->hasMany(VideoWatchSession::class);
    }

    public function activeSessions(): HasMany
    {
        return $this->hasMany(UserSession::class)->where('is_active', true);
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class);
    }

    // ─── State helpers ────────────────────────────────────────────────────────

    public function isVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function isLoginBlocked(): bool
    {
        return $this->login_blocked_until !== null
            && $this->login_blocked_until->isFuture();
    }

    public function isVerificationBlocked(): bool
    {
        return $this->email_verification_blocked_until !== null
            && $this->email_verification_blocked_until->isFuture();
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }
}
