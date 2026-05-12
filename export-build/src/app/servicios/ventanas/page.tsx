import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { VentanasPage } from "@/features/services/ventanas/ventanas-page";
import { ventanasPageContent } from "@/features/services/ventanas/ventanas-page.data";

const serviceTitle = "Ventanas de aluminio y cristal en Toluca";
const serviceDescription =
  "Diseño e instalación de ventanas de aluminio y cristal en Toluca para mejorar luz natural, ventilación, aislamiento y confort interior.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "ventanas de aluminio y cristal en Toluca",
    "ventanas modernas",
    "ventanas de vidrio templado",
    "instalación de ventanas",
    "ventanas corredizas y abatibles",
    "ventanas de aluminio",
    "ventanas a medida",
  ],
  alternates: {
    canonical: "/servicios/ventanas",
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
    url: absoluteUrl("/servicios/ventanas"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: ventanasPageContent.image.src,
        width: 1536,
        height: 1024,
        alt: ventanasPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [ventanasPageContent.image.src],
  },
  category: "ventanas de aluminio y cristal",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/servicios/ventanas#servicio"),
    name: "Ventanas de aluminio y cristal",
    serviceType: "Diseño e instalación de ventanas",
    description: serviceDescription,
    inLanguage: "es-MX",
    url: absoluteUrl("/servicios/ventanas"),
    mainEntityOfPage: absoluteUrl("/servicios/ventanas"),
    image: absoluteUrl(ventanasPageContent.image.src),
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
      name: "Tipos de ventanas",
      itemListElement: ventanasPageContent.types.items.map((item) => ({
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
        name: "Ventanas",
        item: absoluteUrl("/servicios/ventanas"),
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
      <VentanasPage />
    </>
  );
}
