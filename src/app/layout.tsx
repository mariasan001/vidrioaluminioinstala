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
    "cancelería en Toluca",
    "ventanas de aluminio",
    "canceles de baño",
    "puertas de aluminio y vidrio",
    "fachadas de vidrio",
    "barandales de vidrio",
    "pérgolas de aluminio",
    "Aluminio y Vidrio Instala",
  ],
  alternates: {
    canonical: "/",
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
  category: "servicios de construcción",
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
