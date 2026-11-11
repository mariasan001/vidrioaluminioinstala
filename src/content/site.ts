/** Fuente única de datos de negocio (contacto, identidad, cobertura). */

export const siteUrlCanonical = "https://aluminioyvidrioinstala.mx";

export const site = {
  name: "Aluminio y Vidrio Instala",
  description:
    "Diseño, suministro e instalación de ventanas, puertas, canceles, fachadas, barandales y pérgolas en aluminio y vidrio para hogares y negocios en Toluca.",
  phoneDisplay: "729 381 3723",
  phoneDigits: "7293813723",
  phoneInternational: "+527293813723",
  phoneHref: "tel:7293813723",
  whatsappNumber: "527293813723",
  whatsappDirectUrl:
    "https://wa.me/527293813723?text=Hola%2C%20quiero%20pedir%20informaci%C3%B3n%20y%20cotizar%20un%20proyecto%20de%20aluminio%20y%20vidrio.",
  hoursLabel: "Lunes a sábado 8:00–18:00. Domingo cerrado.",
  coverageLabel: "Toluca, Metepec y alrededores.",
  addressLabel:
    "Lago Winnipeg 101, El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Lago%20Winnipeg%20101%2C%20El%20Seminario%20Primera%20Secc%2C%2050170%20Toluca%20de%20Lerdo%2C%20Mex.",
  facebook: "https://www.facebook.com/VentanasdeAluminioOmega/",
  address: {
    street: "Lago Winnipeg 101",
    neighborhood: "El Seminario Primera Secc",
    postalCode: "50170",
    city: "Toluca de Lerdo",
    region: "Estado de México",
    country: "MX",
  },
  services: [
    "Ventanas de aluminio",
    "Puertas de aluminio y vidrio",
    "Canceles de baño",
    "Fachadas de vidrio",
    "Barandales",
    "Pérgolas",
  ],
} as const;

export const phoneDisplay = site.phoneDisplay;
export const phoneHref = site.phoneHref;
export const hoursLabel = site.hoursLabel;
export const coverageLabel = site.coverageLabel;
export const addressLabel = site.addressLabel;
export const mapsHref = site.mapsHref;
export const whatsappPhoneNumber = site.whatsappNumber;
export const whatsappDirectUrl = site.whatsappDirectUrl;

/** Build a WhatsApp deep link from a plain message (single source of truth). */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
