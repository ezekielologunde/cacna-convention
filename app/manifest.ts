import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CACNA Convention",
    short_name: "CACNA",
    description: "Christ Apostolic Church North America Convention",
    start_url: "/",
    display: "standalone",
    background_color: "#fff4ef",
    theme_color: "#c13a22",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon.png", sizes: "270x270", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
