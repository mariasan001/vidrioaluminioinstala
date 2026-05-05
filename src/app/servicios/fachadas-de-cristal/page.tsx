import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { FachadasPage } from "@/features/services/fachadas/fachadas-page";
import { fachadasPageContent } from "@/features/services/fachadas/fachadas-page.data";

const serviceTitle =
  "Fachadas de cristal en Toluca | Diseño e instalación a medida";
const serviceDescription =
  "Diseño e instalación de fachadas de cristal en Toluca. Soluciones a medida con vidrio templado, aluminio y una presencia moderna para proyectos residenciales y comerciales.";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "fachadas de cristal en Toluca",
    "fachadas de vidrio templado",
    "fachadas de aluminio y cristal",
    "instalación de fachadas de vidrio",
    "fachadas de cristal para comercios",
    "fachadas de cristal templado",
  ],
  alternates: {
    canonical: "/servicios/fachadas-de-cristal",
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
    url: absoluteUrl("/servicios/fachadas-de-cristal"),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: fachadasPageContent.image.src,
        width: 1717,
        height: 916,
        alt: fachadasPageContent.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [fachadasPageContent.image.src],
  },
  category: "fachadas de cristal",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Fachadas de cristal",
    serviceType: "Diseño e instalación de fachadas de cristal",
    description: serviceDescription,
    url: absoluteUrl("/servicios/fachadas-de-cristal"),
    image: absoluteUrl(fachadasPageContent.image.src),
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
      name: "Tipos de fachadas de cristal",
      itemListElement: fachadasPageContent.types.items.map((item) => ({
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
        name: "Fachadas de cristal",
        item: absoluteUrl("/servicios/fachadas-de-cristal"),
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
      <FachadasPage />
    </>
  );
}
