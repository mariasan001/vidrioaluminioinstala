(function () {
  const view = document.querySelector("#vista");
  const title = document.querySelector("#titulo");
  const ranges = document.querySelector("#rangos");
  const sources = document.querySelector("#fuentes");
  const custom = document.querySelector("#rango-fechas");
  const fromInput = document.querySelector("#desde");
  const toInput = document.querySelector("#hasta");
  const tabs = document.querySelectorAll(".tabs button");
  const emptyText = "Aún no hay datos en este periodo";

  if (!view || !title || !ranges || !sources || !custom || !fromInput || !toInput) {
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
      const next = "#" + (tab.dataset.vista || "resumen");
      if (location.hash === next) show();
      else location.hash = next;
    });
  });

  paintFilters();
  show();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/panel/sw.js", { scope: "/panel/" }).catch(function () {});
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
      if (!data.visitas) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      const cards = document.createElement("div");
      cards.className = "stats";
      cards.append(
        card(data.visitas, "Visitas"),
        card(data.clics_whatsapp, "WhatsApp"),
        card(data.clics_llamada, "Llamadas"),
        card(data.formularios, "Formularios"),
        card(formatRate(data.tasa_contacto), "Contacto")
      );
      cards.lastElementChild.classList.add("rate");
      const heading = document.createElement("h2");
      heading.textContent = "Visitas por día";
      view.replaceChildren(cards, heading, drawChart(data.por_dia || []));
    });
  }

  function loadPages() {
    return api("/api/stats/paginas.php").then((data) => {
      const pages = data.paginas || [];
      if (!pages.length) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      const list = document.createElement("div");
      pages.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "card-btn";
        button.dataset.pagina = item.pagina;
        const name = document.createElement("b");
        name.textContent = item.etiqueta || pageName(item.pagina);
        const detail = document.createElement("p");
        detail.textContent = item.visitas + " visitas · " + item.clics + " clics · " + formatRate(item.tasa_contacto) + " contacto";
        const extra = document.createElement("p");
        extra.textContent = item.clics_whatsapp + " WhatsApp · " + item.clics_llamada + " llamadas · " + item.formularios + " formularios";
        button.append(name, detail, extra);
        list.append(button);
      });
      view.replaceChildren(list);
    });
  }

  function loadFunnel() {
    return api("/api/stats/paginas.php").then((list) => {
      const pages = list.paginas || [];
      if (!pages.length) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      if (!state.pagina) {
        view.replaceChildren(pagePicker(pages), line("Elige una página para ver el embudo.", "muted"));
        return;
      }
      return api("/api/stats/embudo.php").then((data) => {
        const steps = data.pasos || [];
        const hero = steps.find((step) => step.seccion === "hero");
        const base = hero ? hero.visitas : 0;
        if (!steps.length || base === 0 && steps.every((step) => step.visitas === 0)) {
          view.replaceChildren(pagePicker(pages), line(emptyText, "muted"));
          return;
        }
        const sections = steps.filter((step) => step.seccion !== "clic");
        let dropAt = -1;
        let dropSize = 0;
        for (let index = 0; index < sections.length - 1; index += 1) {
          const drop = sections[index].visitas - sections[index + 1].visitas;
          if (drop > dropSize) {
            dropSize = drop;
            dropAt = index;
          }
        }
        const wrap = document.createElement("div");
        steps.forEach((step) => {
          const row = document.createElement("div");
          row.className = "funnel-row";
          const sectionIndex = sections.indexOf(step);
          if (dropSize > 0 && sectionIndex === dropAt) row.classList.add("sale");
          const meta = document.createElement("div");
          meta.className = "funnel-meta";
          const name = document.createElement("span");
          name.textContent = step.etiqueta + (sectionIndex === dropAt && dropSize > 0 ? " · aquí se va más gente" : "");
          const count = document.createElement("b");
          const percent = base > 0 ? Math.round((step.visitas / base) * 100) : 0;
          count.textContent = step.visitas + " · " + percent + "%";
          meta.append(name, count);
          const track = document.createElement("div");
          track.className = "funnel-track";
          const fill = document.createElement("div");
          fill.className = "funnel-fill";
          fill.style.width = Math.min(100, Math.max(step.visitas > 0 ? 2 : 0, percent)) + "%";
          track.append(fill);
          row.append(meta, track);
          wrap.append(row);
        });
        view.replaceChildren(pagePicker(pages), wrap);
      });
    });
  }

  function loadVisits() {
    return api("/api/stats/visitas.php", { p: String(state.p) }).then((data) => {
      const visits = data.visitas || [];
      if (!visits.length) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      const list = document.createElement("div");
      visits.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "card-btn";
        button.dataset.visita = String(item.id);
        const when = document.createElement("b");
        when.textContent = item.fecha;
        const detail = document.createElement("p");
        detail.textContent = item.fuente_etiqueta + " · " + item.dispositivo_etiqueta + (item.clic ? " · hizo clic" : "");
        const path = document.createElement("p");
        const section = item.seccion_etiqueta ? " · hasta " + item.seccion_etiqueta : "";
        path.textContent = (item.entrada_etiqueta || pageName(item.entrada || "")) + section;
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
      summary.textContent = data.visita.hora + " · " + data.visita.fuente_etiqueta + " · " + data.visita.dispositivo_etiqueta + " · " + (data.visita.pagina_etiqueta || pageName(data.visita.pagina));
      const list = document.createElement("ol");
      list.className = "tl";
      (data.eventos || []).forEach((event) => {
        const item = document.createElement("li");
        const name = document.createElement("b");
        const parts = [event.hora, event.tipo_etiqueta, event.pagina_etiqueta || pageName(event.pagina)];
        if (event.seccion_etiqueta) parts.push(event.seccion_etiqueta);
        if (event.producto) parts.push(event.producto);
        name.textContent = parts.filter(Boolean).join(" · ");
        item.append(name);
        list.append(item);
      });
      if (!data.eventos || !data.eventos.length) list.append(line(emptyText, "muted"));
      view.replaceChildren(back, summary, list);
    });
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

  function pagePicker(pages) {
    const label = document.createElement("label");
    label.textContent = "Página";
    const select = document.createElement("select");
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Elige una página";
    select.append(blank);
    pages.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.pagina;
      option.textContent = item.etiqueta || pageName(item.pagina);
      select.append(option);
    });
    if (state.pagina && ![...select.options].some((option) => option.value === state.pagina)) {
      const option = document.createElement("option");
      option.value = state.pagina;
      option.textContent = pageName(state.pagina);
      select.append(option);
    }
    select.value = state.pagina;
    select.addEventListener("change", () => {
      state.pagina = select.value;
      saveState();
      show();
    });
    label.append(select);
    return label;
  }

  function drawChart(days) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const width = Math.max(280, days.length * 18);
    svg.setAttribute("viewBox", "0 0 " + width + " 128");
    svg.setAttribute("class", "chart-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Visitas por día");
    const max = days.reduce((top, day) => Math.max(top, Number(day.visitas) || 0), 1);
    days.forEach((day, index) => {
      const visits = Number(day.visitas) || 0;
      const height = Math.max(visits > 0 ? 4 : 1, Math.round((visits / max) * 90));
      const rect = document.createElementNS(svg.namespaceURI, "rect");
      rect.setAttribute("x", String(index * 18 + 4));
      rect.setAttribute("y", String(98 - height));
      rect.setAttribute("width", "10");
      rect.setAttribute("height", String(height));
      rect.setAttribute("rx", "2");
      rect.setAttribute("fill", "#e8ff46");
      const tip = document.createElementNS(svg.namespaceURI, "title");
      tip.textContent = day.fecha + ": " + visits;
      rect.append(tip);
      svg.append(rect);
      if (days.length <= 8 || index % 5 === 0 || index === days.length - 1) {
        const text = document.createElementNS(svg.namespaceURI, "text");
        text.setAttribute("x", String(index * 18 + 9));
        text.setAttribute("y", "116");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#9a9a94");
        text.setAttribute("font-size", "10");
        text.textContent = String(day.fecha || "").slice(8);
        svg.append(text);
      }
    });
    return svg;
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
