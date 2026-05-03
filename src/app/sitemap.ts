import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/features/home/home-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [
        absoluteUrl("/img/hero_img.webp"),
        absoluteUrl("/img/img_servios_3.webp"),
        absoluteUrl("/img/img_ventana.webp"),
      ],
    },
  ];
}

