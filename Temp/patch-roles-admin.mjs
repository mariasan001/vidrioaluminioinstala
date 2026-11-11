import fs from "fs";

const path = "C:/PROYECTOS/vidrioaluminioinstala/public/panel/app.js";
let s = fs.readFileSync(path, "utf8");

const roleHelpers = `
  function panelRole() {
    const label = String((document.querySelector(".account em") || {}).textContent || "").trim().toLowerCase();
    if (label.indexOf("due") >= 0 || label === "owner") return "dueno";
    return "admin";
  }

  function isAdminRole() {
    return panelRole() === "admin";
  }

  function isOwnerRole() {
    return panelRole() === "dueno";
  }

  function accountDataKey() {
    return "avi_panel_account_data_v1";
  }

  function defaultAccountData() {
    return {
      campana: {
        name: "Instala · Vidrio y aluminio",
        canal: "Google Ads",
        zona: "Toluca, Metepec y alrededores",
        inicio: "12 ago 2026",
        status: "Activa",
        presupuesto: 18000,
        iva: 2880,
        gastado: 9640,
        visitas: 93,
        clics: 148,
        llamadas: 15,
      },
      pagos: {
        proximo: {
          fecha: "15 nov 2026",
          concepto: "Mensualidad panel + campaña",
          monto: 2500,
          estado: "Programado",
        },
        historial: [
          { fecha: "15 oct 2026", concepto: "Mensualidad panel + campaña", monto: 2500, estado: "Pagado" },
          { fecha: "15 sep 2026", concepto: "Mensualidad panel + campaña", monto: 2500, estado: "Pagado" },
          { fecha: "15 ago 2026", concepto: "Alta de licencia anual", monto: 4800, estado: "Pagado" },
          { fecha: "12 ago 2026", concepto: "Setup campaña Google Ads", monto: 1200, estado: "Pagado" },
        ],
      },
      licencia: {
        status: "Activa",
        plan: "Instala Pro",
        cuenta: "Aluminios y Vidrios Instala",
        inicio: "10 feb 2026",
        fin: "10 feb 2027",
        precioPro: "$2,500 MXN",
        precioEspecial: "$1,300 MXN",
      },
      referidosConfig: {
        descuentoDueno: 50,
        descuentoReferido: 10,
        activoDesde: "2026-11-01",
        empleado: "Equipo Aurena",
      },
    };
  }

  function readAccountData() {
    try {
      const raw = sessionStorage.getItem(accountDataKey());
      if (!raw) {
        const seed = defaultAccountData();
        sessionStorage.setItem(accountDataKey(), JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw);
      const base = defaultAccountData();
      return {
        campana: Object.assign({}, base.campana, parsed.campana || {}),
        pagos: {
          proximo: Object.assign({}, base.pagos.proximo, (parsed.pagos && parsed.pagos.proximo) || {}),
          historial: Array.isArray(parsed.pagos && parsed.pagos.historial) ? parsed.pagos.historial : base.pagos.historial,
        },
        licencia: Object.assign({}, base.licencia, parsed.licencia || {}),
        referidosConfig: Object.assign({}, base.referidosConfig, parsed.referidosConfig || {}),
      };
    } catch (error) {
      return defaultAccountData();
    }
  }

  function writeAccountData(data) {
    try {
      sessionStorage.setItem(accountDataKey(), JSON.stringify(data));
    } catch (error) {}
  }

  function moneyText(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "$0 MXN";
    return "$" + amount.toLocaleString("es-MX") + " MXN";
  }

  function parseMoneyInput(value) {
    const digits = String(value || "").replace(/[^0-9.]/g, "");
    const amount = Number(digits);
    return Number.isFinite(amount) ? amount : 0;
  }

`;

if (!s.includes("function panelRole()")) {
  const marker = "  function accountStatus() {";
  if (!s.includes(marker)) throw new Error("accountStatus marker missing");
  s = s.replace(marker, roleHelpers + marker);
}

