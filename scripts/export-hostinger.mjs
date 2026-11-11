/**
 * Build static export and assemble Hostinger deploy package:
 *   deploy/public_html  ← Next export (includes public/api, panel, js, img)
 *   deploy/private      ← analytics/private (Domain + PHP)
 *   deploy/sql          ← analytics/sql
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const deploy = path.join(root, "deploy");
const outDir = path.join(root, "out");
const staticDist = path.join(root, ".next-static");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function resolveExportRoot() {
  const candidates = [outDir, staticDist];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }
  return null;
}

console.log("→ STATIC_EXPORT build…");
rmrf(outDir);
rmrf(staticDist);
run("npm", ["run", "build"], { STATIC_EXPORT: "true" });

const exportRoot = resolveExportRoot();
if (!exportRoot) {
  console.error("Export failed: index.html missing in out/ and .next-static/");
  process.exit(1);
}
console.log("→ Export root:", exportRoot);

console.log("→ Assemble deploy/…");
rmrf(deploy);
fs.mkdirSync(deploy, { recursive: true });
copyDir(exportRoot, path.join(deploy, "public_html"));
copyDir(path.join(root, "analytics", "private"), path.join(deploy, "private"));
copyDir(path.join(root, "analytics", "sql"), path.join(deploy, "sql"));

// Drop Next debug leftovers from the public tree
for (const name of fs.readdirSync(path.join(deploy, "public_html"))) {
  if (name.startsWith("__next.")) {
    fs.rmSync(path.join(deploy, "public_html", name), { force: true });
  }
}

// Never ship local secrets or logs
const strip = [
  path.join(deploy, "private", "config.php"),
  path.join(deploy, "private", "logs"),
  path.join(deploy, "private", "rate"),
];
for (const item of strip) {
  fs.rmSync(item, { recursive: true, force: true });
}

fs.writeFileSync(
  path.join(deploy, "LEEME.txt"),
  [
    "Paquete Hostinger — Aluminio y Vidrio Instala",
    "",
    "1) Sube public_html/* a domains/.../public_html/",
    "2) Sube private/* a domains/.../private/ (hermano de public_html)",
    "3) En private: copia config.example.php → config.php y completa credenciales",
    "4) SQL (phpMyAdmin): sql/schema.sql (nueva) o sql/migrate-account.sql (existente)",
    "5) Opcional dueño: sql/create-dueno.sql",
    "6) Prueba: /panel/login , /api/track.php , guardar cuenta/CRM",
    "",
    "IMPORTANTE: incluye private/Domain/ completo.",
    "",
  ].join("\n"),
  "utf8",
);

console.log("→ Smoke…");
run("node", ["scripts/smoke-check.mjs", "deploy"]);
console.log("\nDeploy package ready:", deploy);
