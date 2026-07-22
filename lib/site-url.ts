const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fitmeet.app";

export const configuredSiteUrl = rawSiteUrl.replace(/\/$/, "");

export const metadataBase = new URL(configuredSiteUrl);

export function absoluteSiteUrl(path: string) {
  return `${configuredSiteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
