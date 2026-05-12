import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/features/home/home-seo";

export const dynamic = "force-static";

const LAST_MODIFIED = new Date("2026-05-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
      images: [
        absoluteUrl("/img/hero_img.webp"),
        absoluteUrl("/img/img_servios_3.webp"),
        absoluteUrl("/img/img_ventana.webp"),
      ],
    },
    {
      url: absoluteUrl("/servicios/barandales"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/img_barandal.webp")],
    },
    {
      url: absoluteUrl("/servicios/canceles-de-bano"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/cancel_bano/hero_web.webp")],
    },
    {
      url: absoluteUrl("/servicios/fachadas-de-cristal"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/fachadas/hero_web.webp")],
    },
    {
      url: absoluteUrl("/servicios/pergolas"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/pergolas/hero_web.webp")],
    },
    {
      url: absoluteUrl("/servicios/puertas"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/puertas/hero_web.webp")],
    },
    {
      url: absoluteUrl("/servicios/ventanas"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.86,
      images: [absoluteUrl("/img/ventanas/hero_web.webp")],
    },
  ];
}
