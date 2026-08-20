import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/site-url";

const routes = [
  "",
  "/world",
  "/moments",
  "/agent",
  "/safety",
  "/support",
  "/app",
  "/about",
  "/contact",
  "/community-guidelines",
  "/privacy",
  "/privacy/third-parties",
  "/terms",
  "/legal/versions",
  "/legal/versions/terms-1.0",
  "/legal/versions/privacy-1.0",
  "/legal/versions/privacy-1.1",
  "/legal/versions/privacy-1.2",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-29T00:00:00+08:00");
  return routes.flatMap((route) => {
    const url = absoluteSiteUrl(route || "/");
    if (!url) return [];
    return [{ url, lastModified: now, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 }];
  });
}
