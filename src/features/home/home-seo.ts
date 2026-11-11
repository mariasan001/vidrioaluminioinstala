import { site, siteUrlCanonical } from "@/content/site";

function normalizeSiteUrl(raw: string) {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "");

    if (host === "aluminioyvidrioinstala.com" || host === "aluminioyvidrioinstala.mx") {
      return siteUrlCanonical;
    }

    url.hostname = host;
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.origin;
  } catch {
    return siteUrlCanonical;
  }
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || siteUrlCanonical);

export const businessInfo = {
  name: site.name,
  description: site.description,
  phoneDisplay: site.phoneDisplay,
  phoneInternational: site.phoneInternational,
  address: site.address,
  facebook: site.facebook,
  services: site.services,
} as const;

export const homeMetadata = {
  title: "Aluminio y Vidrio Instala | Ventanas y canceler\u00eda en Toluca",
  description:
    "Dise\u00f1amos, suministramos e instalamos ventanas, puertas, canceles, fachadas, barandales y p\u00e9rgolas en aluminio y vidrio para hogares y negocios en Toluca.",
  image: "/img/og-home.jpg",
} as const;

/** Absolute URL; with STATIC_EXPORT, page paths get a trailing slash to match Hostinger. */
export function absoluteUrl(path = "/") {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const hashIndex = raw.indexOf("#");
  const pathname = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : raw.slice(hashIndex);
  const isFile = /\.[a-zA-Z0-9]{2,8}$/.test(pathname);
  const useTrailingSlash = process.env.STATIC_EXPORT === "true";
  let normalized = pathname || "/";

  if (useTrailingSlash && !isFile && normalized !== "/" && !normalized.endsWith("/")) {
    normalized = `${normalized}/`;
  }

  return `${siteUrl}${normalized}${hash}`;
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
    streetAddress: `${businessInfo.address.street}, ${businessInfo.address.neighborhood}`,
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
      "@type": "City",
      name: "Metepec",
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
