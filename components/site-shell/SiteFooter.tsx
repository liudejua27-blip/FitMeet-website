import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./site-footer.module.css";

const footerLinks = [
  { href: "/community-guidelines", label: "社区准则" },
  { href: "/privacy", label: "隐私政策" },
  { href: "/privacy/third-parties", label: "第三方信息清单" },
  { href: "/terms", label: "服务条款" },
  { href: "/legal/versions", label: "法律版本" },
  { href: "/contact", label: "联系" },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer} data-site-footer>
      <div className={styles.operator}>
        <span>© {siteConfig.copyrightYear} {siteConfig.legalEntityName} · {siteConfig.name}</span>
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </div>
      <div className={styles.legalCenter}>
        <nav aria-label="页脚导航">
          {footerLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <a href={siteConfig.icpRecordURL} rel="noreferrer">
          {siteConfig.icpRecord}
        </a>
      </div>
      <a className={styles.toTop} href="#top">
        返回顶部
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" /></svg>
      </a>
    </footer>
  );
}
