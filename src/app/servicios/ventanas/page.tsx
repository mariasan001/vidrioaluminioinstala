import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { VentanasPage } from "@/features/services/ventanas/ventanas-page";
import { ventanasFaq, ventanasPageContent } from "@/features/services/ventanas/ventanas-page.data";

const path = "/servicios/ventanas";
const title = "Ventanas de aluminio en Toluca";
const description =
  "Instalamos ventanas de aluminio a la medida en Toluca y Metepec. Cotización sin costo por WhatsApp o por llamada.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path,
  category: "ventanas de aluminio",
  image: {
    src: "/img/ventanas/hero_web_lcp.webp",
    alt: "Ventana de aluminio y cristal instalada en una casa de Toluca",
    width: 1400,
    height: 933,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path,
    name: "Ventanas de aluminio en Toluca y Metepec",
    serviceType: "Instalación de ventanas de aluminio",
    description,
    image: "/img/ventanas/hero_web_lcp.webp",
    faqs: ventanasFaq.items,
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Ventanas", path },
    ],
    offers: ventanasPageContent.types.items.map((item) => ({
      name: item.label,
      description: item.ideal,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <VentanasPage />
    </>
  );
}
