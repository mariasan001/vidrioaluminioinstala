import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { BarandalesLandingPage } from "@/features/landings/barandales/barandales-landing-page";
import {
  barandalesFaq,
  barandalesHero,
  barandalesSeo,
  barandalesTypes,
} from "@/features/landings/barandales/barandales-landing.data";

const serviceTitle = barandalesSeo.title;
const serviceDescription = barandalesSeo.description;
const pagePath = "/barandales";

export const metadata: Metadata = {
  title: serviceTitle,
  description: serviceDescription,
  keywords: [
    "barandales en Toluca",
    "barandales de aluminio en Toluca",
    "barandales de vidrio en Toluca",
    "barandales de cristal en Toluca",
    "barandales para escaleras",
    "barandales para balcones",
    "barandales para terrazas",
    "barandales en Metepec",
    "instalación de barandales",
  ],
  alternates: {
    canonical: pagePath,
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
    url: absoluteUrl(pagePath),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: barandalesHero.image.src,
        width: barandalesHero.image.width,
        height: barandalesHero.image.height,
        alt: barandalesHero.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: serviceTitle,
    description: serviceDescription,
    images: [barandalesHero.image.src],
  },
  category: "barandales y cancelería",
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${pagePath}#servicio`),
    name: "Barandales en Toluca",
    serviceType: "Diseño e instalación de barandales",
    description: serviceDescription,
    inLanguage: "es-MX",
    url: absoluteUrl(pagePath),
    mainEntityOfPage: absoluteUrl(pagePath),
    image: absoluteUrl(barandalesHero.image.src),
    provider: {
      "@id": absoluteUrl("/#negocio"),
    },
    areaServed: [
      { "@type": "City", name: "Toluca de Lerdo" },
      { "@type": "City", name: "Metepec" },
      { "@type": "AdministrativeArea", name: "Estado de México" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Barandales según el espacio",
      itemListElement: barandalesTypes.items.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.description,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: barandalesFaq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
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
        name: "Barandales",
        item: absoluteUrl(pagePath),
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
          __html: stringifyJsonLd(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(breadcrumbJsonLd),
        }}
      />
      <BarandalesLandingPage />
    </>
  );
}
