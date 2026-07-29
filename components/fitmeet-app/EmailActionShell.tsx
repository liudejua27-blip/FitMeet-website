import Link from 'next/link';
import type { ReactNode } from 'react';
import { FiShield } from 'react-icons/fi';
import { FitMeetBrandIcon } from './FitMeetBrandIcon';
import styles from './email-action.module.css';

export function EmailActionShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="email-action-title">
        <Link className={styles.brand} href="/" aria-label="返回 FitMeet 首页">
          <FitMeetBrandIcon size={48} priority src="/brand/fitmeet-login-icon.png" />
          <strong>FitMeet</strong>
        </Link>

        <article className={styles.panel}>
          <header className={styles.header}>
            <span>{eyebrow}</span>
            <h1 id="email-action-title">{title}</h1>
            <p>{description}</p>
          </header>
          {children}
          <footer className={styles.footer}>
            <p><FiShield aria-hidden="true" /> 此页面不会在浏览器中保存邮件链接凭证。</p>
            <nav aria-label="账号帮助">
              <Link href="/agent/try">返回登录</Link>
              <a href="mailto:support@fitmeet.cn">联系支持</a>
              <Link href="/privacy">隐私政策</Link>
            </nav>
          </footer>
        </article>
      </section>
    </main>
  );
}
