import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { PergolasPage } from "@/features/services/pergolas/pergolas-page";
import { pergolasPageContent } from "@/features/services/pergolas/pergolas-page.data";

const serviceTitle = "Pérgolas de aluminio y cristal en Toluca";
const serviceDescription =
  "Diseño e instalación de pérgolas, domos y techos de vidrio en Toluca con soluciones a medida para sombra, luz y presencia arquitectónica.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "pérgolas de aluminio y cristal en Toluca",
    "pérgolas modernas",
    "domos de cristal",
    "techos de vidrio",
    "estructuras para exterior",
    "instalación de pérgolas",
    "pérgolas para terrazas",
  ],
  alternates: {
    canonical: "/servicios/pergolas",
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
    url: absoluteUrl("/servicios/pergolas"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: pergolasPageContent.image.src,
        width: 1983,
        height: 793,
        alt: pergolasPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [pergolasPageContent.image.src],
  },
  category: "pérgolas y domos",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/servicios/pergolas#servicio"),
    name: "Pérgolas de aluminio y cristal",
    serviceType: "Diseño e instalación de pérgolas, domos y techos",
    description: serviceDescription,
    inLanguage: "es-MX",
    url: absoluteUrl("/servicios/pergolas"),
    mainEntityOfPage: absoluteUrl("/servicios/pergolas"),
    image: absoluteUrl(pergolasPageContent.image.src),
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
      name: "Tipos de pérgolas y domos",
      itemListElement: pergolasPageContent.types.items.map((item) => ({
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
        name: "Pérgolas",
        item: absoluteUrl("/servicios/pergolas"),
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
      <PergolasPage />
    </>
  );
}
