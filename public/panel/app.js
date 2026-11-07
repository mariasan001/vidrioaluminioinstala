(function () {
  const view = document.querySelector("#vista");
  const title = document.querySelector("#titulo");
  const ranges = document.querySelector("#rangos");
  const sources = document.querySelector("#fuentes");
  const pageSelect = document.querySelector("#pagina");
  const custom = document.querySelector("#rango-fechas");
  const fromInput = document.querySelector("#desde");
  const toInput = document.querySelector("#hasta");
  const tabs = document.querySelectorAll(".tabs button");

  if (!view || !title || !ranges || !sources || !pageSelect || !custom || !fromInput || !toInput) {
    return;
  }

  const state = loadState();

  ranges.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.rango = button.dataset.rango || "30";
    state.p = 1;
    saveState();
    paintFilters();
    show();
  });

  sources.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.fuente = button.dataset.fuente || "todas";
    state.p = 1;
    saveState();
    paintFilters();
    show();
  });

  pageSelect.addEventListener("change", () => {
    state.pagina = pageSelect.value;
    state.p = 1;
    saveState();
    show();
  });

  fromInput.addEventListener("change", onCustomDate);
  toInput.addEventListener("change", onCustomDate);
  window.addEventListener("hashchange", show);

  view.addEventListener("click", (event) => {
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

  paintFilters();
  document.querySelectorAll(".tabs button").forEach((tab) => {
    tab.addEventListener("click", () => {
      const next = "#" + (tab.dataset.vista || "resumen");
      if (location.hash === next) {
        show();
        return;
      }
      location.hash = next;
    });
  });
  show();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/panel/sw.js", { scope: "/panel/" }).catch(() => {});
  }

  function onCustomDate() {
    state.desde = fromInput.value;
    state.hasta = toInput.value;
    state.p = 1;
    saveState();
    if (state.desde && state.hasta) show();
  }

  function show() {
    const route = readRoute();
    tabs.forEach((tab) => {
      if (tab.dataset.vista === route.vista) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    title.textContent = route.vista === "visita" ? "Recorrido" : labelFor(route.vista);
    view.replaceChildren(line("Cargando…", "muted"));

    const job = route.vista === "paginas"
      ? loadPages()
      : route.vista === "embudo"
        ? loadFunnel()
        : route.vista === "visitas"
          ? loadVisits()
          : route.vista === "visita"
            ? loadVisit(route.id)
            : loadSummary();

    job.catch((error) => {
      if (error && error.message === "auth") return;
      view.replaceChildren(line("No se pudieron cargar las cifras.", "error"));
    });
  }

  function loadSummary() {
    return api("/api/stats/resumen.php").then((data) => {
      fillPages(data.opciones);
      const max = data.por_dia.reduce((top, day) => Math.max(top, day.visitas), 0);
      const chart = document.createElement("div");
      chart.className = "chart";
      data.por_dia.forEach((day) => {
        const column = document.createElement("div");
        column.className = "bar-col";
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = (max > 0 ? Math.max(4, Math.round((day.visitas / max) * 100)) : 4) + "%";
        bar.title = day.fecha + ": " + day.visitas;
        const caption = document.createElement("span");
        caption.textContent = day.fecha.slice(8);
        column.append(bar, caption);
        chart.append(column);
      });
      const cards = document.createElement("div");
      cards.className = "stats";
      cards.append(
        card(data.visitas, "Visitas"),
        card(data.clics_whatsapp, "WhatsApp"),
        card(data.clics_llamada, "Llamadas"),
        card(formatRate(data.tasa_contacto), "Contacto")
      );
      const note = line("Desde Google Ads: " + data.visitas_google_ads, "muted");
      const heading = document.createElement("h2");
      heading.textContent = "Visitas por día";
      view.replaceChildren(cards, note, heading, chart);
    });
  }

  function loadPages() {
    return api("/api/stats/paginas.php").then((data) => {
      fillPages(data.opciones);
      if (!data.paginas.length) {
        view.replaceChildren(line("Sin datos en este periodo.", "muted"));
        return;
      }
      const list = document.createElement("div");
      data.paginas.forEach((item) => {
        const block = document.createElement("article");
        block.className = "block";
        const name = document.createElement("b");
        name.textContent = item.pagina;
        const rows = document.createElement("p");
        rows.textContent = item.visitas + " visitas · " + item.clics_whatsapp + " WhatsApp · " + item.clics_llamada + " llamadas · " + formatRate(item.tasa_contacto) + " contacto";
        block.append(name, rows);
        list.append(block);
      });
      view.replaceChildren(list);
    });
  }

  function loadFunnel() {
    return api("/api/stats/embudo.php").then((data) => {
      fillPages(data.opciones);
      const base = data.pasos.length ? data.pasos[0].visitas : 0;
      const list = document.createElement("div");
      data.pasos.forEach((step) => {
        const row = document.createElement("div");
        row.className = "funnel-row";
        const meta = document.createElement("div");
        meta.className = "funnel-meta";
        const name = document.createElement("span");
        name.textContent = step.etiqueta;
        const count = document.createElement("b");
        count.textContent = String(step.visitas);
        meta.append(name, count);
        const track = document.createElement("div");
        track.className = "funnel-track";
        const fill = document.createElement("div");
        fill.className = "funnel-fill";
        fill.style.width = (base > 0 ? Math.max(2, Math.round((step.visitas / base) * 100)) : 0) + "%";
        track.append(fill);
        row.append(meta, track);
        list.append(row);
      });
      view.replaceChildren(list);
    });
  }

  function loadVisits() {
    return api("/api/stats/visitas.php", { p: String(state.p) }).then((data) => {
      fillPages(data.opciones);
      if (!data.visitas.length) {
        view.replaceChildren(line("Sin visitas en este periodo.", "muted"));
        return;
      }
      const list = document.createElement("div");
      data.visitas.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "card-btn";
        button.dataset.visita = String(item.id);
        const when = document.createElement("b");
        when.textContent = item.fecha;
        const detail = document.createElement("p");
        const pages = item.paginas.length ? item.paginas.join(" · ") : "Sin página";
        const section = item.seccion_etiqueta ? " · hasta " + item.seccion_etiqueta : "";
        const click = item.clic ? " · hizo clic" : "";
        detail.textContent = item.fuente_etiqueta + " · " + item.dispositivo_etiqueta + section + click;
        const path = document.createElement("p");
        path.textContent = pages;
        button.append(when, detail, path);
        list.append(button);
      });
      if (data.paginas_lista > 1) {
        const pager = document.createElement("div");
        pager.className = "pager";
        if (data.pagina_lista > 1) pager.append(pageButton(data.pagina_lista - 1, "Anterior"));
        if (data.pagina_lista < data.paginas_lista) pager.append(pageButton(data.pagina_lista + 1, "Siguiente"));
        list.append(pager);
      }
      view.replaceChildren(list);
    });
  }

  function loadVisit(id) {
    if (!id) {
      location.hash = "#visitas";
      return Promise.resolve();
    }
    return api("/api/stats/visita.php", { id: id }).then((data) => {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "secondary back";
      back.textContent = "Volver a visitas";
      back.addEventListener("click", () => {
        location.hash = "#visitas";
      });
      const summary = document.createElement("p");
      summary.className = "muted";
      summary.textContent = data.visita.fecha + " · " + data.visita.fuente_etiqueta + " · " + data.visita.dispositivo_etiqueta + " · " + data.visita.pagina;
      const list = document.createElement("ol");
      list.className = "tl";
      data.eventos.forEach((event) => {
        const item = document.createElement("li");
        const name = document.createElement("b");
        name.textContent = event.tipo_etiqueta + (event.seccion_etiqueta ? " · " + event.seccion_etiqueta : "");
        const detail = document.createElement("p");
        detail.textContent = event.fecha + " · " + event.pagina + (event.producto ? " · " + event.producto : "");
        item.append(name, detail);
        list.append(item);
      });
      if (!data.eventos.length) list.append(line("Esta visita no tiene eventos.", "muted"));
      view.replaceChildren(back, summary, list);
    });
  }

  function api(path, extra) {
    const dates = rangeDates();
    const params = new URLSearchParams();
    params.set("desde", dates.desde);
    params.set("hasta", dates.hasta);
    params.set("fuente", state.fuente);
    if (state.pagina) params.set("pagina", state.pagina);
    if (extra) {
      Object.keys(extra).forEach((key) => params.set(key, extra[key]));
    }
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

  function fillPages(options) {
    const current = state.pagina;
    pageSelect.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Todas las páginas";
    pageSelect.append(all);
    (options || []).forEach((page) => {
      const option = document.createElement("option");
      option.value = page;
      option.textContent = page;
      pageSelect.append(option);
    });
    pageSelect.value = [...pageSelect.options].some((option) => option.value === current) ? current : "";
    state.pagina = pageSelect.value;
  }

  function paintFilters() {
    ranges.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.rango === state.rango ? "true" : "false");
    });
    sources.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.fuente === state.fuente ? "true" : "false");
    });
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
    if (hash === "paginas" || hash === "embudo" || hash === "visitas") return { vista: hash, id: "" };
    return { vista: "resumen", id: "" };
  }

  function labelFor(vista) {
    return { resumen: "Resumen", paginas: "Páginas", embudo: "Embudo", visitas: "Visitas" }[vista] || "Resumen";
  }

  function card(value, caption) {
    const box = document.createElement("div");
    box.className = "stat";
    const strong = document.createElement("b");
    strong.textContent = String(value);
    const span = document.createElement("span");
    span.textContent = caption;
    box.append(strong, span);
    return box;
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
    const fallback = { rango: "30", fuente: "todas", pagina: "", desde: "", hasta: "", p: 1 };
    try {
      const saved = JSON.parse(sessionStorage.getItem("avi_panel_filters") || "");
      if (!saved || typeof saved !== "object") return fallback;
      return {
        rango: ["hoy", "7", "30", "custom"].includes(saved.rango) ? saved.rango : "30",
        fuente: saved.fuente === "google_ads" ? "google_ads" : "todas",
        pagina: typeof saved.pagina === "string" ? saved.pagina : "",
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
})();
