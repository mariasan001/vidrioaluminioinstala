/* Panel: contactos, cotizaciones y clientes (vistas y modales). */
(function (AVI) {
  AVI.loadContactos = loadContactos;
  AVI.loadClientes = loadClientes;
  AVI.updateClientsNav = updateClientsNav;
  AVI.openContactModal = openContactModal;
  AVI.readContacts = readContacts;
  AVI.renderContactList = renderContactList;
  AVI.whatsappHref = whatsappHref;
  const { view } = AVI;

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
    form.fecha.value = defaultDate || AVI.rangeDates().hasta;
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
      else AVI.show();
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
  function readContacts() {
    const source = Array.isArray(AVI.contactsCache)
      ? AVI.contactsCache
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
    AVI.contactsCache = list.slice(0, 200);
    sessionStorage.setItem("avi_contactos_reales", JSON.stringify(AVI.contactsCache));
    fetch("/api/crm.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: AVI.csrfToken(), contacts: AVI.contactsCache, quotes: readQuotes() }),
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
    const source = Array.isArray(AVI.quotesCache)
      ? AVI.quotesCache.slice()
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
    AVI.quotesCache = list.slice(0, 300);
    sessionStorage.setItem("avi_cotizaciones", JSON.stringify(AVI.quotesCache));
    fetch("/api/crm.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: AVI.csrfToken(), contacts: readContacts(), quotes: AVI.quotesCache }),
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
        fecha: AVI.iso(new Date()),
        hora: String(new Date().getHours()).padStart(2, "0") + ":" + String(new Date().getMinutes()).padStart(2, "0"),
        texto,
        tipo: tipo || "nota",
      });
      return Object.assign({}, row, { historial: historial.slice(0, 80) });
    });
    saveContacts(next);
  }
  function renderContactList(contacts, mode) {
    const canEditCrm = AVI.isOwnerRole();
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
        AVI.show();
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
            AVI.show();
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
  function quotePdfFileName(contact, quote) {
    const name = String(contact.nombre || "cliente").trim().replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]+/g, "").replace(/\s+/g, "-") || "cliente";
    const day = quote.actualizado || quote.creado || AVI.iso(new Date());
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
    const created = quote.creado || AVI.iso(new Date());
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
      + "<img class=\"quote-sheet-logo-img\" src=\"" + AVI.escapeHtml(businessInfo.logoUrl) + "\" alt=\"Aluminios y Vidrios Instala\" width=\"140\" height=\"140\">"
      + "</div>"
      + "<div class=\"quote-sheet-side-block\"><em>Cliente</em><strong>" + AVI.escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + AVI.escapeHtml(contact.telefono || "Sin teléfono") + "</p>"
      + "<p>" + AVI.escapeHtml(contact.canal === "llamada" ? "Llamada" : "WhatsApp") + "</p></div>"
      + "<div class=\"quote-sheet-side-block\"><em>Contacto Instala</em>"
      + "<strong>" + AVI.escapeHtml(businessInfo.phoneDisplay) + "</strong>"
      + "<p>" + AVI.escapeHtml(businessInfo.hours) + "</p>"
      + "<p>" + AVI.escapeHtml(businessInfo.hoursNote) + "</p>"
      + "<p>" + AVI.escapeHtml(businessInfo.coverage) + "</p></div>"
      + "<div class=\"quote-sheet-terms\"><em>Términos</em>"
      + terms.map((item) => (
        "<div class=\"quote-term\"><span></span><div><strong>" + AVI.escapeHtml(item[0]) + "</strong><p>" + AVI.escapeHtml(item[1]) + "</p></div></div>"
      )).join("")
      + "</div></aside>"
      + "<section class=\"quote-sheet-main\">"
      + "<div class=\"quote-sheet-head\"><div><p class=\"quote-sheet-kicker\">Aluminios y Vidrios Instala</p><h1>COTIZACIÓN</h1></div>"
      + "<div class=\"quote-sheet-meta\"><span>No. " + AVI.escapeHtml(quoteFolio(quote)) + "</span><span>" + AVI.escapeHtml(created) + "</span>"
      + (quote.estado ? ("<span class=\"quote-sheet-status\">" + AVI.escapeHtml(quote.estado) + "</span>") : "")
      + "</div></div>"
      + "<div class=\"quote-sheet-to\"><em>Cotizar a</em><strong>" + AVI.escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + AVI.escapeHtml([contact.telefono, quote.ubicacion].filter(Boolean).join(" · ") || "Sin datos de contacto") + "</p></div>"
      + "<table class=\"quote-sheet-table\"><thead><tr>"
      + "<th>Concepto</th><th>Importe</th></tr></thead><tbody>"
      + "<tr><td><strong class=\"quote-line-title\">" + AVI.escapeHtml(quote.servicio || "Servicio") + "</strong>"
      + (jobMeta ? ("<span class=\"quote-line-meta\">" + AVI.escapeHtml(jobMeta) + "</span>") : "")
      + "<span class=\"quote-line-detail\"><em>Medidas / trabajo</em>" + AVI.escapeHtml(medidas || "Sin medidas capturadas") + "</span></td>"
      + "<td>" + AVI.escapeHtml(price) + "</td></tr>"
      + (anticipo ? ("<tr class=\"is-alt\"><td><strong class=\"quote-line-title\">Anticipo / abono</strong><span class=\"quote-line-detail\"><em>Registro</em>Anticipo recibido</span></td><td>" + AVI.escapeHtml(anticipo) + "</td></tr>") : "")
      + "</tbody></table>"
      + (quote.nota ? ("<div class=\"quote-sheet-note\"><em>Nota</em><p>" + AVI.escapeHtml(quote.nota) + "</p></div>") : "")
      + "<div class=\"quote-sheet-sum\"><div><span>Subtotal</span><strong>" + AVI.escapeHtml(price) + "</strong></div>"
      + "<div class=\"is-total\"><span>TOTAL</span><strong>" + AVI.escapeHtml(price) + "</strong></div></div>"
      + "<div class=\"quote-sheet-foot\">"
      + "<div><p>" + AVI.escapeHtml(businessInfo.address) + "</p><p>" + AVI.escapeHtml(businessInfo.phoneDisplay) + " · " + AVI.escapeHtml(businessInfo.hours) + "</p></div>"
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
      const created = t(quote.creado || AVI.iso(new Date()));
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
        creado: editing ? (quote.creado || AVI.iso(new Date())) : AVI.iso(new Date()),
        actualizado: AVI.iso(new Date()),
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
      AVI.show();
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

      if (AVI.isOwnerRole()) {
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
})(window.AVI = window.AVI || {});
