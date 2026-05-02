import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aluminio y Vidrio Instala",
  description:
    "Fabricación e instalación de cancelería, ventanas, puertas y soluciones en aluminio y vidrio para hogares, negocios y proyectos residenciales.",
  keywords: [
    "aluminio",
    "vidrio",
    "cancelería",
    "ventanas de aluminio",
    "puertas de aluminio",
    "fachadas de vidrio",
    "instalación",
  ],
  openGraph: {
    title: "Aluminio y Vidrio Instala",
    description:
      "Diseño, fabricación e instalación de soluciones en aluminio y vidrio con acabados limpios y duraderos.",
    type: "website",
    locale: "es_MX",
  },
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
