/* Panel: resumen, páginas, embudo, comparativa, visitas, visita, clicks. */
(function (AVI) {
  AVI.loadSummary = loadSummary;
  AVI.loadPages = loadPages;
  AVI.loadFunnel = loadFunnel;
  AVI.setPagePickOpen = setPagePickOpen;
  AVI.loadComparativa = loadComparativa;
  const { emptyText, state, view } = AVI;

  function loadSummary() {
    return Promise.all([AVI.api("/api/stats/resumen.php"), AVI.api("/api/stats/paginas.php")]).then(([data, pages]) => {
      const cards = document.createElement("div");
      cards.className = "stats web";
      const lead = AVI.card(data.visitas, "Visitas", "eye");
      lead.classList.add("lead");
      cards.append(
        lead,
        AVI.card(data.clics_whatsapp, "WhatsApp", "chat"),
        AVI.card(data.clics_llamada, "Llamadas", "phone"),
        AVI.card(data.formularios, "Formularios", "form"),
        AVI.card(AVI.formatRate(data.tasa_contacto), "Contacto", "check")
      );
      const chartCard = document.createElement("section");
      chartCard.className = "panel-card chart-card";
      const days = data.por_dia || [];
      const hourly = days.length === 1 && Array.isArray(days[0].horas) && days[0].horas.length > 0;
      const heading = document.createElement("h2");
      heading.textContent = hourly ? "Visitas por hora" : "Visitas por día";
      chartCard.append(heading, data.visitas ? drawChart(hourly ? hoursOf(days[0]) : days, hourly) : AVI.line(emptyText, "muted"));
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
        side.append(AVI.line(emptyText, "muted"));
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
          name.textContent = item.etiqueta || AVI.pageName(item.pagina);
          const track = document.createElement("span");
          track.className = "rank-track";
          const fill = document.createElement("span");
          fill.className = "rank-fill";
          const visits = Number(item.visitas) || 0;
          fill.dataset.share = String(Math.max(8, Math.round((visits / max) * 100)));
          track.append(fill);
          const meta = document.createElement("span");
          meta.className = "rank-meta";
          meta.textContent = AVI.formatRate(item.tasa_contacto) + " contacto";
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
    return AVI.api("/api/stats/paginas.php").then((data) => {
      const pages = (data.paginas || []).slice().sort((a, b) => Number(b.visitas) - Number(a.visitas));
      if (!pages.length) {
        view.replaceChildren(AVI.line(emptyText, "muted"));
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
        name.textContent = item.etiqueta || AVI.pageName(item.pagina);

        const rate = document.createElement("em");
        rate.className = "page-rate";
        const contact = AVI.formatRate(item.tasa_contacto) + " contacto";
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
    return AVI.api("/api/stats/paginas.php").then((list) => {
      const pages = allPages(list.paginas || []);
      if (!pages.some((page) => page.pagina === state.pagina)) {
        state.pagina = "/";
        AVI.saveState();
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
          etiqueta: item.etiqueta || AVI.pageName(item.pagina),
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
          AVI.api("/api/stats/embudo.php", { pagina: page.pagina })
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
      return AVI.api("/api/stats/embudo.php", { pagina: selected }).then((data) => {
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
      AVI.saveState();
      setPagePickOpen(false);
      AVI.show();
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
      pages.push({ pagina: raw, etiqueta: item.etiqueta || AVI.pageName(raw) });
    });
    return pages;
  }
  function journeyCard(page, steps) {
    const card = document.createElement("article");
    card.className = "journey";
    const head = document.createElement("div");
    head.className = "journey-head";
    const name = document.createElement("h2");
    name.textContent = page.etiqueta || AVI.pageName(page.pagina);
    const hero = steps.find((step) => step.seccion === "hero");
    const entered = hero ? Number(hero.visitas) || 0 : Number(page.visitas) || 0;
    const enteredLabel = document.createElement("em");
    enteredLabel.textContent = entered === 1 ? "1 persona entró" : entered + " personas entraron";
    head.append(name, enteredLabel);
    card.append(head);

    const alive = steps.some((step) => Number(step.visitas) > 0);
    if (!steps.length || !alive) {
      card.remove();
      return emptyJourney(page.etiqueta || AVI.pageName(page.pagina), "Cuando entre alguien, aquí se ve en qué parte se queda.");
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
  function loadComparativa() {
    return Promise.all([
      AVI.api("/api/stats/resumen.php"),
      AVI.api("/api/stats/clics.php"),
    ]).then(([data, clicksData]) => {
      const dates = AVI.rangeDates();
      const contacts = AVI.readContacts().filter((item) => {
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
        wrap.append(AVI.renderContactList(contacts, "contactos"));
      }

      if (AVI.isOwnerRole()) {
        const fab = document.createElement("button");
        fab.type = "button";
        fab.className = "contact-fab";
        fab.setAttribute("aria-label", "Registrar contacto");
        fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>Registrar</span>';
        fab.addEventListener("click", () => AVI.openContactModal(dates.hasta));
        wrap.append(fab);
      }

      view.replaceChildren(wrap);
    });
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
      body.append(AVI.line("No hay clics detectados en este periodo.", "muted"));
    } else {
      list.forEach((item) => {
        const row = document.createElement("article");
        row.className = "click-history-item";
        const head = document.createElement("div");
        head.className = "click-history-top";
        const when = document.createElement("strong");
        when.textContent = formatClickWhen(item);
        const page = document.createElement("span");
        page.textContent = item.pagina_etiqueta || AVI.pageName(item.pagina) || "Página";
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

        if (AVI.isOwnerRole()) {
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
                AVI.openContactModal(item.fecha || AVI.rangeDates().hasta, {
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
      AVI.show();
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
  function loadVisits() {
    return AVI.api("/api/stats/visitas.php", { p: String(state.p) }).then((data) => {
      const visits = data.visitas || [];
      if (!visits.length) {
        view.replaceChildren(AVI.line(emptyText, "muted"));
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
        path.textContent = (item.entrada_etiqueta || AVI.pageName(item.entrada || "")) + section;
        button.append(when, detail, path);
        list.append(button);
      });
      if (data.paginas_lista > 1) {
        const pager = document.createElement("div");
        pager.className = "pager";
        if (data.pagina_lista > 1) pager.append(AVI.pageButton(data.pagina_lista - 1, "Anterior"));
        if (data.pagina_lista < data.paginas_lista) pager.append(AVI.pageButton(data.pagina_lista + 1, "Siguiente"));
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
    return AVI.api("/api/stats/visita.php", { id: id }).then((data) => {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "secondary back";
      back.textContent = "Volver a visitas";
      back.addEventListener("click", () => {
        location.hash = "#visitas";
      });
      const summary = document.createElement("p");
      summary.className = "muted";
      summary.textContent = data.visita.hora + " · " + data.visita.fuente_etiqueta + " · " + data.visita.dispositivo_etiqueta + " · " + (data.visita.pagina_etiqueta || AVI.pageName(data.visita.pagina));
      const list = document.createElement("ol");
      list.className = "tl";
      (data.eventos || []).forEach((event) => {
        const item = document.createElement("li");
        const name = document.createElement("b");
        const parts = [event.hora, event.tipo_etiqueta, event.pagina_etiqueta || AVI.pageName(event.pagina)];
        if (event.seccion_etiqueta) parts.push(event.seccion_etiqueta);
        if (event.producto) parts.push(event.producto);
        name.textContent = parts.filter(Boolean).join(" · ");
        item.append(name);
        list.append(item);
      });
      if (!data.eventos || !data.eventos.length) list.append(AVI.line(emptyText, "muted"));
      view.replaceChildren(back, summary, list);
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
      option.textContent = item.etiqueta || AVI.pageName(item.pagina);
      select.append(option);
    });
    if (state.pagina && ![...select.options].some((option) => option.value === state.pagina)) {
      const option = document.createElement("option");
      option.value = state.pagina;
      option.textContent = AVI.pageName(state.pagina);
      select.append(option);
    }
    select.value = state.pagina;
    select.addEventListener("change", () => {
      state.pagina = select.value;
      AVI.saveState();
      AVI.show();
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
})(window.AVI = window.AVI || {});
