import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "All3Rounds — Filipino Battle Rap Archive",
    short_name: "All3Rounds",
    description:
      "Search any FlipTop battle line. Find out who said it, which battle, and watch it instantly.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#facc15",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
