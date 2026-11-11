<?php

declare(strict_types=1);

/**
 * Domain bootstrap: loads infrastructure (PDO, JSON, session/CSRF) and registers
 * a PSR-4 style autoloader for the Avi\Domain\ namespace.
 */

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/auth.php';

spl_autoload_register(static function (string $class): void {
    $prefix = 'Avi\\Domain\\';

    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $file = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';

    if (is_file($file)) {
        require_once $file;
    }
});
