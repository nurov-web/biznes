import type { MetadataRoute } from "next";

/** Web app manifest — насб дар телефон ва компютер. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Business",
    short_name: "Business",
    description: "Курс, маслиҳат ва нақшаи фурӯш барои соҳибкорони Тоҷикистон",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f4ef",
    theme_color: "#1565c0",
    lang: "tg",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
