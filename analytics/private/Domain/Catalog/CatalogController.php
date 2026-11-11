<?php

declare(strict_types=1);

namespace Avi\Domain\Catalog;

final class CatalogController
{
    private static function service(): CatalogService
    {
        return new CatalogService(new CatalogRepository(CatalogRepository::resolvePath()));
    }

    public static function dispatch(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Robots-Tag: noindex, nofollow');

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'GET') {
            echo json_encode(self::service()->listAll(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        if ($method !== 'POST') {
            http_response_code(405);
            echo '{"ok":false}';
            exit;
        }

        avi_require_login();

        $raw = file_get_contents('php://input');
        if (!is_string($raw) || strlen($raw) > 2500000) {
            http_response_code(400);
            echo '{"ok":false}';
            exit;
        }

        $body = json_decode($raw, true);
        if (!is_array($body) || !avi_csrf_valid(is_string($body['csrf'] ?? null) ? $body['csrf'] : '')) {
            http_response_code(403);
            echo '{"ok":false}';
            exit;
        }

        $action = is_string($body['accion_api'] ?? null) ? $body['accion_api'] : '';
        $id = is_string($body['id'] ?? null) ? $body['id'] : '';
        $product = isset($body['producto']) && is_array($body['producto']) ? $body['producto'] : [];

        $result = self::service()->save($action, $id, $product);

        if (!($result['ok'] ?? false)) {
            $code = ($result['error'] ?? '') === 'write' ? 500 : 400;
            http_response_code($code);
            echo '{"ok":false}';
            exit;
        }

        echo json_encode(
            ['ok' => true, 'productos' => $result['productos'] ?? []],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}
