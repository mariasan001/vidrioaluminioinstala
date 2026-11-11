/* Panel: programa de referidos. */
(function (AVI) {
  AVI.referralStoreKey = referralStoreKey;
  AVI.loadReferrals = loadReferrals;
  const { view } = AVI;

  function referralStoreKey() {
    return "avi_panel_referidos_v1";
  }
  function readClientReferrals() {
    if (Array.isArray(AVI.referralsCache)) return AVI.referralsCache.slice();
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
    AVI.referralsCache = Array.isArray(rows) ? rows : [];
    try {
      sessionStorage.setItem(referralStoreKey(), JSON.stringify(AVI.referralsCache));
    } catch (error) {}
    fetch("/api/account.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ csrf: AVI.csrfToken(), section: "referidos", data: AVI.referralsCache }),
    }).then(function (response) { return response.json(); }).then(function (data) {
      if (data && data.ok && Array.isArray(data.referidos)) {
        AVI.referralsCache = data.referidos;
        try { sessionStorage.setItem(referralStoreKey(), JSON.stringify(AVI.referralsCache)); } catch (error) {}
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
    if (AVI.isAdminRole()) {
      renderAdminReferidosEditor();
      return Promise.resolve();
    }
    const isDesk = !window.matchMedia("(max-width: 760px)").matches;
    const board = document.createElement("div");
    board.className = "account-board is-referidos" + (isDesk ? " is-desk" : "");
    const clientName = AVI.accountClientName();
    const refCfg = AVI.readAccountData().referidosConfig;
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
        sendRefer.href = AVI.whatsappHref(
          telefono,
          "Hola " + nombre + ", te escribe " + clientName + " de Aluminios y Vidrios Instala. Por venir de nuestra parte tienes " + refPct + "% de descuento en tu proyecto web. Si te interesa, con gusto te orientamos."
        );
        setTimeout(() => loadReferrals(), 400);
      });
    }

    function buildReferralsList(panel) {
      if (!rows.length) {
        panel.append(AVI.line("Todavía no ha referido a nadie.", "muted"));
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
          + "<div><strong>" + AVI.escapeHtml(item.nombre || "Referido") + "</strong>"
          + "<p>" + AVI.escapeHtml(estado)
          + (item.telefono ? (" · " + AVI.escapeHtml(item.telefono)) : "")
          + "</p></div>"
          + "<div class=\"account-pay-side\">"
          + "<span class=\"account-pay-badge" + badgeClass + "\">"
          + AVI.escapeHtml(estado)
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
      const sendRefer = AVI.accountWhatsAppButton(
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
      AVI.animateAccountBoard(board);
      return Promise.resolve();
    }

    const summary = document.createElement("div");
    summary.className = "stats";
    const lead = AVI.card(discountOn ? (ownerPct + "%") : "0%", "Desc. sig. mes", "check");
    lead.classList.add("lead");
    summary.append(lead);

    const counts = document.createElement("div");
    counts.className = "account-refer-counts";
    [
      [String(rows.length), "Referidos", "chat"],
      [String(closed), "Cerrados", "check"],
      [String(open), "En proceso", "form"],
    ].forEach((item) => {
      counts.append(AVI.card(item[0], item[1], item[2]));
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
    const sendRefer = AVI.accountWhatsAppButton(
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

    board.append(summary, counts, how, discount, refer, panel, AVI.accountBackButton());
    view.replaceChildren(board);
    AVI.animateAccountBoard(board);
    return Promise.resolve();
  }
  function renderAdminReferidosEditor() {
    const cfg = AVI.readAccountData().referidosConfig;
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
      + AVI.accountField("% descuento dueño", "descuentoDueno", cfg.descuentoDueno, "number")
      + AVI.accountField("% descuento referido", "descuentoReferido", cfg.descuentoReferido, "number")
      + AVI.accountField("Activo desde", "activoDesde", cfg.activoDesde, "date")
      + AVI.accountField("Empleado / responsable", "empleado", cfg.empleado)
      + "</div></div>"
      + AVI.accountEditActions("Guardar referidos")
      + "</section>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const next = AVI.readAccountData();
      next.referidosConfig = {
        descuentoDueno: AVI.parseMoneyInput(fd.get("descuentoDueno")),
        descuentoReferido: AVI.parseMoneyInput(fd.get("descuentoReferido")),
        activoDesde: String(fd.get("activoDesde") || "").trim(),
        empleado: String(fd.get("empleado") || "").trim(),
      };
      AVI.writeAccountData(next, "referidosConfig");
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
        + "<strong>" + AVI.escapeHtml(item.nombre || "Referido") + "</strong>"
        + "<p>" + AVI.escapeHtml(item.telefono || "Sin teléfono") + "</p>"
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
    board.append(form, list, AVI.accountBackButton());
    view.replaceChildren(board);
    AVI.animateAccountBoard(board);
  }
})(window.AVI = window.AVI || {});