// Replace accountStatus body to use store
const oldStatusStart = s.indexOf("  function accountStatus() {");
const oldStatusEnd = s.indexOf("  function closeAccountSheet()");
if (oldStatusStart < 0 || oldStatusEnd < 0) throw new Error("status bounds");
const newAccountStatus = `  function accountStatus() {
    const data = readAccountData();
    const camp = data.campana;
    const paraCampana = Math.max(0, Number(camp.presupuesto || 0) - Number(camp.iva || 0));
    const resta = Math.max(0, paraCampana - Number(camp.gastado || 0));
    const pay = data.pagos;
    const lic = data.licencia;
    return {
      campana: {
        title: "Campaña activa",
        status: camp.status || "Activa",
        detail: (camp.canal || "Google Ads") + " · " + (camp.zona || ""),
        note: "La campaña sigue publicada y mandando visitas al sitio.",
        name: camp.name || "Campaña",
        canal: camp.canal || "",
        zona: camp.zona || "",
        inicio: camp.inicio || "",
        presupuesto: moneyText(camp.presupuesto),
        iva: moneyText(camp.iva),
        paraCampana: moneyText(paraCampana),
        gastado: moneyText(camp.gastado),
        resta: moneyText(resta),
        visitas: String(camp.visitas || 0),
        clics: String(camp.clics || 0),
        llamadas: String(camp.llamadas || 0),
        raw: camp,
      },
      pagos: {
        title: "Próximos pagos",
        status: String(pay.proximo.fecha || "").slice(0, 6) || "—",
        detail: moneyText(pay.proximo.monto) + " · " + (pay.proximo.concepto || ""),
        note: "El siguiente cobro está programado.",
        warn: true,
        proximo: {
          fecha: pay.proximo.fecha || "",
          concepto: pay.proximo.concepto || "",
          monto: moneyText(pay.proximo.monto),
          estado: pay.proximo.estado || "Programado",
        },
        historial: (pay.historial || []).map((row) => ({
          fecha: row.fecha || "",
          concepto: row.concepto || "",
          monto: moneyText(row.monto),
          estado: row.estado || "Pagado",
        })),
        raw: pay,
      },
      licencia: {
        title: "Licencia activa",
        status: lic.status || "Activa",
        detail: "Vigente hasta " + (lic.fin || "—"),
        note: "El cobro principal es por gestión de campaña. Esta plataforma se da con costo promocional único.",
        plan: lic.plan || "Instala Pro",
        cuenta: lic.cuenta || "",
        inicio: lic.inicio || "",
        fin: lic.fin || "",
        precioPro: lic.precioPro || "$2,500 MXN",
        precioEspecial: lic.precioEspecial || "$1,300 MXN",
        proveedor: "Aurena",
        proveedorUrl: "https://aurenna.com.mx/",
        incluye: [
          "Panel de visitas y embudo",
          "CRM de prospectos y clientes",
          "Cotizaciones PDF",
          "1 campaña activa gestionada",
        ],
        upgrade: {
          titulo: "Puede incrementar",
          subtitulo: "Cotizador con IA, catálogo, WhatsApp y ofertas en su web",
          monto: "$1,500 MXN",
          implementacion: "$600 MXN",
          puntos: [
            ["Cotizador con IA", "Arma cotizaciones inteligentes"],
            ["WhatsApp", "Manda la cotización al cliente"],
            ["Catálogo", "Ellos mismos ponen imagen, descripción y precio"],
            ["Ofertas en web", "Se ven al instante en el menú de su página"],
          ],
        },
        basico: {
          titulo: "Paquete básico",
          monto: "$600 MXN",
          nota: "Si un día ya no quiere campaña pero sí las herramientas, pasa a este paquete.",
          puntos: [
            "Sin gestión de campaña",
            "Conserva acceso a las herramientas del panel",
            "Su página web sigue intacta",
          ],
        },
        condiciones: [
          "Las herramientas las renta y opera Aurena; no quedan en propiedad del cliente.",
          "Si deja la campaña pero quiere seguir con las herramientas, pasa al paquete básico de $600 MXN al mes.",
          "Si deja de pagar o ya no las quiere, su página queda intacta.",
          "Pierde acceso a esta sección de la plataforma.",
          "El precio actual incluye gestión de campaña; el panel se da con costo promocional único.",
        ],
        raw: lic,
      },
    };
  }

`;
s = s.slice(0, oldStatusStart) + newAccountStatus + s.slice(oldStatusEnd);

