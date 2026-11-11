export {
  phoneDisplay,
  phoneHref,
  hoursLabel,
  coverageLabel,
  addressLabel,
  mapsHref,
} from "@/content/site";

export const servicios = ["canceles", "ventanas", "barandales"] as const;
export type Servicio = (typeof servicios)[number];

export const ubicaciones = ["hero", "sticky", "seccion", "contacto", "footer", "tipos"] as const;
export type Ubicacion = (typeof ubicaciones)[number];

export const serviceLabels: Record<Servicio, string> = {
  canceles: "Canceles de baño",
  ventanas: "Ventanas de aluminio",
  barandales: "Barandales",
};

export function isServicio(value: string): value is Servicio {
  return (servicios as readonly string[]).includes(value);
}

export function isUbicacion(value: string): value is Ubicacion {
  return (ubicaciones as readonly string[]).includes(value);
}

export function servicioFromPath(pathname: string): Servicio | undefined {
  if (pathname.includes("canceles-de-bano")) {
    return "canceles";
  }

  if (pathname.includes("/ventanas")) {
    return "ventanas";
  }

  if (pathname.includes("barandales")) {
    return "barandales";
  }

  return undefined;
}

export function servicioFromLabel(value: string): Servicio | undefined {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("cancel")) {
    return "canceles";
  }

  if (normalized.includes("ventana")) {
    return "ventanas";
  }

  if (normalized.includes("barandal")) {
    return "barandales";
  }

  return isServicio(normalized) ? normalized : undefined;
}
