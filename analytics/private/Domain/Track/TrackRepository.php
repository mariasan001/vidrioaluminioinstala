<?php

declare(strict_types=1);

namespace Avi\Domain\Track;

use PDO;
use PDOStatement;
use Throwable;

/**
 * Persistence for /api/track: file-based rate limit, site lookup, visits + events.
 * The PDO connection is resolved lazily (avi_pdo()) so early rejections
 * (405/413/403/429/400) never touch the database, exactly as before.
 */
final class TrackRepository
{
    private const VISIT_WINDOW_MINUTES = 30;

    /**
     * Fixed-window file counter: 120 hits / 60 s per ip hash.
     * Fails closed (returns true) on any filesystem problem.
     */
    public function rateLimited(string $ipHash): bool
    {
        $directory = (string) avi_config()['rate_path'];

        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            avi_log('track_rate_dir');

            return true;
        }

        $path = $directory . '/' . $ipHash;
        $handle = fopen($path, 'c+');

        if ($handle === false) {
            avi_log('track_rate_file');

            return true;
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                return true;
            }

            $raw = stream_get_contents($handle);
            $now = time();
            $data = is_string($raw) ? json_decode($raw, true) : null;
            $window = is_array($data) ? (int) ($data['t'] ?? 0) : 0;
            $count = is_array($data) ? (int) ($data['n'] ?? 0) : 0;

            if ($now - $window >= 60) {
                $window = $now;
                $count = 0;
            }

            $count++;
            $blocked = $count > 120;
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode(['t' => $window, 'n' => $count]));
            fflush($handle);

            return $blocked;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public function siteId(string $domain): ?int
    {
        $statement = avi_pdo()->prepare('SELECT id FROM sites WHERE dominio = ? LIMIT 1');
        $statement->execute([$domain]);
        $id = $statement->fetchColumn();

        return is_numeric($id) ? (int) $id : null;
    }

    /**
     * Opens a visit (or extends the one active in the last 30 min) and appends the event.
     *
     * @param array<string, mixed> $event
     */
    public function store(int $siteId, string $ipHash, array $event): void
    {
        $pdo = avi_pdo();
        $pdo->beginTransaction();

        try {
            $find = $pdo->prepare(
                'SELECT id FROM visits
                 WHERE site_id = ? AND visitor_id = ? AND last_at >= (NOW() - INTERVAL ' . self::VISIT_WINDOW_MINUTES . ' MINUTE)
                 ORDER BY last_at DESC
                 LIMIT 1'
            );
            $find->execute([$siteId, $event['visitor_id']]);
            $visitId = $find->fetchColumn();

            if (is_numeric($visitId)) {
                $visitId = (int) $visitId;
                $touch = $pdo->prepare('UPDATE visits SET last_at = NOW() WHERE id = ? AND site_id = ?');
                $touch->execute([$visitId, $siteId]);
            } else {
                $source = in_array($event['source'], TrackValidator::SOURCES, true) ? $event['source'] : 'otro';
                $insertVisit = $pdo->prepare(
                    'INSERT INTO visits
                        (site_id, visitor_id, started_at, last_at, landing_page, source, utm_source, utm_medium, utm_campaign, gclid, device, ip_hash)
                     VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $this->execute($insertVisit, [
                    [$siteId, PDO::PARAM_INT],
                    [$event['visitor_id'], PDO::PARAM_STR],
                    [$event['page'], PDO::PARAM_STR],
                    [$source, PDO::PARAM_STR],
                    [$event['utm_source'], PDO::PARAM_STR],
                    [$event['utm_medium'], PDO::PARAM_STR],
                    [$event['utm_campaign'], PDO::PARAM_STR],
                    [$event['gclid'], PDO::PARAM_INT],
                    [$event['device'], PDO::PARAM_STR],
                    [$ipHash, PDO::PARAM_STR],
                ]);
                $visitId = (int) $pdo->lastInsertId();
            }

            $insertEvent = $pdo->prepare(
                'INSERT INTO events (site_id, visit_id, type, page, section, meta, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())'
            );
            $this->execute($insertEvent, [
                [$siteId, PDO::PARAM_INT],
                [$visitId, PDO::PARAM_INT],
                [$event['type'], PDO::PARAM_STR],
                [$event['page'], PDO::PARAM_STR],
                [$event['section'], PDO::PARAM_STR],
                [$event['meta'], PDO::PARAM_STR],
            ]);
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $error;
        }
    }

    /**
     * @param list<array{0:mixed,1:int}> $params
     */
    private function execute(PDOStatement $statement, array $params): void
    {
        $index = 1;

        foreach ($params as [$value, $type]) {
            if ($value === null) {
                $statement->bindValue($index, null, PDO::PARAM_NULL);
            } else {
                $statement->bindValue($index, $value, $type);
            }

            $index++;
        }

        $statement->execute();
    }
}
