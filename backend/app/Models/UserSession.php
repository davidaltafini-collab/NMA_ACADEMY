<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\PersonalAccessToken;

class UserSession extends Model
{
    protected $fillable = [
        'user_id',
        'sanctum_token_id',
        'ip_address',
        'user_agent',
        'device_fingerprint',
        'device_info',
        'is_active',
        'last_active_at',
        'expires_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'      => 'boolean',
            'last_active_at' => 'datetime',
            'expires_at'     => 'datetime',
            'revoked_at'     => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accessToken(): BelongsTo
    {
        return $this->belongsTo(PersonalAccessToken::class, 'sanctum_token_id');
    }

    /** Deactivate this session and delete the linked Sanctum token. */
    public function revoke(): void
    {
        // Delete the Sanctum token first; nullOnDelete() will null the FK on this row,
        // so we update is_active separately after.
        if ($this->sanctum_token_id) {
            PersonalAccessToken::where('id', $this->sanctum_token_id)->delete();
        }

        $this->update([
            'is_active'  => false,
            'revoked_at' => now(),
        ]);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
