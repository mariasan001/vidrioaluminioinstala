"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackServiceView } from "./tracking";

const servicePaths: Record<string, string> = {
  "/servicios/barandales": "Barandales",
  "/servicios/canceles-de-bano": "Canceles de baño",
  "/servicios/fachadas-de-cristal": "Fachadas",
  "/servicios/pergolas": "Pérgolas",
  "/servicios/puertas": "Puertas",
  "/servicios/ventanas": "Ventanas",
};

export function ServiceViewTracker() {
  const pathname = usePathname();
  const lastTrackedPathname = useRef<string | null>(null);

  useEffect(() => {
    const service = servicePaths[pathname];

    if (!service || lastTrackedPathname.current === pathname) {
      return;
    }

    trackServiceView({
      pathname,
      service,
    });
    lastTrackedPathname.current = pathname;
  }, [pathname]);

  return null;
}
