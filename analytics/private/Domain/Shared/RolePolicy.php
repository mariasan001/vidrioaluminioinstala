<?php

declare(strict_types=1);

namespace Avi\Domain\Shared;

/**
 * Role-based write policy.
 *
 * - admin: writes campana/pagos/licencia/referidosConfig; observes CRM (read-only).
 * - dueno: writes referidos list and CRM; cannot write admin-only account sections.
 */
final class RolePolicy
{
    /** @var list<string> */
    public const ADMIN_ONLY_SECTIONS = ['campana', 'pagos', 'licencia', 'referidosConfig'];

    public static function role(): string
    {
        avi_session_start();

        return (($_SESSION['role'] ?? '') === 'dueno') ? 'dueno' : 'admin';
    }

    public static function isAdmin(): bool
    {
        return self::role() === 'admin';
    }

    public static function canWriteAccountSection(string $section): bool
    {
        if (in_array($section, self::ADMIN_ONLY_SECTIONS, true)) {
            return self::isAdmin();
        }

        return true;
    }

    public static function canWriteCrm(): bool
    {
        return !self::isAdmin();
    }
}
