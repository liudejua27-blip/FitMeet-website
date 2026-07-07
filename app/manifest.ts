import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitMeet",
    short_name: "FitMeet",
    description: "Social World：一句想法，变成一次真实到场。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050101",
    theme_color: "#050101",
    categories: ["social", "sports", "travel", "lifestyle"],
    icons: [
      {
        src: absoluteUrl("/fitmeet-icon.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
