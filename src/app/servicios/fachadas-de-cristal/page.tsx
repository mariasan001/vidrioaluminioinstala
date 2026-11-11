import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { FachadasPage } from "@/features/services/fachadas/fachadas-page";
import { fachadasPageContent } from "@/features/services/fachadas/fachadas-page.data";

const path = "/servicios/fachadas-de-cristal";
const title = "Fachadas de cristal en Toluca";
const description =
  "Diseño e instalación de fachadas de cristal en Toluca con vidrio templado y aluminio para proyectos residenciales y comerciales a medida.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path,
  category: "fachadas de cristal",
  image: {
    src: fachadasPageContent.image.src,
    alt: fachadasPageContent.image.alt,
    width: 1717,
    height: 916,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path,
    name: "Fachadas de cristal",
    serviceType: "Diseño e instalación de fachadas de cristal",
    description,
    image: fachadasPageContent.image.src,
    faqs: [],
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Fachadas de cristal", path },
    ],
    offers: fachadasPageContent.types.items.map((item) => ({
      name: item.title,
      description: item.description,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <FachadasPage />
    </>
  );
}
