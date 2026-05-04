import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { BarandalesPage } from "@/features/services/barandales/barandales-page";
import { barandalesPageContent } from "@/features/services/barandales/barandales-page.data";

const serviceTitle =
  "Barandales de aluminio y vidrio en Toluca | Escaleras, balcones y terrazas";
const serviceDescription =
  "Diseño e instalación de barandales de aluminio y vidrio para escaleras, balcones y terrazas en Toluca. Soluciones a medida con cristal, herrajes y perfiles limpios para hogar y negocio.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "barandales de aluminio y vidrio en Toluca",
    "barandales de vidrio en Toluca",
    "barandales de aluminio en Toluca",
    "barandales para escaleras",
    "barandales para balcones",
    "barandales para terrazas",
    "instalación de barandales en Toluca",
  ],
  alternates: {
    canonical: "/servicios/barandales",
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
    url: absoluteUrl("/servicios/barandales"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: barandalesPageContent.image.src,
        width: 1200,
        height: 630,
        alt: barandalesPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [barandalesPageContent.image.src],
  },
  category: "barandales y cancelería",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Barandales de aluminio y vidrio",
    serviceType: "Diseño e instalación de barandales",
    description: serviceDescription,
    url: absoluteUrl("/servicios/barandales"),
    image: absoluteUrl(barandalesPageContent.image.src),
    provider: {
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
      name: "Tipos de barandales",
      itemListElement: barandalesPageContent.types.items.map((item) => ({
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
        name: "Barandales",
        item: absoluteUrl("/servicios/barandales"),
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
      <BarandalesPage />
    </>
  );
}
