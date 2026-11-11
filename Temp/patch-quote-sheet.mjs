import fs from "fs";

const path = "C:/PROYECTOS/vidrioaluminioinstala/public/panel/app.js";
let s = fs.readFileSync(path, "utf8");

const buildFn = `  function buildQuoteDocumentHtml(contact, quote) {
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
    const specs = [
      quote.tipo ? ["Tipo de trabajo", quote.tipo] : null,
      quote.cuando ? ["Cuándo", quote.cuando] : null,
      quote.ubicacion ? ["Ubicación", quote.ubicacion] : null,
    ].filter(Boolean);
    return ""
      + "<aside class=\\"quote-sheet-side\\">"
      + "<div class=\\"quote-sheet-brand\\">"
      + "<img class=\\"quote-sheet-logo-img\\" src=\\"" + escapeHtml(businessInfo.logoUrl) + "\\" alt=\\"Aluminios y Vidrios Instala\\" width=\\"140\\" height=\\"140\\">"
      + "</div>"
      + "<div class=\\"quote-sheet-side-block\\"><em>Cliente</em><strong>" + escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + escapeHtml(contact.telefono || "Sin teléfono") + "</p>"
      + "<p>" + escapeHtml(contact.canal === "llamada" ? "Llamada" : "WhatsApp") + "</p></div>"
      + "<div class=\\"quote-sheet-side-block\\"><em>Contacto Instala</em>"
      + "<strong>" + escapeHtml(businessInfo.phoneDisplay) + "</strong>"
      + "<p>" + escapeHtml(businessInfo.hours) + "</p>"
      + "<p>" + escapeHtml(businessInfo.hoursNote) + "</p>"
      + "<p>" + escapeHtml(businessInfo.coverage) + "</p></div>"
      + "<div class=\\"quote-sheet-terms\\"><em>Términos</em>"
      + terms.map((item) => (
        "<div class=\\"quote-term\\"><span></span><div><strong>" + escapeHtml(item[0]) + "</strong><p>" + escapeHtml(item[1]) + "</p></div></div>"
      )).join("")
      + "</div></aside>"
      + "<section class=\\"quote-sheet-main\\">"
      + "<div class=\\"quote-sheet-head\\"><div><p class=\\"quote-sheet-kicker\\">Aluminios y Vidrios Instala</p><h1>COTIZACIÓN</h1></div>"
      + "<div class=\\"quote-sheet-meta\\"><span>No. " + escapeHtml(quoteFolio(quote)) + "</span><span>" + escapeHtml(created) + "</span>"
      + (quote.estado ? ("<span class=\\"quote-sheet-status\\">" + escapeHtml(quote.estado) + "</span>") : "")
      + "</div></div>"
      + "<div class=\\"quote-sheet-to\\"><em>Cotizar a</em><strong>" + escapeHtml(contact.nombre || "Cliente") + "</strong>"
      + "<p>" + escapeHtml([contact.telefono, quote.ubicacion].filter(Boolean).join(" · ") || "Sin datos de contacto") + "</p></div>"
      + (specs.length
        ? ("<div class=\\"quote-sheet-specs\\">" + specs.map((item) => (
          "<div><em>" + escapeHtml(item[0]) + "</em><strong>" + escapeHtml(item[1]) + "</strong></div>"
        )).join("") + "</div>")
        : "")
      + "<table class=\\"quote-sheet-table\\"><thead><tr>"
      + "<th>Concepto</th><th>Importe</th></tr></thead><tbody>"
      + "<tr><td><strong class=\\"quote-line-title\\">" + escapeHtml(quote.servicio || "Servicio") + "</strong>"
      + "<span class=\\"quote-line-detail\\"><em>Medidas / trabajo</em>" + escapeHtml(medidas || "Sin medidas capturadas") + "</span></td>"
      + "<td>" + escapeHtml(price) + "</td></tr>"
      + (anticipo ? ("<tr class=\\"is-alt\\"><td><strong class=\\"quote-line-title\\">Anticipo / abono</strong><span class=\\"quote-line-detail\\"><em>Registro</em>Anticipo recibido</span></td><td>" + escapeHtml(anticipo) + "</td></tr>") : "")
      + "</tbody></table>"
      + (quote.nota ? ("<div class=\\"quote-sheet-note\\"><em>Nota</em><p>" + escapeHtml(quote.nota) + "</p></div>") : "")
      + "<div class=\\"quote-sheet-sum\\"><div><span>Subtotal</span><strong>" + escapeHtml(price) + "</strong></div>"
      + "<div class=\\"is-total\\"><span>TOTAL</span><strong>" + escapeHtml(price) + "</strong></div></div>"
      + "<div class=\\"quote-sheet-foot\\">"
      + "<div><p>" + escapeHtml(businessInfo.address) + "</p><p>" + escapeHtml(businessInfo.phoneDisplay) + " · " + escapeHtml(businessInfo.hours) + "</p></div>"
      + "<strong>Atención a cliente</strong></div>"
      + "</section>";
  }

`;

