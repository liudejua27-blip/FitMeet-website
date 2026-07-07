import Link from "next/link";
import styles from "./SystemTrustPage.module.css";
import type { SystemPageContent } from "./systemPageData";

const navItems = [
  { label: "首页", href: "/" },
  { label: "产品", href: "/product" },
  { label: "场景", href: "/scenes" },
  { label: "社区", href: "/community" },
  { label: "安全", href: "/safety" },
  { label: "关于", href: "/about" },
  { label: "动态", href: "/journal" },
  { label: "联系", href: "/contact" }
];

export function SystemTrustPage({ content }: { content: SystemPageContent }) {
  return (
    <div className={styles.surface} data-system-page>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="FitMeet Home">
          <img className={styles.logo} src="/fitmeet-icon.png" alt="" />
          <span>FitMeet</span>
        </Link>

        <nav className={styles.nav} aria-label="主导航">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.headerCta} href="/contact">
          联系入口
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-label={content.title}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href={content.primaryCta.href}>
                {content.primaryCta.label}
              </Link>
              <Link className={styles.secondaryAction} href={content.secondaryCta.href}>
                {content.secondaryCta.label}
              </Link>
            </div>
          </div>

          <aside className={styles.markerPanel} aria-label={content.marker}>
            <span>SYSTEM RULE</span>
            <strong>{content.marker}</strong>
            <p>Social World 需要清楚的底层协议。每个系统页面都必须帮助用户理解边界，而不是制造更多不确定。</p>
          </aside>
        </section>

        <section className={styles.panelSection} aria-label="系统页面规则">
          {content.panels.map((panel) => (
            <article className={styles.panel} key={panel.id}>
              <span className={styles.panelId}>{panel.id}</span>
              <div className={styles.panelCopy}>
                <h2>{panel.title}</h2>
                <p>{panel.body}</p>
              </div>
              <ul className={styles.panelList}>
                {panel.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className={styles.finalSection} aria-label={content.closing.title}>
          <p className={styles.kicker}>SOCIAL WORLD PROTOCOL</p>
          <h2>{content.closing.title}</h2>
          <p>{content.closing.body}</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/contact">
              进入联系入口
            </Link>
            <Link className={styles.secondaryAction} href="/safety">
              查看 Trust & Safety
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
