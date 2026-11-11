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
      const pagePickBox = document.getElementById("pagina-pick");
      if (pagePickBox && !pagePickBox.contains(event.target)) setPagePickOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setPeriodOpen(false);
        setPagePickOpen(false);
        closeAccountSheet();
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
        if (window.matchMedia("(max-width: 980px)").matches) openAccountSheet();
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
    updateClientsNav();
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
      paginas: loadPages,
      embudo: loadFunnel,
      comparativa: loadComparativa,
      contactos: loadContactos,
      clientes: loadClientes,
      referidos: loadReferrals,
      catalogos: loadCatalogs,
      promociones: function () { return Promise.resolve(loadPromos()); },
      pagos: function () { return Promise.resolve(loadAccountSection("pagos")); },
      campana: function () { return Promise.resolve(loadAccountSection("campana")); },
      licencia: function () { return Promise.resolve(loadAccountSection("licencia")); },
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
      if (!pages.some((page) => page.pagina === state.pagina)) {
        state.pagina = "/";
        saveState();
      }
      const isDesk = !window.matchMedia("(max-width: 760px)").matches;
      const wrap = document.createElement("div");
      wrap.className = "funnel-pick" + (isDesk ? " is-desk" : "");

      if (isDesk) {
        const ranked = (list.paginas || []).slice().sort((a, b) => Number(b.visitas) - Number(a.visitas));
        const fallback = [
          { pagina: "/", etiqueta: "Inicio" },
          { pagina: "/servicios/canceles-de-bano/", etiqueta: "Canceles" },
          { pagina: "/servicios/ventanas/", etiqueta: "Ventanas" },
        ];
        const targets = (ranked.length ? ranked : fallback).slice(0, 3).map((item) => ({
          pagina: item.pagina,
          etiqueta: item.etiqueta || pageName(item.pagina),
          visitas: Number(item.visitas) || 0,
        }));
        fallback.forEach((next) => {
          if (targets.length >= 3) return;
          if (!targets.some((row) => row.pagina === next.pagina)) {
            targets.push(Object.assign({}, next, { visitas: 0 }));
          }
        });
        const grid = document.createElement("div");
        grid.className = "journeys is-desk-grid";
        return Promise.all(targets.map((page) => (
          api("/api/stats/embudo.php", { pagina: page.pagina })
            .then((data) => journeyCard(page, data.pasos || []))
            .catch(() => journeyCard(page, []))
        ))).then((cards) => {
          cards.forEach((card) => grid.append(card));
          wrap.append(grid);
          view.replaceChildren(wrap);
          animateJourneys(wrap);
        });
      }

      const selected = state.pagina;
      const page = pages.find((item) => item.pagina === selected) || pages[0];
      wrap.append(pagePick(pages, selected));
      return api("/api/stats/embudo.php", { pagina: selected }).then((data) => {
        wrap.append(journeyCard(page, data.pasos || []));
        view.replaceChildren(wrap);
        animateJourneys(wrap);
      }).catch(() => {
        wrap.append(journeyCard(page, []));
        view.replaceChildren(wrap);
        animateJourneys(wrap);
      });
    });
  }

  function pagePick(pages, selected) {
    const current = pages.find((page) => page.pagina === selected) || pages[0];
    const box = document.createElement("div");
    box.className = "period page-pick";
    box.id = "pagina-pick";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "period-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "pagina-menu");
    const kicker = document.createElement("span");
    kicker.className = "period-kicker";
    kicker.textContent = "Página";
    const value = document.createElement("span");
    value.className = "period-value";
    value.textContent = current ? current.etiqueta : "Inicio";
    const chevron = document.createElement("span");
    chevron.className = "period-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.2 7 9l4-3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    button.append(kicker, value, chevron);
    const menu = document.createElement("ul");
    menu.className = "period-menu";
    menu.id = "pagina-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;
    pages.forEach((page) => {
      const item = document.createElement("li");
      const option = document.createElement("button");
      option.type = "button";
      option.setAttribute("role", "option");
      option.dataset.pagina = page.pagina;
      option.setAttribute("aria-selected", page.pagina === selected ? "true" : "false");
      option.textContent = page.etiqueta;
      item.append(option);
      menu.append(item);
    });
    box.append(button, menu);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setPagePickOpen(menu.hidden);
    });
    menu.addEventListener("click", (event) => {
      const option = event.target.closest("[data-pagina]");
      if (!option) return;
      event.stopPropagation();
      state.pagina = option.dataset.pagina || "/";
      saveState();
      setPagePickOpen(false);
      show();
    });
    return box;
  }

  function setPagePickOpen(open) {
    const box = document.getElementById("pagina-pick");
    if (!box) return;
    const button = box.querySelector(".period-btn");
    const menu = box.querySelector(".period-menu");
    if (!button || !menu) return;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open || !window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.gsap.fromTo(menu, { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.22, ease: "power2.out" });
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
      card.remove();
      return emptyJourney(page.etiqueta || pageName(page.pagina), "Cuando entre alguien, aquí se ve en qué parte se queda.");
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

  function emptyJourney(title, hint) {
    const card = document.createElement("article");
    card.className = "journey journey-empty";
    const head = document.createElement("div");
    head.className = "journey-head";
    const name = document.createElement("h2");
    name.textContent = title;
    head.append(name);
    const path = document.createElement("div");
    path.className = "empty-path";
    path.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 5; index += 1) path.append(document.createElement("span"));
    const note = document.createElement("p");
    note.className = "journey-note";
    note.textContent = title === "Elige una página" ? "Elige una página." : "Nadie pasó por aquí.";
    const copy = document.createElement("p");
    copy.className = "muted";
    copy.textContent = hint;
    card.append(head, path, note, copy);
    return card;
  }

  function placePickPill(menu) {
    const pill = menu.querySelector(".pick-pill");
    const current = menu.querySelector('[aria-pressed="true"]');
    if (!pill || !current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = { top: current.offsetTop, height: current.offsetHeight };
    if (!window.gsap || reduce) {
      pill.style.top = box.top + "px";
      pill.style.height = box.height + "px";
      return;
    }
    window.gsap.fromTo(pill, { top: box.top, height: box.height, scaleX: 0.82, scaleY: 0.72 }, {
      top: box.top,
      height: box.height,
      scaleX: 1,
      scaleY: 1,
      duration: 0.45,
      ease: "power3.out",
      transformOrigin: "left center",
    });
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
    window.gsap.from(board.querySelectorAll(".step-dot, .empty-path span"), {
      scale: 0,
      duration: 0.4,
      stagger: 0.07,
      ease: "back.out(2)",
      delay: 0.12,
    });
    window.gsap.from(board.querySelectorAll(".journey-empty .journey-note, .journey-empty .muted"), {
      y: 12,
      autoAlpha: 0,
      duration: 0.45,
      stagger: 0.08,
      delay: 0.28,
      ease: "power2.out",
    });
  }

  function referralStoreKey() {
    return "avi_panel_referidos_v1";
  }

  function readClientReferrals() {
    if (Array.isArray(referralsCache)) return referralsCache.slice();
    try {
      const raw = sessionStorage.getItem(referralStoreKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeClientReferrals(rows) {
    referralsCache = Array.isArray(rows) ? rows : [];
    try {
      sessionStorage.setItem(referralStoreKey(), JSON.stringify(referralsCache));
    } catch (error) {}
    fetch("/api/account.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: csrfToken(), section: "referidos", data: referralsCache }),
    }).then(function (response) { return response.json(); }).then(function (data) {
      if (data && data.ok && Array.isArray(data.referidos)) {
        referralsCache = data.referidos;
        try { sessionStorage.setItem(referralStoreKey(), JSON.stringify(referralsCache)); } catch (error) {}
      }
    }).catch(function () {});
  }

  function referralStatuses() {
    return ["En proceso", "Cerrado", "No se cerró"];
  }

  function normalizeReferral(item) {
    const row = item && typeof item === "object" ? item : {};
    let estado = String(row.estado || "").trim();
    if (row.cerrado && estado !== "Cerrado") estado = "Cerrado";
    if (!estado || estado === "Enviado") estado = "En proceso";
    if (referralStatuses().indexOf(estado) < 0) estado = "En proceso";
    return Object.assign({}, row, {
      estado,
      cerrado: estado === "Cerrado",
    });
  }

  function setReferralStatus(index, estado) {
    const nextEstado = referralStatuses().indexOf(estado) >= 0 ? estado : "En proceso";
    const rows = readClientReferrals().map(normalizeReferral);
    if (!rows[index]) return;
    rows[index] = Object.assign({}, rows[index], {
      estado: nextEstado,
      cerrado: nextEstado === "Cerrado",
    });
    writeClientReferrals(rows);
  }

  function loadReferrals() {
    if (isAdminRole()) {
      renderAdminReferidosEditor();
      return Promise.resolve();
    }
    const isDesk = !window.matchMedia("(max-width: 760px)").matches;
    const board = document.createElement("div");
    board.className = "account-board is-referidos" + (isDesk ? " is-desk" : "");
    const clientName = accountClientName();
    const refCfg = readAccountData().referidosConfig;
    const rows = readClientReferrals().map(normalizeReferral);
    const closed = rows.filter((item) => item.cerrado).length;
    const open = rows.filter((item) => !item.cerrado && item.estado !== "No se cerró").length;
    const discountOn = closed > 0;
    const ownerPct = Number((refCfg && refCfg.descuentoDueno) || 50);
    const refPct = Number((refCfg && refCfg.descuentoReferido) || 10);

    function bindReferSend(refer, sendRefer) {
      sendRefer.addEventListener("click", (event) => {
        const nameInput = refer.querySelector("#referido-nombre");
        const phoneInput = refer.querySelector("#referido-telefono");
        const nombre = nameInput ? String(nameInput.value || "").trim() : "";
        const telefono = phoneInput ? String(phoneInput.value || "").replace(/\D+/g, "") : "";
        if (!nombre) {
          event.preventDefault();
          if (nameInput) nameInput.focus();
          return;
        }
        if (telefono.length < 10) {
          event.preventDefault();
          if (phoneInput) phoneInput.focus();
          return;
        }
        const current = readClientReferrals();
        current.unshift({
          id: "r" + Date.now(),
          nombre: nombre,
          telefono: telefono,
          estado: "En proceso",
          cerrado: false,
        });
        writeClientReferrals(current);
        sendRefer.href = whatsappHref(
          telefono,
          "Hola " + nombre + ", te escribe " + clientName + " de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes " + refPct + "% de descuento en tu proyecto web. Si te interesa, con gusto te orientamos."
        );
        setTimeout(() => loadReferrals(), 400);
      });
    }

    function buildReferralsList(panel) {
      if (!rows.length) {
        panel.append(line("Todavía no ha referido a nadie.", "muted"));
        return;
      }
      const list = document.createElement("div");
      list.className = "account-pay-list is-dark";
      rows.forEach((item) => {
        const estado = item.estado || "En proceso";
        const badgeClass = item.cerrado
          ? ""
          : (estado === "No se cerró" ? " is-warn" : " is-soft");
        const rowEl = document.createElement("div");
        rowEl.className = "account-pay-row";
        rowEl.innerHTML = ""
          + "<div><strong>" + escapeHtml(item.nombre || "Referido") + "</strong>"
          + "<p>" + escapeHtml(estado)
          + (item.telefono ? (" · " + escapeHtml(item.telefono)) : "")
          + "</p></div>"
          + "<div class=\"account-pay-side\">"
          + "<span class=\"account-pay-badge" + badgeClass + "\">"
          + escapeHtml(estado)
          + "</span></div>";
        list.append(rowEl);
      });
      panel.append(list);
    }

    if (isDesk) {
      const hero = document.createElement("section");
      hero.className = "camp-desk-hero";
      hero.innerHTML = ""
        + "<div class=\"camp-desk-hero-top\">"
        + "<span class=\"camp-desk-status\">" + (discountOn ? "Habilitado" : "Sin descuento") + "</span>"
        + "<em>Programa de referidos</em>"
        + "</div>"
        + "<p class=\"camp-desk-amount\">" + (discountOn ? (ownerPct + "%") : "0%") + "</p>"
        + "<h2>Descuento del siguiente mes</h2>"
        + "<div class=\"camp-desk-meta\">"
        + "<span>Usted " + ownerPct + "% al cerrar</span>"
        + "<span>Referido " + refPct + "% en su proyecto</span>"
        + "<span>" + rows.length + " referidos</span>"
        + "</div>";

      const status = document.createElement("section");
      status.className = "camp-desk-block";
      status.innerHTML = ""
        + "<div class=\"camp-desk-block-head\"><h3>Estado</h3><em>actividad del programa</em></div>"
        + "<div class=\"camp-desk-primary\">"
        + "<article class=\"camp-desk-kpi is-lead\"><em>Desc. sig. mes</em><strong>" + (discountOn ? (ownerPct + "%") : "0%") + "</strong><span>" + (discountOn ? "habilitado" : "aún no") + "</span></article>"
        + "<article class=\"camp-desk-kpi\"><em>Referidos</em><strong>" + rows.length + "</strong><span>enviados</span></article>"
        + "<article class=\"camp-desk-kpi\"><em>Cerrados</em><strong>" + closed + "</strong><span>" + open + " en proceso</span></article>"
        + "</div>";

      const how = document.createElement("section");
      how.className = "camp-desk-block";
      how.innerHTML = ""
        + "<div class=\"camp-desk-block-head\"><h3>Cómo funciona</h3><em>paso a paso</em></div>"
        + "<ol class=\"camp-desk-steps\">"
        + "<li>Captura nombre y WhatsApp de alguien interesado en una página web.</li>"
        + "<li>Se le manda un mensaje con su " + refPct + "% de descuento por venir de Instala.</li>"
        + "<li>Si se cierra el negocio, usted obtiene " + ownerPct + "% el siguiente mes de gestión.</li>"
        + "<li>El referido cerrado aparece aquí y su descuento queda habilitado.</li>"
        + "</ol>";

      const benefits = document.createElement("section");
      benefits.className = "camp-desk-block";
      benefits.innerHTML = ""
        + "<div class=\"camp-desk-block-head\"><h3>Beneficios al cerrar</h3><em>para ambos</em></div>"
        + "<div class=\"camp-desk-secondary\">"
        + "<div><em>Usted</em><strong>" + (discountOn ? (ownerPct + "% habilitado") : (ownerPct + "%")) + "</strong></div>"
        + "<div><em>Referido</em><strong>" + refPct + "% en su proyecto</strong></div>"
        + "</div>"
        + "<p class=\"account-board-note\" style=\"margin:0;color:#9a9a94\">"
        + (discountOn
          ? ("Hay un referido cerrado: su " + ownerPct + "% del siguiente mes ya está habilitado.")
          : ("Al cerrarse un referido: usted " + ownerPct + "% el siguiente mes, el referido " + refPct + "% en su proyecto."))
        + "</p>";

      const refer = document.createElement("section");
      refer.className = "camp-desk-block";
      refer.innerHTML = ""
        + "<div class=\"camp-desk-block-head\"><h3>Referir ahora</h3><em>mensaje al referido</em></div>"
        + "<p class=\"account-board-note\" style=\"margin:0;color:#9a9a94\">Escribe nombre y WhatsApp. Se enviará un mensaje con su " + refPct + "% de descuento.</p>"
        + "<div class=\"camp-desk-form\">"
        + "<label class=\"account-refer-field\">Nombre del interesado"
        + "<input type=\"text\" id=\"referido-nombre\" maxlength=\"80\" placeholder=\"Ej. Ana López\"></label>"
        + "<label class=\"account-refer-field\">WhatsApp del referido"
        + "<input type=\"tel\" id=\"referido-telefono\" maxlength=\"15\" inputmode=\"numeric\" placeholder=\"Ej. 7221234567\"></label>"
        + "<div class=\"account-refer-actions\"></div>"
        + "</div>";
      const sendRefer = accountWhatsAppButton(
        "Enviar mensaje",
        "Hola, te escribe " + clientName + " de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes " + refPct + "% de descuento en tu proyecto web."
      );
      bindReferSend(refer, sendRefer);
      refer.querySelector(".account-refer-actions").append(sendRefer);

      const panel = document.createElement("section");
      panel.className = "camp-desk-block camp-desk-history";
      panel.innerHTML = "<div class=\"camp-desk-block-head\"><h3>Mis referidos</h3><em>contactos</em></div>";
      buildReferralsList(panel);

      board.append(hero, status, how, benefits, refer, panel);
      view.replaceChildren(board);
      animateAccountBoard(board);
      return Promise.resolve();
    }

    const summary = document.createElement("div");
    summary.className = "stats";
    const lead = card(discountOn ? (ownerPct + "%") : "0%", "Desc. sig. mes", "check");
    lead.classList.add("lead");
    summary.append(lead);

    const counts = document.createElement("div");
    counts.className = "account-refer-counts";
    [
      [String(rows.length), "Referidos", "chat"],
      [String(closed), "Cerrados", "check"],
      [String(open), "En proceso", "form"],
    ].forEach((item) => {
      counts.append(card(item[0], item[1], item[2]));
    });

    const how = document.createElement("section");
    how.className = "account-board-panel";
    how.innerHTML = ""
      + "<div class=\"account-board-head\"><h2>Programa</h2><em>cómo funciona</em></div>"
      + "<ul class=\"account-include-list is-dark\">"
      + "<li>Si sabe de alguien interesado en una página web, captura su nombre y WhatsApp.</li>"
      + "<li>Se le manda un mensaje personalizado al referido con su " + refPct + "% de descuento por venir de Aluminios y Vidrios Instala.</li>"
      + "<li>Si se cierra el negocio, usted obtiene " + ownerPct + "% de descuento en el siguiente mes de gestión.</li>"
      + "<li>Cuando se cierra, aparece aquí el nombre del referido y su descuento queda habilitado.</li>"
      + "</ul>";

    const discount = document.createElement("section");
    discount.className = "account-upgrade" + (discountOn ? "" : " is-basic");
    discount.innerHTML = ""
      + "<div class=\"account-upgrade-top\">"
      + "<h2>Beneficios al cerrar</h2>"
      + "<p>" + (discountOn
        ? ("Hay un referido cerrado: su " + ownerPct + "% del siguiente mes ya está habilitado. El referido recibió " + refPct + "% en su proyecto.")
        : ("Al cerrarse un referido: usted " + ownerPct + "% el siguiente mes de gestión, y el referido " + refPct + "% en su proyecto."))
      + "</p>"
      + "</div>"
      + "<div class=\"account-upgrade-prices\">"
      + "<div class=\"" + (discountOn ? "is-main" : "") + "\"><em>Usted</em><strong>"
      + (discountOn ? (ownerPct + "% habilitado") : (ownerPct + "%"))
      + "</strong><span>siguiente mes gestión</span></div>"
      + "<div><em>Referido</em><strong>" + refPct + "%</strong><span>en su proyecto</span></div>"
      + "</div>";

    const refer = document.createElement("section");
    refer.className = "account-board-panel";
    refer.innerHTML = ""
      + "<div class=\"account-board-head\"><h2>Referir ahora</h2><em>mensaje al referido</em></div>"
      + "<p class=\"account-board-note\">Escribe el WhatsApp de la persona interesada. Se le enviará un mensaje personalizado con su 10% de descuento.</p>"
      + "<label class=\"account-refer-field\">Nombre del interesado"
      + "<input type=\"text\" id=\"referido-nombre\" maxlength=\"80\" placeholder=\"Ej. Ana López\"></label>"
      + "<label class=\"account-refer-field\">WhatsApp del referido"
      + "<input type=\"tel\" id=\"referido-telefono\" maxlength=\"15\" inputmode=\"numeric\" placeholder=\"Ej. 7221234567\"></label>";
    const referActions = document.createElement("div");
    referActions.className = "account-refer-actions";
    const sendRefer = accountWhatsAppButton(
      "Enviar mensaje al referido",
      "Hola, te escribe " + clientName + " de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes " + refPct + "% de descuento en tu proyecto web."
    );
    bindReferSend(refer, sendRefer);
    referActions.append(sendRefer);
    refer.append(referActions);

    const panel = document.createElement("section");
    panel.className = "account-board-panel";
    panel.innerHTML = "<div class=\"account-board-head\"><h2>Mis referidos</h2><em>contactos</em></div>";
    buildReferralsList(panel);

    board.append(summary, counts, how, discount, refer, panel, accountBackButton());
    view.replaceChildren(board);
    animateAccountBoard(board);
    return Promise.resolve();
  }

  function loadDesk(message) {
    const sheet = document.createElement("section");
    sheet.className = "desk";
    sheet.append(line(message, "muted"));
    view.replaceChildren(sheet);
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

  let accountCache = null;
  let referralsCache = null;
  let contactsCache = null;
  let quotesCache = null;
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
      accountCache = data.account || defaultAccountData();
      referralsCache = Array.isArray(data.referidos) ? data.referidos : [];
      try {
        sessionStorage.setItem(accountDataKey(), JSON.stringify(accountCache));
        sessionStorage.setItem(referralStoreKey(), JSON.stringify(referralsCache));
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
      contactsCache = Array.isArray(data.contacts) ? data.contacts : [];
      quotesCache = Array.isArray(data.quotes) ? data.quotes : [];
      try {
        sessionStorage.setItem("avi_contactos_reales", JSON.stringify(contactsCache));
        sessionStorage.setItem("avi_cotizaciones", JSON.stringify(quotesCache));
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
    if (accountCache) {
      return {
        campana: Object.assign({}, base.campana, accountCache.campana || {}),
        pagos: {
          proximo: Object.assign({}, base.pagos.proximo, (accountCache.pagos && accountCache.pagos.proximo) || {}),
          historial: Array.isArray(accountCache.pagos && accountCache.pagos.historial) ? accountCache.pagos.historial : [],
        },
        licencia: Object.assign({}, base.licencia, accountCache.licencia || {}),
        referidosConfig: Object.assign({}, base.referidosConfig, accountCache.referidosConfig || {}),
      };
    }
    try {
      const raw = sessionStorage.getItem(accountDataKey());
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return base;
      accountCache = parsed;
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
    accountCache = data;
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
      body: JSON.stringify({ csrf: csrfToken(), section: section, data: payload }),
    }).then(function (response) { return response.json(); }).then(function (res) {
      if (res && res.ok && res.account) {
        accountCache = res.account;
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
      if (location.hash === next) show();
      else location.hash = next;
    }

    const adminMode = isAdminRole();
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
        + "<span><strong>" + escapeHtml(titles[key]) + "</strong><p>" + escapeHtml(details[key]) + "</p></span>"
        + "<span class=\"account-option-status" + (item.warn ? " is-warn" : "") + "\">" + escapeHtml(adminMode ? "Editar" : item.status) + "</span>";
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
        if (location.hash === "#resumen" || !location.hash) show();
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
    link.href = whatsappHref("7221295236", message);
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
      + "<input name=\"" + name + "\" type=\"" + inputType + "\" value=\"" + escapeHtml(shown) + "\""
      + (isMoney ? " data-money=\"1\"" : "")
      + " inputmode=\"" + ((type === "number" || isMoney) ? "decimal" : "text") + "\"></label>";
  }

  function accountEditActions(submitLabel) {
    return ""
      + "<div class=\"account-edit-actions\">"
      + "<button type=\"submit\" class=\"account-edit-save\">" + escapeHtml(submitLabel) + "</button>"
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
        + "<div class=\"is-lead\"><em>Restante</em><strong>" + escapeHtml(moneyText(resta)) + "</strong></div>"
        + "<div><em>Después de IVA</em><strong>" + escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Para la campaña</em><strong>" + escapeHtml(moneyText(para)) + "</strong></div>"
        + "<div><em>Gastado</em><strong>" + escapeHtml(moneyText(gastado)) + "</strong></div>"
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
      + "<div class=\"pay-hero-top\"><span>Próximo cobro</span><em>" + escapeHtml(proximo.estado || "Programado") + "</em></div>"
      + "<strong class=\"pay-hero-amount\">" + escapeHtml(moneyText(proximo.monto)) + "</strong>"
      + "<p class=\"pay-hero-concept\">" + escapeHtml(proximo.concepto || "Sin próximo pago") + "</p>"
      + "<div class=\"pay-hero-meta\">"
      + "<div><em>Fecha</em><strong>" + escapeHtml(proximo.fecha || "—") + "</strong></div>"
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
      timeline.append(line("Aún no hay pagos en el historial.", "muted"));
    } else {
      historial.forEach((row, index) => {
        const rowEl = document.createElement("article");
        rowEl.className = "pay-timeline-item";
        rowEl.innerHTML = ""
          + "<span class=\"pay-timeline-dot\" aria-hidden=\"true\"></span>"
          + "<div class=\"pay-timeline-main\">"
          + "<strong>" + escapeHtml(row.concepto || "") + "</strong>"
          + "<p>" + escapeHtml(row.fecha || "") + " · " + escapeHtml(row.estado || "Pagado") + "</p>"
          + "</div>"
          + "<div class=\"pay-timeline-side\">"
          + "<strong>" + escapeHtml(moneyText(row.monto)) + "</strong>"
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
      + "<div class=\"license-hero-top\"><span>Editor admin</span><em>" + escapeHtml(lic.status || "Activa") + "</em></div>"
      + "<strong class=\"license-hero-plan\">" + escapeHtml(lic.plan || "Instala Pro") + "</strong>"
      + "<p class=\"license-hero-account\">" + escapeHtml(lic.cuenta || "") + "</p>"
      + "<div class=\"license-hero-meta\">"
      + "<div><em>Tu costo</em><strong>" + escapeHtml(lic.precioEspecial || moneyText(0)) + "</strong></div>"
      + "<div><em>Vigente hasta</em><strong>" + escapeHtml(lic.fin || "—") + "</strong></div>"
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

  function renderAdminReferidosEditor() {
    const cfg = readAccountData().referidosConfig;
    const board = document.createElement("div");
    board.className = "account-board is-admin-edit";
    const form = document.createElement("form");
    form.className = "account-edit-form";
    form.innerHTML = ""
      + "<section class=\"account-edit-panel\">"
      + "<div class=\"account-edit-banner\"><strong>Editor admin</strong><span>Porcentajes, fecha y responsable</span></div>"
      + "<div class=\"account-edit-block\">"
      + "<div class=\"account-edit-block-head\"><h2>Configurar referidos</h2><em>reglas</em></div>"
      + "<div class=\"account-edit-grid\">"
      + accountField("% descuento dueño", "descuentoDueno", cfg.descuentoDueno, "number")
      + accountField("% descuento referido", "descuentoReferido", cfg.descuentoReferido, "number")
      + accountField("Activo desde", "activoDesde", cfg.activoDesde, "date")
      + accountField("Empleado / responsable", "empleado", cfg.empleado)
      + "</div></div>"
      + accountEditActions("Guardar referidos")
      + "</section>";
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
      writeAccountData(next, "referidosConfig");
      const saveBtn = form.querySelector(".account-edit-save");
      if (saveBtn) {
        saveBtn.textContent = "Guardado";
        saveBtn.classList.add("is-saved");
        window.setTimeout(() => {
          saveBtn.textContent = "Guardar referidos";
          saveBtn.classList.remove("is-saved");
        }, 1200);
      }
    });

    const list = document.createElement("section");
    list.className = "account-edit-panel";
    list.innerHTML = "<div class=\"account-edit-block-head\"><h2>Referidos del cliente</h2><em>cambiar estatus</em></div>";
    const rowsWrap = document.createElement("div");
    rowsWrap.className = "refer-admin-list";
    readClientReferrals().map(normalizeReferral).forEach((item, index) => {
      const rowEl = document.createElement("article");
      rowEl.className = "refer-admin-item";
      rowEl.innerHTML = ""
        + "<div class=\"refer-admin-main\">"
        + "<strong>" + escapeHtml(item.nombre || "Referido") + "</strong>"
        + "<p>" + escapeHtml(item.telefono || "Sin teléfono") + "</p>"
        + "</div>";
      const statusRow = document.createElement("div");
      statusRow.className = "refer-status-row";
      statusRow.setAttribute("role", "group");
      statusRow.setAttribute("aria-label", "Estatus del referido");
      referralStatuses().forEach((status) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "refer-status-chip";
        chip.textContent = status;
        chip.setAttribute("aria-pressed", item.estado === status ? "true" : "false");
        if (item.estado === status) chip.classList.add("is-on");
        chip.dataset.status = status === "No se cerró" ? "no-cerro" : (status === "Cerrado" ? "cerrado" : "proceso");
        chip.addEventListener("click", () => {
          setReferralStatus(index, status);
          loadReferrals();
        });
        statusRow.append(chip);
      });
      rowEl.append(statusRow);
      rowsWrap.append(rowEl);
    });
    list.append(rowsWrap);
    board.append(form, list, accountBackButton());
    view.replaceChildren(board);
    animateAccountBoard(board);
  }

  function loadAccountSection(kind) {
    if (isAdminRole() && kind === "campana") {
      renderAdminCampanaEditor();
      return;
    }
    if (isAdminRole() && kind === "pagos") {
      renderAdminPagosEditor();
      return;
    }
    if (isAdminRole() && kind === "licencia") {
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
          + "<span class=\"camp-desk-status\">" + escapeHtml(item.status) + "</span>"
          + "<em>Campaña activa</em>"
          + "</div>"
          + "<h2>" + escapeHtml(item.name) + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + escapeHtml(item.canal) + "</span>"
          + "<span>" + escapeHtml(item.zona) + "</span>"
          + "<span>Desde " + escapeHtml(item.inicio) + "</span>"
          + "</div>";

        const money = document.createElement("section");
        money.className = "camp-desk-block";
        money.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Presupuesto</h3><em>uso del dinero</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Restante</em><strong>" + escapeHtml(item.resta) + "</strong><span>disponible</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Presupuesto dado</em><strong>" + escapeHtml(item.presupuesto) + "</strong><span>asignado</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Gastado</em><strong>" + escapeHtml(item.gastado) + "</strong><span>" + spentPct + "% usado</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-bar\" aria-hidden=\"true\"><i style=\"width:" + spentPct + "%\"></i></div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>IVA descontado</em><strong>" + escapeHtml(item.iva) + "</strong></div>"
          + "<div><em>Para la campaña</em><strong>" + escapeHtml(item.paraCampana) + "</strong></div>"
          + "</div>";

        const traffic = document.createElement("section");
        traffic.className = "camp-desk-block";
        traffic.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Resultados</h3><em>tráfico del periodo</em></div>"
          + "<div class=\"camp-desk-traffic\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Visitas</em><strong>" + escapeHtml(item.visitas) + "</strong><span>al sitio</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Clics</em><strong>" + escapeHtml(item.clics) + "</strong><span>en anuncios</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Llamadas</em><strong>" + escapeHtml(item.llamadas) + "</strong><span>detectadas</span></article>"
          + "</div>";

        board.append(hero, money, traffic);
        view.replaceChildren(board);
        animateAccountBoard(board);
        return;
      }

      const facts = document.createElement("section");
      facts.className = "account-board-panel";
      facts.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Campaña</h2><em>" + escapeHtml(item.status) + "</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Nombre</em><strong>" + escapeHtml(item.name) + "</strong></div>"
        + "<div><em>Canal</em><strong>" + escapeHtml(item.canal) + "</strong></div>"
        + "<div><em>Zona</em><strong>" + escapeHtml(item.zona) + "</strong></div>"
        + "<div><em>Inicio</em><strong>" + escapeHtml(item.inicio) + "</strong></div>"
        + "</div>";

      const money = document.createElement("div");
      money.className = "stats";
      const remaining = card(item.resta, "Restante", "check");
      remaining.classList.add("lead");
      money.append(
        remaining,
        card(item.presupuesto, "Presupuesto dado", "form"),
        card(item.iva, "IVA descontado", "form"),
        card(item.paraCampana, "Para la campaña", "check"),
        card(item.gastado, "Gastado", "form")
      );

      const results = document.createElement("div");
      results.className = "stats";
      const visits = card(item.visitas, "Visitas", "eye");
      visits.classList.add("lead");
      results.append(
        visits,
        card(item.clics, "Clics", "chat"),
        card(item.llamadas, "Llamadas", "phone")
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
          + "<span class=\"camp-desk-status\">" + escapeHtml(item.proximo.estado || "Programado") + "</span>"
          + "<em>Próximo cobro</em>"
          + "</div>"
          + "<p class=\"camp-desk-amount\">" + escapeHtml(item.proximo.monto) + "</p>"
          + "<h2>" + escapeHtml(item.proximo.concepto || "Sin próximo pago") + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + escapeHtml(item.proximo.fecha || "—") + "</span>"
          + "<span>" + item.historial.length + " pagos en historial</span>"
          + "</div>";

        const summary = document.createElement("section");
        summary.className = "camp-desk-block";
        summary.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Resumen</h3><em>estado de pagos</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Próximo pago</em><strong>" + escapeHtml(item.proximo.monto) + "</strong><span>programado</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Fecha</em><strong>" + escapeHtml(item.proximo.fecha || "—") + "</strong><span>cobro</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Pagos hechos</em><strong>" + item.historial.length + "</strong><span>en historial</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>Concepto</em><strong>" + escapeHtml(item.proximo.concepto || "—") + "</strong></div>"
          + "<div><em>Estado</em><strong>" + escapeHtml(item.proximo.estado || "Programado") + "</strong></div>"
          + "</div>";

        const history = document.createElement("section");
        history.className = "camp-desk-block camp-desk-history";
        history.innerHTML = "<div class=\"camp-desk-block-head\"><h3>Historial</h3><em>pagos anteriores</em></div>";
        const list = document.createElement("div");
        list.className = "account-pay-list is-dark";
        if (!item.historial.length) {
          list.append(line("Aún no hay pagos en el historial.", "muted"));
        } else {
          item.historial.forEach((row) => {
            const rowEl = document.createElement("div");
            rowEl.className = "account-pay-row";
            rowEl.innerHTML = ""
              + "<div><strong>" + escapeHtml(row.concepto) + "</strong><p>" + escapeHtml(row.fecha) + "</p></div>"
              + "<div class=\"account-pay-side\"><strong>" + escapeHtml(row.monto) + "</strong>"
              + "<span class=\"account-pay-badge\">" + escapeHtml(row.estado) + "</span></div>";
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
      const nextAmount = card(item.proximo.monto, "Próximo pago", "form");
      nextAmount.classList.add("lead");
      summary.append(
        nextAmount,
        card(item.proximo.fecha, "Fecha", "check"),
        card(String(item.historial.length), "Pagos hechos", "check")
      );

      const detail = document.createElement("section");
      detail.className = "account-board-panel";
      detail.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Detalle</h2><em>próximo cobro</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Concepto</em><strong>" + escapeHtml(item.proximo.concepto) + "</strong></div>"
        + "<div><em>Monto</em><strong>" + escapeHtml(item.proximo.monto) + "</strong></div>"
        + "<div><em>Fecha</em><strong>" + escapeHtml(item.proximo.fecha) + "</strong></div>"
        + "<div><em>Estado</em><strong>" + escapeHtml(item.proximo.estado || "Programado") + "</strong></div>"
        + "</div>";

      const history = document.createElement("section");
      history.className = "account-board-panel";
      history.innerHTML = "<div class=\"account-board-head\"><h2>Historial de pagos</h2><em>pagos anteriores</em></div>";
      const list = document.createElement("div");
      list.className = "account-pay-list is-dark";
      if (!item.historial.length) {
        list.append(line("Aún no hay pagos en el historial.", "muted"));
      } else {
        item.historial.forEach((row) => {
          const rowEl = document.createElement("div");
          rowEl.className = "account-pay-row";
          rowEl.innerHTML = ""
            + "<div><strong>" + escapeHtml(row.concepto) + "</strong><p>" + escapeHtml(row.fecha) + "</p></div>"
            + "<div class=\"account-pay-side\"><strong>" + escapeHtml(row.monto) + "</strong>"
            + "<span class=\"account-pay-badge\">" + escapeHtml(row.estado) + "</span></div>";
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
          + "<span class=\"camp-desk-status\">" + escapeHtml(item.status) + "</span>"
          + "<em>Licencia</em>"
          + "</div>"
          + "<h2>" + escapeHtml(item.plan) + "</h2>"
          + "<div class=\"camp-desk-meta\">"
          + "<span>" + escapeHtml(item.cuenta) + "</span>"
          + "<span>Vigente hasta " + escapeHtml(item.fin) + "</span>"
          + "<span>Operado por <a class=\"account-board-link\" href=\"" + escapeHtml(item.proveedorUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + escapeHtml(item.proveedor) + "</a></span>"
          + "</div>";

        const plan = document.createElement("section");
        plan.className = "camp-desk-block";
        plan.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Tu plan</h3><em>costo y vigencia</em></div>"
          + "<div class=\"camp-desk-primary\">"
          + "<article class=\"camp-desk-kpi is-lead\"><em>Tu costo</em><strong>" + escapeHtml(item.precioEspecial) + "</strong><span>promoción activa</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Precio Pro</em><strong>" + escapeHtml(item.precioPro) + "</strong><span>referencia</span></article>"
          + "<article class=\"camp-desk-kpi\"><em>Vigente hasta</em><strong>" + escapeHtml(item.fin) + "</strong><span>desde " + escapeHtml(item.inicio) + "</span></article>"
          + "</div>"
          + "<div class=\"camp-desk-secondary\">"
          + "<div><em>Cuenta</em><strong>" + escapeHtml(item.cuenta) + "</strong></div>"
          + "<div><em>Modelo</em><strong>Renta de herramientas</strong></div>"
          + "</div>"
          + "<p class=\"account-board-note\" style=\"margin:0;color:#9a9a94\">" + escapeHtml(item.note) + "</p>";

        const includes = document.createElement("section");
        includes.className = "camp-desk-block";
        includes.innerHTML = ""
          + "<div class=\"camp-desk-block-head\"><h3>Incluye ahora</h3><em>activo</em></div>"
          + "<ul class=\"camp-desk-include\">"
          + item.incluye.map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("")
          + "</ul>";

        const offers = document.createElement("div");
        offers.className = "camp-desk-split";

        const upgrade = document.createElement("section");
        upgrade.className = "camp-desk-offer is-lead";
        upgrade.innerHTML = ""
          + "<h3>" + escapeHtml(item.upgrade.titulo) + "</h3>"
          + "<p>" + escapeHtml(item.upgrade.subtitulo) + "</p>"
          + "<div class=\"camp-desk-offer-prices\">"
          + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + escapeHtml(item.upgrade.monto) + "</strong><span>queda en este monto</span></div>"
          + "<div><em>Implementación</em><strong>" + escapeHtml(item.upgrade.implementacion) + "</strong><span>pago único</span></div>"
          + "</div>"
          + "<div class=\"camp-desk-offer-grid\">"
          + item.upgrade.puntos.map((entry) => (
            "<div><strong>" + escapeHtml(entry[0]) + "</strong><p>" + escapeHtml(entry[1]) + "</p></div>"
          )).join("")
          + "</div>";
        upgrade.append(accountWhatsAppButton(
          "Quiero subir de herramientas",
          "Hola, soy " + clientName + ". Quiero subir de herramientas: cotizador con IA, catálogo, WhatsApp y ofertas en mi web. Mensual a " + item.upgrade.monto + " + implementación " + item.upgrade.implementacion + "."
        ));

        const basico = document.createElement("section");
        basico.className = "camp-desk-offer";
        basico.innerHTML = ""
          + "<h3>" + escapeHtml(item.basico.titulo) + "</h3>"
          + "<p>" + escapeHtml(item.basico.nota) + "</p>"
          + "<div class=\"camp-desk-offer-prices\" style=\"grid-template-columns:1fr\">"
          + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + escapeHtml(item.basico.monto) + "</strong><span>solo herramientas</span></div>"
          + "</div>"
          + "<ul class=\"account-include-list is-dark\">"
          + item.basico.puntos.map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("")
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
          + item.condiciones.map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("")
          + "</ul>";

        board.append(hero, plan, includes, offers, terms);
        view.replaceChildren(board);
        animateAccountBoard(board);
        return;
      }

      const summary = document.createElement("div");
      summary.className = "stats";
      const statusLead = card(item.status, "Licencia vigente", "check");
      statusLead.classList.add("lead");
      summary.append(
        statusLead,
        card(item.plan, "Plan", "form"),
        card(item.precioPro, "Precio Pro", "form"),
        card(item.precioEspecial, "Tu costo", "check"),
        card(item.fin, "Vigente hasta", "check")
      );

      const facts = document.createElement("section");
      facts.className = "account-board-panel";
      facts.innerHTML = ""
        + "<div class=\"account-board-head\"><h2>Licencia</h2><em>detalle</em></div>"
        + "<div class=\"account-board-facts\">"
        + "<div><em>Cuenta</em><strong>" + escapeHtml(item.cuenta) + "</strong></div>"
        + "<div><em>Plan</em><strong>" + escapeHtml(item.plan) + "</strong></div>"
        + "<div><em>Inicio</em><strong>" + escapeHtml(item.inicio) + "</strong></div>"
        + "<div><em>Vigencia</em><strong>" + escapeHtml(item.fin) + "</strong></div>"
        + "<div><em>Operado por</em><strong><a class=\"account-board-link\" href=\"" + escapeHtml(item.proveedorUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + escapeHtml(item.proveedor) + "</a></strong></div>"
        + "<div><em>Modelo</em><strong>Renta de herramientas</strong></div>"
        + "</div>"
        + "<p class=\"account-board-note\">" + escapeHtml(item.note) + "</p>";

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
        + "<h2>" + escapeHtml(item.upgrade.titulo) + "</h2>"
        + "<p>" + escapeHtml(item.upgrade.subtitulo) + "</p>"
        + "</div>"
        + "<div class=\"account-upgrade-prices\">"
        + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + escapeHtml(item.upgrade.monto) + "</strong><span>queda en este monto</span></div>"
        + "<div><em>Implementación</em><strong>" + escapeHtml(item.upgrade.implementacion) + "</strong><span>pago único</span></div>"
        + "</div>"
        + "<div class=\"account-upgrade-grid\">"
        + item.upgrade.puntos.map((entry) => (
          "<div><strong>" + escapeHtml(entry[0]) + "</strong><p>" + escapeHtml(entry[1]) + "</p></div>"
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
        + "<h2>" + escapeHtml(item.basico.titulo) + "</h2>"
        + "<p>" + escapeHtml(item.basico.nota) + "</p>"
        + "</div>"
        + "<div class=\"account-upgrade-prices\">"
        + "<div class=\"is-main\"><em>Pago mensual</em><strong>" + escapeHtml(item.basico.monto) + "</strong><span>solo herramientas</span></div>"
        + "</div>"
        + "<ul class=\"account-include-list is-dark\">"
        + item.basico.puntos.map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("")
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

    view.replaceChildren(line("No hay detalle para esta sección.", "muted"), accountBackButton());
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

  function loadComparativa() {
    return Promise.all([
      api("/api/stats/resumen.php"),
      api("/api/stats/clics.php"),
    ]).then(([data, clicksData]) => {
      const dates = rangeDates();
      const contacts = readContacts().filter((item) => {
        if (item.rol === "cliente") return false;
        return item.fecha >= dates.desde && item.fecha <= dates.hasta;
      });
      const clicks = Array.isArray(clicksData.clics) ? clicksData.clics : [];
      const whatsappStats = clickStats(clicks, "whatsapp");
      const callStats = clickStats(clicks, "llamada");
      const wrap = document.createElement("div");
      wrap.className = "compare-board";

      const grid = document.createElement("div");
      grid.className = "compare-grid";
      grid.append(
        compareCard("WhatsApp", whatsappStats, false, () => openClickHistory("whatsapp", clicks)),
        compareCard("Llamadas", callStats, true, () => openClickHistory("llamada", clicks))
      );
      wrap.append(grid);

      const note = document.createElement("p");
      note.className = "compare-note";
      note.textContent = "Prospectos de este periodo. Solo se pasan a cliente cuando ya cerraron trato.";
      wrap.append(note);

      if (!contacts.length) {
        const empty = document.createElement("article");
        empty.className = "compare-empty";
        empty.innerHTML = "<h2>Sin prospectos en este periodo</h2><p>Registra un contacto real con el botón + o al marcar un clic.</p>";
        wrap.append(empty);
      } else {
        wrap.append(renderContactList(contacts, "contactos"));
      }

      if (isOwnerRole()) {
        const fab = document.createElement("button");
        fab.type = "button";
        fab.className = "contact-fab";
        fab.setAttribute("aria-label", "Registrar contacto");
        fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>Registrar</span>';
        fab.addEventListener("click", () => openContactModal(dates.hasta));
        wrap.append(fab);
      }

      view.replaceChildren(wrap);
    });
  }

  function loadContactos() {
    location.hash = "#comparativa";
    return Promise.resolve();
  }

  function loadClientes() {
    const clients = readContacts().filter((item) => item.rol === "cliente");
    const wrap = document.createElement("div");
    wrap.className = "compare-board";
    if (!clients.length) {
      const empty = document.createElement("article");
      empty.className = "compare-empty";
      empty.innerHTML = "<h2>Sin clientes todavía</h2><p>Cuando un prospecto pase a cliente, aparece aquí y en la barra de abajo.</p>";
      wrap.append(empty);
    } else {
      wrap.append(renderContactList(clients, "clientes"));
    }
    view.replaceChildren(wrap);
    return Promise.resolve();
  }

  function contactInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function contactAvatarTone(name) {
    const text = String(name || "");
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) hash = (hash + text.charCodeAt(i) * (i + 1)) % 4;
    return String(hash + 1);
  }

  function hasClients() {
    return readContacts().some((item) => item.rol === "cliente");
  }

  function updateClientsNav() {
    const tab = document.querySelector('.tabs button[data-vista="clientes"]');
    if (!tab) return;
    tab.hidden = false;
  }

  function isDemoCrmItem(item) {
    const id = String((item && item.id) || "");
    const contactId = String((item && item.contactId) || "");
    return id.indexOf("c-demo-") === 0 || id.indexOf("q-demo-") === 0 || contactId.indexOf("c-demo-") === 0;
  }

  function openContactModal(defaultDate, preset) {
    const existing = document.getElementById("contact-modal");
    if (existing) existing.remove();
    const prefs = preset && typeof preset === "object" ? preset : {};

    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.id = "contact-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Registrar contacto real");

    const sheet = document.createElement("div");
    sheet.className = "contact-sheet";
    const handle = document.createElement("span");
    handle.className = "contact-sheet-handle";
    handle.setAttribute("aria-hidden", "true");

    const top = document.createElement("div");
    top.className = "contact-sheet-top";
    const heading = document.createElement("h2");
    heading.textContent = "Contacto real";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const canal = prefs.canal === "llamada" ? "llamada" : "whatsapp";
    const form = document.createElement("form");
    form.className = "contact-form";
    form.innerHTML = ""
      + "<label class=\"full\">Canal"
      + "<input type=\"hidden\" name=\"canal\" value=\"" + canal + "\">"
      + "<div class=\"contact-status-row form-choice\" data-field=\"canal\">"
      + "<button type=\"button\" data-value=\"whatsapp\" aria-pressed=\"" + (canal === "whatsapp" ? "true" : "false") + "\">WhatsApp</button>"
      + "<button type=\"button\" data-value=\"llamada\" aria-pressed=\"" + (canal === "llamada" ? "true" : "false") + "\">Llamada</button>"
      + "</div></label>"
      + "<label>Fecha<input name=\"fecha\" type=\"date\" required></label>"
      + "<label>Nombre<input name=\"nombre\" maxlength=\"80\" required placeholder=\"Nombre o cómo lo identificas\"></label>"
      + "<label>Servicio<select name=\"servicio\"><option>Canceles</option><option>Ventanas</option><option>Barandales</option><option>Fachadas</option><option>Puertas</option><option>Pérgolas</option><option>Otro</option></select></label>"
      + "<label>Teléfono<input name=\"telefono\" maxlength=\"40\" placeholder=\"Opcional\"></label>"
      + "<label class=\"full\">Estatus"
      + "<input type=\"hidden\" name=\"estatus\" value=\"Nuevo\">"
      + "<div class=\"contact-status-row form-choice\" data-field=\"estatus\">"
      + "<button type=\"button\" data-value=\"Nuevo\" data-status=\"nuevo\" aria-pressed=\"true\">Nuevo</button>"
      + "<button type=\"button\" data-value=\"En proceso\" data-status=\"en-proceso\" aria-pressed=\"false\">En proceso</button>"
      + "<button type=\"button\" data-value=\"Ya no respondió\" data-status=\"ya-no-respondio\" aria-pressed=\"false\">Ya no respondió</button>"
      + "<button type=\"button\" data-value=\"Cerrado\" data-status=\"cerrado\" aria-pressed=\"false\">Cerrado</button>"
      + "<button type=\"button\" data-value=\"Perdido\" data-status=\"perdido\" aria-pressed=\"false\">Perdido</button>"
      + "</div></label>"
      + "<label class=\"full\">Nota<textarea name=\"nota\" maxlength=\"240\" placeholder=\"Qué pidió o cómo dar seguimiento\"></textarea></label>"
      + "<button type=\"submit\">Guardar contacto</button>";
    form.fecha.value = defaultDate || rangeDates().hasta;
    if (prefs.servicio) {
      const serviceSelect = form.querySelector("[name='servicio']");
      if (serviceSelect) {
        const match = [...serviceSelect.options].find((option) => option.value === prefs.servicio);
        if (match) serviceSelect.value = prefs.servicio;
      }
    }
    form.querySelectorAll(".form-choice").forEach((group) => {
      group.addEventListener("click", (event) => {
        const option = event.target.closest("button[data-value]");
        if (!option || !group.contains(option)) return;
        const field = group.dataset.field;
        const hidden = form.querySelector("[name='" + field + "']");
        group.querySelectorAll("button[data-value]").forEach((button) => {
          button.setAttribute("aria-pressed", button === option ? "true" : "false");
        });
        if (hidden) hidden.value = option.dataset.value || "";
      });
    });

    const isDeskModal = !window.matchMedia("(max-width: 760px)").matches;

    function closeModal() {
      if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.to(sheet, {
          y: isDeskModal ? 12 : 40,
          scale: isDeskModal ? 0.98 : 1,
          autoAlpha: 0,
          duration: 0.18,
          ease: "power2.in",
          onComplete: function () { modal.remove(); },
        });
        window.gsap.to(modal, { autoAlpha: 0, duration: 0.18, ease: "power2.in" });
        return;
      }
      modal.remove();
    }

    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = new FormData(form);
      const all = readContacts();
      all.unshift({
        id: "c" + Date.now().toString(16),
        canal: String(payload.get("canal") || "whatsapp"),
        fecha: String(payload.get("fecha") || defaultDate),
        nombre: String(payload.get("nombre") || "").trim(),
        servicio: String(payload.get("servicio") || "Otro"),
        estatus: String(payload.get("estatus") || "Nuevo"),
        telefono: String(payload.get("telefono") || "").trim(),
        nota: String(payload.get("nota") || "").trim(),
        rol: "prospecto",
        historial: [{
          id: "h" + Date.now().toString(16),
          fecha: String(payload.get("fecha") || defaultDate),
          hora: "",
          texto: "Se registró el prospecto.",
          tipo: "nota",
        }],
      });
      saveContacts(all);
      modal.remove();
      updateClientsNav();
      if (location.hash !== "#comparativa") location.hash = "#comparativa";
      else show();
    });

    sheet.append(handle, top, form);
    modal.append(sheet);
    document.body.append(modal);

    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "power2.out" });
      if (isDeskModal) {
        window.gsap.fromTo(sheet, { y: 18, scale: 0.97, autoAlpha: 0.85 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.28, ease: "power3.out" });
      } else {
        window.gsap.fromTo(sheet, { y: 56, autoAlpha: 0.8 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" });
      }
    }

    const nameInput = form.querySelector("[name='nombre']");
    if (nameInput) nameInput.focus();
  }

  function compareCard(title, stats, lead, onHistory) {
    const detected = Number(stats.detected) || 0;
    const real = Number(stats.reales) || 0;
    const pending = Number(stats.sinValidar) || 0;
    const ratio = detected > 0 ? Math.min(100, Math.round((real / detected) * 100)) : 0;
    const card = document.createElement("article");
    card.className = lead ? "compare-card lead" : "compare-card";

    const top = document.createElement("div");
    top.className = "compare-card-top";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const kicker = document.createElement("span");
    kicker.className = "compare-kicker";
    kicker.textContent = ratio + "% real";
    top.append(heading, kicker);

    const hero = document.createElement("div");
    hero.className = "compare-hero";
    const value = document.createElement("b");
    value.textContent = String(real);
    const label = document.createElement("span");
    label.textContent = "reales";
    hero.append(value, label);

    const meta = document.createElement("div");
    meta.className = "compare-meta";
    meta.innerHTML = "<span><strong>" + detected + "</strong>detectados</span>"
      + "<span><strong>" + pending + "</strong>sin validar</span>";

    const bar = document.createElement("div");
    bar.className = "compare-bar";
    const fill = document.createElement("i");
    fill.style.width = ratio + "%";
    bar.append(fill);

    const history = document.createElement("button");
    history.type = "button";
    history.className = "compare-history-btn";
    history.textContent = "Ver historial";
    history.addEventListener("click", onHistory);

    card.append(top, hero, meta, bar, history);
    return card;
  }

  function clickStats(clicks, canal) {
    const marks = readClickMarks();
    const list = clicks.filter((item) => item.canal === canal);
    let reales = 0;
    let validados = 0;
    list.forEach((item) => {
      const mark = marks[String(item.id)] || "";
      if (!mark) return;
      validados += 1;
      if (mark === "contacto_real" || mark === "respondida") reales += 1;
    });
    return {
      detected: list.length,
      reales,
      sinValidar: Math.max(0, list.length - validados),
    };
  }

  function openClickHistory(canal, allClicks) {
    const existing = document.getElementById("click-history-modal");
    if (existing) existing.remove();
    const marks = readClickMarks();
    const list = allClicks.filter((item) => item.canal === canal);
    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.id = "click-history-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Historial de clics");

    const sheet = document.createElement("div");
    sheet.className = "contact-sheet";
    const handle = document.createElement("span");
    handle.className = "contact-sheet-handle";
    handle.setAttribute("aria-hidden", "true");
    const top = document.createElement("div");
    top.className = "contact-sheet-top";
    const heading = document.createElement("h2");
    heading.textContent = canal === "llamada" ? "Historial de llamadas" : "Historial de WhatsApp";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const body = document.createElement("div");
    body.className = "click-history-list";
    if (!list.length) {
      body.append(line("No hay clics detectados en este periodo.", "muted"));
    } else {
      list.forEach((item) => {
        const row = document.createElement("article");
        row.className = "click-history-item";
        const head = document.createElement("div");
        head.className = "click-history-top";
        const when = document.createElement("strong");
        when.textContent = formatClickWhen(item);
        const page = document.createElement("span");
        page.textContent = item.pagina_etiqueta || pageName(item.pagina) || "Página";
        head.append(when, page);

        const current = marks[String(item.id)] || "";
        if (current) {
          const markLabel = document.createElement("em");
          markLabel.className = "click-history-mark";
          markLabel.textContent = clickMarkLabel(current);
          row.append(head, markLabel);
        } else {
          row.append(head);
        }

        if (isOwnerRole()) {
          const actions = document.createElement("div");
          actions.className = "click-history-actions";
          const options = canal === "llamada"
            ? [
              ["respondida", "Respondida"],
              ["perdida", "Perdida"],
              ["no_contestaron", "No me llamaron"],
            ]
            : [
              ["contacto_real", "Sí contactó"],
              ["sin_contacto", "No pasó"],
            ];
          options.forEach(([value, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.setAttribute("aria-pressed", current === value ? "true" : "false");
            button.addEventListener("click", () => {
              const next = readClickMarks();
              if (next[String(item.id)] === value) delete next[String(item.id)];
              else next[String(item.id)] = value;
              sessionStorage.setItem("avi_clic_marcas", JSON.stringify(next));
              if (value === "contacto_real" && next[String(item.id)] === value) {
                modal.remove();
                openContactModal(item.fecha || rangeDates().hasta, {
                  canal: "whatsapp",
                  servicio: item.pagina_etiqueta || "Otro",
                });
                return;
              }
              openClickHistory(canal, allClicks);
            });
            actions.append(button);
          });
          row.append(actions);
        } else if (!current) {
          const observe = document.createElement("em");
          observe.className = "click-history-mark";
          observe.textContent = "Solo observación";
          row.append(observe);
        }
        body.append(row);
      });
    }

    function closeModal() {
      modal.remove();
      show();
    }
    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    sheet.append(handle, top, body);
    modal.append(sheet);
    document.body.append(modal);
    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "power2.out" });
      window.gsap.fromTo(sheet, { y: 56, autoAlpha: 0.8 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" });
    }
  }

  function formatClickWhen(item) {
    const hour = String(item.hora || "").slice(0, 5);
    const date = String(item.fecha || "");
    if (hour && date) return hour + " · " + date;
    return hour || date || "Sin hora";
  }

  function clickMarkLabel(value) {
    return {
      contacto_real: "Sí contactó",
      sin_contacto: "No pasó",
      respondida: "Respondida",
      perdida: "Perdida",
      no_contestaron: "No me llamaron",
    }[value] || value;
  }

  function readClickMarks() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("avi_clic_marcas") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function readContacts() {
    const source = Array.isArray(contactsCache)
      ? contactsCache
      : (function () {
        try {
          const parsed = JSON.parse(sessionStorage.getItem("avi_contactos_reales") || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }());
    return source
      .filter((item) => item && typeof item === "object" && item.nombre && item.fecha && item.canal && !isDemoCrmItem(item))
      .map((item) => Object.assign({}, item, {
        estatus: item.estatus || "Nuevo",
        rol: item.rol === "cliente" ? "cliente" : "prospecto",
        historial: Array.isArray(item.historial) ? item.historial : [],
      }));
  }

  function saveContacts(list) {
    contactsCache = list.slice(0, 200);
    sessionStorage.setItem("avi_contactos_reales", JSON.stringify(contactsCache));
    fetch("/api/crm.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: csrfToken(), contacts: contactsCache, quotes: readQuotes() }),
    }).catch(function () {});
  }

  function contactStatusKey(value) {
    return String(value || "Nuevo")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function contactRoleLabel(rol) {
    return { contacto: "Contacto", prospecto: "Prospecto", cliente: "Cliente" }[rol] || "Contacto";
  }

  function readQuotes() {
    const source = Array.isArray(quotesCache)
      ? quotesCache.slice()
      : (function () {
        try {
          const parsed = JSON.parse(sessionStorage.getItem("avi_cotizaciones") || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }());
    return source.filter((item) => item && !isDemoCrmItem(item));
  }

  function saveQuotes(list) {
    quotesCache = list.slice(0, 300);
    sessionStorage.setItem("avi_cotizaciones", JSON.stringify(quotesCache));
    fetch("/api/crm.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: csrfToken(), contacts: readContacts(), quotes: quotesCache }),
    }).catch(function () {});
  }

  function quotesForContact(contactId) {
    return readQuotes()
      .filter((item) => item && item.contactId === contactId)
      .sort((a, b) => String(b.creado || "").localeCompare(String(a.creado || "")));
  }

  function pushContactHistory(contactId, texto, tipo) {
    const next = readContacts().map((row) => {
      if (row.id !== contactId) return row;
      const historial = Array.isArray(row.historial) ? row.historial.slice() : [];
      historial.unshift({
        id: "h" + Date.now().toString(16),
        fecha: iso(new Date()),
        hora: String(new Date().getHours()).padStart(2, "0") + ":" + String(new Date().getMinutes()).padStart(2, "0"),
        texto,
        tipo: tipo || "nota",
      });
      return Object.assign({}, row, { historial: historial.slice(0, 80) });
    });
    saveContacts(next);
  }

  function renderContactList(contacts, mode) {
    const canEditCrm = isOwnerRole();
    const list = document.createElement("div");
    list.className = mode === "clientes" ? "contact-list is-clients" : "contact-list";
    const statuses = ["Nuevo", "En proceso", "Ya no respondió", "Cerrado", "Perdido"];
    const isClients = mode === "clientes";
    contacts.forEach((item) => {
      const card = document.createElement("article");
      card.className = isClients ? "contact-item client-card" : "contact-item";

      const head = document.createElement("div");
      head.className = "contact-item-top";

      const avatar = document.createElement("span");
      avatar.className = "contact-avatar";
      avatar.dataset.tone = contactAvatarTone(item.nombre);
      avatar.textContent = contactInitials(item.nombre);
      avatar.setAttribute("aria-hidden", "true");

      const main = document.createElement("div");
      main.className = "contact-item-main";
      const name = document.createElement("strong");
      name.textContent = item.nombre;
      const meta = document.createElement("div");
      meta.className = "contact-item-meta";
      [
        item.canal === "llamada" ? "Llamada" : "WhatsApp",
        item.servicio,
        item.fecha,
      ].filter(Boolean).forEach((label) => {
        const chip = document.createElement("span");
        chip.textContent = label;
        meta.append(chip);
      });
      main.append(name, meta);
      if (item.telefono) {
        const phone = document.createElement("div");
        phone.className = "contact-item-line";
        phone.textContent = item.telefono;
        main.append(phone);
      }

      const side = document.createElement("div");
      side.className = "contact-item-side";
      const badge = document.createElement("span");
      badge.className = "contact-status";
      badge.dataset.status = contactStatusKey(item.estatus);
      badge.textContent = item.estatus || "Nuevo";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "contact-remove";
      remove.setAttribute("aria-label", "Quitar");
      remove.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      remove.addEventListener("click", () => {
        saveContacts(readContacts().filter((row) => row.id !== item.id));
        updateClientsNav();
        show();
      });
      if (canEditCrm) side.append(badge, remove);
      else side.append(badge);
      head.append(avatar, main, side);
      card.append(head);

      if (item.nota) {
        const noteLine = document.createElement("p");
        noteLine.className = "contact-item-note";
        noteLine.textContent = item.nota;
        card.append(noteLine);
      }

      if (!isClients && canEditCrm) {
        const statusRow = document.createElement("div");
        statusRow.className = "contact-status-row";
        statusRow.setAttribute("role", "group");
        statusRow.setAttribute("aria-label", "Estatus");
        statuses.forEach((option) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.textContent = option;
          chip.dataset.status = contactStatusKey(option);
          chip.setAttribute("aria-pressed", (item.estatus || "Nuevo") === option ? "true" : "false");
          chip.addEventListener("click", () => {
            if ((item.estatus || "Nuevo") === option) return;
            const next = readContacts().map((row) => {
              if (row.id !== item.id) return row;
              return Object.assign({}, row, { estatus: option });
            });
            saveContacts(next);
            pushContactHistory(item.id, "Estatus: " + option + ".", "estatus");
            show();
          });
          statusRow.append(chip);
        });
        card.append(statusRow);

        const promote = document.createElement("button");
        promote.type = "button";
        promote.className = "contact-open-btn";
        promote.textContent = "Pasar a cliente";
        promote.addEventListener("click", () => {
          const next = readContacts().map((row) => {
            if (row.id !== item.id) return row;
            return Object.assign({}, row, { rol: "cliente" });
          });
          saveContacts(next);
          pushContactHistory(item.id, "Pasó a cliente.", "rol");
          updateClientsNav();
          location.hash = "#clientes";
        });
        card.append(promote);
      } else {
        const actions = document.createElement("div");
        actions.className = "contact-actions";
        const historyBtn = document.createElement("button");
        historyBtn.type = "button";
        historyBtn.className = "contact-action is-soft";
        historyBtn.textContent = "Historial";
        historyBtn.addEventListener("click", () => openClientSheet(item.id, "historial"));
        const quoteBtn = document.createElement("button");
        quoteBtn.type = "button";
        quoteBtn.className = "contact-action is-primary";
        quoteBtn.textContent = canEditCrm ? "Cotización" : "Ver flujo";
        quoteBtn.addEventListener("click", () => openClientSheet(item.id, "cotizacion"));
        actions.append(historyBtn, quoteBtn);
        card.append(actions);
      }

      list.append(card);
    });
    return list;
  }

  function whatsappHref(phone, text) {
    const digits = String(phone || "").replace(/\D+/g, "");
    const full = digits ? (digits.length === 10 ? "52" + digits : digits) : "";
    const base = full ? ("https://wa.me/" + full) : "https://wa.me/";
    const message = String(text || "").trim();
    return message ? (base + "?text=" + encodeURIComponent(message)) : (full ? base : "");
  }

  function quoteShareText(contact, quote) {
    return [
      "Hola" + (contact.nombre ? (" " + contact.nombre) : "") + ",",
      "Te comparto la cotización:",
      "",
      "• Servicio: " + (quote.servicio || ""),
      "• Tipo: " + (quote.tipo || ""),
      quote.ubicacion ? ("• Ubicación: " + quote.ubicacion) : "",
      "• Precio: " + (formatPriceMxn(quote.precio) || "$0 MXN"),
      quote.anticipo ? ("• Anticipo: " + formatPriceMxn(quote.anticipo)) : "",
      quote.descripcion ? ("• Medidas / trabajo: " + quote.descripcion) : "",
      quote.estado ? ("• Estado: " + quote.estado) : "",
    ].filter(Boolean).join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function quotePdfFileName(contact, quote) {
    const name = String(contact.nombre || "cliente").trim().replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]+/g, "").replace(/\s+/g, "-") || "cliente";
    const day = quote.actualizado || quote.creado || iso(new Date());
    return "cotizacion-" + name + "-" + day + ".pdf";
  }

  const businessInfo = {
    name: "Aluminios y Vidrios Instala",
    phoneDisplay: "729 381 3723",
    phoneDigits: "527293813723",
    hours: "Lunes a sábado 8:00–18:00",
    hoursNote: "Domingo cerrado",
    coverage: "Toluca, Metepec y alrededores",
    address: "Lago Winnipeg 101, El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.",
    logoUrl: "/img/logo.webp",
  };

  function pdfSafeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/€/g, "EUR");
  }

  function quoteFolio(quote) {
    const raw = String(quote.id || "q000").replace(/\W/g, "").toUpperCase();
    return "CT-" + raw.slice(-6);
  }

  function loadImageDataUrl(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "sync";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#161614";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("logo"));
      img.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=1";
    });
  }

  function buildQuoteDocumentHtml(contact, quote) {
    const created = quote.creado || iso(new Date());
    const price = formatPriceMxn(quote.precio) || "$0 MXN";
    const anticipo = quote.anticipo ? formatPriceMxn(quote.anticipo) : "";
    const medidas = String(quote.descripcion || "").trim();
    const terms = [
      ["Validez", "Esta cotización tiene vigencia de 15 días."],
      ["Medidas", "El precio final se confirma tras visita y medidas reales."],
      ["Anticipo", "El anticipo reserva materiales e instalación."],
      ["Garantía", "La garantía aplica sobre instalación y materiales acordados."],
    ];
    const jobMeta = [quote.tipo, quote.cuando].filter(Boolean).join(" · ");
    return ""
      + "<aside class=\"quote-sheet-side\">"
      + "<div class=\"quote-sheet-brand\">"
      + "<img class=\"quote-sheet-logo-img\" src=\"" + escapeHtml(businessInfo.logoUrl) + "\" alt=\"Aluminios y Vidrios Instala\" width=\"140\" height=\"140\">"
      + "</div>"
      + "<div class=\"quote-sheet-side-block\"><em>Cliente</em><strong>" + escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + escapeHtml(contact.telefono || "Sin teléfono") + "</p>"
      + "<p>" + escapeHtml(contact.canal === "llamada" ? "Llamada" : "WhatsApp") + "</p></div>"
      + "<div class=\"quote-sheet-side-block\"><em>Contacto Instala</em>"
      + "<strong>" + escapeHtml(businessInfo.phoneDisplay) + "</strong>"
      + "<p>" + escapeHtml(businessInfo.hours) + "</p>"
      + "<p>" + escapeHtml(businessInfo.hoursNote) + "</p>"
      + "<p>" + escapeHtml(businessInfo.coverage) + "</p></div>"
      + "<div class=\"quote-sheet-terms\"><em>Términos</em>"
      + terms.map((item) => (
        "<div class=\"quote-term\"><span></span><div><strong>" + escapeHtml(item[0]) + "</strong><p>" + escapeHtml(item[1]) + "</p></div></div>"
      )).join("")
      + "</div></aside>"
      + "<section class=\"quote-sheet-main\">"
      + "<div class=\"quote-sheet-head\"><div><p class=\"quote-sheet-kicker\">Aluminios y Vidrios Instala</p><h1>COTIZACIÓN</h1></div>"
      + "<div class=\"quote-sheet-meta\"><span>No. " + escapeHtml(quoteFolio(quote)) + "</span><span>" + escapeHtml(created) + "</span>"
      + (quote.estado ? ("<span class=\"quote-sheet-status\">" + escapeHtml(quote.estado) + "</span>") : "")
      + "</div></div>"
      + "<div class=\"quote-sheet-to\"><em>Cotizar a</em><strong>" + escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + escapeHtml([contact.telefono, quote.ubicacion].filter(Boolean).join(" · ") || "Sin datos de contacto") + "</p></div>"
      + "<table class=\"quote-sheet-table\"><thead><tr>"
      + "<th>Concepto</th><th>Importe</th></tr></thead><tbody>"
      + "<tr><td><strong class=\"quote-line-title\">" + escapeHtml(quote.servicio || "Servicio") + "</strong>"
      + (jobMeta ? ("<span class=\"quote-line-meta\">" + escapeHtml(jobMeta) + "</span>") : "")
      + "<span class=\"quote-line-detail\"><em>Medidas / trabajo</em>" + escapeHtml(medidas || "Sin medidas capturadas") + "</span></td>"
      + "<td>" + escapeHtml(price) + "</td></tr>"
      + (anticipo ? ("<tr class=\"is-alt\"><td><strong class=\"quote-line-title\">Anticipo / abono</strong><span class=\"quote-line-detail\"><em>Registro</em>Anticipo recibido</span></td><td>" + escapeHtml(anticipo) + "</td></tr>") : "")
      + "</tbody></table>"
      + (quote.nota ? ("<div class=\"quote-sheet-note\"><em>Nota</em><p>" + escapeHtml(quote.nota) + "</p></div>") : "")
      + "<div class=\"quote-sheet-sum\"><div><span>Subtotal</span><strong>" + escapeHtml(price) + "</strong></div>"
      + "<div class=\"is-total\"><span>TOTAL</span><strong>" + escapeHtml(price) + "</strong></div></div>"
      + "<div class=\"quote-sheet-foot\">"
      + "<div><p>" + escapeHtml(businessInfo.address) + "</p><p>" + escapeHtml(businessInfo.phoneDisplay) + " · " + escapeHtml(businessInfo.hours) + "</p></div>"
      + "<strong>Atención a cliente</strong></div>"
      + "</section>";
  }

  function generateQuotePdf(contact, quote) {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) return Promise.reject(new Error("pdf"));
    return loadImageDataUrl(businessInfo.logoUrl).catch(() => "").then((logoData) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const side = 58;
      const ink = [22, 22, 20];
      const lime = [232, 255, 70];
      const mute = [110, 110, 104];
      const line = [228, 228, 222];
      const soft = [246, 245, 239];
      const t = (value) => pdfSafeText(value);
      const price = t(formatPriceMxn(quote.precio) || "$0 MXN");
      const created = t(quote.creado || iso(new Date()));
      const medidas = t(String(quote.descripcion || "").trim() || "Sin medidas capturadas");

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");
      doc.setFillColor(ink[0], ink[1], ink[2]);
      doc.rect(0, 0, side, pageH, "F");
      doc.setFillColor(lime[0], lime[1], lime[2]);
      doc.rect(side, 0, 2.2, pageH, "F");

      if (logoData) {
        doc.addImage(logoData, "PNG", 9, 12, 40, 40);
      } else {
        doc.setTextColor(lime[0], lime[1], lime[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("INSTALA", 12, 28);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("CLIENTE", 12, 66);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      const nameLines = doc.splitTextToSize(t(contact.nombre || "Cliente"), side - 20);
      doc.text(nameLines, 12, 74);
      let sideY = 74 + nameLines.length * 5 + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(190, 190, 180);
      doc.text(t(contact.telefono || "Sin telefono"), 12, sideY);
      sideY += 5;
      doc.text(t(contact.canal === "llamada" ? "Llamada" : "WhatsApp"), 12, sideY);

      sideY += 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("CONTACTO INSTALA", 12, sideY);
      sideY += 7;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(t(businessInfo.phoneDisplay), 12, sideY);
      sideY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(190, 190, 180);
      doc.text(t(businessInfo.hours), 12, sideY);
      sideY += 4.5;
      doc.text(t(businessInfo.hoursNote), 12, sideY);
      sideY += 4.5;
      const coverage = doc.splitTextToSize(t(businessInfo.coverage), side - 20);
      doc.text(coverage, 12, sideY);

      const terms = [
        ["Validez", "Vigencia de 15 dias."],
        ["Medidas", "Precio final tras visita."],
        ["Anticipo", "Reserva materiales."],
        ["Garantia", "Segun instalacion acordada."],
      ];
      let termY = 200;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("TERMINOS", 12, termY);
      termY += 8;
      terms.forEach((item) => {
        doc.setFillColor(lime[0], lime[1], lime[2]);
        doc.circle(14, termY - 1.2, 1.4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(item[0], 18, termY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(190, 190, 180);
        doc.text(item[1], 18, termY + 4);
        termY += 11;
      });

      const left = side + 12;
      const right = pageW - 14;
      const contentW = right - left;

      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("ALUMINIOS Y VIDRIOS INSTALA", left, 18);
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFontSize(26);
      doc.text("COTIZACION", left, 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text("No. " + t(quoteFolio(quote)), right, 18, { align: "right" });
      doc.text(created, right, 24, { align: "right" });
      if (quote.estado) {
        const estado = t(quote.estado);
        const badgeW = doc.getTextWidth(estado) + 8;
        doc.setFillColor(ink[0], ink[1], ink[2]);
        doc.roundedRect(right - badgeW, 28, badgeW, 7, 1.5, 1.5, "F");
        doc.setTextColor(lime[0], lime[1], lime[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(estado, right - badgeW + 4, 32.8);
      }

      doc.setDrawColor(line[0], line[1], line[2]);
      doc.setLineWidth(0.3);
      doc.line(left, 40, right, 40);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text("COTIZAR A", left, 50);
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFontSize(13);
      doc.text(t(contact.nombre || "Cliente"), left, 57);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text(t([contact.telefono, quote.ubicacion].filter(Boolean).join("  |  ") || "Sin datos de contacto"), left, 63);

      let rowY = 72;
      const jobMeta = t([quote.tipo, quote.cuando].filter(Boolean).join(" · "));

      doc.setFillColor(ink[0], ink[1], ink[2]);
      doc.rect(left, rowY, contentW, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("CONCEPTO", left + 3, rowY + 6.5);
      doc.text("IMPORTE", right - 3, rowY + 6.5, { align: "right" });
      rowY += 16;

      const serviceTitle = t(quote.servicio || "Servicio");
      const titleLines = doc.splitTextToSize(serviceTitle, contentW - 50);
      const detailLines = doc.splitTextToSize(medidas, contentW - 50);
      const metaH = jobMeta ? 5 : 0;
      const blockH = Math.max(22, 8 + titleLines.length * 4.2 + metaH + 5 + detailLines.length * 3.8);

      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(titleLines, left + 3, rowY);
      doc.text(price, right - 3, rowY, { align: "right" });
      let detailY = rowY + titleLines.length * 4.2;
      if (jobMeta) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(mute[0], mute[1], mute[2]);
        doc.text(jobMeta, left + 3, detailY + 4);
        detailY += 5;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text("MEDIDAS / TRABAJO", left + 3, detailY + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 66);
      doc.text(detailLines, left + 3, detailY + 9);
      rowY += blockH;

      if (quote.anticipo) {
        doc.setFillColor(soft[0], soft[1], soft[2]);
        doc.rect(left, rowY - 5, contentW, 14, "F");
        doc.setTextColor(ink[0], ink[1], ink[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Anticipo / abono", left + 3, rowY + 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(mute[0], mute[1], mute[2]);
        doc.text("Anticipo recibido", left + 3, rowY + 7);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(ink[0], ink[1], ink[2]);
        doc.text(t(formatPriceMxn(quote.anticipo)), right - 3, rowY + 3, { align: "right" });
        rowY += 16;
      }

      if (quote.nota) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(mute[0], mute[1], mute[2]);
        doc.text("NOTA", left, rowY + 2);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(ink[0], ink[1], ink[2]);
        const noteLines = doc.splitTextToSize(t(quote.nota), contentW);
        doc.text(noteLines, left, rowY + 8);
        rowY += 8 + noteLines.length * 4 + 4;
      }

      doc.setDrawColor(line[0], line[1], line[2]);
      doc.line(left, rowY, right, rowY);
      rowY += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text("Subtotal", right - 45, rowY);
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFont("helvetica", "bold");
      doc.text(price, right, rowY, { align: "right" });
      rowY += 8;
      doc.setFillColor(ink[0], ink[1], ink[2]);
      doc.rect(right - 72, rowY - 7, 72, 14, "F");
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.setFontSize(11);
      doc.text("TOTAL", right - 68, rowY + 2);
      doc.setFontSize(12);
      doc.text(price, right - 3, rowY + 2, { align: "right" });

      doc.setDrawColor(line[0], line[1], line[2]);
      doc.line(left, pageH - 32, right, pageH - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      const address = doc.splitTextToSize(t(businessInfo.address), 110);
      doc.text(address, left, pageH - 24);
      doc.text(t(businessInfo.phoneDisplay + "  |  " + businessInfo.hours), left, pageH - 24 + address.length * 3.6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.text("Atencion a cliente", right, pageH - 18, { align: "right" });

      doc.save(quotePdfFileName(contact, quote));
    });
  }

  function openQuoteViewer(contact, quote) {
    const existing = document.getElementById("quote-viewer-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.className = "quote-viewer-modal";
    modal.id = "quote-viewer-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Vista de cotización PDF");

    const stage = document.createElement("div");
    stage.className = "quote-viewer-stage";

    const top = document.createElement("div");
    top.className = "quote-viewer-top";
    const heading = document.createElement("h2");
    heading.textContent = "Hoja de cotización";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const scroll = document.createElement("div");
    scroll.className = "quote-viewer-scroll";
    const frame = document.createElement("div");
    frame.className = "quote-sheet-frame";
    const paper = document.createElement("div");
    paper.className = "quote-doc quote-sheet";
    paper.innerHTML = buildQuoteDocumentHtml(contact, quote);
    frame.append(paper);
    scroll.append(frame);

    const actions = document.createElement("div");
    actions.className = "quote-viewer-actions is-single";
    const download = document.createElement("button");
    download.type = "button";
    download.className = "client-pdf-btn";
    download.textContent = "Descargar PDF";
    actions.append(download);

    const shine = document.createElement("span");
    shine.className = "quote-sheet-shine";
    shine.setAttribute("aria-hidden", "true");
    paper.append(shine);

    stage.append(top, scroll, actions);
    modal.append(stage);
    document.body.append(modal);

    function fitQuotePaper() {
      const naturalW = 640;
      const naturalH = Math.max(paper.scrollHeight, 900);
      const avail = Math.max(220, scroll.clientWidth - 8);
      const scale = Math.min(1, avail / naturalW);
      paper.style.width = naturalW + "px";
      paper.style.transform = "scale(" + scale + ")";
      paper.style.transformOrigin = "top center";
      frame.style.width = Math.round(naturalW * scale) + "px";
      frame.style.height = Math.round(naturalH * scale) + "px";
    }
    fitQuotePaper();
    requestAnimationFrame(fitQuotePaper);
    window.addEventListener("resize", fitQuotePaper);

    let motion = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function closeViewer() {
      window.removeEventListener("resize", fitQuotePaper);
      if (window.gsap && !reduced) {
        if (motion) motion.kill();
        window.gsap.killTweensOf([modal, stage, paper, shine, top, actions]);
        const outro = window.gsap.timeline({
          defaults: { ease: "power2.in" },
          onComplete: () => modal.remove(),
        });
        outro.to([actions, top], { y: 12, autoAlpha: 0, duration: 0.16 }, 0);
        outro.to(paper, { y: 36, autoAlpha: 0, rotate: -0.6, duration: 0.24 }, 0);
        outro.to(modal, { autoAlpha: 0, duration: 0.2 }, 0.05);
      } else {
        modal.remove();
      }
    }

    close.addEventListener("click", closeViewer);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeViewer();
    });
    download.addEventListener("click", () => {
      download.textContent = "Generando PDF…";
      if (window.gsap && !reduced) {
        window.gsap.fromTo(download, { scale: 0.96 }, { scale: 1, duration: 0.28, ease: "back.out(2)" });
      }
      generateQuotePdf(contact, quote).then(() => {
        pushContactHistory(contact.id, "Descargó PDF de cotización (" + formatPriceMxn(quote.precio) + ").", "cotizacion");
        download.textContent = "PDF descargado";
        if (window.gsap && !reduced) {
          window.gsap.fromTo(download, { backgroundColor: "#e8ff46", color: "#161614" }, {
            backgroundColor: "#161614",
            color: "#e8ff46",
            duration: 0.45,
            ease: "power2.out",
          });
        }
        setTimeout(() => { download.textContent = "Descargar PDF"; }, 1800);
      }).catch(() => {
        download.textContent = "No se pudo generar";
        setTimeout(() => { download.textContent = "Descargar PDF"; }, 1800);
      });
    });

    if (window.gsap && !reduced) {
      const logo = paper.querySelector(".quote-sheet-logo-img");
      const terms = paper.querySelectorAll(".quote-term");
      const rows = paper.querySelectorAll(".quote-sheet-table tbody tr");
      const total = paper.querySelector(".quote-sheet-sum .is-total");
      const sideBlocks = paper.querySelectorAll(".quote-sheet-side-block, .quote-sheet-terms");
      const mainBits = paper.querySelectorAll(".quote-sheet-head, .quote-sheet-to, .quote-sheet-table, .quote-sheet-sum, .quote-sheet-foot");

      motion = window.gsap.timeline({ defaults: { ease: "power3.out" } });
      motion.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, 0);
      motion.fromTo(stage, { y: 28, autoAlpha: 0.6, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.42 }, 0.02);
      motion.fromTo(top, { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28 }, 0.08);
      const currentScale = (() => {
        const match = /scale\(([^)]+)\)/.exec(paper.style.transform || "");
        return match ? Number(match[1]) : 1;
      })();
      motion.fromTo(paper, {
        y: 64,
        autoAlpha: 0,
        rotateX: 12,
        rotate: -1.2,
        scale: currentScale * 0.94,
        transformPerspective: 900,
      }, {
        y: 0,
        autoAlpha: 1,
        rotateX: 0,
        rotate: 0,
        scale: currentScale,
        duration: 0.58,
        ease: "power4.out",
      }, 0.1);
      if (logo) {
        motion.fromTo(logo, { scale: 0.7, autoAlpha: 0, rotate: -8 }, {
          scale: 1,
          autoAlpha: 1,
          rotate: 0,
          duration: 0.45,
          ease: "back.out(1.8)",
        }, 0.28);
        motion.to(logo, {
          y: -4,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        }, 0.8);
      }
      motion.fromTo(sideBlocks, { x: -18, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.36,
        stagger: 0.08,
      }, 0.32);
      motion.fromTo(terms, { x: -10, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.3,
        stagger: 0.06,
      }, 0.42);
      motion.fromTo(mainBits, { y: 18, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.36,
        stagger: 0.07,
      }, 0.3);
      motion.fromTo(rows, { y: 10, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        stagger: 0.05,
      }, 0.48);
      if (total) {
        motion.fromTo(total, { scale: 0.88, autoAlpha: 0 }, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.34,
          ease: "back.out(2)",
        }, 0.58);
      }
      motion.fromTo(shine, { x: "-120%" }, { x: "140%", duration: 1.1, ease: "power2.inOut" }, 0.5);
      motion.fromTo(actions.children, { y: 16, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.32,
        stagger: 0.08,
        ease: "back.out(1.6)",
      }, 0.62);
    }
    return true;
  }

  function parsePriceDigits(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function formatPriceMxn(value) {
    const digits = parsePriceDigits(value);
    if (!digits) return "";
    const amount = Number(digits);
    if (!Number.isFinite(amount)) return "";
    return "$" + amount.toLocaleString("es-MX") + " MXN";
  }

  function quoteStatusFlow() {
    return ["Borrador", "Enviada", "Aceptada", "Anticipo", "En obra", "Finalizado"];
  }

  function buildQuoteChoice(label, name, options, selected) {
    const wrap = document.createElement("label");
    wrap.className = "full quote-choice-field";
    wrap.append(document.createTextNode(label));
    const list = document.createElement("div");
    list.className = "quote-option-list";
    list.dataset.field = name;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", label);
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = name;
    hidden.value = selected || options[0] || "";
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quote-option";
      button.setAttribute("role", "option");
      button.dataset.value = option;
      button.setAttribute("aria-selected", option === hidden.value ? "true" : "false");
      button.innerHTML = "<span></span><em></em>";
      button.querySelector("span").textContent = option;
      button.querySelector("em").setAttribute("aria-hidden", "true");
      button.addEventListener("click", () => {
        hidden.value = option;
        list.querySelectorAll(".quote-option").forEach((item) => {
          item.setAttribute("aria-selected", item.dataset.value === option ? "true" : "false");
        });
      });
      list.append(button);
    });
    wrap.append(list, hidden);
    return wrap;
  }

  function bindPriceInput(input) {
    input.addEventListener("input", () => {
      const caret = input.selectionStart;
      const before = input.value.length;
      const formatted = formatPriceMxn(input.value);
      input.value = formatted;
      if (typeof caret === "number") {
        const next = Math.max(0, caret + (formatted.length - before));
        try { input.setSelectionRange(next, next); } catch (error) {}
      }
    });
    input.addEventListener("blur", () => {
      input.value = formatPriceMxn(input.value);
    });
  }

  function buildPriceField(name, labelText, value, required) {
    const precio = document.createElement("label");
    precio.className = "full quote-price-field";
    precio.append(document.createTextNode(labelText));
    const precioBox = document.createElement("div");
    precioBox.className = "quote-price-box";
    const precioInput = document.createElement("input");
    precioInput.name = name;
    precioInput.inputMode = "numeric";
    precioInput.autocomplete = "off";
    precioInput.placeholder = "$1,000 MXN";
    precioInput.required = !!required;
    if (value) precioInput.value = formatPriceMxn(value);
    const precioHint = document.createElement("span");
    precioHint.textContent = "MXN";
    precioBox.append(precioInput, precioHint);
    precio.append(precioBox);
    bindPriceInput(precioInput);
    return precio;
  }

  function buildQuoteForm(contact, quote) {
    const editing = !!(quote && quote.id);
    const form = document.createElement("form");
    form.className = "contact-form quote-form";

    const serviceWanted = String((quote && quote.servicio) || contact.servicio || "Canceles");
    const serviceOptions = ["Canceles", "Ventanas", "Barandales", "Fachadas", "Puertas", "Pérgolas", "Canceles de baño", "Otro"];
    const serviceSelected = serviceOptions.find((option) => option === serviceWanted || option.indexOf(serviceWanted) === 0 || serviceWanted.indexOf(option) === 0) || "Canceles";

    form.append(
      buildQuoteChoice("Servicio", "servicio", serviceOptions, serviceSelected),
      buildQuoteChoice("Tipo", "tipo", ["Instalación nueva", "Reemplazo / remodelación", "No estoy seguro"], (quote && quote.tipo) || "Instalación nueva")
    );

    const ubicacion = document.createElement("label");
    ubicacion.className = "full";
    ubicacion.append(document.createTextNode("Ubicación"));
    const ubicacionInput = document.createElement("input");
    ubicacionInput.name = "ubicacion";
    ubicacionInput.maxLength = 120;
    ubicacionInput.placeholder = "Colonia, municipio o referencia";
    ubicacionInput.required = true;
    ubicacionInput.value = (quote && quote.ubicacion) || "";
    ubicacion.append(ubicacionInput);
    form.append(ubicacion);

    form.append(buildQuoteChoice("Cuándo", "cuando", ["Urgente", "Este mes", "Más adelante", "Solo cotizo"], (quote && quote.cuando) || "Urgente"));
    form.append(buildPriceField("precio", "Precio total", quote && quote.precio, true));

    const medidas = document.createElement("label");
    medidas.className = "full";
    medidas.append(document.createTextNode("Medidas / trabajo"));
    const medidasInput = document.createElement("textarea");
    medidasInput.name = "descripcion";
    medidasInput.maxLength = 400;
    medidasInput.placeholder = "Alto × ancho, material, color y detalle del trabajo";
    medidasInput.required = true;
    medidasInput.value = (quote && quote.descripcion) || "";
    medidas.append(medidasInput);
    form.append(medidas);

    form.append(buildQuoteStatusFlow((quote && quote.estado) || "Borrador"));
    form.append(buildPriceField("anticipo", "Anticipo / abono", quote && quote.anticipo, false));

    const nota = document.createElement("label");
    nota.className = "full";
    nota.append(document.createTextNode("Nota de seguimiento"));
    const notaInput = document.createElement("textarea");
    notaInput.name = "nota";
    notaInput.maxLength = 240;
    notaInput.placeholder = "Ej. dio anticipo, quedó en rentas, visita agendada…";
    notaInput.value = (quote && quote.nota) || "";
    nota.append(notaInput);
    form.append(nota);

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = editing ? "Guardar cambios" : "Crear cotización";
    form.append(submit);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const priceDigits = parsePriceDigits(data.get("precio"));
      if (!priceDigits) {
        form.querySelector("[name='precio']").focus();
        return;
      }
      const anticipoDigits = parsePriceDigits(data.get("anticipo"));
      const nextQuote = {
        id: editing ? quote.id : ("q" + Date.now().toString(16)),
        contactId: contact.id,
        servicio: String(data.get("servicio") || ""),
        tipo: String(data.get("tipo") || ""),
        ubicacion: String(data.get("ubicacion") || "").trim(),
        cuando: String(data.get("cuando") || ""),
        precio: priceDigits,
        anticipo: anticipoDigits,
        descripcion: String(data.get("descripcion") || "").trim(),
        estado: String(data.get("estado") || "Borrador"),
        nota: String(data.get("nota") || "").trim(),
        creado: editing ? (quote.creado || iso(new Date())) : iso(new Date()),
        actualizado: iso(new Date()),
      };
      const cleaned = readQuotes().filter((row) => row.contactId !== contact.id);
      cleaned.unshift(nextQuote);
      saveQuotes(cleaned);
      const changeText = editing
        ? "Actualizó cotización · " + nextQuote.estado + " · " + formatPriceMxn(nextQuote.precio) + (anticipoDigits ? " · anticipo " + formatPriceMxn(anticipoDigits) : "") + (nextQuote.nota ? ". " + nextQuote.nota : ".")
        : "Cotización de " + nextQuote.servicio + " en " + nextQuote.ubicacion + " por " + formatPriceMxn(nextQuote.precio) + " · " + nextQuote.estado + (nextQuote.nota ? ". " + nextQuote.nota : ".");
      pushContactHistory(contact.id, changeText, "cotizacion");
      const modal = document.getElementById("client-sheet-modal");
      if (modal) modal.remove();
      openClientSheet(contact.id, "cotizacion");
    });

    return form;
  }

  function buildQuoteStatusFlow(selected) {
    const steps = quoteStatusFlow().concat(["Rechazada"]);
    const current = steps.includes(selected) ? selected : "Borrador";
    return buildQuoteChoice("Seguimiento del trabajo", "estado", steps, current);
  }

  function openClientSheet(contactId, focus) {
    const existing = document.getElementById("client-sheet-modal");
    if (existing) existing.remove();
    const contact = readContacts().find((item) => item.id === contactId);
    if (!contact) return;
    const quotes = quotesForContact(contactId);
    const isQuote = focus === "cotizacion";

    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.id = "client-sheet-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", isQuote ? "Cotización" : "Historial");

    const sheet = document.createElement("div");
    sheet.className = "contact-sheet client-sheet" + (isQuote ? " is-quote" : " is-history");
    const handle = document.createElement("span");
    handle.className = "contact-sheet-handle";
    handle.setAttribute("aria-hidden", "true");

    const top = document.createElement("div");
    top.className = "contact-sheet-top";
    const heading = document.createElement("h2");
    heading.textContent = isQuote ? "Cotización" : "Historial";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "×";
    top.append(heading, close);

    const person = document.createElement("div");
    person.className = "client-sheet-person";
    const avatar = document.createElement("span");
    avatar.className = "contact-avatar";
    avatar.dataset.tone = contactAvatarTone(contact.nombre);
    avatar.textContent = contactInitials(contact.nombre);
    avatar.setAttribute("aria-hidden", "true");
    const personMain = document.createElement("div");
    const personName = document.createElement("strong");
    personName.textContent = contact.nombre;
    const summary = document.createElement("p");
    summary.className = "client-sheet-summary";
    summary.textContent = [
      contact.canal === "llamada" ? "Llamada" : "WhatsApp",
      contact.servicio,
      contact.telefono || "",
    ].filter(Boolean).join(" · ");
    personMain.append(personName, summary);
    person.append(avatar, personMain);

    function closeModal() {
      modal.remove();
      show();
    }
    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    sheet.append(handle, top, person);

    if (!isQuote) {
      const timeline = document.createElement("ol");
      timeline.className = "client-timeline";
      const events = [];
      if (contact.nota) {
        events.push({
          tipo: "nota",
          texto: contact.nota,
          fecha: contact.fecha,
          hora: "",
        });
      }
      (Array.isArray(contact.historial) ? contact.historial : []).forEach((event) => events.push(event));
      events.sort((a, b) => {
        const left = String(a.fecha || "") + " " + String(a.hora || "");
        const right = String(b.fecha || "") + " " + String(b.hora || "");
        return right.localeCompare(left);
      });
      if (!events.length) {
        const empty = document.createElement("p");
        empty.className = "client-timeline-empty";
        empty.textContent = "Aún no hay movimientos en esta ficha.";
        sheet.append(empty);
      } else {
        events.forEach((event) => {
          const row = document.createElement("li");
          row.className = "client-timeline-item";
          row.dataset.type = event.tipo || "nota";
          const mark = document.createElement("span");
          mark.className = "client-timeline-dot";
          mark.setAttribute("aria-hidden", "true");
          const body = document.createElement("div");
          body.className = "client-timeline-body";
          const title = document.createElement("strong");
          title.textContent = event.tipo === "cotizacion"
            ? "Cotización"
            : event.tipo === "rol"
              ? "Cambio"
              : event.tipo === "estatus"
                ? "Estatus"
                : "Nota";
          const copy = document.createElement("p");
          copy.textContent = event.texto || "";
          const when = document.createElement("em");
          when.textContent = [event.fecha, event.hora].filter(Boolean).join(" · ");
          body.append(title, copy, when);
          row.append(mark, body);
          timeline.append(row);
        });
        sheet.append(timeline);
      }
    } else {
      const currentQuote = quotes[0] || null;
      if (currentQuote) {
        const summary = document.createElement("article");
        summary.className = "quote-card quote-summary";
        const title = document.createElement("strong");
        title.textContent = (currentQuote.servicio || "Servicio") + " · " + (formatPriceMxn(currentQuote.precio) || "$0 MXN");
        const meta = document.createElement("p");
        meta.textContent = [
          currentQuote.estado,
          currentQuote.anticipo ? ("Anticipo " + formatPriceMxn(currentQuote.anticipo)) : "",
          currentQuote.ubicacion,
        ].filter(Boolean).join(" · ");
        summary.append(title, meta);
        if (currentQuote.nota) {
          const note = document.createElement("span");
          note.className = "quote-card-note";
          note.textContent = currentQuote.nota;
          summary.append(note);
        }
        sheet.append(summary);

        const actions = document.createElement("div");
        actions.className = "quote-share-actions";

        const pdfBtn = document.createElement("button");
        pdfBtn.type = "button";
        pdfBtn.className = "client-pdf-btn";
        pdfBtn.textContent = "Ver / generar PDF";
        pdfBtn.addEventListener("click", () => {
          openQuoteViewer(contact, currentQuote);
          pushContactHistory(contact.id, "Abrió la cotización PDF (" + formatPriceMxn(currentQuote.precio) + ").", "cotizacion");
        });
        actions.append(pdfBtn);
        sheet.append(actions);
      } else {
        const wa = whatsappHref(contact.telefono);
        if (wa) {
          const waBtn = document.createElement("a");
          waBtn.className = "client-wa-btn is-soft-wa";
          waBtn.href = wa;
          waBtn.target = "_blank";
          waBtn.rel = "noopener noreferrer";
          waBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2a8.3 8.3 0 0 0-7.2 12.4L3.6 20.4l4.9-1.3A8.3 8.3 0 1 0 12 3.2zm0 1.5a6.8 6.8 0 0 1 5.7 10.4l-.3.4.7 2.6-2.6-.7-.4.2A6.8 6.8 0 1 1 12 4.7zm3.8 8.7c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-.9-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3 0-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.3.1-.5.3-.2.2-.6.6-.6 1.4 0 .8.6 1.6.7 1.7.1.2 1.2 1.9 3 2.6 1.8.7 1.8.5 2.1.5.3 0 1-.4 1.1-.8.1-.4.1-.7.1-.8 0-.1-.1-.2-.3-.3z" fill="currentColor"/></svg><span>Abrir WhatsApp</span>';
          sheet.append(waBtn);
        }
      }

      if (isOwnerRole()) {
        const formTitle = document.createElement("h3");
        formTitle.textContent = currentQuote ? "Editar cotización" : "Crear cotización";
        sheet.append(formTitle, buildQuoteForm(contact, currentQuote));
      } else {
        const observe = document.createElement("p");
        observe.className = "muted";
        observe.textContent = "Rol admin: solo observación del flujo. No genera ni edita cotizaciones.";
        sheet.append(observe);
      }
    }

    modal.append(sheet);
    document.body.append(modal);
    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "power2.out" });
      window.gsap.fromTo(sheet, { y: 56, autoAlpha: 0.8 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" });
      if (!isQuote) {
        const items = sheet.querySelectorAll(".client-timeline-item");
        if (items.length) {
          window.gsap.fromTo(items, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, stagger: 0.06, ease: "power2.out", delay: 0.12 });
        }
      }
    }
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
    const refCfg = readAccountData().referidosConfig;
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
})();
