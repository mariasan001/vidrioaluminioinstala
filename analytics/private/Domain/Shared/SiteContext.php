<?php

declare(strict_types=1);

namespace Avi\Domain\Shared;

final class SiteContext
{
    private const DOMAIN = 'aluminioyvidrioinstala.mx';

    public static function siteId(): int
    {
        $statement = avi_pdo()->prepare('SELECT id FROM sites WHERE dominio = ? LIMIT 1');
        $statement->execute([self::DOMAIN]);
        $id = $statement->fetchColumn();

        return $id === false ? 0 : (int) $id;
    }

    /**
     * Enforces HTTP method + authenticated session and resolves the site id.
     * Responds (and exits) with 405 / 401 / 500 on failure.
     */
    public static function requireLoginMethod(string $method = 'GET'): int
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
            avi_json(405);
        }

        avi_session_start();

        if (avi_user_id() === null) {
            avi_json(401);
        }

        $siteId = self::siteId();

        if ($siteId < 1) {
            avi_json(500, ['ok' => false, 'error' => 'site']);
        }

        return $siteId;
    }

    /**
     * @return array<string, mixed>|null null when body is not a JSON object/array
     */
    public static function jsonBody(): ?array
    {
        $raw = file_get_contents('php://input');
        $body = is_string($raw) ? json_decode($raw, true) : null;

        return is_array($body) ? $body : null;
    }
}
