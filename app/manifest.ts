import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CACNA Convention",
    short_name: "CACNA",
    description: "Christ Apostolic Church North America Convention",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b1010",
    icons: [
      { src: "/brand/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
