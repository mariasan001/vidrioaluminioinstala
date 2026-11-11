<?php

declare(strict_types=1);

namespace Avi\Domain\Track;

/**
 * Business flow for POST /api/track (formerly avi_track()).
 * Order of checks is part of the public behavior; do not reorder.
 */
final class TrackService
{
    public function __construct(private readonly TrackRepository $repository)
    {
    }

    public function handle(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            avi_json(405);
        }

        $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);

        if ($length > 4096) {
            avi_json(413);
        }

        $host = self::requestHost();

        if ($host === null || !self::hostAllowed($host)) {
            avi_fail(403, 'track_origin');
        }

        if (self::isBot((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''))) {
            avi_fail(403, 'track_bot');
        }

        $ip = avi_client_ip();

        if ($ip === '') {
            avi_fail(403, 'track_ip');
        }

        $ipHash = avi_ip_hash($ip);

        if ($this->repository->rateLimited($ipHash)) {
            avi_fail(429, 'track_rate');
        }

        $body = file_get_contents('php://input');

        if ($body === false || strlen($body) > 4096) {
            avi_json(413);
        }

        $payload = json_decode($body, true);

        if (!is_array($payload)) {
            avi_json(400);
        }

        $event = TrackValidator::event($payload);

        if ($event === null) {
            avi_json(400);
        }

        $siteId = $this->repository->siteId(self::canonicalHost($host));

        if ($siteId === null) {
            avi_fail(403, 'track_site');
        }

        $this->repository->store($siteId, $ipHash, $event);
        avi_json(200, ['ok' => true]);
    }

    public static function requestHost(): ?string
    {
        $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
        $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        $candidate = $origin !== '' ? $origin : $referer;

        if ($candidate === '') {
            return null;
        }

        $scheme = parse_url($candidate, PHP_URL_SCHEME);
        $host = parse_url($candidate, PHP_URL_HOST);

        if (!is_string($scheme) || !is_string($host) || $host === '') {
            return null;
        }

        $requireHttps = (bool) avi_config()['require_https'];

        if ($requireHttps && strtolower($scheme) !== 'https') {
            return null;
        }

        if (!in_array(strtolower($scheme), ['https', 'http'], true)) {
            return null;
        }

        return strtolower($host);
    }

    public static function hostAllowed(string $host): bool
    {
        $allowed = avi_config()['allowed_domains'];

        foreach ($allowed as $domain) {
            if (is_string($domain) && strtolower($domain) === $host) {
                return true;
            }
        }

        return false;
    }

    public static function canonicalHost(string $host): string
    {
        return str_starts_with($host, 'www.') ? substr($host, 4) : $host;
    }

    public static function isBot(string $userAgent): bool
    {
        $agent = strtolower(trim($userAgent));

        if ($agent === '' || strlen($agent) > 400) {
            return true;
        }

        $needles = [
            'bot',
            'spider',
            'crawl',
            'slurp',
            'archiver',
            'wget',
            'curl',
            'python-requests',
            'httpclient',
            'headless',
            'phantom',
            'semrush',
            'ahrefs',
            'mj12',
            'dotbot',
            'petalbot',
            'bytespider',
            'gptbot',
            'claudebot',
            'amazonbot',
            'bingpreview',
            'facebookexternalhit',
        ];

        foreach ($needles as $needle) {
            if (str_contains($agent, $needle)) {
                return true;
            }
        }

        return false;
    }
}
