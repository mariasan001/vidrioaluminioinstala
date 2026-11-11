/* Panel: campaña, pagos, licencia y escritura de datos de cuenta (desk account UI). */
(function (AVI) {
  AVI.accountDataKey = accountDataKey;
  AVI.defaultAccountData = defaultAccountData;
  AVI.readAccountData = readAccountData;
  AVI.writeAccountData = writeAccountData;
  AVI.parseMoneyInput = parseMoneyInput;
  AVI.closeAccountSheet = closeAccountSheet;
  AVI.openAccountSheet = openAccountSheet;
  AVI.accountBackButton = accountBackButton;
  AVI.accountClientName = accountClientName;
  AVI.accountWhatsAppButton = accountWhatsAppButton;
  AVI.animateAccountBoard = animateAccountBoard;
  AVI.accountField = accountField;
  AVI.accountEditActions = accountEditActions;
  AVI.loadAccountSection = loadAccountSection;
  const { view } = AVI;

  function loadDesk(message) {
    const sheet = document.createElement("section");
    sheet.className = "desk";
    sheet.append(AVI.line(message, "muted"));
    view.replaceChildren(sheet);
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
    const base = defaultAccountData();
    if (AVI.accountCache) {
      return {
        campana: Object.assign({}, base.campana, AVI.accountCache.campana || {}),
        pagos: {
          proximo: Object.assign({}, base.pagos.proximo, (AVI.accountCache.pagos && AVI.accountCache.pagos.proximo) || {}),
          historial: Array.isArray(AVI.accountCache.pagos && AVI.accountCache.pagos.historial) ? AVI.accountCache.pagos.historial : [],
        },
        licencia: Object.assign({}, base.licencia, AVI.accountCache.licencia || {}),
        referidosConfig: Object.assign({}, base.referidosConfig, AVI.accountCache.referidosConfig || {}),
      };
    }
    try {
      const raw = sessionStorage.getItem(accountDataKey());
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return base;
      AVI.accountCache = parsed;
      return {
        campana: Object.assign({}, base.campana, parsed.campana || {}),
        pagos: {
          proximo: Object.assign({}, base.pagos.proximo, (parsed.pagos && parsed.pagos.proximo) || {}),
          historial: Array.isArray(parsed.pagos && parsed.pagos.historial) ? parsed.pagos.historial : [],
        },
        licencia: Object.assign({}, base.licencia, parsed.licencia || {}),
        referidosConfig: Object.assign({}, base.referidosConfig, parsed.referidosConfig || {}),
      };
    } catch (error) {
      return base;
    }
  }
  function writeAccountData(data, section) {
    AVI.accountCache = data;
    try {
      sessionStorage.setItem(accountDataKey(), JSON.stringify(data));
    } catch (error) {}
    if (!section) return Promise.resolve({ ok: true });
    const payload = section === "pagos"
      ? data.pagos
      : (section === "referidosConfig" ? data.referidosConfig : data[section]);
    return fetch("/api/account.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: AVI.csrfToken(), section: section, data: payload }),
    }).then(function (response) { return response.json(); }).then(function (res) {
      if (res && res.ok && res.account) {
        AVI.accountCache = res.account;
        try { sessionStorage.setItem(accountDataKey(), JSON.stringify(res.account)); } catch (error) {}
      }
      return res || { ok: false };
    }).catch(function () { return { ok: false }; });
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
  function formatMoneyField(input) {
    if (!input) return;
    input.value = moneyText(parseMoneyInput(input.value));
  }
  function bindMoneyFields(form) {
    form.querySelectorAll("input[data-money=\"1\"]").forEach((input) => {
      formatMoneyField(input);
      input.addEventListener("blur", () => formatMoneyField(input));
      input.addEventListener("focus", () => {
        const amount = parseMoneyInput(input.value);
        input.value = amount ? String(amount) : "";
        input.select();
      });
    });
  }
  function accountStatus() {
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
  function closeAccountSheet() {
    const modal = document.getElementById("account-modal");
    const gear = document.querySelector('.tabs button[data-action="cuenta"]');
    if (gear) gear.setAttribute("aria-expanded", "false");
    if (!modal) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sheet = modal.querySelector(".account-sheet");
    if (window.gsap && !reduce && sheet) {
      window.gsap.timeline({ onComplete: () => modal.remove() })
        .to(sheet, { y: 40, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
        .to(modal, { autoAlpha: 0, duration: 0.18 }, 0);
      return;
    }
    modal.remove();
  }
  function openAccountSheet() {
    closeAccountSheet();
    const gear = document.querySelector('.tabs button[data-action="cuenta"]');
    if (gear) gear.setAttribute("aria-expanded", "true");

    const modal = document.createElement("div");
    modal.className = "account-modal";
    modal.id = "account-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Opciones de cuenta");

    const sheet = document.createElement("div");
    sheet.className = "account-sheet";
    const handle = document.createElement("span");
    handle.className = "account-sheet-handle";
    handle.setAttribute("aria-hidden", "true");

    const top = document.createElement("div");
    top.className = "account-sheet-top";
    const heading = document.createElement("h2");
    heading.textContent = "Cuenta";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const list = document.createElement("div");
    list.className = "account-options";
    const status = accountStatus();
    const icons = {
      campana: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5v3h3.2L14 18V6l-6.8 4.5zM16.5 9.2a3.2 3.2 0 0 1 0 5.6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>',
      pagos: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 8.5h17v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17.5zM3.5 8.5 6 5h12l2.5 3.5M3.5 12.5h17" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      licencia: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h7l4 4v12H7zM14 4v4h4M9.5 13h5M9.5 16.5h3.5M8.2 9.2l1.4 1.4 2.8-2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      referidos: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.8 3.8 0 0 1 7 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H10M10 12h9M16 8.5 19.5 12 16 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    function goAccountVista(key) {
      const next = "#" + key;
      const modalNode = document.getElementById("account-modal");
      if (modalNode) modalNode.remove();
      if (gear) gear.setAttribute("aria-expanded", "false");
      if (location.hash === next) AVI.show();
      else location.hash = next;
    }

    const adminMode = AVI.isAdminRole();
    const refCfg = readAccountData().referidosConfig;
    const ownerPct = Number((refCfg && refCfg.descuentoDueno) || 50);
    const refPct = Number((refCfg && refCfg.descuentoReferido) || 10);
    const titles = {
      campana: adminMode ? "Editar campaña" : status.campana.title,
      pagos: adminMode ? "Cargar pagos" : status.pagos.title,
      licencia: adminMode ? "Editar licencia" : status.licencia.title,
    };
    const details = {
      campana: adminMode ? "Nombre, canal, zona, presupuesto e IVA" : status.campana.detail,
      pagos: adminMode ? "Nombre, concepto, fecha, estado y cantidad" : status.pagos.detail,
      licencia: adminMode ? "Vigencia, plan y costo" : status.licencia.detail,
    };

    ["campana", "pagos", "licencia"].forEach((key) => {
      const item = status[key];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "account-option";
      button.dataset.vista = key;
      button.innerHTML = ""
        + "<span class=\"account-option-ico\">" + icons[key] + "</span>"
        + "<span><strong>" + AVI.escapeHtml(titles[key]) + "</strong><p>" + AVI.escapeHtml(details[key]) + "</p></span>"
        + "<span class=\"account-option-status" + (item.warn ? " is-warn" : "") + "\">" + AVI.escapeHtml(adminMode ? "Editar" : item.status) + "</span>";
      button.addEventListener("click", () => goAccountVista(key));
      list.append(button);
    });

    const referidosBtn = document.createElement("button");
    referidosBtn.type = "button";
    referidosBtn.className = "account-option";
    referidosBtn.innerHTML = ""
      + "<span class=\"account-option-ico\">" + icons.referidos + "</span>"
      + "<span><strong>" + (adminMode ? "Configurar referidos" : "Mis referidos") + "</strong><p>"
      + (adminMode
        ? ("Porcentaje, fecha activo y empleado")
        : ("Usted " + ownerPct + "% · referido " + refPct + "%"))
      + "</p></span>"
      + "<span class=\"account-option-status\">" + (adminMode ? "Editar" : "Ver") + "</span>";
    referidosBtn.addEventListener("click", () => goAccountVista("referidos"));
    list.append(referidosBtn);

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.className = "account-option is-logout";
    logoutBtn.innerHTML = ""
      + "<span class=\"account-option-ico\">" + icons.logout + "</span>"
      + "<span><strong>Cerrar sesión</strong><p>Salir del panel</p></span>"
      + "<span class=\"account-option-status is-warn\">Salir</span>";
    logoutBtn.addEventListener("click", () => {
      const form = document.querySelector('form[action="/api/logout.php"]');
      if (form) {
        form.submit();
        return;
      }
      window.location.href = "/api/logout.php";
    });
    list.append(logoutBtn);

    sheet.append(handle, top, list);
    modal.append(sheet);
    document.body.append(modal);

    close.addEventListener("click", closeAccountSheet);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeAccountSheet();
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.gsap && !reduce) {
      window.gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      window.gsap.fromTo(sheet, { y: 48, autoAlpha: 0.7 }, { y: 0, autoAlpha: 1, duration: 0.34, ease: "power3.out" });
      window.gsap.fromTo(list.children, { y: 14, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        stagger: 0.06,
        delay: 0.08,
        ease: "back.out(1.6)",
      });
      if (gear) {
        window.gsap.fromTo(gear.querySelector(".nav-ico"), { rotate: 0 }, {
          rotate: 42,
          duration: 0.35,
          ease: "back.out(1.8)",
        });
      }
    }
  }
  function accountBackButton() {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "account-back-btn";
    const mobile = window.matchMedia("(max-width: 980px)").matches;
    back.textContent = mobile ? "Volver a opciones" : "Volver al resumen";
    back.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 980px)").matches) openAccountSheet();
      else {
        if (location.hash === "#resumen" || !location.hash) AVI.show();
        else location.hash = "#resumen";
      }
    });
    return back;
  }
  function accountClientName() {
    const node = document.querySelector(".account strong");
    const name = node ? String(node.textContent || "").trim() : "";
    return name || "Instala";
  }
  function accountWhatsAppButton(label, message, kind) {
    const link = document.createElement("a");
    link.className = "account-wa-btn" + (kind === "soft" ? " is-soft" : "");
    link.href = AVI.whatsappHref("7221295236", message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }
  function animateAccountBoard(board) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) return;
    window.gsap.fromTo(board.children, { y: 18, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.34,
      stagger: 0.06,
      ease: "power2.out",
    });
  }
  function accountField(label, name, value, type, extraClass) {
    const isMoney = type === "money";
    const inputType = isMoney ? "text" : (type || "text");
    const shown = isMoney ? moneyText(value) : String(value == null ? "" : value);
    return ""
      + "<label class=\"account-edit-field" + (extraClass ? (" " + extraClass) : "") + (isMoney ? " is-money" : "") + "\"><span>" + label + "</span>"
      + "<input name=\"" + name + "\" type=\"" + inputType + "\" value=\"" + AVI.escapeHtml(shown) + "\""
      + (isMoney ? " data-money=\"1\"" : "")
      + " inputmode=\"" + ((type === "number" || isMoney) ? "decimal" : "text") + "\"></label>";
  }
  function accountEditActions(submitLabel) {
    return ""
      + "<div class=\"account-edit-actions\">"
      + "<button type=\"submit\" class=\"account-edit-save\">" + AVI.escapeHtml(submitLabel) + "</button>"
      + "</div>";
  }
  function renderAdminCampanaEditor() {
    const data = readAccountData();
    const camp = data.campana;
    const board = document.createElement("div");
    board.className = "account-board is-admin-edit";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\"account-edit-panel\">"
      + "<div class=\"account-edit-banner\"><strong>Editor admin</strong><span>Los cambios se reflejan en la vista del dueño</span></div>"
      + "<div class=\"account-edit-block\">"
      + "<div class=\"account-edit-block-head\"><h2>Datos de campaña</h2><em>identidad</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Nombre", "name", camp.name, "text", "is-full")
      + accountField("Canal", "canal", camp.canal)
      + accountField("Estado", "status", camp.status)
      + accountField("Zona", "zona", camp.zona, "text", "is-full")
      + accountField("Inicio", "inicio", camp.inicio)
      + "</div></div>"
      + "<div class=\"account-edit-block is-money\">"
      + "<div class=\"account-edit-block-head\"><h2>Presupuesto</h2><em>se calcula solo</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Presupuesto dado", "presupuesto", camp.presupuesto, "money")
      + accountField("IVA descontado", "iva", camp.iva, "money")
      + accountField("Gastado", "gastado", camp.gastado, "money", "is-full")
      + "</div>"
      + "<div class=\"account-edit-live\" id=\"campana-live\"></div>"
      + "</div>"
      + "<div class=\"account-edit-block\">"
      + "<div class=\"account-edit-block-head\"><h2>Resultados</h2><em>métricas</em></div>"
      + "<div class=\"account-edit-grid is-three\">"
      + accountField("Visitas", "visitas", camp.visitas, "number")
      + accountField("Clics", "clics", camp.clics, "number")
      + accountField("Llamadas", "llamadas", camp.llamadas, "number")
      + "</div></div>"
      + accountEditActions("Guardar campaña")
      + "</section>";

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
        + "<div class=\"account-edit-calc\">"
        + "<div class=\"is-lead\"><em>Restante</em><strong>" + AVI.escapeHtml(moneyText(resta)) + "</strong></div>"
        + "<div><em>Después de IVA</em><strong>" + AVI.escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Para la campaña</em><strong>" + AVI.escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Gastado</em><strong>" + AVI.escapeHtml(moneyText(gastado)) + "</strong></div>"
        + "</div>";
    }

    form.addEventListener("input", paintLive);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.querySelectorAll("input[data-money=\"1\"]").forEach((input) => formatMoneyField(input));
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
      writeAccountData(next, "campana");
      const saveBtn = form.querySelector(".account-edit-save");
      if (saveBtn) {
        saveBtn.textContent = "Guardado";
        saveBtn.classList.add("is-saved");
        window.setTimeout(() => {
          saveBtn.textContent = "Guardar campaña";
          saveBtn.classList.remove("is-saved");
        }, 1200);
      }
    });
    bindMoneyFields(form);
    board.append(form, accountBackButton());
    paintLive();
    view.replaceChildren(board);
    animateAccountBoard(board);
  }
  function animatePayBoard(board) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce || !board) return;
    const hero = board.querySelector(".pay-hero");
    const rows = board.querySelectorAll(".pay-timeline-item");
    const rest = board.querySelectorAll(".pay-add-btn, .account-edit-panel.is-history, .account-back-btn");
    const tl = window.gsap.timeline();
    if (hero) {
      tl.fromTo(hero, { y: 24, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.42, ease: "power3.out" }, 0);
      const amount = hero.querySelector(".pay-hero-amount");
      if (amount) tl.fromTo(amount, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.34, ease: "power2.out" }, 0.12);
    }
    if (rest.length) tl.fromTo(rest, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.32, stagger: 0.07, ease: "power2.out" }, 0.16);
    if (rows.length) tl.fromTo(rows, { x: -14, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.28, stagger: 0.05, ease: "power2.out" }, 0.22);
  }
  function openNextPayModal() {
    const existing = document.getElementById("pay-next-modal");
    if (existing) existing.remove();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.id = "pay-next-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Nuevo próximo pago");

    const sheet = document.createElement("div");
    sheet.className = "contact-sheet pay-history-sheet";
    const handle = document.createElement("span");
    handle.className = "contact-sheet-handle";
    handle.setAttribute("aria-hidden", "true");

    const top = document.createElement("div");
    top.className = "contact-sheet-top";
    const heading = document.createElement("h2");
    heading.textContent = "Nuevo próximo pago";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const body = document.createElement("div");
    body.className = "pay-history-body";
    const form = document.createElement("form");
    form.className = "pay-history-form";
    form.innerHTML = ""
      + "<div class=\"pay-modal-kicker\">Formulario admin</div>"
      + "<p class=\"pay-history-lead\">Captura nombre, fecha, estado y cantidad. El pago actual pasará al historial.</p>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Nombre / concepto", "concepto", "", "text", "is-full")
      + accountField("Fecha", "fecha", "")
      + accountField("Estado", "estado", "Programado")
      + accountField("Cantidad", "monto", "", "money", "is-full")
      + "</div>"
      + "<button type=\"submit\" class=\"account-edit-save\">Guardar próximo pago</button>";
    bindMoneyFields(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.querySelectorAll("input[data-money=\"1\"]").forEach((input) => formatMoneyField(input));
      const fd = new FormData(form);
      const row = {
        concepto: String(fd.get("concepto") || "").trim(),
        fecha: String(fd.get("fecha") || "").trim(),
        estado: String(fd.get("estado") || "Programado").trim(),
        monto: parseMoneyInput(fd.get("monto")),
      };
      if (!row.concepto || !row.fecha) return;
      const next = readAccountData();
      if (next.pagos.proximo && next.pagos.proximo.concepto) {
        next.pagos.historial.unshift(Object.assign({}, next.pagos.proximo, {
          estado: next.pagos.proximo.estado || "Pagado",
        }));
      }
      next.pagos.proximo = row;
      writeAccountData(next, "pagos");
      function finish() {
        modal.remove();
        loadAccountSection("pagos");
      }
      if (window.gsap && !reduce) {
        window.gsap.timeline({ onComplete: finish })
          .to(sheet, { y: 40, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
          .to(modal, { autoAlpha: 0, duration: 0.18 }, 0);
      } else finish();
    });
    body.append(form);

    function closeModal() {
      if (window.gsap && !reduce) {
        window.gsap.timeline({ onComplete: () => modal.remove() })
          .to(sheet, { y: 40, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
          .to(modal, { autoAlpha: 0, duration: 0.18 }, 0);
        return;
      }
      modal.remove();
    }
    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    sheet.append(handle, top, body);
    modal.append(sheet);
    document.body.append(modal);
    if (window.gsap && !reduce) {
      window.gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power2.out" });
      window.gsap.fromTo(sheet, { y: 64, autoAlpha: 0.75 }, { y: 0, autoAlpha: 1, duration: 0.38, ease: "power3.out" });
      const fields = form.querySelectorAll(".account-edit-field, .pay-modal-kicker, .pay-history-lead, .account-edit-save");
      window.gsap.fromTo(fields, { y: 16, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        stagger: 0.05,
        delay: 0.12,
        ease: "power2.out",
      });
    }
  }
  function renderAdminPagosEditor() {
    const data = readAccountData();
    const board = document.createElement("div");
    board.className = "account-board is-admin-edit is-pagos";
    const proximo = data.pagos.proximo || {};
    const historial = data.pagos.historial || [];

    const hero = document.createElement("section");
    hero.className = "pay-hero";
    hero.innerHTML = ""
      + "<div class=\"pay-hero-top\"><span>Próximo cobro</span><em>" + AVI.escapeHtml(proximo.estado || "Programado") + "</em></div>"
      + "<strong class=\"pay-hero-amount\">" + AVI.escapeHtml(moneyText(proximo.monto)) + "</strong>"
      + "<p class=\"pay-hero-concept\">" + AVI.escapeHtml(proximo.concepto || "Sin próximo pago") + "</p>"
      + "<div class=\"pay-hero-meta\">"
      + "<div><em>Fecha</em><strong>" + AVI.escapeHtml(proximo.fecha || "—") + "</strong></div>"
      + "<div><em>Historial</em><strong>" + historial.length + " pagos</strong></div>"
      + "</div>";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "pay-add-btn";
    addBtn.innerHTML = ""
      + "<span class=\"pay-add-ico\" aria-hidden=\"true\">+</span>"
      + "<span><strong>Agregar nuevo próximo pago</strong><em>Se abre el formulario en modal</em></span>";
    addBtn.addEventListener("click", () => {
      if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.fromTo(addBtn, { scale: 1 }, { scale: 0.97, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" });
      }
      openNextPayModal();
    });

    const list = document.createElement("section");
    list.className = "account-edit-panel is-history";
    list.innerHTML = ""
      + "<div class=\"account-edit-block-head\"><h2>Historial de pagos</h2><em>a la vista</em></div>";
    const timeline = document.createElement("div");
    timeline.className = "pay-timeline";
    if (!historial.length) {
      timeline.append(AVI.line("Aún no hay pagos en el historial.", "muted"));
    } else {
      historial.forEach((row, index) => {
        const rowEl = document.createElement("article");
        rowEl.className = "pay-timeline-item";
        rowEl.innerHTML = ""
          + "<span class=\"pay-timeline-dot\" aria-hidden=\"true\"></span>"
          + "<div class=\"pay-timeline-main\">"
          + "<strong>" + AVI.escapeHtml(row.concepto || "") + "</strong>"
          + "<p>" + AVI.escapeHtml(row.fecha || "") + " · " + AVI.escapeHtml(row.estado || "Pagado") + "</p>"
          + "</div>"
          + "<div class=\"pay-timeline-side\">"
          + "<strong>" + AVI.escapeHtml(moneyText(row.monto)) + "</strong>"
          + "</div>";
        const del = document.createElement("button");
        del.type = "button";
        del.className = "account-edit-mini";
        del.textContent = "Quitar";
        del.addEventListener("click", () => {
          const next = readAccountData();
          next.pagos.historial.splice(index, 1);
          writeAccountData(next, "pagos");
          loadAccountSection("pagos");
        });
        rowEl.querySelector(".pay-timeline-side").append(del);
        timeline.append(rowEl);
      });
    }
    list.append(timeline);

    board.append(hero, addBtn, list, accountBackButton());
    view.replaceChildren(board);
    animatePayBoard(board);
  }
  function animateLicenseForm(board) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce || !board) return;
    const hero = board.querySelector(".license-hero");
    const blocks = board.querySelectorAll(".account-edit-block, .account-edit-actions, .account-back-btn");
    const tl = window.gsap.timeline();
    if (hero) {
      tl.fromTo(hero, { y: 22, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.4, ease: "power3.out" }, 0);
    }
    if (blocks.length) {
      tl.fromTo(blocks, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" }, 0.12);
    }
  }
  function renderAdminLicenciaEditor() {
    const lic = readAccountData().licencia;
    const board = document.createElement("div");
    board.className = "account-board is-admin-edit is-licencia";
    const form = document.createElement("form");
    form.className = "account-edit-form license-edit-form";
    form.innerHTML = ""
      + "<section class=\"license-hero\">"
      + "<div class=\"license-hero-top\"><span>Editor admin</span><em>" + AVI.escapeHtml(lic.status || "Activa") + "</em></div>"
      + "<strong class=\"license-hero-plan\">" + AVI.escapeHtml(lic.plan || "Instala Pro") + "</strong>"
      + "<p class=\"license-hero-account\">" + AVI.escapeHtml(lic.cuenta || "") + "</p>"
      + "<div class=\"license-hero-meta\">"
      + "<div><em>Tu costo</em><strong>" + AVI.escapeHtml(lic.precioEspecial || moneyText(0)) + "</strong></div>"
      + "<div><em>Vigente hasta</em><strong>" + AVI.escapeHtml(lic.fin || "—") + "</strong></div>"
      + "</div>"
      + "</section>"
      + "<section class=\"account-edit-panel is-license-form\">"
      + "<div class=\"account-edit-block\">"
      + "<div class=\"account-edit-block-head\"><h2>Identidad</h2><em>cuenta</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Estado", "status", lic.status)
      + accountField("Plan", "plan", lic.plan)
      + accountField("Cuenta", "cuenta", lic.cuenta, "text", "is-full")
      + "</div></div>"
      + "<div class=\"account-edit-block\">"
      + "<div class=\"account-edit-block-head\"><h2>Vigencia</h2><em>fechas</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Inicio", "inicio", lic.inicio)
      + accountField("Vigencia", "fin", lic.fin)
      + "</div></div>"
      + "<div class=\"account-edit-block is-money\">"
      + "<div class=\"account-edit-block-head\"><h2>Costos</h2><em>mensual</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("Precio Pro", "precioPro", lic.precioPro, "money")
      + accountField("Tu costo", "precioEspecial", lic.precioEspecial, "money")
      + "</div></div>"
      + accountEditActions("Guardar licencia")
      + "</section>";
    bindMoneyFields(form);

    function syncHero() {
      const status = String((form.querySelector("[name=\"status\"]") || {}).value || "Activa").trim();
      const plan = String((form.querySelector("[name=\"plan\"]") || {}).value || "").trim();
      const cuenta = String((form.querySelector("[name=\"cuenta\"]") || {}).value || "").trim();
      const fin = String((form.querySelector("[name=\"fin\"]") || {}).value || "—").trim();
      const costo = moneyText(parseMoneyInput((form.querySelector("[name=\"precioEspecial\"]") || {}).value));
      const statusEl = form.querySelector(".license-hero-top em");
      const planEl = form.querySelector(".license-hero-plan");
      const accountEl = form.querySelector(".license-hero-account");
      const meta = form.querySelectorAll(".license-hero-meta strong");
      if (statusEl) statusEl.textContent = status || "Activa";
      if (planEl) planEl.textContent = plan || "Instala Pro";
      if (accountEl) accountEl.textContent = cuenta;
      if (meta[0]) meta[0].textContent = costo;
      if (meta[1]) meta[1].textContent = fin || "—";
    }

    form.addEventListener("input", syncHero);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.querySelectorAll("input[data-money=\"1\"]").forEach((input) => formatMoneyField(input));
      const fd = new FormData(form);
      const next = readAccountData();
      next.licencia = Object.assign({}, next.licencia, {
        status: String(fd.get("status") || "").trim(),
        plan: String(fd.get("plan") || "").trim(),
        cuenta: String(fd.get("cuenta") || "").trim(),
        inicio: String(fd.get("inicio") || "").trim(),
        fin: String(fd.get("fin") || "").trim(),
        precioPro: moneyText(parseMoneyInput(fd.get("precioPro"))),
        precioEspecial: moneyText(parseMoneyInput(fd.get("precioEspecial"))),
      });
      writeAccountData(next, "licencia");
      syncHero();
      const saveBtn = form.querySelector(".account-edit-save");
      if (saveBtn) {
        saveBtn.textContent = "Guardado";
        saveBtn.classList.add("is-saved");
        window.setTimeout(() => {
          saveBtn.textContent = "Guardar licencia";
          saveBtn.classList.remove("is-saved");
        }, 1200);
      }
    });
    board.append(form, accountBackButton());
    view.replaceChildren(board);
    animateLicenseForm(board);
  }
  function loadAccountSection(kind) {
    if (AVI.isAdminRole() && kind === "campana") {
      renderAdminCampanaEditor();
      return;
    }
    if (AVI.isAdminRole() && kind === "pagos") {
      renderAdminPagosEditor();
      return;
    }
    if (AVI.isAdminRole() && kind === "licencia") {
      renderAdminLicenciaEditor();
      return;
    }

    const item = accountStatus()[kind];

    if (kind === "campana" && item) {
      const isDesk = !window.matchMedia("(max-width: 760px)").matches;
      const board = document.createElement("div");
      board.className = "account-board is-campana" + (isDesk ? " is-desk" : "");

      if (isDesk) {
        const raw = item.raw || {};
        const presupuesto = Number(raw.presupuesto) || 0;
        const gastado = Number(raw.gastado) || 0;
        const spentPct = presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0;

        const hero = document.createElement("section");
        hero.className = "camp-desk-hero";
        hero.innerHTML = ""
          + "<div class=\"camp-desk-hero-top\">"
          + "<span class=\"camp-desk-status\">" + AVI.escapeHtml(item.status) + "</span>"
          + "<em>Campaña activa</em>"
          + "</div>"
          + "<h2>" + AVI.escapeHtml(item.name) + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + AVI.escapeHtml(item.canal) + "</span>"
          + "<span>" + AVI.escapeHtml(item.zona) + "</span>"
          + "<span>Desde " + AVI.escapeHtml(item.inicio) + "</span>"
          + "</div>";

        const money = document.createElement("section");
        money.className = "camp-desk-block";
        money.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Presupuesto</h3><em>uso del dinero</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Restante</em><strong>" + AVI.escapeHtml(item.resta) + "</strong><span>disponible</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Presupuesto dado</em><strong>" + AVI.escapeHtml(item.presupuesto) + "</strong><span>asignado</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Gastado</em><strong>" + AVI.escapeHtml(item.gastado) + "</strong><span>" + spentPct + "% usado</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-bar\" aria-hidden=\"true\"><i style=\"width:" + spentPct + "%\"></i></div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>IVA descontado</em><strong>" + AVI.escapeHtml(item.iva) + "</strong></div>"
          + "<div><em>Para la campaña</em><strong>" + AVI.escapeHtml(item.paraCampana) + "</strong></div>"
          + "</div>";

        const traffic = document.createElement("section");
        traffic.className = "camp-desk-block";
        traffic.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Resultados</h3><em>tráfico del periodo</em></div>"
          + "<div class=\"camp-desk-traffic\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Visitas</em><strong>" + AVI.escapeHtml(item.visitas) + "</strong><span>al sitio</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Clics</em><strong>" + AVI.escapeHtml(item.clics) + "</strong><span>en anuncios</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Llamadas</em><strong>" + AVI.escapeHtml(item.llamadas) + "</strong><span>detectadas</span></article>"
          + "</div>";

        board.append(hero, money, traffic);
        view.replaceChildren(board);
        animateAccountBoard(board);
        return;
      }

      const facts = document.createElement("section");
      facts.className = "account-board-panel";
      facts.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Campaña</h2><em>" + AVI.escapeHtml(item.status) + "</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Nombre</em><strong>" + AVI.escapeHtml(item.name) + "</strong></div>"
        + "<div><em>Canal</em><strong>" + AVI.escapeHtml(item.canal) + "</strong></div>"
        + "<div><em>Zona</em><strong>" + AVI.escapeHtml(item.zona) + "</strong></div>"
        + "<div><em>Inicio</em><strong>" + AVI.escapeHtml(item.inicio) + "</strong></div>"
        + "</div>";

      const money = document.createElement("div");
      money.className = "stats";
      const remaining = AVI.card(item.resta, "Restante", "check");
      remaining.classList.add("lead");
      money.append(
        remaining,
        AVI.card(item.presupuesto, "Presupuesto dado", "form"),
        AVI.card(item.iva, "IVA descontado", "form"),
        AVI.card(item.paraCampana, "Para la campaña", "check"),
        AVI.card(item.gastado, "Gastado", "form")
      );

      const results = document.createElement("div");
      results.className = "stats";
      const visits = AVI.card(item.visitas, "Visitas", "eye");
      visits.classList.add("lead");
      results.append(
        visits,
        AVI.card(item.clics, "Clics", "chat"),
        AVI.card(item.llamadas, "Llamadas", "phone")
      );

      board.append(facts, money, results, accountBackButton());
      view.replaceChildren(board);
      animateAccountBoard(board);
      return;
    }

    if (kind === "pagos" && item) {
      const isDesk = !window.matchMedia("(max-width: 760px)").matches;
      const board = document.createElement("div");
      board.className = "account-board is-pagos" + (isDesk ? " is-desk" : "");

      if (isDesk) {
        const hero = document.createElement("section");
        hero.className = "camp-desk-hero";
        hero.innerHTML = ""
          + "<div class=\"camp-desk-hero-top\">"
          + "<span class=\"camp-desk-status\">" + AVI.escapeHtml(item.proximo.estado || "Programado") + "</span>"
          + "<em>Próximo cobro</em>"
          + "</div>"
          + "<p class=\"camp-desk-amount\">" + AVI.escapeHtml(item.proximo.monto) + "</p>"
          + "<h2>" + AVI.escapeHtml(item.proximo.concepto || "Sin próximo pago") + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + AVI.escapeHtml(item.proximo.fecha || "—") + "</span>"
          + "<span>" + item.historial.length + " pagos en historial</span>"
          + "</div>";

        const summary = document.createElement("section");
        summary.className = "camp-desk-block";
        summary.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Resumen</h3><em>estado de pagos</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Próximo pago</em><strong>" + AVI.escapeHtml(item.proximo.monto) + "</strong><span>programado</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Fecha</em><strong>" + AVI.escapeHtml(item.proximo.fecha || "—") + "</strong><span>cobro</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Pagos hechos</em><strong>" + item.historial.length + "</strong><span>en historial</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>Concepto</em><strong>" + AVI.escapeHtml(item.proximo.concepto || "—") + "</strong></div>"
          + "<div><em>Estado</em><strong>" + AVI.escapeHtml(item.proximo.estado || "Programado") + "</strong></div>"
          + "</div>";

        const history = document.createElement("section");
        history.className = "camp-desk-block camp-desk-history";
        history.innerHTML = "<div class=\"camp-desk-block-head\"><h3>Historial</h3><em>pagos anteriores</em></div>";
        const list = document.createElement("div");
        list.className = "account-pay-list is-dark";
        if (!item.historial.length) {
          list.append(AVI.line("Aún no hay pagos en el historial.", "muted"));
        } else {
          item.historial.forEach((row) => {
            const rowEl = document.createElement("div");
            rowEl.className = "account-pay-row";
            rowEl.innerHTML = ""
              + "<div><strong>" + AVI.escapeHtml(row.concepto) + "</strong><p>" + AVI.escapeHtml(row.fecha) + "</p></div>"
              + "<div class=\"account-pay-side\"><strong>" + AVI.escapeHtml(row.monto) + "</strong>"
              + "<span class=\"account-pay-badge\">" + AVI.escapeHtml(row.estado) + "</span></div>";
            list.append(rowEl);
          });
        }
        history.append(list);

        board.append(hero, summary, history);
        view.replaceChildren(board);
        animateAccountBoard(board);
        return;
      }

      const summary = document.createElement("div");
      summary.className = "stats";
      const nextAmount = AVI.card(item.proximo.monto, "Próximo pago", "form");
      nextAmount.classList.add("lead");
      summary.append(
        nextAmount,
        AVI.card(item.proximo.fecha, "Fecha", "check"),
        AVI.card(String(item.historial.length), "Pagos hechos", "check")
      );

      const detail = document.createElement("section");
      detail.className = "account-board-panel";
      detail.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Detalle</h2><em>próximo cobro</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Concepto</em><strong>" + AVI.escapeHtml(item.proximo.concepto) + "</strong></div>"
        + "<div><em>Monto</em><strong>" + AVI.escapeHtml(item.proximo.monto) + "</strong></div>"
        + "<div><em>Fecha</em><strong>" + AVI.escapeHtml(item.proximo.fecha) + "</strong></div>"
        + "<div><em>Estado</em><strong>" + AVI.escapeHtml(item.proximo.estado || "Programado") + "</strong></div>"
        + "</div>";

      const history = document.createElement("section");
      history.className = "account-board-panel";
      history.innerHTML = "<div class=\"account-board-head\"><h2>Historial de pagos</h2><em>pagos anteriores</em></div>";
      const list = document.createElement("div");
      list.className = "account-pay-list is-dark";
      if (!item.historial.length) {
        list.append(AVI.line("Aún no hay pagos en el historial.", "muted"));
      } else {
        item.historial.forEach((row) => {
          const rowEl = document.createElement("div");
          rowEl.className = "account-pay-row";
          rowEl.innerHTML = ""
            + "<div><strong>" + AVI.escapeHtml(row.concepto) + "</strong><p>" + AVI.escapeHtml(row.fecha) + "</p></div>"
            + "<div class=\"account-pay-side\"><strong>" + AVI.escapeHtml(row.monto) + "</strong>"
            + "<span class=\"account-pay-badge\">" + AVI.escapeHtml(row.estado) + "</span></div>";
          list.append(rowEl);
        });
      }
      history.append(list);

      board.append(summary, detail, history, accountBackButton());
      view.replaceChildren(board);
      animateAccountBoard(board);
      return;
    }

    if (kind === "licencia" && item) {
      const isDesk = !window.matchMedia("(max-width: 760px)").matches;
      const board = document.createElement("div");
      board.className = "account-board is-licencia" + (isDesk ? " is-desk" : "");
      const clientName = accountClientName();

      if (isDesk) {
        const hero = document.createElement("section");
        hero.className = "camp-desk-hero";
        hero.innerHTML = ""
          + "<div class=\"camp-desk-hero-top\">"
          + "<span class=\"camp-desk-status\">" + AVI.escapeHtml(item.status) + "</span>"
          + "<em>Licencia</em>"
          + "</div>"
          + "<h2>" + AVI.escapeHtml(item.plan) + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + AVI.escapeHtml(item.cuenta) + "</span>"
          + "<span>Vigente hasta " + AVI.escapeHtml(item.fin) + "</span>"
          + "<span>Operado por <a class=\"account-board-link\" href=\"" + AVI.escapeHtml(item.proveedorUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + AVI.escapeHtml(item.proveedor) + "</a></span>"
          + "</div>";

        const plan = document.createElement("section");
        plan.className = "camp-desk-block";
        plan.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Tu plan</h3><em>costo y vigencia</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Tu costo</em><strong>" + AVI.escapeHtml(item.precioEspecial) + "</strong><span>promoción activa</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Precio Pro</em><strong>" + AVI.escapeHtml(item.precioPro) + "</strong><span>referencia</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Vigente hasta</em><strong>" + AVI.escapeHtml(item.fin) + "</strong><span>desde " + AVI.escapeHtml(item.inicio) + "</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>Cuenta</em><strong>" + AVI.escapeHtml(item.cuenta) + "</strong></div>"
          + "<div><em>Modelo</em><strong>Renta de herramientas</strong></div>"
          + "</div>"
          + "<p class=\"account-board-note\" style=\"margin:0;color:#9a9a94\">" + AVI.escapeHtml(item.note) + "</p>";

        const includes = document.createElement("section");
        includes.className = "camp-desk-block";
        includes.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Incluye ahora</h3><em>activo</em></div>"
          + "<ul class=\"camp-desk-include\">"
          + item.incluye.map((entry) => "<li>" + AVI.escapeHtml(entry) + "</li>").join("")
          + "</ul>";

        const offers = document.createElement("div");
        offers.className = "camp-desk-split";

        const upgrade = document.createElement("section");
        upgrade.className = "camp-desk-offer is-lead";
        upgrade.innerHTML = ""
          + "<h3>" + AVI.escapeHtml(item.upgrade.titulo) + "</h3>"
          + "<p>" + AVI.escapeHtml(item.upgrade.subtitulo) + "</p>"
          + "<div class=\"camp-desk-offer-prices\">"
          + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + AVI.escapeHtml(item.upgrade.monto) + "</strong><span>queda en este monto</span></div>"
          + "<div><em>Implementación</em><strong>" + AVI.escapeHtml(item.upgrade.implementacion) + "</strong><span>pago único</span></div>"
          + "</div>"
          + "<div class=\"camp-desk-offer-grid\">"
          + item.upgrade.puntos.map((entry) => (
            "<div><strong>" + AVI.escapeHtml(entry[0]) + "</strong><p>" + AVI.escapeHtml(entry[1]) + "</p></div>"
          )).join("")
          + "</div>";
        upgrade.append(accountWhatsAppButton(
          "Quiero subir de herramientas",
          "Hola, soy " + clientName + ". Quiero subir de herramientas: cotizador con IA, catálogo, WhatsApp y ofertas en mi web. Mensual a " + item.upgrade.monto + " + implementación " + item.upgrade.implementacion + "."
        ));

        const basico = document.createElement("section");
        basico.className = "camp-desk-offer";
        basico.innerHTML = ""
          + "<h3>" + AVI.escapeHtml(item.basico.titulo) + "</h3>"
          + "<p>" + AVI.escapeHtml(item.basico.nota) + "</p>"
          + "<div class=\"camp-desk-offer-prices\" style=\"grid-template-columns:1fr\">"
          + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + AVI.escapeHtml(item.basico.monto) + "</strong><span>solo herramientas</span></div>"
          + "</div>"
          + "<ul class=\"account-include-list is-dark\">"
          + item.basico.puntos.map((entry) => "<li>" + AVI.escapeHtml(entry) + "</li>").join("")
          + "</ul>";
        basico.append(accountWhatsAppButton(
          "Solo quiero las herramientas sin campaña",
          "Hola, soy " + clientName + ". Ya no quiero campaña, pero sí quiero quedarme solo con las herramientas en el paquete básico de " + item.basico.monto + " al mes.",
          "soft"
        ));
        offers.append(upgrade, basico);

        const terms = document.createElement("section");
        terms.className = "camp-desk-block";
        terms.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Condiciones</h3><em>importante</em></div>"
          + "<ul class=\"camp-desk-include\">"
          + item.condiciones.map((entry) => "<li>" + AVI.escapeHtml(entry) + "</li>").join("")
          + "</ul>";

        board.append(hero, plan, includes, offers, terms);
        view.replaceChildren(board);
        animateAccountBoard(board);
        return;
      }

      const summary = document.createElement("div");
      summary.className = "stats";
      const statusLead = AVI.card(item.status, "Licencia vigente", "check");
      statusLead.classList.add("lead");
      summary.append(
        statusLead,
        AVI.card(item.plan, "Plan", "form"),
        AVI.card(item.precioPro, "Precio Pro", "form"),
        AVI.card(item.precioEspecial, "Tu costo", "check"),
        AVI.card(item.fin, "Vigente hasta", "check")
      );

      const facts = document.createElement("section");
      facts.className = "account-board-panel";
      facts.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Licencia</h2><em>detalle</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Cuenta</em><strong>" + AVI.escapeHtml(item.cuenta) + "</strong></div>"
        + "<div><em>Plan</em><strong>" + AVI.escapeHtml(item.plan) + "</strong></div>"
        + "<div><em>Inicio</em><strong>" + AVI.escapeHtml(item.inicio) + "</strong></div>"
        + "<div><em>Vigencia</em><strong>" + AVI.escapeHtml(item.fin) + "</strong></div>"
        + "<div><em>Operado por</em><strong><a class=\"account-board-link\" href=\"" + AVI.escapeHtml(item.proveedorUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + AVI.escapeHtml(item.proveedor) + "</a></strong></div>"
        + "<div><em>Modelo</em><strong>Renta de herramientas</strong></div>"
        + "</div>"
        + "<p class=\"account-board-note\">" + AVI.escapeHtml(item.note) + "</p>";

      const includes = document.createElement("section");
      includes.className = "account-board-panel";
      includes.innerHTML = "<div class=\"account-board-head\"><h2>Incluye ahora</h2><em>activo</em></div>";
      const list = document.createElement("ul");
      list.className = "account-include-list is-dark";
      item.incluye.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = entry;
        list.append(li);
      });
      includes.append(list);

      const upgrade = document.createElement("section");
      upgrade.className = "account-upgrade";
      upgrade.innerHTML = ""
        + "<div class=\"account-upgrade-top\">"
        + "<h2>" + AVI.escapeHtml(item.upgrade.titulo) + "</h2>"
        + "<p>" + AVI.escapeHtml(item.upgrade.subtitulo) + "</p>"
        + "</div>"
        + "<div class=\"account-upgrade-prices\">"
        + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + AVI.escapeHtml(item.upgrade.monto) + "</strong><span>queda en este monto</span></div>"
        + "<div><em>Implementación</em><strong>" + AVI.escapeHtml(item.upgrade.implementacion) + "</strong><span>pago único</span></div>"
        + "</div>"
        + "<div class=\"account-upgrade-grid\">"
        + item.upgrade.puntos.map((entry) => (
          "<div><strong>" + AVI.escapeHtml(entry[0]) + "</strong><p>" + AVI.escapeHtml(entry[1]) + "</p></div>"
        )).join("")
        + "</div>";
      upgrade.append(accountWhatsAppButton(
        "Quiero subir de herramientas",
        "Hola, soy " + clientName + ". Quiero subir de herramientas: cotizador con IA, catálogo, WhatsApp y ofertas en mi web. Mensual a " + item.upgrade.monto + " + implementación " + item.upgrade.implementacion + "."
      ));

      const basico = document.createElement("section");
      basico.className = "account-upgrade is-basic";
      basico.innerHTML = ""
        + "<div class=\"account-upgrade-top\">"
        + "<h2>" + AVI.escapeHtml(item.basico.titulo) + "</h2>"
        + "<p>" + AVI.escapeHtml(item.basico.nota) + "</p>"
        + "</div>"
        + "<div class=\"account-upgrade-prices\">"
        + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + AVI.escapeHtml(item.basico.monto) + "</strong><span>solo herramientas</span></div>"
        + "</div>"
        + "<ul class=\"account-include-list is-dark\">"
        + item.basico.puntos.map((entry) => "<li>" + AVI.escapeHtml(entry) + "</li>").join("")
        + "</ul>";
      basico.append(accountWhatsAppButton(
        "Solo quiero las herramientas sin campaña",
        "Hola, soy " + clientName + ". Ya no quiero campaña, pero sí quiero quedarme solo con las herramientas en el paquete básico de " + item.basico.monto + " al mes.",
        "soft"
      ));

      const terms = document.createElement("section");
      terms.className = "account-board-panel";
      terms.innerHTML = "<div class=\"account-board-head\"><h2>Condiciones</h2><em>importante</em></div>";
      const termsList = document.createElement("ul");
      termsList.className = "account-include-list is-dark";
      item.condiciones.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = entry;
        termsList.append(li);
      });
      terms.append(termsList);

      board.append(summary, facts, includes, upgrade, basico, terms, accountBackButton());
      view.replaceChildren(board);
      animateAccountBoard(board);
      return;
    }

    view.replaceChildren(AVI.line("No hay detalle para esta sección.", "muted"), accountBackButton());
  }
})(window.AVI = window.AVI || {});
