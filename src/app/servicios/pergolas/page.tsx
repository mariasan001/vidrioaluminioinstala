import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { PergolasPage } from "@/features/services/pergolas/pergolas-page";
import { pergolasPageContent } from "@/features/services/pergolas/pergolas-page.data";

const path = "/servicios/pergolas";
const title = "Pérgolas de aluminio y cristal en Toluca";
const description =
  "Diseño e instalación de pérgolas, domos y techos de vidrio en Toluca con soluciones a medida para sombra, luz y presencia arquitectónica.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path,
  category: "pérgolas y domos",
  image: {
    src: pergolasPageContent.image.src,
    alt: pergolasPageContent.image.alt,
    width: 1983,
    height: 793,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path,
    name: "Pérgolas de aluminio y cristal",
    serviceType: "Diseño e instalación de pérgolas y techos de vidrio",
    description,
    image: pergolasPageContent.image.src,
    faqs: [],
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Pérgolas", path },
    ],
    offers: pergolasPageContent.types.items.map((item) => ({
      name: item.title,
      description: item.description,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <PergolasPage />
    </>
  );
}