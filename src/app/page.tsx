import { HomePage } from "@/features/home/components/home-page";
import {
  localBusinessJsonLd,
  stringifyJsonLd,
} from "@/features/home/home-seo";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(localBusinessJsonLd),
        }}
      />
      <HomePage />
    </>
  );
}
