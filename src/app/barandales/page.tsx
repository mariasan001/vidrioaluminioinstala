import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { BarandalesLandingPage } from "@/features/landings/barandales/barandales-landing-page";
import { barandalesFaq } from "@/content/services/barandales";
import {
  barandalesHero,
  barandalesSeo,
} from "@/features/landings/barandales/barandales-landing.data";

const pagePath = "/barandales";
const serviceTitle = barandalesSeo.title;
const serviceDescription = barandalesSeo.description;

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
  const schema = serviceSchemaMarkup({
    path: pagePath,
    name: "Barandales en Toluca",
    serviceType: "Diseño e instalación de barandales",
    description: serviceDescription,
    image: barandalesHero.image.src,
    faqs: barandalesFaq.items,
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Barandales", path: pagePath },
    ],
    offers: ["Barandal con botones", "Barandal con miniposte", "Barandal con poste"].map((name) => ({
      name,
      description: `Instalación de ${name.toLowerCase()} a medida en Toluca y Metepec.`,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <BarandalesLandingPage />
    </>
  );
}