// Insert admin editor helpers before loadAccountSection
const adminEditors = `
  function accountField(label, name, value, type) {
    return ""
      + "<label class=\\"account-edit-field\\">" + label
      + "<input name=\\"" + name + "\\" type=\\"" + (type || "text") + "\\" value=\\"" + escapeHtml(String(value == null ? "" : value)) + "\\"></label>";
  }

  function renderAdminCampanaEditor() {
    const data = readAccountData();
    const camp = data.campana;
    const board = document.createElement("div");
    board.className = "account-board";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\\"account-board-panel\\"><div class=\\"account-board-head\\"><h2>Editar campaña</h2><em>admin</em></div>"
      + "<div class=\\"account-edit-grid\\">"
      + accountField("Nombre", "name", camp.name)
      + accountField("Canal", "canal", camp.canal)
      + accountField("Zona", "zona", camp.zona)
      + accountField("Inicio", "inicio", camp.inicio)
      + accountField("Estado", "status", camp.status)
      + accountField("Presupuesto dado", "presupuesto", camp.presupuesto, "number")
      + accountField("IVA descontado", "iva", camp.iva, "number")
      + accountField("Gastado", "gastado", camp.gastado, "number")
      + accountField("Visitas", "visitas", camp.visitas, "number")
      + accountField("Clics", "clics", camp.clics, "number")
      + accountField("Llamadas", "llamadas", camp.llamadas, "number")
      + "</div>"
      + "<div class=\\"account-edit-live\\" id=\\"campana-live\\"></div>"
      + "<button type=\\"submit\\" class=\\"account-back-btn\\">Guardar campaña</button></section>";

    function paintLive() {
      const fd = new FormData(form);
      const presupuesto = parseMoneyInput(fd.get("presupuesto"));
      const iva = parseMoneyInput(fd.get("iva"));
      const gastado = parseMoneyInput(fd.get("gastado"));
      const para = Math.max(0, presupuesto - iva);
      const resta = Math.max(0, para - gastado);
      const live = form.querySelector("#campana-live");
      if (!live) return;
      live.innerHTML = ""
        + "<div class=\\"account-board-facts\\">"
        + "<div><em>Después de IVA</em><strong>" + escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Para la campaña</em><strong>" + escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Restante</em><strong>" + escapeHtml(moneyText(resta)) + "</strong></div>"
        + "<div><em>Gastado</em><strong>" + escapeHtml(moneyText(gastado)) + "</strong></div>"
        + "</div>";
    }

    form.addEventListener("input", paintLive);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const next = readAccountData();
      next.campana = {
        name: String(fd.get("name") || "").trim(),
        canal: String(fd.get("canal") || "").trim(),
        zona: String(fd.get("zona") || "").trim(),
        inicio: String(fd.get("inicio") || "").trim(),
        status: String(fd.get("status") || "Activa").trim(),
        presupuesto: parseMoneyInput(fd.get("presupuesto")),
        iva: parseMoneyInput(fd.get("iva")),
        gastado: parseMoneyInput(fd.get("gastado")),
        visitas: parseMoneyInput(fd.get("visitas")),
        clics: parseMoneyInput(fd.get("clics")),
        llamadas: parseMoneyInput(fd.get("llamadas")),
      };
      writeAccountData(next);
      loadAccountSection("campana");
    });
    board.append(form, accountBackButton());
    paintLive();
    view.replaceChildren(board);
    animateAccountBoard(board);
  }

  function renderAdminPagosEditor() {
    const data = readAccountData();
    const board = document.createElement("div");
    board.className = "account-board";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\\"account-board-panel\\"><div class=\\"account-board-head\\"><h2>Cargar pago</h2><em>admin</em></div>"
      + "<div class=\\"account-edit-grid\\">"
      + accountField("Concepto / nombre", "concepto", "")
      + accountField("Fecha", "fecha", "")
      + accountField("Estado", "estado", "Programado")
      + accountField("Cantidad", "monto", "", "number")
      + "</div>"
      + "<label class=\\"account-edit-check\\"><input type=\\"checkbox\\" name=\\"es_proximo\\" checked> Es el próximo pago</label>"
      + "<button type=\\"submit\\" class=\\"account-back-btn\\">Guardar pago</button></section>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const row = {
        concepto: String(fd.get("concepto") || "").trim(),
        fecha: String(fd.get("fecha") || "").trim(),
        estado: String(fd.get("estado") || "Programado").trim(),
        monto: parseMoneyInput(fd.get("monto")),
      };
      if (!row.concepto || !row.fecha) return;
      const next = readAccountData();
      if (fd.get("es_proximo")) next.pagos.proximo = row;
      else next.pagos.historial.unshift(row);
      writeAccountData(next);
      loadAccountSection("pagos");
    });

    const list = document.createElement("section");
    list.className = "account-board-panel";
    list.innerHTML = "<div class=\\"account-board-head\\"><h2>Historial</h2><em>editable</em></div>";
    const rows = document.createElement("div");
    rows.className = "account-pay-list is-dark";
    (data.pagos.historial || []).forEach((row, index) => {
      const rowEl = document.createElement("div");
      rowEl.className = "account-pay-row";
      rowEl.innerHTML = ""
        + "<div><strong>" + escapeHtml(row.concepto || "") + "</strong><p>" + escapeHtml(row.fecha || "") + " · " + escapeHtml(row.estado || "") + "</p></div>"
        + "<div class=\\"account-pay-side\\"><strong>" + escapeHtml(moneyText(row.monto)) + "</strong></div>";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "account-edit-mini";
      del.textContent = "Quitar";
      del.addEventListener("click", () => {
        const next = readAccountData();
        next.pagos.historial.splice(index, 1);
        writeAccountData(next);
        loadAccountSection("pagos");
      });
      rowEl.querySelector(".account-pay-side").append(del);
      rows.append(rowEl);
    });
    list.append(rows);
    board.append(form, list, accountBackButton());
    view.replaceChildren(board);
    animateAccountBoard(board);
  }

  function renderAdminLicenciaEditor() {
    const lic = readAccountData().licencia;
    const board = document.createElement("div");
    board.className = "account-board";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\\"account-board-panel\\"><div class=\\"account-board-head\\"><h2>Editar licencia</h2><em>admin</em></div>"
      + "<div class=\\"account-edit-grid\\">"
      + accountField("Estado", "status", lic.status)
      + accountField("Plan", "plan", lic.plan)
      + accountField("Cuenta", "cuenta", lic.cuenta)
      + accountField("Inicio", "inicio", lic.inicio)
      + accountField("Vigencia", "fin", lic.fin)
      + accountField("Precio Pro", "precioPro", lic.precioPro)
      + accountField("Tu costo", "precioEspecial", lic.precioEspecial)
      + "</div>"
      + "<button type=\\"submit\\" class=\\"account-back-btn\\">Guardar licencia</button></section>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const next = readAccountData();
      next.licencia = Object.assign({}, next.licencia, {
        status: String(fd.get("status") || "").trim(),
        plan: String(fd.get("plan") || "").trim(),
        cuenta: String(fd.get("cuenta") || "").trim(),
        inicio: String(fd.get("inicio") || "").trim(),
        fin: String(fd.get("fin") || "").trim(),
        precioPro: String(fd.get("precioPro") || "").trim(),
        precioEspecial: String(fd.get("precioEspecial") || "").trim(),
      });
      writeAccountData(next);
      loadAccountSection("licencia");
    });
    board.append(form, accountBackButton());
    view.replaceChildren(board);
    animateAccountBoard(board);
  }

  function renderAdminReferidosEditor() {
    const cfg = readAccountData().referidosConfig;
    const board = document.createElement("div");
    board.className = "account-board";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\\"account-board-panel\\"><div class=\\"account-board-head\\"><h2>Configurar referidos</h2><em>admin</em></div>"
      + "<div class=\\"account-edit-grid\\">"
      + accountField("% descuento dueño (sig. mes)", "descuentoDueno", cfg.descuentoDueno, "number")
      + accountField("% descuento referido (proyecto)", "descuentoReferido", cfg.descuentoReferido, "number")
      + accountField("Activo desde", "activoDesde", cfg.activoDesde, "date")
      + accountField("Empleado / responsable", "empleado", cfg.empleado)
      + "</div>"
      + "<button type=\\"submit\\" class=\\"account-back-btn\\">Guardar referidos</button></section>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const next = readAccountData();
      next.referidosConfig = {
        descuentoDueno: parseMoneyInput(fd.get("descuentoDueno")),
        descuentoReferido: parseMoneyInput(fd.get("descuentoReferido")),
        activoDesde: String(fd.get("activoDesde") || "").trim(),
        empleado: String(fd.get("empleado") || "").trim(),
      };
      writeAccountData(next);
      loadReferrals();
    });

    const list = document.createElement("section");
    list.className = "account-board-panel";
    list.innerHTML = "<div class=\\"account-board-head\\"><h2>Referidos del cliente</h2><em>estados</em></div>";
    const rowsWrap = document.createElement("div");
    rowsWrap.className = "account-pay-list is-dark";
    readClientReferrals().forEach((item, index) => {
      const rowEl = document.createElement("div");
      rowEl.className = "account-pay-row";
      rowEl.innerHTML = ""
        + "<div><strong>" + escapeHtml(item.nombre || "Referido") + "</strong><p>" + escapeHtml(item.estado || "") + "</p></div>";
      const side = document.createElement("div");
      side.className = "account-pay-side";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "account-edit-mini";
      toggle.textContent = item.cerrado ? "Reabrir" : "Marcar cerrado";
      toggle.addEventListener("click", () => {
        const rows = readClientReferrals();
        rows[index] = Object.assign({}, rows[index], {
          cerrado: !rows[index].cerrado,
          estado: !rows[index].cerrado ? "Cerrado" : "Enviado",
        });
        writeClientReferrals(rows);
        loadReferrals();
      });
      side.append(toggle);
      rowEl.append(side);
      rowsWrap.append(rowEl);
    });
    list.append(rowsWrap);
    board.append(form, list, accountBackButton());
    view.replaceChildren(board);
    animateAccountBoard(board);
  }

`;

