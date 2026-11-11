<?php

declare(strict_types=1);

http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
echo '<!doctype html><html lang="es"><meta charset="utf-8"><title>No encontrado</title><p>No encontrado</p></html>';
exit;
