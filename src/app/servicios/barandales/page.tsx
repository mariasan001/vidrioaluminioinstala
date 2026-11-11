import { buildServiceMetadata, ServiceJsonLdScripts, serviceSchemaMarkup } from "@/features/conversion/service-seo";
import { BarandalesPage } from "@/features/services/barandales/barandales-page";
import { barandalesPageContent } from "@/features/services/barandales/barandales-page.data";

/** Canonical apunta a la landing de conversión para evitar canibalización. */
const canonicalPath = "/barandales";
const title = "Barandales de aluminio y vidrio en Toluca";
const description =
  "Diseño e instalación de barandales de aluminio y vidrio en Toluca para escaleras, balcones y terrazas, con soluciones a medida para hogar y negocio.";

export const metadata = buildServiceMetadata({
  title,
  description,
  path: canonicalPath,
  category: "barandales y cancelería",
  image: {
    src: barandalesPageContent.image.src,
    alt: barandalesPageContent.image.alt,
    width: 1717,
    height: 916,
  },
});

export default function Page() {
  const schema = serviceSchemaMarkup({
    path: canonicalPath,
    name: "Barandales de aluminio y vidrio",
    serviceType: "Diseño e instalación de barandales",
    description,
    image: barandalesPageContent.image.src,
    faqs: [],
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Barandales", path: canonicalPath },
    ],
    offers: barandalesPageContent.types.items.map((item) => ({
      name: item.title,
      description: item.description,
    })),
  });

  return (
    <>
      <ServiceJsonLdScripts schema={schema} />
      <BarandalesPage />
    </>
  );
}
