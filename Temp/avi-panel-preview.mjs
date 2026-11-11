import http from "node:http";
import fs from "node:fs";

const root = "C:/PROYECTOS/vidrioaluminioinstala";
const php = fs.readFileSync(root + "/analytics/private/panel.php", "utf8");
const css = php.match(/<style>([\s\S]*?)<\/style>/)[1];

function buildHtml(rol) {
  const roleLabel = rol === "dueno" ? "Dueño" : "Admin";
  const body = php.split("$body = <<<HTML")[1].split("\nHTML;")[0]
    .replaceAll("{$csrf}", "preview")
    .replaceAll("{$cuentaNombre}", "Instala")
    .replaceAll("{$cuentaRol}", roleLabel)
    .replaceAll("{$cuentaInicial}", "I");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0c0c0a"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Panel AVI"><link rel="manifest" href="/panel/manifest.json"><link rel="apple-touch-icon" href="/panel/icon-192.png"><title>Panel · ${roleLabel}</title><link rel="icon" href="/panel/favicon.png" type="image/png"><style>${css}
.preview-banner{position:sticky;top:0;z-index:20;margin:0;padding:8px 16px;background:#e8ff46;color:#161614;font:600 13px Trebuchet MS,sans-serif;text-align:center}
.preview-banner a{color:#161614;font-weight:800}
</style></head><body class="wide"><p class="preview-banner">Preview ${roleLabel}. Cambiar: <a href="/panel/?rol=admin">Admin</a> · <a href="/panel/?rol=dueno">Dueño</a></p><main class="wide">${body}</main></body></html>`;
}
const opciones = ["/", "/servicios/canceles-de-bano/", "/servicios/ventanas/", "/barandales/"];

function dayVisits(fecha) {
  const month = Number(fecha.slice(5, 7));
  const day = Number(fecha.slice(8));
  if (month === 11 && day === 9) return 4;
  return (day * 3 + month) % 7;
}

function hoursFor(fecha, total) {
  if (Number(fecha.slice(8)) === 9) return [{ hora: "10:00", visitas: total }];
  const slots = ["08:00", "10:00", "13:00", "16:00", "18:00"];
  const hours = [];
  let left = total;
  slots.forEach((hora, index) => {
    const visitas = index === slots.length - 1 ? left : Math.min(left, 1 + (index % 2));
    left -= visitas;
    if (visitas > 0) hours.push({ hora, visitas });
  });
  return hours;
}

function eachDay(desde, hasta) {
  const start = new Date(`${desde}T00:00:00`);
  const end = new Date(`${hasta}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const days = [];
  for (const cursor = new Date(start); cursor <= end && days.length < 400; cursor.setDate(cursor.getDate() + 1)) {
    const fecha = cursor.getFullYear() + "-" + String(cursor.getMonth() + 1).padStart(2, "0") + "-" + String(cursor.getDate()).padStart(2, "0");
    const visitas = dayVisits(fecha);
    days.push({ fecha, visitas, horas: visitas ? hoursFor(fecha, visitas) : [] });
  }
  return days;
}

function buildSummary(desde, hasta) {
  const por_dia = eachDay(desde, hasta);
  const visitas = por_dia.reduce((sum, day) => sum + day.visitas, 0);
  const clics_whatsapp = Math.round(visitas * 0.4);
  const clics_llamada = Math.round(visitas * 0.16);
  const formularios = visitas > 6 ? 1 : 0;
  const contactos = Math.min(visitas, clics_whatsapp + clics_llamada);
  return {
    ok: true,
    opciones,
    visitas,
    visitas_google_ads: Math.round(visitas * 0.3),
    clics_whatsapp,
    clics_llamada,
    formularios,
    tasa_contacto: visitas ? Math.round((contactos / visitas) * 1000) / 10 : 0,
    por_dia,
  };
}

function buildPages(total) {
  const shares = [0.5, 0.31, 0.19];
  const names = [
    ["/servicios/canceles-de-bano/", "Canceles"],
    ["/servicios/ventanas/", "Ventanas"],
    ["/barandales/", "Barandales"],
  ];
  return {
    ok: true,
    opciones,
    paginas: names.map(([pagina, etiqueta], index) => {
      const visitas = Math.round(total * shares[index]);
      const clics_whatsapp = Math.round(visitas * 0.4);
      const clics_llamada = Math.round(visitas * 0.15);
      const clics = clics_whatsapp + clics_llamada;
      return {
        pagina,
        etiqueta,
        visitas,
        visitas_google_ads: Math.round(visitas * 0.3),
        clics_whatsapp,
        clics_llamada,
        clics,
        formularios: index === 0 && visitas > 4 ? 1 : 0,
        tasa_contacto: visitas ? Math.round((Math.min(visitas, clics) / visitas) * 1000) / 10 : 0,
      };
    }),
  };
}
function buildFunnel(pagina, visitas) {
  const key = pagina === "/" ? "/" : String(pagina || "").replace(/\/$/, "");
  const ratios = {
    "/servicios/canceles-de-bano": [1, 0.88, 0.75, 0.25, 0.25, 0.25, 0.13, 0.13, 0.38],
    "/servicios/ventanas": [1, 1, 0.8, 0.6, 0.4, 0.4, 0.2, 0.2, 0.4],
    "/barandales": [1, 0.67, 0.67, 0.33, 0.33, 0, 0, 0, 0.33],
  };
  const ratio = ratios[key] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const labels = [
    ["hero", "Inicio"],
    ["usos", "Usos"],
    ["ventajas", "Ventajas"],
    ["tipos", "Tipos"],
    ["confianza", "Confianza"],
    ["trabajos", "Trabajos"],
    ["preguntas", "Preguntas"],
    ["contacto", "Contacto"],
    ["clic", "Clic"],
  ];
  return {
    ok: true,
    pagina,
    pasos: labels.map(([seccion, etiqueta], index) => ({
      seccion,
      etiqueta,
      visitas: Math.round(Number(visitas) * ratio[index]),
    })),
  };
}
const visits = {
  ok: true,
  opciones,
  total: 1,
  pagina_lista: 1,
  paginas_lista: 1,
  visitas: [{
    id: 1,
    fecha: "2026-11-06 17:40:00",
    hora: "17:40",
    fuente_etiqueta: "Directo",
    dispositivo_etiqueta: "Móvil",
    entrada: "/servicios/canceles-de-bano/",
    entrada_etiqueta: "Canceles",
    seccion_etiqueta: "Contacto",
    clic: true,
  }],
};
const visit = {
  ok: true,
  visita: {
    hora: "17:40",
    fuente_etiqueta: "Directo",
    dispositivo_etiqueta: "Móvil",
    pagina: "/servicios/canceles-de-bano/",
    pagina_etiqueta: "Canceles",
  },
  eventos: [
    { hora: "17:40", tipo_etiqueta: "Vio la página", pagina_etiqueta: "Canceles", seccion_etiqueta: "", producto: "", pagina: "/servicios/canceles-de-bano/" },
    { hora: "17:41", tipo_etiqueta: "Clic en WhatsApp", pagina_etiqueta: "Canceles", seccion_etiqueta: "Contacto", producto: "Doble corredizo", pagina: "/servicios/canceles-de-bano/" },
  ],
};
const referrals = { ok: true, referidos: [
  { origen: "facebook", visitas: 4, con_clic: 1, tasa_contacto: 25 },
  { origen: "instagram", visitas: 2, con_clic: 1, tasa_contacto: 50 },
] };
const routes = {
  "/api/stats/visitas.php": visits,
  "/api/stats/visita.php": visit,
  "/api/stats/referidos.php": referrals,
};

http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/api/catalogo.php") {
    const catalogFile = root + "/public/data/catalogo.json";
    const readCatalog = () => {
      try {
        const data = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
        return data && Array.isArray(data.productos) ? data : { productos: [] };
      } catch {
        return { productos: [] };
      }
    };
    const send = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    };
    if (req.method === "GET") {
      send(200, readCatalog());
      return;
    }
    if (req.method !== "POST") {
      send(405, { ok: false });
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      let body = {};
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { send(400, { ok: false }); return; }
      const store = readCatalog();
      if (body.accion_api === "eliminar") {
        store.productos = store.productos.filter((row) => row.id !== body.id);
      } else {
        const product = body.producto || {};
        const id = body.accion_api === "editar" && typeof body.id === "string" && body.id ? body.id : "p" + Date.now().toString(16);
        const clean = {
          id,
          pagina: String(product.pagina || ""),
          titulo: String(product.titulo || "").slice(0, 120),
          descripcion: String(product.descripcion || "").slice(0, 600),
          caracteristicas: String(product.caracteristicas || "").slice(0, 300),
          imagen: String(product.imagen || ""),
          accion: ["preguntar", "precio", "color"].includes(product.accion) ? product.accion : "preguntar",
          precio: product.accion === "precio" ? String(product.precio || "").slice(0, 40) : "",
          color: product.accion === "color" ? String(product.color || "").slice(0, 40) : "",
        };
        if (!clean.titulo || !clean.pagina.startsWith("/")) { send(400, { ok: false }); return; }
        const index = store.productos.findIndex((row) => row.id === id);
        if (index >= 0) store.productos[index] = clean;
        else store.productos.push(clean);
      }
      fs.writeFileSync(catalogFile, JSON.stringify(store, null, 2) + "\n");
      send(200, { ok: true, productos: store.productos });
    });
    return;
  }
  if (url.pathname === "/api/stats/embudo.php") {
    const summary = buildSummary(url.searchParams.get("desde") || "", url.searchParams.get("hasta") || "");
    const pagina = url.searchParams.get("pagina") || "";
    const match = buildPages(summary.visitas).paginas.find((item) => item.pagina === pagina);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildFunnel(pagina, match ? match.visitas : 0)));
    return;
  }
  if (url.pathname === "/api/stats/resumen.php" || url.pathname === "/api/stats/paginas.php") {
    const data = buildSummary(url.searchParams.get("desde") || "", url.searchParams.get("hasta") || "");
    const body = url.pathname === "/api/stats/paginas.php" ? buildPages(data.visitas) : data;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
    return;
  }
  if (url.pathname === "/api/stats/clics.php") {
    const data = buildSummary(url.searchParams.get("desde") || "", url.searchParams.get("hasta") || "");
    const canal = String(url.searchParams.get("canal") || "");
    const pages = buildPages(data.visitas).paginas;
    const slots = ["09:14", "10:02", "11:40", "12:05", "13:18", "15:33", "16:50", "18:22"];
    const make = (count, kind) => Array.from({ length: count }, (_, index) => {
      const page = pages[index % Math.max(pages.length, 1)] || { pagina: "/", etiqueta: "Inicio" };
      const day = data.por_dia?.[Math.min(index, (data.por_dia || []).length - 1)]?.fecha || url.searchParams.get("hasta") || "2026-11-10";
      const hora = slots[index % slots.length];
      return {
        id: String((kind === "llamada" ? 2000 : 1000) + index + 1),
        canal: kind,
        pagina: page.pagina,
        pagina_etiqueta: page.etiqueta,
        fecha: day,
        hora,
        cuando: day + " " + hora + ":00",
      };
    });
    let clics = make(data.clics_whatsapp || 0, "whatsapp").concat(make(data.clics_llamada || 0, "llamada"));
    if (canal === "whatsapp" || canal === "llamada") clics = clics.filter((item) => item.canal === canal);
    clics.sort((a, b) => String(b.cuando).localeCompare(String(a.cuando)));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, clics }));
    return;
  }
  if (routes[url.pathname]) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(routes[url.pathname]));
    return;
  }
  if (url.pathname === "/panel/manifest.json") {
    res.writeHead(200, { "Content-Type": "application/manifest+json", "Cache-Control": "no-store" });
    res.end(fs.readFileSync(root + "/public/panel/manifest.json"));
    return;
  }
  if (url.pathname === "/panel/favicon.png" || url.pathname === "/panel/icon-192.png" || url.pathname === "/panel/icon-512.png") {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(fs.readFileSync(root + "/public" + url.pathname));
    return;
  }
  if (url.pathname === "/img/logo.webp" || url.pathname === "/img/logo-nav.webp") {
    res.writeHead(200, { "Content-Type": "image/webp", "Cache-Control": "no-store" });
    res.end(fs.readFileSync(root + "/public" + url.pathname));
    return;
  }
  if (url.pathname === "/panel/gsap.min.js" || url.pathname === "/panel/html2canvas.min.js" || url.pathname === "/panel/jspdf.umd.min.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(fs.readFileSync(root + "/public" + url.pathname));
    return;
  }
  if (url.pathname === "/panel/app.js") {
    res.writeHead(200, { "Content-Type": "application/javascript", "Cache-Control": "no-store" });
    res.end(fs.readFileSync(root + "/public/panel/app.js"));
    return;
  }
  if (url.pathname === "/panel/sw.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end("/* preview */");
    return;
  }
  if (url.pathname === "/panel/" || url.pathname === "/panel") {
    const rol = String(url.searchParams.get("rol") || "admin").toLowerCase() === "dueno" ? "dueno" : "admin";
    const page = buildHtml(rol);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(page);
    return;
  }
  res.writeHead(404);
  res.end("no");
}).listen(8765, "127.0.0.1", () => {
  console.log("preview up", buildHtml("admin").includes("id=\"vista\""));
});
