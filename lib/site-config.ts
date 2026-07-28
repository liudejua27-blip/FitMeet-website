export const siteConfig = {
  name: "FitMeet",
  companyName: "晤云科技",
  contactEmail: "support@fitmeet.cn",
  copyrightYear: 2026,
  icpRecord: "鲁ICP备2026015946号-4",
  icpRecordURL: "https://beian.miit.gov.cn/",
} as const;

export function contactMailto(subject: string) {
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}`;
}
