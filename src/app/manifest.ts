import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Enfoca Tu Ser: Un camino para soltar y volver a ti",
    short_name: "Enfoca Tu Ser",
    description:
      "Un espacio cálido para escucharte, soltar peso emocional y avanzar con presencia.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F1E8",
    theme_color: "#016DBF",
    orientation: "portrait-primary",
    lang: "es",
    categories: ["lifestyle", "health"],
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
    ],
    shortcuts: [
      { name: "Mi camino", short_name: "Camino", url: "/camino" },
      { name: "Soltar ahora", short_name: "Soltar", url: "/soltar" },
      { name: "Mi diario", short_name: "Diario", url: "/diario" },
    ],
  };
}
