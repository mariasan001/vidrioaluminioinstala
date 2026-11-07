(function () {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    var path = window.location.pathname || "/";

    if (path === "/panel" || path.indexOf("/panel/") === 0) {
      return;
    }

    var idleMs = 30 * 60 * 1000;
    var sectionNames = {
      hero: true,
      usos: true,
      ventajas: true,
      tipos: true,
      confianza: true,
      trabajos: true,
      preguntas: true,
      contacto: true,
    };
    var clickSections = {
      hero: true,
      usos: true,
      ventajas: true,
      tipos: true,
      confianza: true,
      trabajos: true,
      preguntas: true,
      contacto: true,
      sticky: true,
      footer: true,
    };

    function debugEnabled() {
      return /(?:\?|&)debug_tracking=1(?:&|$)/.test(window.location.search);
    }

    function log(payload) {
      if (debugEnabled() && window.console && console.log) {
        console.log("[avi-track]", payload);
      }
    }

    function read(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    }

    function write(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // El modo privado puede bloquear localStorage.
      }
    }

    function visitorId() {
      var current = read("avi_visitor_id");

      if (current && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(current)) {
        return current;
      }

      if (!window.crypto || typeof window.crypto.randomUUID !== "function") {
        return "";
      }

      var created = window.crypto.randomUUID();
      write("avi_visitor_id", created);
      return created;
    }

    function pagePath() {
      var pathname = window.location.pathname || "/";

      if (!/^\/[a-z0-9/_-]*$/.test(pathname)) {
        return "";
      }

      return pathname;
    }

    function device() {
      var ua = navigator.userAgent || "";

      if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
        return "tablet";
      }

      if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
        return "movil";
      }

      return "escritorio";
    }

    function cleanUtm(value) {
      if (!value) {
        return "";
      }

      var text = String(value).trim();

      if (!text || text.length > 80 || !/^[a-zA-Z0-9 ._+|\-]+$/.test(text)) {
        return "";
      }

      return text;
    }

    function attribution() {
      var params = new URLSearchParams(window.location.search);
      var utmSource = cleanUtm(params.get("utm_source"));
      var utmMedium = cleanUtm(params.get("utm_medium"));
      var utmCampaign = cleanUtm(params.get("utm_campaign"));
      var hasGclid = params.has("gclid") && params.get("gclid") !== "";
      var medium = utmMedium.toLowerCase();
      var source = "directo";
      var referrer = document.referrer || "";

      if (hasGclid || medium === "cpc" || medium === "ppc" || medium === "paid" || medium === "paidsearch") {
        source = "google_ads";
      } else if (referrer) {
        try {
          var host = new URL(referrer).hostname.replace(/^www\./, "");
          var selfHost = window.location.hostname.replace(/^www\./, "");

          if (host && host !== selfHost) {
            source = /google\.|bing\.|yahoo\.|duckduckgo\.|ecosia\./.test(host) ? "organico" : "referido";
          }
        } catch (error) {
          source = "otro";
        }
      }

      return {
        source: source,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid: hasGclid,
      };
    }

    function seenKey(visitId, section) {
      return visitId + "|" + pagePath() + "|" + section;
    }

    function alreadySeen(visitId, section) {
      try {
        var data = JSON.parse(read("avi_seen") || "null");

        if (!data || data.visit !== visitId || !data.keys) {
          return false;
        }

        return data.keys[seenKey(visitId, section)] === 1;
      } catch (error) {
        return false;
      }
    }

    function remember(visitId, section) {
      try {
        var data = JSON.parse(read("avi_seen") || "null");

        if (!data || data.visit !== visitId || !data.keys) {
          data = { visit: visitId, keys: {} };
        }

        data.keys[seenKey(visitId, section)] = 1;
        write("avi_seen", JSON.stringify(data));
      } catch (error) {
        // Si el almacenamiento falla, el observador igual deja de mirar ese nodo.
      }
    }

    function visitId(now) {
      var last = Number(read("avi_last_at") || 0);
      var current = read("avi_visit_id") || "";

      if (!current || !last || now - last > idleMs) {
        current = String(now);
        write("avi_visit_id", current);

        write("avi_seen", "");
      }

      write("avi_last_at", String(now));
      return current;
    }

    function post(payload) {
      var body = JSON.stringify(payload);
      log(payload);

      try {
        if (navigator.sendBeacon) {
          var blob = new Blob([body], { type: "application/json" });

          if (navigator.sendBeacon("/api/track.php", blob)) {
            return;
          }
        }
      } catch (error) {
        // Se intenta el respaldo.
      }

      try {
        window.fetch("/api/track.php", {
          method: "POST",
          body: body,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      } catch (error) {
        // El seguimiento no debe afectar la página.
      }
    }

    function track(type, section, meta) {
      var id = visitorId();
      var page = pagePath();

      if (!id || !page) {
        return;
      }

      if (section && type === "section_view") {
        var activeVisit = read("avi_visit_id") || "";
        var last = Number(read("avi_last_at") || 0);

        if (activeVisit && last && Date.now() - last <= idleMs && alreadySeen(activeVisit, section)) {
          return;
        }
      }

      var visit = visitId(Date.now());

      if (section && type === "section_view") {
        remember(visit, section);
      }

      var visitSource = attribution();
      var payload = {
        visitor_id: id,
        type: type,
        page: page,
        device: device(),
        source: visitSource.source,
        utm_source: visitSource.utm_source,
        utm_medium: visitSource.utm_medium,
        utm_campaign: visitSource.utm_campaign,
        gclid: visitSource.gclid,
      };

      if (section) {
        payload.section = section;
      }

      if (meta && meta.tipo) {
        payload.meta = { tipo: String(meta.tipo).slice(0, 80) };
      }

      post(payload);
    }

    function halfVisible(entry) {
      if (entry.intersectionRatio >= 0.5) {
        return true;
      }

      var viewport = window.innerHeight || 0;

      return viewport > 0 && entry.intersectionRect && entry.intersectionRect.height >= viewport * 0.5;
    }

    function watchSections() {
      if (typeof window.IntersectionObserver !== "function") {
        return;
      }

      var nodes = document.querySelectorAll("[data-section]");
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            try {
              if (!entry.isIntersecting || !halfVisible(entry)) {
                return;
              }

              var name = entry.target.getAttribute("data-section") || "";

              if (!sectionNames[name]) {
                return;
              }

              track("section_view", name, null);
              observer.unobserve(entry.target);
            } catch (error) {
              // Sigue con las demás secciones.
            }
          });
        },
        { threshold: [0, 0.5] }
      );

      nodes.forEach(function (node) {
        var name = node.getAttribute("data-section") || "";

        if (sectionNames[name]) {
          observer.observe(node);
        }
      });
    }

    function onClick(event) {
      try {
        var target = event.target;

        if (!target || typeof target.closest !== "function") {
          return;
        }

        var link = target.closest("a");

        if (!link) {
          return;
        }

        var href = link.getAttribute("href") || "";
        var type = "";

        if (href.indexOf("wa.me") !== -1) {
          type = "click_whatsapp";
        } else if (href.indexOf("tel:") === 0) {
          type = "click_llamada";
        }

        if (!type) {
          return;
        }

        var holder = link.closest("[data-section]");
        var section = holder ? holder.getAttribute("data-section") || "" : "";
        var tipo = link.getAttribute("data-tipo") || "";

        if (!clickSections[section]) {
          section = "";
        }

        track(type, section, tipo ? { tipo: tipo } : null);
      } catch (error) {
        // Un clic de contacto no debe romperse.
      }
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("avi-envio-formulario", function () {
      try {
        track("envio_formulario", "contacto", null);
      } catch (error) {
        // El formulario ya se envió.
      }
    });

    track("page_view", "", null);
    watchSections();
  } catch (error) {
    // El sitio sigue aunque el seguimiento falle.
  }
})();