const pdfFn = `  function generateQuotePdf(contact, quote) {
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

      const specs = [
        quote.tipo ? ["Tipo de trabajo", t(quote.tipo)] : null,
        quote.cuando ? ["Cuando", t(quote.cuando)] : null,
        quote.ubicacion ? ["Ubicacion", t(quote.ubicacion)] : null,
      ].filter(Boolean);

      let rowY = 72;
      if (specs.length) {
        const colW = contentW / specs.length;
        specs.forEach((item, index) => {
          const x = left + index * colW;
          doc.setFillColor(soft[0], soft[1], soft[2]);
          doc.roundedRect(x, rowY - 5, colW - 3, 16, 1.5, 1.5, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(mute[0], mute[1], mute[2]);
          doc.text(item[0].toUpperCase(), x + 3, rowY);
          doc.setTextColor(ink[0], ink[1], ink[2]);
          doc.setFontSize(8.5);
          const valueLines = doc.splitTextToSize(item[1], colW - 8);
          doc.text(valueLines[0], x + 3, rowY + 6);
        });
        rowY += 20;
      }

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
      const blockH = Math.max(22, 8 + titleLines.length * 4.2 + 5 + detailLines.length * 3.8);

      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(titleLines, left + 3, rowY);
      doc.text(price, right - 3, rowY, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text("MEDIDAS / TRABAJO", left + 3, rowY + titleLines.length * 4.2 + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 66);
      doc.text(detailLines, left + 3, rowY + titleLines.length * 4.2 + 9);
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

`;

const startBuild = s.indexOf("  function buildQuoteDocumentHtml");
const endBuild = s.indexOf("  function generateQuotePdf");
if (startBuild < 0 || endBuild < 0) throw new Error("build markers missing");
s = s.slice(0, startBuild) + buildFn + s.slice(endBuild);

const startPdf = s.indexOf("  function generateQuotePdf");
const endPdf = s.indexOf("  function openQuoteViewer");
if (startPdf < 0 || endPdf < 0) throw new Error("pdf markers missing");
s = s.slice(0, startPdf) + pdfFn + s.slice(endPdf);

const oldViewerChunk = `    const scroll = document.createElement("div");
    scroll.className = "quote-viewer-scroll";
    const paper = document.createElement("div");
    paper.className = "quote-doc quote-sheet";
    paper.innerHTML = buildQuoteDocumentHtml(contact, quote);
    scroll.append(paper);

    const actions = document.createElement("div");
    actions.className = "quote-viewer-actions";
    const download = document.createElement("button");
    download.type = "button";
    download.className = "client-pdf-btn";
    download.textContent = "Descargar PDF";
    const send = document.createElement("a");
    send.className = "client-wa-btn";
    send.href = whatsappHref(contact.telefono, quoteShareText(contact, quote));
    send.target = "_blank";
    send.rel = "noopener noreferrer";
    send.innerHTML = "<span>Enviar por WhatsApp</span>";
    actions.append(download, send);

    const shine = document.createElement("span");
    shine.className = "quote-sheet-shine";
    shine.setAttribute("aria-hidden", "true");
    paper.append(shine);

    stage.append(top, scroll, actions);
    modal.append(stage);
    document.body.append(modal);`;

const newViewerChunk = `    const scroll = document.createElement("div");
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
    window.addEventListener("resize", fitQuotePaper);`;

if (!s.includes(oldViewerChunk)) throw new Error("viewer chunk missing");
s = s.replace(oldViewerChunk, newViewerChunk);

const oldClose = `    function closeViewer() {
      if (window.gsap && !reduced) {
        if (motion) motion.kill();
        window.gsap.killTweensOf([modal, stage, paper, shine, top, actions]);
        const outro = window.gsap.timeline({
          defaults: { ease: "power2.in" },
          onComplete: () => modal.remove(),
        });
        outro.to([actions, top], { y: 12, autoAlpha: 0, duration: 0.16 }, 0);
        outro.to(paper, { y: 36, scale: 0.96, autoAlpha: 0, rotate: -0.6, duration: 0.24 }, 0);
        outro.to(modal, { autoAlpha: 0, duration: 0.2 }, 0.05);
      } else {
        modal.remove();
      }
    }`;

const newClose = `    function closeViewer() {
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
    }`;

if (!s.includes(oldClose)) throw new Error("closeViewer missing");
s = s.replace(oldClose, newClose);

const sendHandler = `    send.addEventListener("click", () => {
      pushContactHistory(contact.id, "Envió la cotización por WhatsApp.", "cotizacion");
    });
`;
if (!s.includes(sendHandler)) throw new Error("send handler missing");
s = s.replace(sendHandler, "");

const oldMotionPaper = `      motion.fromTo(paper, {
        y: 64,
        autoAlpha: 0,
        rotateX: 12,
        rotate: -1.2,
        scale: 0.92,
        transformPerspective: 900,
      }, {
        y: 0,
        autoAlpha: 1,
        rotateX: 0,
        rotate: 0,
        scale: 1,
        duration: 0.58,
        ease: "power4.out",
      }, 0.1);`;

const newMotionPaper = `      const currentScale = (() => {
        const match = /scale\\(([^)]+)\\)/.exec(paper.style.transform || "");
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
      }, 0.1);`;

if (!s.includes(oldMotionPaper)) throw new Error("motion paper missing");
s = s.replace(oldMotionPaper, newMotionPaper);

const oldMainBits = `      const mainBits = paper.querySelectorAll(".quote-sheet-head, .quote-sheet-to, .quote-sheet-table, .quote-sheet-sum, .quote-sheet-foot");`;
const newMainBits = `      const mainBits = paper.querySelectorAll(".quote-sheet-head, .quote-sheet-to, .quote-sheet-specs, .quote-sheet-table, .quote-sheet-sum, .quote-sheet-foot");`;
if (!s.includes(oldMainBits)) throw new Error("mainBits missing");
s = s.replace(oldMainBits, newMainBits);

fs.writeFileSync(path, s);
console.log("app.js patched ok");
