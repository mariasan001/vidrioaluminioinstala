import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { CancelesPage } from "@/features/services/canceles/canceles-page";
import { cancelesFaq, cancelesPageContent } from "@/features/services/canceles/canceles-page.data";

const path = "/servicios/canceles-de-bano";
const title = "Canceles de baño en Toluca y Metepec";
const description =
  "Instalamos tu cancel de baño a la medida en Toluca y Metepec. Mándanos una foto por WhatsApp y te cotizamos sin costo.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path,
  category: "canceles de baño",
  image: {
    src: "/img/cancel_bano/hero_web_lcp.webp",
    alt: "Cancel de baño de cristal templado instalado en un baño residencial",
    width: 1600,
    height: 640,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path,
    name: "Canceles de baño en Toluca y Metepec",
    serviceType: "Instalación de canceles de baño",
    description,
    image: "/img/cancel_bano/hero_web_lcp.webp",
    faqs: cancelesFaq.items,
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/#servicios" },
      { name: "Canceles de baño", path },
    ],
    offers: cancelesPageContent.types.items.map((item) => ({
      name: item.title,
      description: item.description,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <CancelesPage />
    </>
  );
}
