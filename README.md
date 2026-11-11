# Aluminio y Vidrio Instala

Sitio Next (export estático) + panel/API PHP en Hostinger.

## Estado

Arquitectura y backend Domain listos. Front con contacto único, catálogo estático, error/loading. Panel modular. Paquete de subida: `npm run export:hostinger`.

## Estructura

| Ruta | Qué es |
|------|--------|
| `src/app` | Rutas, `error.tsx`, `loading.tsx` |
| `src/content` | Datos de negocio (`site.ts`) |
| `src/components/site` | Nav, contacto, proyectos, cotización |
| `src/features` | Home, servicios, landings, conversión, analytics |
| `public/` | Assets + `api/` + `panel/` + `js/avi-track.js` |
| `analytics/private` | PHP + `Domain/` (Account, Crm, Catalog, Stats, Track) |
| `analytics/sql` | Schema y migraciones |
| `deploy/` | Paquete listo para Hostinger (generado) |

## Comandos

```bash
npm install
npm run dev
npm test
npm run lint
npm run export:hostinger   # build estático + deploy/ + smoke estructural
npm run smoke              # verifica deploy/
```

## Subir a Hostinger

1. `npm run export:hostinger`
2. Sube `deploy/public_html/*` → `domains/.../public_html/`
3. Sube `deploy/private/*` → `domains/.../private/` (**incluye `Domain/`**)
4. En private: `config.example.php` → `config.php`
5. SQL: `deploy/sql/migrate-account.sql` (o `schema.sql` si es BD nueva)
6. Smoke en vivo:
   - `/panel/login` (admin y dueño)
   - guardar campaña / contacto CRM
   - sitio: sin 405 en track (solo producción)
   - `/servicios/*` y `/barandales`

Detalle PHP: [`analytics/README.md`](analytics/README.md).
