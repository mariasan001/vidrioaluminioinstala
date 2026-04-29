import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aluminio y Vidrio Instala",
  description:
    "Fabricacion e instalacion de canceleria, ventanas, puertas y soluciones en aluminio y vidrio para hogares, negocios y proyectos residenciales.",
  keywords: [
    "aluminio",
    "vidrio",
    "canceleria",
    "ventanas de aluminio",
    "puertas de aluminio",
    "fachadas de vidrio",
    "instalacion",
  ],
  openGraph: {
    title: "Aluminio y Vidrio Instala",
    description:
      "Diseno, fabricacion e instalacion de soluciones en aluminio y vidrio con acabados limpios y duraderos.",
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
