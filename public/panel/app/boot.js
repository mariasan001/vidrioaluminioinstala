/* Panel: shared helpers, state, routing (show), api(), CSRF/role, hydrateRemoteData and start-up wiring. Must load first. */
(function (AVI) {
  AVI.show = show;
  AVI.csrfToken = csrfToken;
  AVI.isAdminRole = isAdminRole;
  AVI.isOwnerRole = isOwnerRole;
  AVI.escapeHtml = escapeHtml;
  AVI.api = api;
  AVI.rangeDates = rangeDates;
  AVI.pageName = pageName;
  AVI.card = card;
  AVI.line = line;
  AVI.pageButton = pageButton;
  AVI.formatRate = formatRate;
  AVI.iso = iso;
  AVI.saveState = saveState;

  const view = document.querySelector("#vista");
  AVI.view = view;
  const title = document.querySelector("#titulo");
  const subtitle = document.querySelector("#subtitulo");
  const ranges = document.querySelector("#rangos");
  const custom = document.querySelector("#rango-fechas");
  const fromInput = document.querySelector("#desde");
  const toInput = document.querySelector("#hasta");
  const tabs = document.querySelectorAll(".tabs button");
  const emptyText = "Aún no hay datos en este periodo";
  AVI.emptyText = emptyText;
  const periodButton = (ranges || document).querySelector(".period-btn");
  const periodValue = (ranges || document).querySelector(".period-value");
  const periodMenu = (ranges || document).querySelector(".period-menu");
  const periodLabels = { hoy: "Hoy", "7": "7 días", "30": "30 días", custom: "Rango" };
  const state = loadState();
  AVI.state = state;
  state.fuente = "todas";
  function moveNavPill() {
    const current = document.querySelector(".tabs button[aria-current='page']");
    const pill = document.querySelector(".nav-pill");
    if (!current || !pill) return;
    const narrow = window.matchMedia("(max-width: 980px)").matches;
    const next = narrow
      ? { x: current.offsetLeft, y: current.offsetTop, width: current.offsetWidth, height: current.offsetHeight }
      : { x: 0, y: current.offsetTop, width: current.offsetWidth, height: current.offsetHeight };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) {
      pill.style.transform = "translate(" + next.x + "px, " + next.y + "px)";
      pill.style.width = next.width + "px";
      pill.style.height = next.height + "px";
      return;
    }
    window.gsap.to(pill, {
      x: next.x,
      y: next.y,
      width: next.width,
      height: next.height,
      duration: 0.48,
      ease: "power3.out",
    });
    const icon = current.querySelector(".nav-ico");
    if (icon) {
      window.gsap.fromTo(
        icon,
        { scale: 0.72, y: 4 },
        { scale: 1, y: 0, duration: 0.42, ease: "back.out(2.4)" }
      );
    }
  }
  function onCustomDate() {
    state.desde = fromInput.value;
    state.hasta = toInput.value;
    state.p = 1;
    saveState();
    if (state.desde && state.hasta) show();
  }
  function paintHello(vista) {
    const time = document.getElementById("hello-time");
    const name = document.getElementById("hello-name");
    if (!time || !name) return;
    time.textContent = labelFor(vista || "resumen");
    name.textContent = "";
  }
  function show() {
    const hash = location.hash.replace(/^#/, "");
    if (hash && hash !== "paginas" && hash !== "embudo" && hash !== "comparativa" && hash !== "contactos" && hash !== "clientes" && hash !== "campana" && hash !== "pagos" && hash !== "licencia" && hash !== "referidos" && !/^visita\/\d+$/.test(hash)) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    AVI.updateClientsNav();
    const route = readRoute();
    tabs.forEach((tab) => {
      if (tab.dataset.vista === route.vista) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    const section = labelFor(route.vista);
    title.textContent = section;
    paintHello(route.vista);
    if (subtitle) subtitle.textContent = subtitleFor(route.vista);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) toolbar.hidden = route.vista === "pagos" || route.vista === "campana" || route.vista === "licencia" || route.vista === "referidos" || route.vista === "catalogos";
    moveNavPill();
    view.replaceChildren(line("Cargando…", "muted"));

    const loaders = {
      paginas: AVI.loadPages,
      embudo: AVI.loadFunnel,
      comparativa: AVI.loadComparativa,
      contactos: AVI.loadContactos,
      clientes: AVI.loadClientes,
      referidos: AVI.loadReferrals,
      catalogos: AVI.loadCatalogs,
      promociones: function () { return Promise.resolve(AVI.loadPromos()); },
      pagos: function () { return Promise.resolve(AVI.loadAccountSection("pagos")); },
      campana: function () { return Promise.resolve(AVI.loadAccountSection("campana")); },
      licencia: function () { return Promise.resolve(AVI.loadAccountSection("licencia")); },
    };
    const job = (loaders[route.vista] || AVI.loadSummary)();

    job.catch((error) => {
      if (error && error.message === "auth") return;
      view.replaceChildren(line("No se pudieron cargar las cifras.", "error"));
    });
  }
  function panelRole() {
    const box = document.querySelector(".account[data-role]");
    const fromData = box ? String(box.getAttribute("data-role") || "").trim().toLowerCase() : "";
    if (fromData === "dueno" || fromData === "admin") return fromData;
    const label = String((document.querySelector(".account em") || {}).textContent || "").trim().toLowerCase();
    if (label.indexOf("due") >= 0 || label === "owner") return "dueno";
    return "admin";
  }
  function csrfToken() {
    const input = document.querySelector('input[name="csrf"]');
    return input ? String(input.value || "") : "";
  }
  AVI.accountCache = null;
  AVI.referralsCache = null;
  AVI.contactsCache = null;
  AVI.quotesCache = null;
  let remoteReady = false;
  function hydrateRemoteData() {
    let accountOk = false;
    const accountReq = fetch("/api/account.php", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    }).then(function (response) {
      if (response.status === 401) {
        location.href = "/panel/login/";
        throw new Error("auth");
      }
      return response.json();
    }).then(function (data) {
      if (!data || !data.ok) throw new Error("fail");
      accountOk = true;
      AVI.accountCache = data.account || AVI.defaultAccountData();
      AVI.referralsCache = Array.isArray(data.referidos) ? data.referidos : [];
      try {
        sessionStorage.setItem(AVI.accountDataKey(), JSON.stringify(AVI.accountCache));
        sessionStorage.setItem(AVI.referralStoreKey(), JSON.stringify(AVI.referralsCache));
      } catch (error) {}
      if (data.role === "dueno" || data.role === "admin") {
        const box = document.querySelector(".account");
        if (box) box.setAttribute("data-role", data.role);
      }
    }).catch(function () {});

    const crmReq = fetch("/api/crm.php", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    }).then(function (response) {
      if (response.status === 401) {
        location.href = "/panel/login/";
        throw new Error("auth");
      }
      return response.json();
    }).then(function (data) {
      if (!data || !data.ok) throw new Error("fail");
      AVI.contactsCache = Array.isArray(data.contacts) ? data.contacts : [];
      AVI.quotesCache = Array.isArray(data.quotes) ? data.quotes : [];
      try {
        sessionStorage.setItem("avi_contactos_reales", JSON.stringify(AVI.contactsCache));
        sessionStorage.setItem("avi_cotizaciones", JSON.stringify(AVI.quotesCache));
      } catch (error) {}
    }).catch(function () {});

    return Promise.all([accountReq, crmReq]).then(function () {
      remoteReady = accountOk;
      if (!accountOk) {
        location.href = "/panel/login/";
      }
    });
  }
  function isAdminRole() {
    return panelRole() === "admin";
  }
  function isOwnerRole() {
    return panelRole() === "dueno";
  }
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function api(path, extra) {
    const dates = rangeDates();
    const params = new URLSearchParams();
    params.set("desde", dates.desde);
    params.set("hasta", dates.hasta);
    params.set("fuente", state.fuente);
    if (path.indexOf("embudo.php") !== -1 && state.pagina) params.set("pagina", state.pagina);
    if (extra) Object.keys(extra).forEach((key) => params.set(key, extra[key]));
    return fetch(path + "?" + params.toString(), {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    }).then((response) => {
      if (response.status === 401) {
        location.href = "/panel/login/";
        throw new Error("auth");
      }
      return response.json().then((data) => {
        if (!response.ok || !data.ok) throw new Error("fail");
        return data;
      });
    });
  }
  function setPeriodOpen(open) {
    if (!periodMenu || !periodButton) return;
    periodMenu.hidden = !open;
    periodButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open || !window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.gsap.fromTo(periodMenu, { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.22, ease: "power2.out" });
  }
  function paintFilters() {
    if (periodValue) periodValue.textContent = periodLabels[state.rango] || "30 días";
    if (periodMenu) {
      periodMenu.querySelectorAll("[data-rango]").forEach((option) => {
        option.setAttribute("aria-selected", option.dataset.rango === state.rango ? "true" : "false");
      });
    }
    custom.hidden = state.rango !== "custom";
    fromInput.value = state.desde;
    toInput.value = state.hasta;
  }
  function rangeDates() {
    const today = new Date();
    if (state.rango === "hoy") return { desde: iso(today), hasta: iso(today) };
    if (state.rango === "7") return { desde: iso(addDays(today, -6)), hasta: iso(today) };
    if (state.rango === "custom" && state.desde && state.hasta) return { desde: state.desde, hasta: state.hasta };
    return { desde: iso(addDays(today, -29)), hasta: iso(today) };
  }
  function readRoute() {
    const hash = location.hash.replace(/^#/, "");
    const visit = hash.match(/^visita\/(\d+)$/);
    if (visit) return { vista: "visita", id: visit[1] };
    if (hash === "paginas" || hash === "embudo" || hash === "comparativa" || hash === "contactos" || hash === "clientes" || hash === "campana" || hash === "pagos" || hash === "licencia" || hash === "referidos") {
      return { vista: hash, id: "" };
    }
    return { vista: "resumen", id: "" };
  }
  function labelFor(vista) {
    const admin = isAdminRole();
    return {
      resumen: "Resumen",
      paginas: "Páginas",
      embudo: "Embudo",
      comparativa: "Comparativa",
      contactos: "Contactos",
      clientes: "Clientes",
      referidos: admin ? "Configurar referidos" : "Mis referidos",
      catalogos: "Catálogos",
      promociones: "Promociones",
      pagos: admin ? "Cargar pagos" : "Próximos pagos",
      campana: admin ? "Editar campaña" : "Campaña activa",
      licencia: admin ? "Editar licencia" : "Licencia activa",
    }[vista] || "Resumen";
  }
  function subtitleFor(vista) {
    const admin = isAdminRole();
    const refCfg = AVI.readAccountData().referidosConfig;
    const ownerPct = Number((refCfg && refCfg.descuentoDueno) || 50);
    const refPct = Number((refCfg && refCfg.descuentoReferido) || 10);
    return {
      resumen: "Visitas, contactos y el ritmo del periodo.",
      paginas: "Qué página trae WhatsApp y llamadas.",
      embudo: "Así se mueven en tus páginas.",
      comparativa: admin
        ? "Observa prospectos y el flujo. Sin editar ni cotizar."
        : "Clics del periodo y prospectos que puedes pasar a cliente.",
      contactos: "Los prospectos viven en Comparativa.",
      clientes: admin
        ? "Solo observación del historial y cotizaciones."
        : "Clientes con historial y cotizaciones.",
      referidos: admin
        ? "Porcentaje, fecha activo y empleado responsable."
        : ("Refiera a Aurena: usted " + ownerPct + "% el siguiente mes, el referido " + refPct + "% en su proyecto."),
      catalogos: "Productos de cada página. Lo que guardas aquí se ve en esa sección.",
      promociones: "Ofertas del negocio. Por ahora quedan en este navegador.",
      pagos: admin ? "Alta de nombre, concepto, fecha, estado y cantidad." : "Fechas e importes que vienen.",
      campana: admin ? "Nombre, canal, zona, presupuesto, IVA y métricas." : "Estado de la campaña que trae visitas.",
      licencia: admin ? "Vigencia, plan y costo de la licencia." : "Plan Pro con costo promocional único.",
    }[vista] || "";
  }
  function pageName(page) {
    const path = page === "/" ? "/" : String(page || "").replace(/\/$/, "");
    return {
      "/": "Inicio",
      "/servicios/canceles-de-bano": "Canceles",
      "/servicios/ventanas": "Ventanas",
      "/barandales": "Barandales",
      "/servicios/barandales": "Barandales",
      "/servicios/fachadas-de-cristal": "Fachadas",
      "/servicios/puertas": "Puertas",
      "/servicios/pergolas": "Pérgolas",
      "/aviso-de-privacidad": "Aviso de privacidad",
    }[path] || page || "Página";
  }
  function card(value, caption, icon) {
    const box = document.createElement("div");
    box.className = "stat";
    const top = document.createElement("div");
    top.className = "stat-top";
    const mark = document.createElement("span");
    mark.className = "stat-icon";
    mark.append(iconNode(icon));
    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = caption;
    top.append(mark, label);
    const strong = document.createElement("b");
    strong.textContent = String(value);
    box.append(top, strong);
    return box;
  }
  function iconNode(name) {
    const paths = {
      eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      chat: "M12 4.5a7.5 7.5 0 0 0-6.7 11.1L4.5 19.5l4.2-1.1A7.5 7.5 0 1 0 12 4.5z",
      phone: "M8.2 3.8h2.4l1.1 3.5-1.9 1.1a12 12 0 0 0 5.4 5.4l1.1-1.9 3.5 1.1v2.4a1.9 1.9 0 0 1-1.9 1.9A14.2 14.2 0 0 1 4.3 5.7a1.9 1.9 0 0 1 1.9-1.9z",
      form: "M7 4h7l4 4v12H7z M14 4v4h4 M9.5 13h5 M9.5 16.5h5",
      check: "M5.5 12.2 9.8 16.5 18.5 7.5",
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", paths[name] || paths.eye);
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.9");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.append(path);
    return svg;
  }
  function line(text, className) {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
  }
  function pageButton(page, text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.dataset.p = String(page);
    button.textContent = text;
    return button;
  }
  function formatRate(value) {
    return String(value).replace(".", ",") + "%";
  }
  function iso(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }
  function addDays(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }
  function loadState() {
    const fallback = { rango: "30", fuente: "todas", pagina: "/", desde: "", hasta: "", p: 1 };
    try {
      const saved = JSON.parse(sessionStorage.getItem("avi_panel_filters") || "");
      if (!saved || typeof saved !== "object") return fallback;
      return {
        rango: ["hoy", "7", "30", "custom"].includes(saved.rango) ? saved.rango : "30",
        fuente: "todas",
        pagina: typeof saved.pagina === "string" && saved.pagina ? saved.pagina : "/",
        desde: typeof saved.desde === "string" ? saved.desde : "",
        hasta: typeof saved.hasta === "string" ? saved.hasta : "",
        p: 1,
      };
    } catch (error) {
      return fallback;
    }
  }
  function saveState() {
    sessionStorage.setItem("avi_panel_filters", JSON.stringify({
      rango: state.rango,
      fuente: state.fuente,
      pagina: state.pagina,
      desde: state.desde,
      hasta: state.hasta,
    }));
  }

  AVI.start = function start() {

    if (!view || !title || !ranges || !custom || !fromInput || !toInput) {
      return;
    }

    if (periodButton && periodMenu) {
      periodButton.addEventListener("click", () => {
        setPeriodOpen(periodMenu.hidden);
      });
      periodMenu.addEventListener("click", (event) => {
        const option = event.target.closest("[data-rango]");
        if (!option) return;
        state.rango = option.dataset.rango || "30";
        state.fuente = "todas";
        state.p = 1;
        setPeriodOpen(false);
        saveState();
        paintFilters();
        show();
      });
      document.addEventListener("click", (event) => {
        if (!ranges.contains(event.target)) setPeriodOpen(false);
        const pagePickBox = document.getElementById("pagina-pick");
        if (pagePickBox && !pagePickBox.contains(event.target)) AVI.setPagePickOpen(false);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          setPeriodOpen(false);
          AVI.setPagePickOpen(false);
          AVI.closeAccountSheet();
        }
      });
    }

    fromInput.addEventListener("change", onCustomDate);
    toInput.addEventListener("change", onCustomDate);
    window.addEventListener("hashchange", show);

    view.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-pagina]");
      if (pageButton) {
        state.pagina = pageButton.dataset.pagina || "";
        saveState();
        if (location.hash === "#embudo") show();
        else location.hash = "#embudo";
        return;
      }

      const visit = event.target.closest("[data-visita]");
      if (visit) {
        location.hash = "#visita/" + visit.dataset.visita;
        return;
      }

      const pager = event.target.closest("[data-p]");
      if (pager) {
        state.p = Number(pager.dataset.p) || 1;
        saveState();
        show();
      }
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.dataset.action === "cuenta") {
          if (window.matchMedia("(max-width: 980px)").matches) AVI.openAccountSheet();
          return;
        }
        const next = "#" + (tab.dataset.vista || "resumen");
        if (location.hash === next) show();
        else location.hash = next;
      });
    });

    paintFilters();
    paintHello();
    hydrateRemoteData().finally(function () { show(); });
    window.matchMedia("(max-width: 980px)").addEventListener("change", moveNavPill);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/panel/sw.js", { scope: "/panel/" }).catch(function () {});
    }
  };

  // Scripts load with `defer` in order (boot, stats, crm, account, referrals, catalog); start once every module is registered.
  if (document.readyState === "complete") {
    AVI.start();
  } else {
    document.addEventListener("DOMContentLoaded", function () { AVI.start(); });
  }
})(window.AVI = window.AVI || {});
