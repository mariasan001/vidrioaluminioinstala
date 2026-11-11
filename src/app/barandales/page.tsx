import { absoluteUrl, localBusinessJsonLd, stringifyJsonLd } from "@/features/home/home-seo";
import { buildServiceMetadata } from "@/features/conversion/service-seo";
import { BarandalesLandingPage } from "@/features/landings/barandales/barandales-landing-page";
import { barandalesFaq } from "@/content/services/barandales";
import {
  barandalesHero,
  barandalesSeo,
} from "@/features/landings/barandales/barandales-landing.data";

const serviceTitle = barandalesSeo.title;
const serviceDescription = barandalesSeo.description;
const pagePath = "/barandales";

export const metadata = buildServiceMetadata({
  title: serviceTitle,
  description: serviceDescription,
  path: pagePath,
  category: "barandales",
  image: {
    src: barandalesHero.image.src,
    alt: barandalesHero.image.alt,
    width: barandalesHero.image.width,
    height: barandalesHero.image.height,
  },
});

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
      name: "Tipos de barandal",
      itemListElement: ["Barandal con botones", "Barandal con miniposte", "Barandal con poste"].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: barandalesFaq.items
      .filter((item) => item.answer)
      .map((item) => ({
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
          __html: stringifyJsonLd(localBusinessJsonLd),
        }}
      />
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
