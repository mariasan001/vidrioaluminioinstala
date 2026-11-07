<?php

declare(strict_types=1);

/**
 * Copiar a config.php en la misma carpeta y completar.
 * config.php no se sube a git ni debe quedar dentro de public_html.
 *
 * En Hostinger la ruta queda así:
 * domains/aluminioyvidrioinstala.mx/private/config.php
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'u495120473_metricas',
    'db_user' => 'CAMBIA_USUARIO',
    'db_pass' => 'CAMBIA_CONTRASENA',
    'ip_salt' => 'CAMBIA_SALT_64_CARACTERES_HEX',
    'setup_token' => 'CAMBIA_SETUP_TOKEN',
    'allowed_domains' => [
        'aluminioyvidrioinstala.mx',
        'www.aluminioyvidrioinstala.mx',
    ],
    'require_https' => true,
    'timezone' => 'America/Mexico_City',
    'log_path' => __DIR__ . '/logs/app.log',
    'rate_path' => __DIR__ . '/rate',
];
