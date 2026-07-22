import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/site-url";

const routes = ["", "/world", "/moments", "/agent", "/safety", "/support", "/app", "/about", "/contact", "/community-guidelines", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-11T00:00:00+08:00");
  return routes.flatMap((route) => {
    const url = absoluteSiteUrl(route || "/");
    if (!url) return [];
    return [{ url, lastModified: now, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 }];
  });
}
