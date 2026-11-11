# Analítica y panel (Hostinger)

Next exporta estático a `public_html`. PHP vive en `private/` (hermano de `public_html`) y se expone solo vía stubs en `public_html/api/` y `public_html/panel/`.

```
domains/aluminioyvidrioinstala.mx/
  private/                 ← analytics/private/
    config.php
    bootstrap.php
    auth.php
    track.php
    stats.php              ← delgado → Domain/Stats
    account.php            ← delgado → Domain/Account
    crm.php                ← delgado → Domain/Crm
    Domain/                ← Avi\Domain\ (Shared, Account, Crm, Catalog, Stats)
    catalog.php            ← delgado → Domain/Catalog
    panel.php
    panel/panel.css        ← fuente; el deploy usa también public_html/panel/panel.css
    setup.php
    create-admin.php
    cleanup.php
    logs/
  public_html/             ← export Next + public/
    api/*.php              ← stubs → ../../private/
    panel/
    js/avi-track.js
    data/catalogo.json
```

## Subir

1. Copia `analytics/private/` → `domains/.../private/`.
2. Copia `config.example.php` → `config.php` y completa credenciales + salt.
3. En phpMyAdmin (`u495120473_metricas`):
   - Base nueva: `analytics/sql/schema.sql`
   - Cuenta/CRM: `analytics/sql/migrate-account.sql`
   - Usuario dueño (opcional): `analytics/sql/create-dueno.sql`
4. Publica el export estático. No subas `private/` dentro de `public_html`.

## Login y roles

- `/panel/login` — cookie HttpOnly / Secure / SameSite=Strict, duración ~1 año (hasta logout).
- Roles en `users.role`: `admin` | `dueno` (sesión → `data-role` en el panel).
- Admin escribe cuenta (campaña/pagos/licencia/config referidos). Dueño escribe CRM.
- Setup web (`/panel/setup`) está cerrado (404). Usa SQL o `create-admin.php` por CLI.

## APIs

| Endpoint | Uso |
|----------|-----|
| `POST /api/track.php` | Visitas/eventos del sitio |
| `GET /api/stats/*` | Resumen, embudo, páginas, clics, visitas |
| `GET/POST /api/account.php` | Campaña, pagos, licencia, referidos |
| `GET/POST /api/crm.php` | Contactos y cotizaciones |
| `GET/POST /api/catalogo.php` | Catálogo vivo (`data/catalogo.json`) |

## Limpieza

`analytics/sql/cleanup.sql` / cron:

```bash
php /home/USUARIO/domains/aluminioyvidrioinstala.mx/private/cleanup.php
```

## Track (prueba)

```bash
curl -i -X POST "https://aluminioyvidrioinstala.mx/api/track.php" \
  -H "Origin: https://aluminioyvidrioinstala.mx" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d "{\"visitor_id\":\"11111111-1111-4111-8111-111111111111\",\"type\":\"page_view\",\"page\":\"/\",\"device\":\"movil\",\"source\":\"directo\",\"gclid\":false}"
```
