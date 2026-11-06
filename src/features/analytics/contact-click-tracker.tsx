"use client";

import { useEffect } from "react";
import { isServicio, isUbicacion, servicioFromPath } from "@/features/conversion/contact-info";
import { analyticsEventNames, pushAnalyticsEvent } from "./tracking";

export function ContactClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = link.getAttribute("href") ?? "";
      const isPhone = href.startsWith("tel:");
      const isWhatsapp = href.includes("wa.me");

      if (!isPhone && !isWhatsapp) {
        return;
      }

      const servicioAttr = link.closest("[data-servicio]")?.getAttribute("data-servicio") ?? "";
      const ubicacionAttr = link.closest("[data-ubicacion]")?.getAttribute("data-ubicacion") ?? "";
      const servicio = isServicio(servicioAttr) ? servicioAttr : servicioFromPath(window.location.pathname);
      const ubicacion = isUbicacion(ubicacionAttr) ? ubicacionAttr : "seccion";
      const tipo = link.getAttribute("data-tipo") ?? "";

      pushAnalyticsEvent({
        event: isPhone ? analyticsEventNames.clickLlamada : analyticsEventNames.clickWhatsapp,
        servicio: servicio ?? "",
        ubicacion,
        ...(tipo ? { tipo } : {}),
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
