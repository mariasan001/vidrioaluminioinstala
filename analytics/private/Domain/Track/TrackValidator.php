<?php

declare(strict_types=1);

namespace Avi\Domain\Track;

/**
 * Payload validation/normalization for POST /api/track.
 * Global constants AVI_EVENT_TYPES / AVI_SECTIONS / AVI_SOURCES / AVI_DEVICES
 * are (re)defined at the bottom of this file for backwards compatibility.
 */
final class TrackValidator
{
    public const EVENT_TYPES = [
        'page_view',
        'section_view',
        'click_whatsapp',
        'click_llamada',
        'envio_formulario',
    ];

    public const SECTIONS = [
        'hero',
        'usos',
        'ventajas',
        'tipos',
        'confianza',
        'trabajos',
        'preguntas',
        'contacto',
        'sticky',
        'footer',
    ];

    public const SOURCES = ['google_ads', 'organico', 'directo', 'referido', 'otro'];

    public const DEVICES = ['movil', 'escritorio', 'tablet'];

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    public static function event(array $payload): ?array
    {
        $visitorId = strtolower(trim((string) ($payload['visitor_id'] ?? '')));

        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $visitorId)) {
            return null;
        }

        $type = (string) ($payload['type'] ?? '');

        if (!in_array($type, self::EVENT_TYPES, true)) {
            return null;
        }

        $page = self::page($payload['page'] ?? null);

        if ($page === null) {
            return null;
        }

        $section = self::section($payload['section'] ?? null);

        if ($type === 'section_view' && $section === null) {
            return null;
        }

        if (array_key_exists('section', $payload) && $payload['section'] !== null && $payload['section'] !== '' && $section === null) {
            return null;
        }

        $device = (string) ($payload['device'] ?? '');

        if (!in_array($device, self::DEVICES, true)) {
            return null;
        }

        $source = (string) ($payload['source'] ?? '');

        if ($source !== '' && !in_array($source, self::SOURCES, true)) {
            return null;
        }

        return [
            'visitor_id' => $visitorId,
            'type' => $type,
            'page' => $page,
            'section' => $section,
            'device' => $device,
            'source' => $source,
            'utm_source' => self::utm($payload['utm_source'] ?? null),
            'utm_medium' => self::utm($payload['utm_medium'] ?? null),
            'utm_campaign' => self::utm($payload['utm_campaign'] ?? null),
            'gclid' => self::gclid($payload),
            'meta' => self::meta($payload['meta'] ?? null),
        ];
    }

    public static function page(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $page = rawurldecode(trim($value));
        $page = explode('?', $page, 2)[0];
        $page = explode('#', $page, 2)[0];

        if ($page === '') {
            $page = '/';
        }

        if (!str_starts_with($page, '/') || str_contains($page, '..') || str_contains($page, '\\') || str_contains($page, '//')) {
            return null;
        }

        if (strlen($page) > 200 || !preg_match('#^/[a-z0-9/_-]*$#', $page)) {
            return null;
        }

        return $page;
    }

    public static function section(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_string($value) || !in_array($value, self::SECTIONS, true)) {
            return null;
        }

        return $value;
    }

    public static function utm(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = trim(preg_replace('/[\x00-\x1F\x7F]/', '', $value) ?? '');

        if ($value === '' || strlen($value) > 80 || !preg_match('/^[a-zA-Z0-9 ._+\\-|]+$/', $value)) {
            return null;
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public static function gclid(array $payload): int
    {
        if (!array_key_exists('gclid', $payload)) {
            return 0;
        }

        $value = $payload['gclid'];

        if (is_bool($value)) {
            return $value ? 1 : 0;
        }

        if (is_int($value)) {
            return $value === 1 ? 1 : 0;
        }

        if (is_string($value)) {
            return $value === '' || $value === '0' ? 0 : 1;
        }

        return 0;
    }

    public static function meta(mixed $value): ?string
    {
        if (!is_array($value) || !isset($value['tipo']) || !is_string($value['tipo'])) {
            return null;
        }

        $tipo = trim(preg_replace('/[\x00-\x1F\x7F]/', '', $value['tipo']) ?? '');

        if ($tipo === '') {
            return null;
        }

        $tipo = substr($tipo, 0, 80);
        $json = json_encode(['tipo' => $tipo], JSON_UNESCAPED_UNICODE);

        return is_string($json) ? $json : null;
    }
}

// Backwards-compatible global constants (previously defined in track.php).
if (!\defined('AVI_EVENT_TYPES')) {
    \define('AVI_EVENT_TYPES', TrackValidator::EVENT_TYPES);
}

if (!\defined('AVI_SECTIONS')) {
    \define('AVI_SECTIONS', TrackValidator::SECTIONS);
}

if (!\defined('AVI_SOURCES')) {
    \define('AVI_SOURCES', TrackValidator::SOURCES);
}

if (!\defined('AVI_DEVICES')) {
    \define('AVI_DEVICES', TrackValidator::DEVICES);
}
