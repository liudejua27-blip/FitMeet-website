import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { SiteFooter } from "@/components/site-shell/SiteFooter";
import { SiteNavigation } from "@/components/site-shell/SiteNavigation";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <SiteNavigation context="404" />
      <section className={styles.hero} id="top">
        <div className={styles.route} aria-hidden="true"><i /><i /><i /></div>
        <span>未找到页面 / 404</span>
        <h1>这条路线还没有<br />抵达任何地方</h1>
        <p>也许链接已经改变或者这个页面还没有进入 FitMeet 的 Social World</p>
        <div>
          <Link href="/">返回首页 <FiArrowUpRight aria-hidden="true" /></Link>
          <Link href="/world">进入 Social World</Link>
          <Link href="/app">查看应用</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
