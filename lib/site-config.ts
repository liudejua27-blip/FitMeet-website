export const siteConfig = {
  name: "FitMeet",
  contactEmail: "1525005312@163.com",
  copyrightYear: 2026,
} as const;

export function contactMailto(subject: string) {
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}`;
}
