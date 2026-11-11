<?php

declare(strict_types=1);

namespace Avi\Domain\Crm;

use Avi\Domain\Shared\RolePolicy;
use Avi\Domain\Shared\SiteContext;
use Throwable;

final class CrmController
{
    private static function service(): CrmService
    {
        return new CrmService(new CrmRepository(avi_pdo()));
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
            self::respond($siteId);
        } catch (Throwable $error) {
            avi_log('crm_get ' . $error->getMessage());
            avi_json(500);
        }
    }

    private static function post(): void
    {
        try {
            $siteId = SiteContext::requireLoginMethod('POST');

            $body = SiteContext::jsonBody();
            if ($body === null || !avi_csrf_valid((string) ($body['csrf'] ?? ''))) {
                avi_json(403);
            }

            // Dueño edita CRM; admin solo observa → bloquear writes de admin
            if (!RolePolicy::canWriteCrm()) {
                avi_json(403, ['ok' => false, 'error' => 'role']);
            }

            $contacts = is_array($body['contacts'] ?? null) ? $body['contacts'] : null;
            $quotes = is_array($body['quotes'] ?? null) ? $body['quotes'] : null;

            self::service()->sync($siteId, $contacts, $quotes);
            self::respond($siteId);
        } catch (Throwable $error) {
            avi_log('crm_post ' . $error->getMessage());
            avi_json(500);
        }
    }

    private static function respond(int $siteId): never
    {
        $data = self::service()->listAll($siteId);

        avi_json(200, [
            'ok' => true,
            'contacts' => $data['contacts'],
            'quotes' => $data['quotes'],
            'role' => RolePolicy::role(),
        ]);
    }
}
