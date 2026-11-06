export const phoneDisplay = "729 381 3723";
export const phoneHref = "tel:7293813723";
export const hoursLabel = "Lunes a sábado 8:00–18:00. Domingo cerrado.";
export const coverageLabel = "Toluca, Metepec y alrededores.";
export const addressLabel =
  "Lago Winnipeg 101, El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.";
export const mapsHref =
  "https://www.google.com/maps/search/?api=1&query=Lago%20Winnipeg%20101%2C%20El%20Seminario%20Primera%20Secc%2C%2050170%20Toluca%20de%20Lerdo%2C%20Mex.";

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
