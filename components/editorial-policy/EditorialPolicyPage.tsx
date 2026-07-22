import Link from "next/link";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import styles from "./editorial-policy.module.css";

type PolicySection = {
  index: string;
  title: string;
  body: string[];
};

type EditorialPolicyPageProps = {
  eyebrow: string;
  title: [string, string];
  introduction: string;
  status?: string;
  sections: PolicySection[];
  relatedHref: string;
  relatedLabel: string;
  navigationContext: string;
  version: string;
  effectiveDate: string;
  updatedAt: string;
};

export function EditorialPolicyPage({
  eyebrow,
  title,
  introduction,
  status,
  sections,
  relatedHref,
  relatedLabel,
  navigationContext,
  version,
  effectiveDate,
  updatedAt,
}: EditorialPolicyPageProps) {
  return (
    <main className={styles.page}>
      <SiteNavigation context={navigationContext} />

      <header className={styles.hero} id="top">
        <div className={styles.heroOrbit} aria-hidden="true"><i /><i /><i /><span /></div>
        <div className={styles.heroCopy}>
          <span>{eyebrow}</span>
          <h1>{title[0]}<br />{title[1]}</h1>
          <p>{introduction}</p>
          {status ? <div className={styles.reviewState}><i />{status}</div> : null}
          <dl className={styles.documentMeta}>
            <div><dt>版本</dt><dd>{version}</dd></div>
            <div><dt>生效日期</dt><dd>{effectiveDate}</dd></div>
            <div><dt>更新日期</dt><dd>{updatedAt}</dd></div>
          </dl>
        </div>
        <a className={styles.readCue} href="#document"><i />开始阅读</a>
      </header>

      <section className={styles.document} id="document">
        <aside>
          <span>文档目录</span>
          <nav aria-label="文档目录">
            {sections.map((section) => <a href={`#section-${section.index}`} key={section.index}>{section.index} {section.title}</a>)}
          </nav>
          <Link href="/safety"><FiArrowLeft aria-hidden="true" /> 返回安全设计</Link>
          <Link href="/support">需要支持或反馈</Link>
        </aside>

        <article>
          {sections.map((section) => (
            <section id={`section-${section.index}`} key={section.index}>
              <div><span>{section.index}</span><i /><strong>{section.title}</strong></div>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </section>

      <footer className={styles.footer}>
        <span>下一份文档</span>
        <Link href={relatedHref}>{relatedLabel}<FiArrowUpRight aria-hidden="true" /></Link>
        <div><span>© 2026 FitMeet</span><Link href="/">Social World</Link></div>
      </footer>
      <SiteFooter />
    </main>
  );
}
