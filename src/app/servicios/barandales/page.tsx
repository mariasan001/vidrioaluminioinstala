import type { Metadata } from "next";
import { absoluteUrl, businessInfo, stringifyJsonLd } from "@/features/home/home-seo";
import { BarandalesPage } from "@/features/services/barandales/barandales-page";
import { barandalesPageContent } from "@/features/services/barandales/barandales-page.data";

export const metadata: Metadata = {
  title: "Barandales de aluminio y vidrio en Toluca",
  description:
    "Diseño e instalación de barandales de aluminio y vidrio para escaleras, balcones y terrazas en Toluca y alrededores.",
  alternates: {
    canonical: "/servicios/barandales",
  },
  openGraph: {
    title: "Barandales de aluminio y vidrio en Toluca",
    description: barandalesPageContent.description,
    url: "/servicios/barandales",
    images: [
      {
        url: barandalesPageContent.image.src,
        width: 1254,
        height: 1254,
        alt: barandalesPageContent.image.alt,
      },
    ],
  },
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Barandales de aluminio y vidrio",
    serviceType: "Diseño e instalación de barandales",
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: businessInfo.name,
      telephone: businessInfo.phoneInternational,
      areaServed: "Toluca y alrededores",
    },
    areaServed: {
      "@type": "City",
      name: "Toluca de Lerdo",
    },
    description: barandalesPageContent.description,
    url: absoluteUrl("/servicios/barandales"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(serviceJsonLd),
        }}
      />
      <BarandalesPage />
    </>
  );
}
