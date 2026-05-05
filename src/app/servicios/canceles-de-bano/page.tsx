import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { CancelesPage } from "@/features/services/canceles/canceles-page";
import { cancelesPageContent } from "@/features/services/canceles/canceles-page.data";

const serviceTitle =
  "Canceles de baño en Toluca | Diseño e instalación a medida";
const serviceDescription =
  "Diseño e instalación de canceles de baño en Toluca. Soluciones completas de cancelería para baño con vidrio templado, perfiles limpios y proyectos a medida.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "canceles de baño en Toluca",
    "canceles de baño de aluminio y cristal",
    "canceles con vidrio templado",
    "instalación de canceles de baño",
    "canceles corredizos para baño",
    "diseño de canceles de baño",
    "canceles de baño a medida",
  ],
  alternates: {
    canonical: "/servicios/canceles-de-bano",
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
    url: absoluteUrl("/servicios/canceles-de-bano"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: cancelesPageContent.image.src,
        width: 1983,
        height: 793,
        alt: cancelesPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [cancelesPageContent.image.src],
  },
  category: "canceles de baño",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Canceles de baño",
    serviceType: "Diseño e instalación de canceles de baño",
    description: serviceDescription,
    url: absoluteUrl("/servicios/canceles-de-bano"),
    image: absoluteUrl(cancelesPageContent.image.src),
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
      name: "Tipos de canceles de baño",
      itemListElement: cancelesPageContent.types.items.map((item) => ({
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
        name: "Canceles de baño",
        item: absoluteUrl("/servicios/canceles-de-bano"),
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
      <CancelesPage />
    </>
  );
}