if (!s.includes("function renderAdminCampanaEditor")) {
  const marker = "  function loadAccountSection(kind) {";
  if (!s.includes(marker)) throw new Error("loadAccountSection missing");
  s = s.replace(marker, adminEditors + marker);
}

// Inject admin branch at start of loadAccountSection
if (!s.includes("if (isAdminRole() && kind === \"campana\")")) {
  s = s.replace(
    "  function loadAccountSection(kind) {\n    const item = accountStatus()[kind];\n\n    if (kind === \"campana\" && item) {",
    "  function loadAccountSection(kind) {\n    if (isAdminRole() && kind === \"campana\") {\n      renderAdminCampanaEditor();\n      return;\n    }\n    if (isAdminRole() && kind === \"pagos\") {\n      renderAdminPagosEditor();\n      return;\n    }\n    if (isAdminRole() && kind === \"licencia\") {\n      renderAdminLicenciaEditor();\n      return;\n    }\n\n    const item = accountStatus()[kind];\n\n    if (kind === \"campana\" && item) {"
  );
}

// Admin referrals: at start of loadReferrals after board create - better replace beginning of loadReferrals body
if (!s.includes("if (isAdminRole()) {\n      renderAdminReferidosEditor()")) {
  s = s.replace(
    "  function loadReferrals() {\n    const board = document.createElement(\"div\");\n    board.className = \"account-board\";\n    const clientName = accountClientName();",
    "  function loadReferrals() {\n    if (isAdminRole()) {\n      renderAdminReferidosEditor();\n      return Promise.resolve();\n    }\n    const board = document.createElement(\"div\");\n    board.className = \"account-board\";\n    const clientName = accountClientName();\n    const refCfg = readAccountData().referidosConfig;"
  );
}

