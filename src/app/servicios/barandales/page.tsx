import type { Metadata } from "next";
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
  return <BarandalesPage />;
}
