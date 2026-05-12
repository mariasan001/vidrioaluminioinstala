import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { PuertasPage } from "@/features/services/puertas/puertas-page";
import { puertasPageContent } from "@/features/services/puertas/puertas-page.data";

const serviceTitle = "Puertas de aluminio y cristal en Toluca";
const serviceDescription =
  "Diseño e instalación de puertas de aluminio y cristal en Toluca para accesos, interiores y exteriores con soluciones a medida.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "puertas de aluminio y cristal en Toluca",
    "puertas modernas",
    "puertas de vidrio templado",
    "instalación de puertas",
    "puertas plegables de cristal",
    "puertas de herrería",
    "puertas de cristal",
  ],
  alternates: {
    canonical: "/servicios/puertas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: serviceTitle,
    description: serviceDescription,
    url: absoluteUrl("/servicios/puertas"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: puertasPageContent.image.src,
        width: 1983,
        height: 793,
        alt: puertasPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [puertasPageContent.image.src],
  },
  category: "puertas de aluminio y cristal",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/servicios/puertas#servicio"),
    name: "Puertas de aluminio y cristal",
    serviceType: "Diseño e instalación de puertas",
    description: serviceDescription,
    inLanguage: "es-MX",
    url: absoluteUrl("/servicios/puertas"),
    mainEntityOfPage: absoluteUrl("/servicios/puertas"),
    image: absoluteUrl(puertasPageContent.image.src),
    provider: {
      "@id": absoluteUrl("/#negocio"),
      "@type": "HomeAndConstructionBusiness",
      name: businessInfo.name,
      url: absoluteUrl(),
      telephone: businessInfo.phoneInternational,
      address: {
        "@type": "PostalAddress",
        streetAddress: businessInfo.address.street,
        addressLocality: businessInfo.address.city,
        addressRegion: businessInfo.address.region,
        postalCode: businessInfo.address.postalCode,
        addressCountry: businessInfo.address.country,
      },
      sameAs: [businessInfo.facebook],
    },
    areaServed: [
      {
        "@type": "City",
        name: "Toluca de Lerdo",
      },
      {
        "@type": "AdministrativeArea",
        name: "Estado de México",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tipos de puertas",
      itemListElement: puertasPageContent.types.items.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.description,
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Servicios",
        item: absoluteUrl("/#servicios"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Puertas",
        item: absoluteUrl("/servicios/puertas"),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(serviceJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(breadcrumbJsonLd),
        }}
      />
      <PuertasPage />
    </>
  );
}
