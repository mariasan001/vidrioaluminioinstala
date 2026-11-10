(function () {
  const view = document.querySelector("#vista");
  const title = document.querySelector("#titulo");
  const subtitle = document.querySelector("#subtitulo");
  const ranges = document.querySelector("#rangos");
  const custom = document.querySelector("#rango-fechas");
  const fromInput = document.querySelector("#desde");
  const toInput = document.querySelector("#hasta");
  const tabs = document.querySelectorAll(".tabs button");
  const emptyText = "Aún no hay datos en este periodo";

  if (!view || !title || !ranges || !custom || !fromInput || !toInput) {
    return;
  }

  const periodButton = ranges.querySelector(".period-btn");
  const periodValue = ranges.querySelector(".period-value");
  const periodMenu = ranges.querySelector(".period-menu");
  const periodLabels = { hoy: "Hoy", "7": "7 días", "30": "30 días", custom: "Rango" };
  const state = loadState();
  state.fuente = "todas";

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
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setPeriodOpen(false);
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
      const next = "#" + (tab.dataset.vista || "resumen");
      if (location.hash === next) show();
      else location.hash = next;
    });
  });

  paintFilters();
  show();
  window.matchMedia("(max-width: 980px)").addEventListener("change", moveNavPill);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/panel/sw.js", { scope: "/panel/" }).catch(function () {});
  }

  function moveNavPill() {
    const current = document.querySelector(".tabs button[aria-current='page']");
    const pill = document.querySelector(".nav-pill");
    if (!current || !pill) return;
    const narrow = window.matchMedia("(max-width: 980px)").matches;
    const next = narrow
      ? { x: current.offsetLeft, y: 0, width: current.offsetWidth, height: current.offsetHeight }
      : { x: 0, y: current.offsetTop, width: current.offsetWidth, height: current.offsetHeight };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) {
      pill.style.transform = "translate(" + next.x + "px, " + next.y + "px)";
      pill.style.width = next.width + "px";
      pill.style.height = next.height + "px";
      return;
    }
    window.gsap.to(pill, { x: next.x, y: next.y, width: next.width, height: next.height, duration: 0.45, ease: "power3.out" });
    window.gsap.fromTo(current.querySelector(".nav-ico"), { scale: 0.82 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
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
    title.textContent = labelFor(route.vista);
    if (subtitle) subtitle.textContent = subtitleFor(route.vista);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) toolbar.hidden = route.vista === "pagos" || route.vista === "campana" || route.vista === "problema" || route.vista === "compras" || route.vista === "catalogos";
    moveNavPill();
    view.replaceChildren(line("Cargando…", "muted"));

    const loaders = {
      paginas: loadPages,
      embudo: loadFunnel,
      referidos: loadReferrals,
      catalogos: loadCatalogs,
      promociones: function () { return Promise.resolve(loadPromos()); },
      pagos: function () { return Promise.resolve(loadDesk("Aún no hay pagos registrados.")); },
      campana: function () { return Promise.resolve(loadDesk("Aún no hay campañas registradas.")); },
      problema: function () { return Promise.resolve(loadDesk("Aún no hay problemas anotados.")); },
      compras: function () { return Promise.resolve(loadDesk("Aún no hay compras registradas.")); },
    };
    const job = (loaders[route.vista] || loadSummary)();

    job.catch((error) => {
      if (error && error.message === "auth") return;
      view.replaceChildren(line("No se pudieron cargar las cifras.", "error"));
    });
  }

  function loadSummary() {
    return Promise.all([api("/api/stats/resumen.php"), api("/api/stats/paginas.php")]).then(([data, pages]) => {
      const cards = document.createElement("div");
      cards.className = "stats web";
      const lead = card(data.visitas, "Visitas", "eye");
      lead.classList.add("lead");
      cards.append(
        lead,
        card(data.clics_whatsapp, "WhatsApp", "chat"),
        card(data.clics_llamada, "Llamadas", "phone"),
        card(data.formularios, "Formularios", "form"),
        card(formatRate(data.tasa_contacto), "Contacto", "check")
      );
      const chartCard = document.createElement("section");
      chartCard.className = "panel-card chart-card";
      const days = data.por_dia || [];
      const hourly = days.length === 1 && Array.isArray(days[0].horas) && days[0].horas.length > 0;
      const heading = document.createElement("h2");
      heading.textContent = hourly ? "Visitas por hora" : "Visitas por día";
      chartCard.append(heading, data.visitas ? drawChart(hourly ? hoursOf(days[0]) : days, hourly) : line(emptyText, "muted"));
      const side = document.createElement("section");
      side.className = "panel-card top-pages";
      const sideTitle = document.createElement("h2");
      sideTitle.textContent = "Top páginas";
      const kicker = document.createElement("p");
      kicker.className = "top-kicker";
      kicker.textContent = "más visitadas";
      side.append(sideTitle, kicker);
      const top = (pages.paginas || []).slice().sort((a, b) => Number(b.visitas) - Number(a.visitas)).slice(0, 3);
      if (!top.length) {
        side.append(line(emptyText, "muted"));
      } else {
        const max = top.reduce((highest, item) => Math.max(highest, Number(item.visitas) || 0), 1);
        const list = document.createElement("ol");
        list.className = "rank";
        top.forEach((item, index) => {
          const row = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.pagina = item.pagina;
          const place = document.createElement("span");
          place.className = "rank-no";
          place.textContent = String(index + 1).padStart(2, "0");
          const body = document.createElement("span");
          body.className = "rank-body";
          const name = document.createElement("b");
          name.textContent = item.etiqueta || pageName(item.pagina);
          const track = document.createElement("span");
          track.className = "rank-track";
          const fill = document.createElement("span");
          fill.className = "rank-fill";
          const visits = Number(item.visitas) || 0;
          fill.dataset.share = String(Math.max(8, Math.round((visits / max) * 100)));
          track.append(fill);
          const meta = document.createElement("span");
          meta.className = "rank-meta";
          meta.textContent = formatRate(item.tasa_contacto) + " contacto";
          body.append(name, track, meta);
          const count = document.createElement("span");
          count.className = "rank-count";
          const strong = document.createElement("strong");
          strong.dataset.n = String(visits);
          strong.textContent = "0";
          const unit = document.createElement("small");
          unit.textContent = visits === 1 ? "visita" : "visitas";
          count.append(strong, unit);
          button.append(place, body, count);
          row.append(button);
          list.append(row);
        });
        side.append(list);
      }
      const board = document.createElement("div");
      board.className = "board";
      board.append(chartCard, side);
      view.replaceChildren(cards, board);
      animateSummary(cards, chartCard);
      animateRank(side);
    });
  }

  function animateRank(side) {
    const fills = side.querySelectorAll(".rank-fill");
    const counts = side.querySelectorAll(".rank-count strong");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) {
      fills.forEach((fill) => {
        fill.style.width = fill.dataset.share + "%";
      });
      counts.forEach((node) => {
        node.textContent = node.dataset.n || "0";
      });
      return;
    }
    window.gsap.from(side.querySelectorAll(".rank li"), {
      y: 18,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: "power3.out",
    });
    fills.forEach((fill) => {
      fill.style.width = fill.dataset.share + "%";
    });
    window.gsap.from(fills, {
      scaleX: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.12,
    });
    counts.forEach((node) => {
      const end = Number(node.dataset.n) || 0;
      const proxy = { n: 0 };
      window.gsap.to(proxy, {
        n: end,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: function () {
          node.textContent = String(Math.round(proxy.n));
        },
      });
    });
  }

  function animatePages(board) {
    const bars = board.querySelectorAll(".page-bar span");
    const counts = board.querySelectorAll(".page-count strong");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) {
      bars.forEach((bar) => {
        bar.style.width = bar.dataset.share + "%";
      });
      counts.forEach((node) => {
        node.textContent = node.dataset.n || "0";
      });
      return;
    }
    window.gsap.from(board.querySelectorAll(".page-sheet"), {
      y: 22,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: "power3.out",
    });
    bars.forEach((bar) => {
      bar.style.width = bar.dataset.share + "%";
    });
    window.gsap.from(bars, {
      scaleX: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.1,
    });
    counts.forEach((node) => {
      const end = Number(node.dataset.n) || 0;
      const proxy = { n: 0 };
      window.gsap.to(proxy, {
        n: end,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: function () {
          node.textContent = String(Math.round(proxy.n));
        },
      });
    });
  }

  function loadPages() {
    return api("/api/stats/paginas.php").then((data) => {
      const pages = (data.paginas || []).slice().sort((a, b) => Number(b.visitas) - Number(a.visitas));
      if (!pages.length) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      const max = pages.reduce((highest, item) => Math.max(highest, Number(item.visitas) || 0), 1);
      const board = document.createElement("div");
      board.className = "pages-board";
      pages.forEach((item, index) => {
        const visits = Number(item.visitas) || 0;
        const sheet = document.createElement("button");
        sheet.type = "button";
        sheet.className = "page-sheet" + (index === 0 ? " lead" : "");
        sheet.dataset.pagina = item.pagina;

        const no = document.createElement("span");
        no.className = "page-no";
        no.textContent = String(index + 1).padStart(2, "0");

        const name = document.createElement("b");
        name.className = "page-name";
        name.textContent = item.etiqueta || pageName(item.pagina);

        const rate = document.createElement("em");
        rate.className = "page-rate";
        const contact = formatRate(item.tasa_contacto) + " contacto";
        rate.textContent = index === 0 ? "La más visitada · " + contact : contact;

        const count = document.createElement("span");
        count.className = "page-count";
        const strong = document.createElement("strong");
        strong.dataset.n = String(visits);
        strong.textContent = "0";
        const unit = document.createElement("small");
        unit.textContent = visits === 1 ? "visita" : "visitas";
        count.append(strong, unit);

        const bar = document.createElement("span");
        bar.className = "page-bar";
        const fill = document.createElement("span");
        fill.dataset.share = String(Math.round((visits / max) * 100));
        bar.append(fill);

        const facts = document.createElement("span");
        facts.className = "page-facts";
        [
          [item.clics_whatsapp, "WhatsApp"],
          [item.clics_llamada, Number(item.clics_llamada) === 1 ? "llamada" : "llamadas"],
          [item.formularios, Number(item.formularios) === 1 ? "formulario" : "formularios"],
        ].forEach(([value, label]) => {
          const fact = document.createElement("span");
          const number = document.createElement("b");
          number.textContent = String(value);
          const caption = document.createElement("span");
          caption.textContent = label;
          fact.append(number, caption);
          facts.append(fact);
        });

        sheet.append(no, name, rate, count, bar, facts);
        board.append(sheet);
      });
      view.replaceChildren(board);
      animatePages(board);
    });
  }

  function loadFunnel() {
    return api("/api/stats/paginas.php").then((list) => {
      const pages = allPages(list.paginas || []);
      const selected = pages.some((page) => page.pagina === state.pagina) ? state.pagina : "";
      const wrap = document.createElement("div");
      wrap.className = "funnel-pick";
      const menu = document.createElement("div");
      menu.className = "pick-list";
      pages.forEach((page) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.pagina = page.pagina;
        button.setAttribute("aria-pressed", page.pagina === selected ? "true" : "false");
        button.textContent = page.etiqueta;
        menu.append(button);
      });
      wrap.append(menu);
      if (!selected) {
        const empty = document.createElement("section");
        empty.className = "journey";
        empty.append(line("Elige una página para ver su recorrido.", "muted"));
        wrap.append(empty);
        view.replaceChildren(wrap);
        return;
      }
      const page = pages.find((item) => item.pagina === selected);
      return api("/api/stats/embudo.php", { pagina: selected }).then((data) => {
        wrap.append(journeyCard(page, data.pasos || []));
        view.replaceChildren(wrap);
        animateJourneys(wrap);
      }).catch(() => {
        wrap.append(journeyCard(page, []));
        view.replaceChildren(wrap);
      });
    });
  }

  function allPages(stats) {
    const pages = [
      { pagina: "/", etiqueta: "Inicio" },
      { pagina: "/servicios/canceles-de-bano/", etiqueta: "Canceles" },
      { pagina: "/servicios/ventanas/", etiqueta: "Ventanas" },
      { pagina: "/barandales/", etiqueta: "Barandales" },
      { pagina: "/servicios/barandales/", etiqueta: "Barandales, servicio" },
      { pagina: "/servicios/fachadas-de-cristal/", etiqueta: "Fachadas" },
      { pagina: "/servicios/puertas/", etiqueta: "Puertas" },
      { pagina: "/servicios/pergolas/", etiqueta: "Pérgolas" },
      { pagina: "/aviso-de-privacidad/", etiqueta: "Aviso de privacidad" },
    ];
    const known = new Set(pages.map((page) => page.pagina === "/" ? "/" : page.pagina.replace(/\/$/, "")));
    stats.forEach((item) => {
      const raw = String(item.pagina || "");
      const key = raw === "/" ? "/" : raw.replace(/\/$/, "");
      if (!key || known.has(key)) return;
      known.add(key);
      pages.push({ pagina: raw, etiqueta: item.etiqueta || pageName(raw) });
    });
    return pages;
  }

  function journeyCard(page, steps) {
    const card = document.createElement("article");
    card.className = "journey";
    const head = document.createElement("div");
    head.className = "journey-head";
    const name = document.createElement("h2");
    name.textContent = page.etiqueta || pageName(page.pagina);
    const hero = steps.find((step) => step.seccion === "hero");
    const entered = hero ? Number(hero.visitas) || 0 : Number(page.visitas) || 0;
    const enteredLabel = document.createElement("em");
    enteredLabel.textContent = entered === 1 ? "1 persona entró" : entered + " personas entraron";
    head.append(name, enteredLabel);
    card.append(head);

    const alive = steps.some((step) => Number(step.visitas) > 0);
    if (!steps.length || !alive) {
      card.append(line(emptyText, "muted"));
      return card;
    }

    const base = hero ? Number(hero.visitas) || 0 : 0;
    const sections = steps.filter((step) => step.seccion !== "clic");
    let dropAt = -1;
    let dropSize = 0;
    for (let index = 0; index < sections.length - 1; index += 1) {
      const drop = Number(sections[index].visitas) - Number(sections[index + 1].visitas);
      if (drop > dropSize) {
        dropSize = drop;
        dropAt = index;
      }
    }

    const trail = document.createElement("ol");
    trail.className = "trail";
    steps.forEach((step) => {
      const item = document.createElement("li");
      const sectionIndex = sections.indexOf(step);
      if (dropSize > 0 && sectionIndex === dropAt) item.classList.add("drop");
      const dot = document.createElement("span");
      dot.className = "step-dot";
      const count = document.createElement("b");
      count.className = "step-n";
      count.textContent = String(Number(step.visitas) || 0);
      const label = document.createElement("span");
      label.className = "step-name";
      label.textContent = step.etiqueta;
      const percent = document.createElement("small");
      percent.className = "step-pct";
      percent.textContent = (base > 0 ? Math.round((Number(step.visitas) / base) * 100) : 0) + "%";
      item.append(dot, count, label, percent);
      trail.append(item);
    });
    card.append(trail);

    if (dropSize > 0 && sections[dropAt]) {
      const note = document.createElement("p");
      note.className = "journey-note";
      note.textContent = "En " + sections[dropAt].etiqueta + " se va más gente.";
      card.append(note);
    }
    return card;
  }

  function animateJourneys(board) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) return;
    window.gsap.from(board.querySelectorAll(".journey"), {
      y: 22,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
    });
    window.gsap.from(board.querySelectorAll(".step-dot"), {
      scale: 0,
      duration: 0.35,
      stagger: 0.02,
      ease: "back.out(2)",
      delay: 0.12,
    });
  }

  function loadReferrals() {
    return api("/api/stats/referidos.php").then((data) => {
      const rows = data.referidos || [];
      if (!rows.length) {
        view.replaceChildren(line(emptyText, "muted"));
        return;
      }
      const card = document.createElement("section");
      card.className = "desk";
      const table = document.createElement("table");
      table.className = "table";
      const head = document.createElement("tr");
      ["Origen", "Visitas", "Con clic", "Contacto"].forEach((label) => {
        const cell = document.createElement("th");
        cell.textContent = label;
        head.append(cell);
      });
      table.append(head);
      rows.forEach((item) => {
        const row = document.createElement("tr");
        [item.origen, String(item.visitas), String(item.con_clic), formatRate(item.tasa_contacto)].forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });
        table.append(row);
      });
      card.append(table);
      view.replaceChildren(card);
    });
  }

  function loadDesk(message) {
    const sheet = document.createElement("section");
    sheet.className = "desk";
    sheet.append(line(message, "muted"));
    view.replaceChildren(sheet);
  }

  function loadCatalogs() {
    const sections = [
      ["/servicios/canceles-de-bano/", "Canceles"],
      ["/servicios/ventanas/", "Ventanas"],
      ["/barandales/", "Barandales"],
      ["/servicios/barandales/", "Barandales, servicio"],
      ["/servicios/fachadas-de-cristal/", "Fachadas"],
      ["/servicios/puertas/", "Puertas"],
      ["/servicios/pergolas/", "Pérgolas"],
    ];
    let section = sections[0][0];
    let editing = "";
    let editingImage = "";

    const board = document.createElement("div");
    board.className = "catalog-board";
    const picker = document.createElement("div");
    picker.className = "pick-list catalog-pages";
    const grid = document.createElement("div");
    grid.className = "product-grid";
    const form = document.createElement("form");
    form.className = "product-form";
    form.innerHTML = ""
      + "<h2>Nuevo producto</h2>"
      + "<label>Sección<select name=\"pagina\"></select></label>"
      + "<label>Título<input name=\"titulo\" maxlength=\"120\" required></label>"
      + "<label>Descripción<textarea name=\"descripcion\" maxlength=\"600\" rows=\"3\"></textarea></label>"
      + "<label>Características<textarea name=\"caracteristicas\" maxlength=\"300\" rows=\"2\"></textarea></label>"
      + "<label>Imagen<input name=\"imagen\" type=\"file\" accept=\"image/*\"></label>"
      + "<fieldset><legend>Acción</legend>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"preguntar\" checked> Preguntar</label>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"precio\"> Precio</label>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"color\"> Color</label>"
      + "</fieldset>"
      + "<label data-extra=\"precio\" hidden>Precio<input name=\"precio\" maxlength=\"40\"></label>"
      + "<label data-extra=\"color\" hidden>Color<input name=\"color\" maxlength=\"40\"></label>"
      + "<div class=\"actions\"><button type=\"submit\">Guardar</button><button type=\"button\" class=\"secondary\" data-cancel>Cancelar</button></div>";
    const select = form.querySelector("select");
    sections.forEach(([path, name]) => {
      const option = document.createElement("option");
      option.value = path;
      option.textContent = name;
      select.append(option);
    });
    board.append(picker, grid, form);
    view.replaceChildren(board);

    function paintExtras() {
      const action = new FormData(form).get("accion");
      form.querySelectorAll("[data-extra]").forEach((node) => {
        node.hidden = node.getAttribute("data-extra") !== action;
      });
    }

    form.addEventListener("change", paintExtras);
    form.querySelector("[data-cancel]").addEventListener("click", () => {
      editing = "";
      editingImage = "";
      form.reset();
      form.querySelector("h2").textContent = "Nuevo producto";
      select.value = section;
      paintExtras();
    });

    function csrf() {
      const input = document.querySelector('input[name="csrf"]');
      return input ? input.value : "";
    }

    function saveStore(payload) {
      return fetch("/api/catalogo.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ csrf: csrf() }, payload)),
      }).then((response) => response.json());
    }

    function actionLabel(product) {
      if (product.accion === "precio" && product.precio) return product.precio;
      if (product.accion === "color" && product.color) return product.color;
      return "Preguntar";
    }

    function draw(products) {
      picker.replaceChildren();
      sections.forEach(([path, name]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = name;
        button.setAttribute("aria-pressed", path === section ? "true" : "false");
        button.addEventListener("click", () => {
          section = path;
          select.value = path;
          draw(products);
        });
        picker.append(button);
      });
      grid.replaceChildren();
      products.filter((product) => product.pagina === section).forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        if (product.imagen) {
          const photo = document.createElement("img");
          photo.src = product.imagen;
          photo.alt = "";
          card.append(photo);
        }
        const title = document.createElement("h3");
        title.textContent = product.titulo;
        const copy = document.createElement("p");
        copy.textContent = product.descripcion;
        const detail = document.createElement("p");
        detail.className = "muted";
        detail.textContent = product.caracteristicas;
        const action = document.createElement("strong");
        action.textContent = actionLabel(product);
        const controls = document.createElement("div");
        controls.className = "actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Editar";
        edit.addEventListener("click", () => {
          editing = product.id;
          editingImage = product.imagen || "";
          form.querySelector("h2").textContent = "Editar producto";
          form.elements.pagina.value = product.pagina;
          form.elements.titulo.value = product.titulo;
          form.elements.descripcion.value = product.descripcion;
          form.elements.caracteristicas.value = product.caracteristicas;
          form.elements.precio.value = product.precio || "";
          form.elements.color.value = product.color || "";
          form.querySelector('input[name="accion"][value="' + product.accion + '"]').checked = true;
          paintExtras();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "secondary";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", () => {
          saveStore({ accion_api: "eliminar", id: product.id }).then(load);
        });
        controls.append(edit, remove);
        card.append(title, copy, detail, action, controls);
        grid.append(card);
      });
      if (!grid.children.length) grid.append(line("Aún no hay productos en esta sección.", "muted"));
    }

    function load() {
      return fetch("/api/catalogo.php", { cache: "no-store", credentials: "same-origin" })
        .then((response) => response.json())
        .then((data) => draw(data.productos || []));
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const file = form.elements.imagen.files[0];
      const finish = (imagen) => {
        const product = {
          pagina: String(data.get("pagina") || section),
          titulo: String(data.get("titulo") || ""),
          descripcion: String(data.get("descripcion") || ""),
          caracteristicas: String(data.get("caracteristicas") || ""),
          imagen: imagen,
          accion: String(data.get("accion") || "preguntar"),
          precio: String(data.get("precio") || ""),
          color: String(data.get("color") || ""),
        };
        section = product.pagina;
        const payload = editing
          ? { accion_api: "editar", id: editing, producto: product }
          : { accion_api: "crear", producto: product };
        saveStore(payload).then(() => {
          editing = "";
          editingImage = "";
          form.reset();
          form.querySelector("h2").textContent = "Nuevo producto";
          select.value = section;
          paintExtras();
          load();
        });
      };
      if (!file) {
        finish(editingImage);
        return;
      }
      if (file.size > 1400000) {
        form.querySelector("h2").textContent = "La imagen pesa demasiado";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => finish(String(reader.result || ""));
      reader.readAsDataURL(file);
    });

    paintExtras();
    load();
  }

  function loadPromos() {
    const saved = readPromos();
    const wrap = document.createElement("div");
    const form = document.createElement("form");
    form.className = "promo-form";
    form.innerHTML = ""
      + "<label>Nombre<input name=\"nombre\" maxlength=\"80\" required></label>"
      + "<label>Línea<select name=\"linea\"><option>Canceles</option><option>Ventanas</option><option>Barandales</option><option>Fachadas</option><option>Puertas</option><option>Pérgolas</option></select></label>"
      + "<label>Desde<input name=\"desde\" type=\"date\" required></label>"
      + "<label>Hasta<input name=\"hasta\" type=\"date\" required></label>"
      + "<label class=\"full\">Detalle<input name=\"detalle\" maxlength=\"160\" required></label>"
      + "<button class=\"full\" type=\"submit\">Guardar promoción</button>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      saved.unshift({
        nombre: String(data.get("nombre") || ""),
        linea: String(data.get("linea") || ""),
        desde: String(data.get("desde") || ""),
        hasta: String(data.get("hasta") || ""),
        detalle: String(data.get("detalle") || ""),
      });
      sessionStorage.setItem("avi_promos", JSON.stringify(saved.slice(0, 12)));
      show();
    });
    wrap.append(form);
    if (!saved.length) {
      wrap.append(line("Aún no hay promociones en este navegador.", "muted"));
    } else {
      const grid = document.createElement("div");
      grid.className = "promos";
      saved.forEach((promo) => {
        const card = document.createElement("article");
        card.className = "promo";
        const kicker = document.createElement("em");
        kicker.textContent = promo.linea;
        const name = document.createElement("h2");
        name.textContent = promo.nombre;
        const copy = document.createElement("p");
        copy.textContent = promo.detalle;
        const when = document.createElement("p");
        when.className = "muted";
        when.textContent = promo.desde + " → " + promo.hasta;
        card.append(kicker, name, copy, when);
        grid.append(card);
      });
      wrap.append(grid);
    }
    view.replaceChildren(wrap);
  }

  function readPromos() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("avi_promos") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
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

  function animateSummary(cards, chartCard) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = chartCard.querySelector(".chart-line");
    const area = chartCard.querySelector(".chart-area");
    if (!window.gsap || reduce) return;
    window.gsap.from(cards.querySelectorAll(".stat"), {
      y: 18,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
    });
    window.gsap.from(chartCard, {
      y: 20,
      autoAlpha: 0,
      duration: 0.55,
      delay: 0.08,
      ease: "power3.out",
    });
    if (path && typeof path.getTotalLength === "function") {
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      window.gsap.to(path, { strokeDashoffset: 0, duration: 1.15, ease: "power2.out", delay: 0.25 });
    }
    if (area) window.gsap.from(area, { autoAlpha: 0, duration: 0.55, delay: 0.45 });
  }

  function hoursOf(day) {
    const totals = {};
    day.horas.forEach((hour) => {
      totals[String(hour.hora || "")] = Number(hour.visitas) || 0;
    });
    const points = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const label = String(hour).padStart(2, "0") + ":00";
      points.push({ hora: label, fecha: day.fecha, visitas: totals[label] || 0 });
    }
    return points;
  }

  function drawChart(days, hourly) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const width = 640;
    const height = 220;
    const padX = 16;
    const padTop = 16;
    const padBottom = 32;
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("class", "chart-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", hourly ? "Visitas por hora" : "Visitas por día");
    const list = days.length ? days : [{ fecha: "", visitas: 0 }];
    const max = list.reduce((top, day) => Math.max(top, Number(day.visitas) || 0), 1);
    const innerW = width - padX * 2;
    const innerH = height - padTop - padBottom;
    const points = list.map((day, index) => {
      const visits = Number(day.visitas) || 0;
      const x = list.length === 1 ? width / 2 : padX + (index / (list.length - 1)) * innerW;
      const y = padTop + innerH - (visits / max) * innerH;
      return { x: x, y: y, day: day, visits: visits };
    });
    const line = smoothLine(points);
    const base = padTop + innerH;
    const area = document.createElementNS(svg.namespaceURI, "path");
    area.setAttribute("class", "chart-area");
    area.setAttribute("d", line + " L " + points[points.length - 1].x + " " + base + " L " + points[0].x + " " + base + " Z");
    svg.append(area);
    const stroke = document.createElementNS(svg.namespaceURI, "path");
    stroke.setAttribute("class", "chart-line");
    stroke.setAttribute("d", line);
    svg.append(stroke);
    points.forEach((point, index) => {
      const dot = document.createElementNS(svg.namespaceURI, "circle");
      dot.setAttribute("class", "chart-dot");
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      dot.setAttribute("r", index === points.length - 1 ? "5" : "3.2");
      svg.append(dot);
      const step = list.length <= 8 ? 1 : list.length <= 16 ? 2 : hourly ? 3 : 4;
      if (index % step === 0 || index === list.length - 1) {
        const text = document.createElementNS(svg.namespaceURI, "text");
        text.setAttribute("x", String(point.x));
        text.setAttribute("y", String(height - 8));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#5e5e56");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-family", "Trebuchet MS, sans-serif");
        text.textContent = hourly ? String(Number(String(point.day.hora).slice(0, 2))) + "h" : dayLabel(point.day.fecha);
        svg.append(text);
      }
    });
    const guide = document.createElementNS(svg.namespaceURI, "line");
    guide.setAttribute("class", "chart-guide");
    guide.setAttribute("y1", String(padTop));
    guide.setAttribute("y2", String(base));
    guide.setAttribute("visibility", "hidden");
    svg.append(guide);
    const wrap = document.createElement("div");
    wrap.className = "chart-wrap";
    const tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.hidden = true;
    const tipTitle = document.createElement("strong");
    const tipBody = document.createElement("span");
    tip.append(tipTitle, tipBody);
    wrap.append(svg, tip);
    const dots = svg.querySelectorAll(".chart-dot");

    function showPoint(point, index) {
      const detail = chartDetail(point.day);
      tipTitle.textContent = detail.title;
      tipBody.textContent = detail.body;
      tip.hidden = false;
      const left = (point.x / width) * svg.getBoundingClientRect().width;
      tip.style.left = Math.max(8, Math.min(left - 20, wrap.clientWidth - tip.offsetWidth - 8)) + "px";
      tip.style.top = "8px";
      guide.setAttribute("x1", String(point.x));
      guide.setAttribute("x2", String(point.x));
      guide.setAttribute("visibility", "visible");
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("r", dotIndex === index ? "6" : "3.2");
      });
    }

    svg.addEventListener("pointermove", (event) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const x = ((event.clientX - rect.left) / rect.width) * width;
      let nearest = 0;
      let distance = Infinity;
      points.forEach((point, index) => {
        const gap = Math.abs(point.x - x);
        if (gap < distance) {
          distance = gap;
          nearest = index;
        }
      });
      showPoint(points[nearest], nearest);
    });
    svg.addEventListener("pointerleave", () => {
      tip.hidden = true;
      guide.setAttribute("visibility", "hidden");
      dots.forEach((dot, index) => {
        dot.setAttribute("r", index === points.length - 1 ? "5" : "3.2");
      });
    });
    return wrap;
  }

  function chartDetail(day) {
    if (day.hora) {
      const atHour = Number(day.visitas) || 0;
      return {
        title: "A las " + day.hora,
        body: atHour ? "Obtuvo " + visitWord(atHour) + "." : "No tuvo visitas.",
      };
    }
    const date = String(day.fecha || "");
    const dayNumber = Number(date.slice(8)) || 0;
    const month = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][Number(date.slice(5, 7)) - 1] || "";
    const hours = Array.isArray(day.horas) ? day.horas : [];
    const visits = Number(day.visitas) || 0;
    if (hours.length === 1) {
      return {
        title: "El día " + dayNumber + " a las " + hours[0].hora,
        body: "Obtuvo " + visitWord(hours[0].visitas) + ".",
      };
    }
    if (hours.length > 1) {
      return {
        title: "El día " + dayNumber + (month ? " de " + month : ""),
        body: "Obtuvo " + visitWord(visits) + ". " + hours.map((hour) => hour.hora + " · " + visitWord(hour.visitas)).join(" · "),
      };
    }
    return {
      title: "El día " + dayNumber + (month ? " de " + month : ""),
      body: visits ? "Obtuvo " + visitWord(visits) + "." : "No tuvo visitas.",
    };
  }

  function visitWord(count) {
    const total = Number(count) || 0;
    return total + (total === 1 ? " visita" : " visitas");
  }

  function dayLabel(fecha) {
    const date = String(fecha || "");
    const day = date.slice(8);
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = months[Number(date.slice(5, 7)) - 1] || "";
    return day && month ? Number(day) + " " + month : day;
  }

  function smoothLine(points) {
    if (points.length === 1) {
      const point = points[0];
      return "M " + (point.x - 28) + " " + point.y + " L " + (point.x + 28) + " " + point.y;
    }
    let path = "M " + points[0].x + " " + points[0].y;
    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const mid = (current.x + next.x) / 2;
      path += " C " + mid + " " + current.y + ", " + mid + " " + next.y + ", " + next.x + " " + next.y;
    }
    return path;
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
    if (hash === "paginas" || hash === "embudo" || hash === "referidos" || hash === "catalogos" || hash === "promociones" || hash === "pagos" || hash === "campana" || hash === "problema" || hash === "compras") {
      return { vista: hash, id: "" };
    }
    return { vista: "resumen", id: "" };
  }

  function labelFor(vista) {
    return {
      resumen: "Resumen",
      paginas: "Páginas",
      embudo: "Embudo",
      referidos: "Referidos",
      catalogos: "Catálogos",
      promociones: "Promociones",
      pagos: "Pagos",
      campana: "Campaña",
      problema: "Algún problema",
      compras: "Historia de compras",
    }[vista] || "Resumen";
  }

  function subtitleFor(vista) {
    return {
      resumen: "Visitas, contactos y el ritmo del periodo.",
      paginas: "Qué página trae WhatsApp y llamadas.",
      embudo: "Elige una página y mira su recorrido.",
      referidos: "Sitios y campañas que mandan visitas.",
      catalogos: "Productos de cada página. Lo que guardas aquí se ve en esa sección.",
      promociones: "Ofertas del negocio. Por ahora quedan en este navegador.",
      pagos: "Cobros del negocio. Todavía no se registran aquí.",
      campana: "Campañas que mandan gente. Todavía no hay una lista.",
      problema: "Avisos del negocio. Todavía no hay ninguno.",
      compras: "Lo que se ha comprado. Todavía no hay registros.",
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
      eye: "M2.5 12S6.2 6.5 12 6.5 21.5 12 21.5 12 17.8 17.5 12 17.5 2.5 12 2.5 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      chat: "M6 17.5 4.5 20l2.2-.8A8.2 8.2 0 1 0 6 17.5z",
      phone: "M8 4.5h2.2l1 3.2-1.8 1a11 11 0 0 0 5 5l1-1.8 3.2 1V15a1.8 1.8 0 0 1-1.8 1.8A13.2 13.2 0 0 1 5.2 6.3 1.8 1.8 0 0 1 7 4.5z",
      form: "M7 3.5h7.2L19 8.2V20.5H7z M14.2 3.5V8H19 M9.5 12.5h6 M9.5 16h6",
      check: "M5 12.5 9.2 17 19 7",
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
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
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
    const fallback = { rango: "30", fuente: "todas", pagina: "", desde: "", hasta: "", p: 1 };
    try {
      const saved = JSON.parse(sessionStorage.getItem("avi_panel_filters") || "");
      if (!saved || typeof saved !== "object") return fallback;
      return {
        rango: ["hoy", "7", "30", "custom"].includes(saved.rango) ? saved.rango : "30",
        fuente: "todas",
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