// Use dynamic discount % from config in owner referrals view
s = s.replace(
  "const lead = card(discountOn ? \"50%\" : \"0%\", \"Desc. sig. mes\", \"check\");",
  "const ownerPct = Number((refCfg && refCfg.descuentoDueno) || 50);\n    const refPct = Number((refCfg && refCfg.descuentoReferido) || 10);\n    const lead = card(discountOn ? (ownerPct + \"%\") : \"0%\", \"Desc. sig. mes\", \"check\");"
);
s = s.replace(
  "+ \"<li>Se le manda un mensaje personalizado al referido con su 10% de descuento por venir de Aluminios y Vidrios Instala.</li>\"\n"
  + "      + \"<li>Si se cierra el negocio, usted obtiene 50% de descuento en el siguiente mes de gestión.</li>\"",
  "+ \"<li>Se le manda un mensaje personalizado al referido con su \" + refPct + \"% de descuento por venir de Aluminios y Vidrios Instala.</li>\"\n"
  + "      + \"<li>Si se cierra el negocio, usted obtiene \" + ownerPct + \"% de descuento en el siguiente mes de gestión.</li>\""
);
s = s.replace(
  "? \"Hay un referido cerrado: su 50% del siguiente mes ya está habilitado. El referido recibió 10% en su proyecto.\"\n"
  + "        : \"Al cerrarse un referido: usted 50% el siguiente mes de gestión, y el referido 10% en su proyecto.\")",
  "? (\"Hay un referido cerrado: su \" + ownerPct + \"% del siguiente mes ya está habilitado. El referido recibió \" + refPct + \"% en su proyecto.\")\n"
  + "        : (\"Al cerrarse un referido: usted \" + ownerPct + \"% el siguiente mes de gestión, y el referido \" + refPct + \"% en su proyecto.\"))"
);
s = s.replace(
  "+ (discountOn ? \"50% habilitado\" : \"50%\")\n"
  + "      + \"</strong><span>siguiente mes gestión</span></div>\"\n"
  + "      + \"<div><em>Referido</em><strong>10%</strong><span>en su proyecto</span></div>\"",
  "+ (discountOn ? (ownerPct + \"% habilitado\") : (ownerPct + \"%\"))\n"
  + "      + \"</strong><span>siguiente mes gestión</span></div>\"\n"
  + "      + \"<div><em>Referido</em><strong>\" + refPct + \"%</strong><span>en su proyecto</span></div>\""
);
s = s.replace(
  "\"Hola, te escribe \" + clientName + \" de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes 10% de descuento en tu proyecto web.\"",
  "\"Hola, te escribe \" + clientName + \" de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes \" + refPct + \"% de descuento en tu proyecto web.\""
);
s = s.replace(
  "\"Hola \" + nombre + \", te escribe \" + clientName + \" de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes 10% de descuento en tu proyecto web. Si te interesa, con gusto te orientamos.\"",
  "\"Hola \" + nombre + \", te escribe \" + clientName + \" de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes \" + refPct + \"% de descuento en tu proyecto web. Si te interesa, con gusto te orientamos.\""
);

