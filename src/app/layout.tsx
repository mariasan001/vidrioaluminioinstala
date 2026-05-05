import type { Metadata } from "next";
import { absoluteUrl, homeMetadata, siteUrl } from "@/features/home/home-seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeMetadata.title,
    template: "%s | Aluminio y Vidrio Instala",
  },
  description: homeMetadata.description,
  applicationName: "Aluminio y Vidrio Instala",
  authors: [{ name: "Aurean" }],
  creator: "Aurean",
  publisher: "Aurean",
  keywords: [
    "aluminio y vidrio Toluca",
    "canceler\u00eda en Toluca",
    "ventanas de aluminio",
    "canceles de ba\u00f1o",
    "puertas de aluminio y vidrio",
    "fachadas de vidrio",
    "barandales de vidrio",
    "p\u00e9rgolas de aluminio",
    "Aluminio y Vidrio Instala",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeMetadata.title,
    description: homeMetadata.description,
    url: absoluteUrl(),
    siteName: "Aluminio y Vidrio Instala",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: homeMetadata.image,
        width: 1200,
        height: 630,
        alt: "Casa moderna con soluciones de aluminio y vidrio instaladas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeMetadata.title,
    description: homeMetadata.description,
    images: [homeMetadata.image],
  },
  category: "servicios de construcci\u00f3n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
