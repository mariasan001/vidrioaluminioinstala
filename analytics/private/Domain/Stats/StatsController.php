<?php

declare(strict_types=1);

namespace Avi\Domain\Stats;

use Avi\Domain\Shared\SiteContext;
use DateTimeImmutable;
use Throwable;

/**
 * HTTP layer for GET /api/stats/*: method + session guard, query filters, JSON envelope.
 *
 * @phpstan-type Filters array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool}
 */
final class StatsController
{
    private static function service(): StatsService
    {
        return new StatsService(new StatsRepository());
    }

    public static function resumen(): void
    {
        try {
            $filters = self::guard();
            self::ok($filters, self::service()->resumen($filters));
        } catch (Throwable $error) {
            self::fail('stats_resumen', $error);
        }
    }

    public static function clics(): void
    {
        try {
            $filters = self::guard();
            $canal = (string) ($_GET['canal'] ?? '');
            self::ok($filters, self::service()->clics($filters, $canal));
        } catch (Throwable $error) {
            self::fail('stats_clics', $error);
        }
    }

    public static function paginas(): void
    {
        try {
            $filters = self::guard();
            self::ok($filters, self::service()->paginas($filters));
        } catch (Throwable $error) {
            self::fail('stats_paginas', $error);
        }
    }

    public static function embudo(): void
    {
        try {
            $filters = self::guard();
            self::ok($filters, self::service()->embudo($filters));
        } catch (Throwable $error) {
            self::fail('stats_embudo', $error);
        }
    }

    public static function referidos(): void
    {
        try {
            $filters = self::guard();
            // Referral list ignores the Google Ads source filter (also for the page options).
            $filters['ads'] = false;
            self::ok($filters, self::service()->referidos($filters));
        } catch (Throwable $error) {
            self::fail('stats_referidos', $error);
        }
    }

    public static function visitas(): void
    {
        try {
            $filters = self::guard();
            $page = self::listPage();
            self::ok($filters, self::service()->visitas($filters, $page));
        } catch (Throwable $error) {
            self::fail('stats_visitas', $error);
        }
    }

    public static function visita(): void
    {
        try {
            $filters = self::guard();
            $id = $_GET['id'] ?? '';

            if (!is_string($id) || !ctype_digit($id) || (int) $id < 1) {
                avi_json(400);
            }

            $data = self::service()->visita($filters, (int) $id);

            if ($data === null) {
                avi_json(404);
            }

            self::ok($filters, $data);
        } catch (Throwable $error) {
            self::fail('stats_visita', $error);
        }
    }

    /**
     * @return Filters
     */
    private static function guard(): array
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
            avi_json(405);
        }

        avi_session_start();

        if (avi_user_id() === null) {
            avi_json(401);
        }

        return self::filters();
    }

    /**
     * @return Filters
     */
    private static function filters(): array
    {
        avi_config();
        $today = new DateTimeImmutable('today');
        $desdeRaw = $_GET['desde'] ?? '';
        $hastaRaw = $_GET['hasta'] ?? '';
        $desdeRaw = is_string($desdeRaw) ? $desdeRaw : '';
        $hastaRaw = is_string($hastaRaw) ? $hastaRaw : '';

        if ($desdeRaw === '' && $hastaRaw === '') {
            $desde = $today->modify('-29 days');
            $hasta = $today;
        } else {
            $desde = self::day($desdeRaw);
            $hasta = self::day($hastaRaw);

            if ($desde === null || $hasta === null || $desde > $hasta || $hasta > $today) {
                avi_json(400);
            }

            if ($desde->diff($hasta)->days === false || $desde->diff($hasta)->days > 400) {
                avi_json(400);
            }
        }

        $page = $_GET['pagina'] ?? '';
        $page = is_string($page) ? $page : '';

        if ($page !== '' && (!preg_match('#^/[a-z0-9/_-]*$#', $page) || strlen($page) > 200)) {
            avi_json(400);
        }

        $source = $_GET['fuente'] ?? 'todas';
        $source = is_string($source) ? strtolower(trim($source)) : '';

        if (!in_array($source, ['', 'todas', 'google_ads'], true)) {
            avi_json(400);
        }

        $next = $hasta->modify('+1 day');

        return [
            'site_id' => SiteContext::siteId(),
            'desde' => $desde->format('Y-m-d'),
            'hasta' => $hasta->format('Y-m-d'),
            'desde_dt' => $desde->format('Y-m-d') . ' 00:00:00',
            'hasta_dt' => $next->format('Y-m-d') . ' 00:00:00',
            'pagina' => $page,
            'ads' => $source === 'google_ads',
        ];
    }

    private static function day(string $value): ?DateTimeImmutable
    {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        if (!$date instanceof DateTimeImmutable || $date->format('Y-m-d') !== $value) {
            return null;
        }

        $errors = DateTimeImmutable::getLastErrors();

        if ($errors !== false && (($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0)) {
            return null;
        }

        return $date;
    }

    private static function listPage(): int
    {
        $page = $_GET['p'] ?? '1';
        $page = is_string($page) ? $page : '';

        if (!ctype_digit($page) || (int) $page < 1 || (int) $page > 200) {
            avi_json(400);
        }

        return (int) $page;
    }

    /**
     * @param Filters $filters
     * @param array<string,mixed> $data
     */
    private static function ok(array $filters, array $data): void
    {
        avi_json(200, array_merge([
            'ok' => true,
            'desde' => $filters['desde'],
            'hasta' => $filters['hasta'],
            'opciones' => self::service()->options($filters),
        ], $data));
    }

    private static function fail(string $context, Throwable $error): void
    {
        avi_log($context . ' ' . $error->getMessage());
        avi_json(500);
    }
}