// CRM restrictions for admin in renderContactList
if (!s.includes("const canEditCrm = isOwnerRole();")) {
  s = s.replace(
    "function renderContactList(items, mode) {",
    "function renderContactList(items, mode) {\n    const canEditCrm = isOwnerRole();"
  );
}

// Guard remove button
s = s.replace(
  "side.append(badge, remove);\n      head.append(avatar, main, side);",
  "if (canEditCrm) side.append(badge, remove);\n      else side.append(badge);\n      head.append(avatar, main, side);"
);

// Guard prospect status + promote
s = s.replace(
  "if (!isClients) {\n        const statusRow = document.createElement(\"div\");",
  "if (!isClients && canEditCrm) {\n        const statusRow = document.createElement(\"div\");"
);

// Client actions: admin observes quote flow
s = s.replace(
  "        quoteBtn.textContent = \"Cotización\";\n        quoteBtn.addEventListener(\"click\", () => openClientSheet(item.id, \"cotizacion\"));\n        actions.append(historyBtn, quoteBtn);\n        card.append(actions);",
  "        quoteBtn.textContent = canEditCrm ? \"Cotización\" : \"Ver flujo\";\n        quoteBtn.addEventListener(\"click\", () => openClientSheet(item.id, \"cotizacion\"));\n        actions.append(historyBtn, quoteBtn);\n        card.append(actions);"
);

// Quote form: hide for admin
s = s.replace(
  "const formTitle = document.createElement(\"h3\");\n      formTitle.textContent = currentQuote ? \"Editar cotización\" : \"Crear cotización\";\n      sheet.append(formTitle, buildQuoteForm(contact, currentQuote));",
  "if (isOwnerRole()) {\n        const formTitle = document.createElement(\"h3\");\n        formTitle.textContent = currentQuote ? \"Editar cotización\" : \"Crear cotización\";\n        sheet.append(formTitle, buildQuoteForm(contact, currentQuote));\n      } else {\n        const observe = document.createElement(\"p\");\n        observe.className = \"muted\";\n        observe.textContent = \"Rol admin: solo observación del flujo. No genera ni edita cotizaciones.\";\n        sheet.append(observe);\n      }"
);

// Hide FAB for admin
s = s.replace(
  "      const fab = document.createElement(\"button\");\n      fab.type = \"button\";\n      fab.className = \"contact-fab\";\n      fab.setAttribute(\"aria-label\", \"Registrar contacto\");\n      fab.innerHTML = '<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></svg><span>Registrar</span>';\n      fab.addEventListener(\"click\", () => openContactModal(dates.hasta));\n      wrap.append(fab);",
  "      if (isOwnerRole()) {\n        const fab = document.createElement(\"button\");\n        fab.type = \"button\";\n        fab.className = \"contact-fab\";\n        fab.setAttribute(\"aria-label\", \"Registrar contacto\");\n        fab.innerHTML = '<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></svg><span>Registrar</span>';\n        fab.addEventListener(\"click\", () => openContactModal(dates.hasta));\n        wrap.append(fab);\n      }"
);

fs.writeFileSync(path, s);
console.log("roles patch applied");
