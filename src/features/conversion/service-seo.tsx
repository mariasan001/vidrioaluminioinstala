import type { Metadata } from "next";
import { absoluteUrl, businessInfo, localBusinessJsonLd, stringifyJsonLd } from "@/features/home/home-seo";
import type { FaqItem } from "./service-faq";

type ServiceMetaInput = {
  title: string;
  description: string;
  path: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  category: string;
};

export function buildServiceMetadata({
  title,
  description,
  path,
  image,
  category,
}: ServiceMetaInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.src);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
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
      title,
      description,
      url,
      siteName: businessInfo.name,
      type: "website",
      locale: "es_MX",
      images: [
        {
          url: imageUrl,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    category,
  };
}

type ServiceSchemaInput = {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  image: string;
  faqs: readonly FaqItem[];
  breadcrumb: readonly { name: string; path: string }[];
  offers: readonly { name: string; description: string }[];
};

export function serviceSchemaMarkup({
  path,
  name,
  serviceType,
  description,
  image,
  faqs,
  breadcrumb,
  offers,
}: ServiceSchemaInput) {
  const url = absoluteUrl(path);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#servicio`,
    name,
    serviceType,
    description,
    inLanguage: "es-MX",
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(image),
    provider: { "@id": absoluteUrl("/#negocio") },
    areaServed: localBusinessJsonLd.areaServed,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name,
      itemListElement: offers.map((offer) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: offer.name,
          description: offer.description,
        },
      })),
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
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
    itemListElement: breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return { serviceJsonLd, faqJsonLd, breadcrumbJsonLd, businessJsonLd: localBusinessJsonLd };
}

export function ServiceJsonLdScripts({
  schema,
}: {
  schema: ReturnType<typeof serviceSchemaMarkup>;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema.businessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema.serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema.faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema.breadcrumbJsonLd) }}
      />
    </>
  );
}
