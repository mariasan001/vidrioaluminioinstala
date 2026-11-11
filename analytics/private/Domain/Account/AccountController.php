<?php

declare(strict_types=1);

namespace Avi\Domain\Account;

use Avi\Domain\Shared\RolePolicy;
use Avi\Domain\Shared\SiteContext;
use Throwable;

final class AccountController
{
    private static function service(): AccountService
    {
        return new AccountService(new AccountRepository(avi_pdo()));
    }

    public static function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'GET') {
            self::get();
        }

        if ($method === 'POST') {
            self::post();
        }

        avi_json(405);
    }

    private static function get(): void
    {
        try {
            $siteId = SiteContext::requireLoginMethod('GET');
            $payload = self::service()->payload($siteId);

            avi_json(200, [
                'ok' => true,
                'role' => RolePolicy::role(),
                'account' => $payload['account'],
                'referidos' => $payload['referidos'],
            ]);
        } catch (Throwable $error) {
            avi_log('account_get ' . $error->getMessage());
            avi_json(500);
        }
    }

    private static function post(): void
    {
        try {
            $siteId = SiteContext::requireLoginMethod('POST');

            $body = SiteContext::jsonBody();
            if ($body === null) {
                avi_json(400);
            }

            if (!avi_csrf_valid((string) ($body['csrf'] ?? ''))) {
                avi_json(403);
            }

            $section = (string) ($body['section'] ?? '');
            $data = is_array($body['data'] ?? null) ? $body['data'] : [];

            if (!RolePolicy::canWriteAccountSection($section)) {
                avi_json(403, ['ok' => false, 'error' => 'role']);
            }

            if (!AccountService::isKnownSection($section)) {
                avi_json(400, ['ok' => false, 'error' => 'section']);
            }

            $service = self::service();
            $service->saveSection($siteId, $section, $data);
            $payload = $service->payload($siteId);

            avi_json(200, [
                'ok' => true,
                'role' => RolePolicy::role(),
                'account' => $payload['account'],
                'referidos' => $payload['referidos'],
            ]);
        } catch (Throwable $error) {
            avi_log('account_post ' . $error->getMessage());
            avi_json(500);
        }
    }
}
