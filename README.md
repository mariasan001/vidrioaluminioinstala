# Aluminio y Vidrio Instala

Sitio de marketing (Next.js, export estático) + panel/API PHP en Hostinger.

## Estructura

| Ruta | Qué es |
|------|--------|
| `src/app` | Rutas y metadata |
| `src/content` | Datos de negocio y copy compartido |
| `src/components/site` | Nav, contacto, proyectos, cotización |
| `src/features` | Home, servicios, landings, conversión, analytics GTM, catálogo |
| `public/` | Assets + `api/` + `panel/` (entra a `public_html`) |
| `analytics/private` | Lógica PHP (fuera de `public_html`) |
| `analytics/sql` | Schema y migraciones |

## Desarrollo

```bash
npm install
npm run dev
```

## Export estático (Hostinger)

```bash
STATIC_EXPORT=true npm run build
```

El export escribe HTML en `public/`. Conserva `public/api`, `public/panel`, `public/js`, `public/data`.

## Panel

- Login: `/panel/login` (sesión larga hasta cerrar sesión)
- APIs: `/api/track.php`, `/api/stats/*`, `/api/account.php`, `/api/crm.php`, `/api/catalogo.php`
- JS del panel: `public/panel/app/*.js` + vendors en `public/panel/vendor/`
- Estilos del panel: `public/panel/panel.css`

Deploy PHP y SQL: ver [`analytics/README.md`](analytics/README.md).
