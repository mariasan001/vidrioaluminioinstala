# Analítica — fase 1: base de datos y API de seguimiento

El sitio es Next.js. En Hostinger se publica el export estático (`STATIC_EXPORT=true`), y ese resultado reemplaza el contenido de `public_html`. PHP no corre dentro de Next: el único archivo público de esta fase viaja con ese export.

```
domains/aluminioyvidrioinstala.mx/
  private/          ← se sube a mano, fuera de public_html
    config.php
    bootstrap.php
    track.php
    create-admin.php
    cleanup.php
    logs/
  public_html/      ← sale del export estático
    api/track.php
```

`public/api/track.php` carga `../../private/bootstrap.php`. En el servidor esa ruta es `domains/aluminioyvidrioinstala.mx/private/bootstrap.php`.

## Subir

1. Copia el contenido de `analytics/private/` a `domains/aluminioyvidrioinstala.mx/private/`.
2. En esa carpeta, copia `config.example.php` a `config.php` y completa usuario, contraseña y salt. El salt puede generarse con `php -r "echo bin2hex(random_bytes(32));"`.
3. En phpMyAdmin, con la base `u495120473_metricas` seleccionada, ejecuta `analytics/schema.sql`.
4. Publica el sitio. El export incluye `api/track.php`. No subas `private/` dentro de `public_html`.

## Primer administrador, sin SSH

En `config.php` define `setup_token` con una cadena propia de al menos 20 caracteres. El valor de ejemplo `CAMBIA_SETUP_TOKEN` no sirve.

Abre, en HTTPS:

```
https://aluminioyvidrioinstala.mx/panel/setup/
```

El formulario pide el token de configuración, correo, contraseña (mínimo 12 caracteres) y confirmación. El token no va en la URL. Solo funciona si la tabla `users` está vacía. Si el token no coincide o ya hay un usuario, la respuesta es 404 y no crea nada. Al guardar, redirige a `/panel/login`.

Borra setup_token de config.php una vez creado el usuario.

La contraseña se guarda con `password_hash` (ARGON2ID, o BCRYPT si el servidor no tiene Argon2). No hay usuario ni contraseña en el código ni en `schema.sql`.

Si más adelante tienes SSH, `private/create-admin.php` sigue disponible como alternativa.

## Entrar

`/panel/login` pide correo y contraseña. La cookie de sesión es HttpOnly, Secure y SameSite=Strict, y dura 7 días. Tras 5 intentos fallidos de la misma IP o del mismo correo, el acceso queda bloqueado 15 minutos. Salir es un POST a `/api/logout.php`. Sin sesión, el resto de `/panel/` vuelve al login. `/panel/` muestra un “Hola” hasta que estén las estadísticas.

## Limpieza

`cleanup.sql` borra eventos, visitas e intentos de acceso de más de 13 meses. En el cron de Hostinger se puede usar, una vez al mes:

```bash
php /home/USUARIO/domains/aluminioyvidrioinstala.mx/private/cleanup.php
```

## Probar el endpoint

`POST https://aluminioyvidrioinstala.mx/api/track.php`

Solo acepta origen `https://aluminioyvidrioinstala.mx` (o `www`). Rechaza bots, cuerpos de más de 4 KB y más de 120 eventos por minuto por IP. La IP se guarda solo como SHA-256 con el salt. `gclid` se guarda como sí o no, nunca el valor.

El primer evento de un visitante abre la visita. Si no manda `source`, queda como `otro`; un valor fuera de la lista se rechaza. Los siguientes, dentro de 30 minutos y con el mismo `visitor_id`, se agregan a esa visita.

```bash
curl -i -X POST "https://aluminioyvidrioinstala.mx/api/track.php" \
  -H "Origin: https://aluminioyvidrioinstala.mx" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d "{\"visitor_id\":\"11111111-1111-4111-8111-111111111111\",\"type\":\"page_view\",\"page\":\"/\",\"device\":\"movil\",\"source\":\"directo\",\"gclid\":false}"
```

Una respuesta `{\"ok\":true}` crea una fila en `visits` y otra en `events`. Un origen ajeno responde `{\"ok\":false}` sin explicar la causa. El detalle queda en `private/logs/app.log`.

`curl` sin un User-Agent de navegador se trata como bot a propósito.

## Qué sigue

El script del sitio y las estadísticas del panel todavía no están. El login ya queda en `/panel/login`.
