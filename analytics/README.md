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

## Usuario admin

No hay registro público. Desde SSH, en la carpeta `private`:

```bash
php create-admin.php tu-correo@dominio.com 'una-contraseña-de-12-o-mas'
```

El comando imprime el hash. Si no tienes SSH, pega ese hash en phpMyAdmin:

```sql
INSERT INTO users (email, password_hash, role, created_at)
VALUES ('tu-correo@dominio.com', 'EL_HASH', 'admin', NOW());
```

El login del panel llega en una fase posterior. Este usuario queda listo para entonces.

## Limpieza

`cleanup.sql` borra eventos, visitas e intentos de acceso de más de 13 meses. En el cron de Hostinger se puede usar, una vez al mes:

```bash
php /home/USUARIO/domains/aluminioyvidrioinstala.mx/private/cleanup.php
```

## Probar el endpoint

`POST https://aluminioyvidrioinstala.mx/api/track.php`

Solo acepta origen `https://aluminioyvidrioinstala.mx` (o `www`). Rechaza bots, cuerpos de más de 4 KB y más de 120 eventos por minuto por IP. La IP se guarda solo como SHA-256 con el salt. `gclid` se guarda como sí o no, nunca el valor.

El primer evento de un visitante abre la visita y tiene que traer `source`. Los siguientes, dentro de 30 minutos y con el mismo `visitor_id`, se agregan a esa visita.

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

El script del sitio, el login, las estadísticas y el panel no están en esta fase.
