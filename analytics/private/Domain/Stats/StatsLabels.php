<?php

declare(strict_types=1);

namespace Avi\Domain\Stats;

/**
 * Human labels (es-MX) for stats values + small formatting helpers.
 */
final class StatsLabels
{
    public const SECTIONS = [
        'hero' => 'Inicio',
        'usos' => 'Usos',
        'ventajas' => 'Ventajas',
        'tipos' => 'Tipos',
        'confianza' => 'Confianza',
        'trabajos' => 'Trabajos',
        'preguntas' => 'Preguntas',
        'contacto' => 'Contacto',
    ];

    public static function source(string $source): string
    {
        return [
            'google_ads' => 'Google Ads',
            'organico' => 'Orgánico',
            'directo' => 'Directo',
            'referido' => 'Referido',
            'otro' => 'Otro',
        ][$source] ?? $source;
    }

    public static function device(string $device): string
    {
        return [
            'movil' => 'Móvil',
            'escritorio' => 'Escritorio',
            'tablet' => 'Tablet',
        ][$device] ?? $device;
    }

    public static function section(string $section): string
    {
        return self::SECTIONS[$section] ?? $section;
    }

    public static function page(string $page): string
    {
        $path = $page === '/' ? '/' : rtrim($page, '/');

        return [
            '/' => 'Inicio',
            '/servicios/canceles-de-bano' => 'Canceles',
            '/servicios/ventanas' => 'Ventanas',
            '/barandales' => 'Barandales',
            '/servicios/barandales' => 'Barandales',
            '/servicios/fachadas-de-cristal' => 'Fachadas',
            '/servicios/puertas' => 'Puertas',
            '/servicios/pergolas' => 'Pérgolas',
            '/aviso-de-privacidad' => 'Aviso de privacidad',
        ][$path] ?? $page;
    }

    public static function type(string $type): string
    {
        return [
            'page_view' => 'Vio la página',
            'section_view' => 'Vio la sección',
            'click_whatsapp' => 'Clic en WhatsApp',
            'click_llamada' => 'Clic en llamar',
            'envio_formulario' => 'Envió el formulario',
        ][$type] ?? $type;
    }

    public static function hour(string $value): string
    {
        if (preg_match('/(\d{2}:\d{2})/', $value, $match) === 1) {
            return $match[1];
        }

        return '';
    }

    public static function product(string $meta): string
    {
        if ($meta === '') {
            return '';
        }

        $decoded = json_decode($meta, true);

        if (!is_array($decoded) || !is_string($decoded['tipo'] ?? null)) {
            return '';
        }

        return $decoded['tipo'];
    }
}

// Backward-compatible global constant (previously declared in stats.php).
if (!defined('AVI_STATS_SECTIONS')) {
    define('AVI_STATS_SECTIONS', StatsLabels::SECTIONS);
}
