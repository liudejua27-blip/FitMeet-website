"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./site-shell.module.css";

const navigationGroups = [
  {
    id: "explore",
    label: "探索",
    links: [
      { href: "/world", label: "Social World" },
      { href: "/moments", label: "见面片段" },
      { href: "/agent", label: "社交助手" },
      { href: "/app", label: "FitMeet 应用" },
    ],
  },
  {
    id: "trust",
    label: "信任",
    links: [
      { href: "/safety", label: "安全设计" },
      { href: "/support", label: "支持中心" },
      { href: "/community-guidelines", label: "社区准则" },
    ],
  },
  {
    id: "company",
    label: "公司",
    links: [
      { href: "/about", label: "关于 FitMeet" },
      { href: "/contact", label: "联系与合作" },
    ],
  },
  {
    id: "legal",
    label: "法律",
    links: [
      { href: "/privacy", label: "隐私政策" },
      { href: "/terms", label: "服务条款" },
    ],
  },
] as const;

export type SiteNavigationSection = "world" | "moments" | "agent" | "safety" | "app";
type NavigationGroupId = (typeof navigationGroups)[number]["id"];

const sectionPaths: Record<SiteNavigationSection, string> = {
  world: "/world",
  moments: "/moments",
  agent: "/agent",
  safety: "/safety",
  app: "/app",
};

function getActiveGroup(pathname: string): NavigationGroupId | undefined {
  return navigationGroups.find((group) => group.links.some((link) => link.href === pathname))?.id;
}

export function SiteNavigation({
  active,
  context,
  tone = "dark",
}: {
  active?: SiteNavigationSection;
  context?: string;
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<NavigationGroupId | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const currentPath = active ? sectionPaths[active] : pathname;
  const activeGroup = getActiveGroup(currentPath);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className={styles.navigation} data-site-navigation data-tone={tone} ref={headerRef}>
      <Link className={styles.brand} href="/" aria-label="返回 FitMeet 首页">
        <Image src="/brand/fitmeet-logo-v2.png" width={40} height={40} alt="FitMeet 标志" priority />
        <span>FitMeet</span>
        {context ? <><i className={styles.brandDivider} aria-hidden="true" /><strong>{context}</strong></> : null}
      </Link>

      <nav className={styles.links} aria-label="主导航" onMouseLeave={() => setOpenGroup(null)}>
        {navigationGroups.map((group) => {
          const isOpen = openGroup === group.id;
          const isActive = activeGroup === group.id;
          return (
            <div
              className={styles.group}
              key={group.id}
              onMouseEnter={() => setOpenGroup(group.id)}
            >
              <button
                className={isActive ? styles.active : undefined}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`nav-${group.id}`}
                onClick={() => setOpenGroup((current) => current === group.id ? null : group.id)}
              >
                {group.label}
                <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.25 6 6.25l5-5" /></svg>
              </button>
              <div className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ""}`} id={`nav-${group.id}`}>
                <span>{group.label}</span>
                {group.links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    aria-current={currentPath === link.href ? "page" : undefined}
                    onClick={() => setOpenGroup(null)}
                  >
                    {link.label}
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <Link className={`${styles.launch} ${currentPath === "/agent/try" ? styles.launchActive : ""}`} href="/agent/try" aria-current={currentPath === "/agent/try" ? "page" : undefined}>
        <span>进入</span><i aria-hidden="true" />Agent
      </Link>
    </header>
  );
}
