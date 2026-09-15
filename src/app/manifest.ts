import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

/** Web app manifest — насб дар телефон ва компютер. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BusinessPilot",
    short_name: "BusinessPilot",
    description: "Курс, маслиҳат ва нақшаи фурӯш барои соҳибкорони Тоҷикистон",
    start_url: "/tg?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f4ef",
    theme_color: "#1565c0",
    lang: "tg",
    dir: "ltr",
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    related_applications: [
      {
        platform: "webapp",
        url: `${siteOrigin()}/manifest.webmanifest`,
      },
    ],
    icons: [
      {
        src: "/pwa/mark-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/mark-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
