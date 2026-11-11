import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { PuertasPage } from "@/features/services/puertas/puertas-page";
import { puertasPageContent } from "@/features/services/puertas/puertas-page.data";

const path = "/servicios/puertas";
const title = "Puertas de aluminio y cristal en Toluca";
const description =
  "Diseño e instalación de puertas de aluminio y cristal en Toluca para accesos, interiores y exteriores con soluciones a medida.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path,
  category: "puertas de aluminio y cristal",
  image: {
    src: puertasPageContent.image.src,
    alt: puertasPageContent.image.alt,
    width: 1983,
    height: 793,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path,
    name: "Puertas de aluminio y cristal",
    serviceType: "Diseño e instalación de puertas",
    description,
    image: puertasPageContent.image.src,
    faqs: [],
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Puertas", path },
    ],
    offers: puertasPageContent.types.items.map((item) => ({
      name: item.title,
      description: item.description,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <PuertasPage />
    </>
  );
}
