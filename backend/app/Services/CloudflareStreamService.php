<?php

namespace App\Services;

use App\Models\CourseVideo;

/**
 * Responsible for generating Cloudflare Stream playback data.
 *
 * Two modes:
 *   development — returns the stored cloudflare_playback_url (or null) with no signing.
 *                 Used when CLOUDFLARE_STREAM_SIGNING_KEY_ID / _PRIVATE_KEY are not set.
 *   signed      — generates a short-lived JWT (RS256) that Cloudflare validates on playback.
 *                 Enabled automatically once both signing env vars are non-empty.
 *
 * Keeping this isolated means the signing strategy can be swapped without touching controllers.
 */
class CloudflareStreamService
{
    private readonly bool   $signingEnabled;
    private readonly string $keyId;
    private readonly string $privateKey;
    private readonly int    $ttlSeconds;

    public function __construct()
    {
        $this->keyId          = (string) config('services.cloudflare_stream.signing_key_id', '');
        $this->privateKey     = (string) config('services.cloudflare_stream.signing_private_key', '');
        $this->ttlSeconds     = (int)    config('services.cloudflare_stream.signed_url_ttl_seconds', 3600);
        $this->signingEnabled = $this->keyId !== '' && $this->privateKey !== '';
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Returns the playback block included in the video playback API response.
     * Never includes signing credentials; never logs tokens.
     */
    public function buildPlaybackData(CourseVideo $video): array
    {
        if ($this->signingEnabled) {
            return $this->buildSignedPlaybackData($video);
        }

        return $this->buildDevPlaybackData($video);
    }

    // ─── Development mode ─────────────────────────────────────────────────────

    private function buildDevPlaybackData(CourseVideo $video): array
    {
        // PRODUCTION NOTE: This path is intentionally unsecured.
        // When CLOUDFLARE_STREAM_SIGNING_KEY_ID and CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY
        // are configured, buildSignedPlaybackData() is used instead — never expose this
        // development path in a live environment with real video UIDs.
        return [
            'provider'   => 'cloudflare_stream',
            'type'       => 'development',
            'url'        => $video->cloudflare_playback_url,
            'expires_at' => null,
        ];
    }

    // ─── Signed mode ──────────────────────────────────────────────────────────

    /**
     * Generates a Cloudflare Stream signed token (RS256 JWT) and constructs
     * the manifest URL the player should use.
     *
     * Reference: https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
     */
    private function buildSignedPlaybackData(CourseVideo $video): array
    {
        $expiresAt = now()->addSeconds($this->ttlSeconds);
        $token     = $this->generateSignedToken($video->cloudflare_video_uid, $expiresAt->timestamp);

        // Cloudflare Stream signed HLS manifest URL format.
        // The <token> replaces the video UID when signed URLs are enabled.
        $url = "https://customer-stream.cloudflarestream.com/{$token}/manifest/video.m3u8";

        return [
            'provider'   => 'cloudflare_stream',
            'type'       => 'signed',
            'url'        => $url,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    /**
     * Produces the RS256 JWT required by Cloudflare Stream signed URL playback.
     *
     * Header  : {"alg":"RS256","kid":"<key_id>"}
     * Payload : {"sub":"<video_uid>","kid":"<key_id>","exp":<unix_ts>,"accessRules":[...]}
     *
     * The private key must be stored base64-encoded in CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY.
     */
    private function generateSignedToken(string $videoUid, int $expiresTimestamp): string
    {
        $header = $this->base64UrlEncode((string) json_encode([
            'alg' => 'RS256',
            'kid' => $this->keyId,
        ]));

        $payload = $this->base64UrlEncode((string) json_encode([
            'sub' => $videoUid,
            'kid' => $this->keyId,
            'exp' => $expiresTimestamp,
            'accessRules' => [
                ['type' => 'any', 'action' => 'allow'],
            ],
        ]));

        $signingInput = "{$header}.{$payload}";

        $rawKey = base64_decode($this->privateKey, strict: true);

        if ($rawKey === false) {
            throw new \RuntimeException('CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY is not valid base64.');
        }

        $pkey = openssl_pkey_get_private($rawKey);

        if ($pkey === false) {
            throw new \RuntimeException('Could not load Cloudflare Stream signing private key.');
        }

        openssl_sign($signingInput, $signature, $pkey, OPENSSL_ALGO_SHA256);

        return $signingInput . '.' . $this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
