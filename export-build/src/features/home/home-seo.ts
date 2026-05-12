const fallbackSiteUrl = "https://aluminioyvidrioinstala.com";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl
).replace(/\/$/, "");

export const businessInfo = {
  name: "Aluminio y Vidrio Instala",
  description:
    "Dise\u00f1o, suministro e instalaci\u00f3n de ventanas, puertas, canceles, fachadas, barandales y p\u00e9rgolas en aluminio y vidrio para hogares y negocios en Toluca.",
  phoneDisplay: "729 381 3723",
  phoneInternational: "+527293813723",
  address: {
    street: "Lago Winnipeg 101",
    neighborhood: "El Seminario Primera Secc",
    postalCode: "50170",
    city: "Toluca de Lerdo",
    region: "Estado de M\u00e9xico",
    country: "MX",
  },
  facebook: "https://www.facebook.com/VentanasdeAluminioOmega/",
  services: [
    "Ventanas de aluminio",
    "Puertas de aluminio y vidrio",
    "Canceles de ba\u00f1o",
    "Fachadas de vidrio",
    "Barandales",
    "P\u00e9rgolas",
  ],
} as const;

export const homeMetadata = {
  title: "Aluminio y Vidrio Instala | Ventanas y canceler\u00eda en Toluca",
  description:
    "Dise\u00f1amos, suministramos e instalamos ventanas, puertas, canceles, fachadas, barandales y p\u00e9rgolas en aluminio y vidrio para hogares y negocios en Toluca.",
  image: "/img/og-home.jpg",
} as const;

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": absoluteUrl("/#negocio"),
  name: businessInfo.name,
  url: absoluteUrl(),
  image: absoluteUrl(homeMetadata.image),
  logo: absoluteUrl("/img/logo.webp"),
  description: businessInfo.description,
  inLanguage: "es-MX",
  telephone: businessInfo.phoneInternational,
  sameAs: [businessInfo.facebook],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: businessInfo.phoneInternational,
      areaServed: "MX",
      availableLanguage: ["es-MX"],
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: businessInfo.address.street,
    addressLocality: businessInfo.address.city,
    addressRegion: businessInfo.address.region,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.country,
  },
  areaServed: [
    {
      "@type": "City",
      name: "Toluca de Lerdo",
    },
    {
      "@type": "AdministrativeArea",
      name: "Estado de M\u00e9xico",
    },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  knowsAbout: businessInfo.services,
  makesOffer: businessInfo.services.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service,
    },
  })),
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  url: absoluteUrl("/"),
  name: businessInfo.name,
  description: homeMetadata.description,
  inLanguage: "es-MX",
  publisher: {
    "@id": absoluteUrl("/#negocio"),
  },
};

export function stringifyJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
