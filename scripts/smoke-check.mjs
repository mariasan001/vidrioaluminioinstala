/**
 * Local structural smoke: confirms deploy-critical paths exist after packaging.
 * Run: node scripts/smoke-check.mjs [deployRoot]
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "deploy");
const required = [
  "public_html/index.html",
  "public_html/panel/index.php",
  "public_html/panel/login/index.php",
  "public_html/panel/app/boot.js",
  "public_html/panel/panel.css",
  "public_html/api/track.php",
  "public_html/api/account.php",
  "public_html/api/crm.php",
  "public_html/api/catalogo.php",
  "public_html/js/avi-track.js",
  "public_html/.htaccess",
  "private/Domain/bootstrap.php",
  "private/account.php",
  "private/crm.php",
  "private/catalog.php",
  "private/stats.php",
  "private/track.php",
  "private/auth.php",
  "private/panel.php",
  "private/Domain/Account/AccountController.php",
  "private/Domain/Crm/CrmController.php",
  "private/Domain/Stats/StatsController.php",
  "private/Domain/Track/TrackController.php",
  "sql/schema.sql",
  "sql/migrate-account.sql",
];

let failed = 0;
for (const rel of required) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error("MISSING", rel);
    failed += 1;
  } else {
    console.log("OK", rel);
  }
}

if (failed > 0) {
  console.error(`\nSmoke failed: ${failed} missing path(s) under ${root}`);
  process.exit(1);
}

console.log(`\nSmoke OK: ${required.length} paths present in ${root}`);
