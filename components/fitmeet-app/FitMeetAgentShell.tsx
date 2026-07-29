"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCompass,
  FiEdit3,
  FiFileText,
  FiHelpCircle,
  FiMenu,
  FiMessageCircle,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import type { AgentThread } from "@/lib/fitmeet-api-contract";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-agent-shell.module.css";

export type FitMeetAppDestination = "home" | "moments" | "messages" | "profile";

type RealtimeStatus = "offline" | "connecting" | "connected" | "reconnecting";

type FitMeetAgentShellProps = {
  activeDestination: FitMeetAppDestination;
  activeThreadId?: string;
  activeThreadTitle?: string;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  currentDemandTitle?: string;
  currentDemandStatus?: string;
  nickname: string;
  realtimeStatus: RealtimeStatus;
  threads: AgentThread[];
  unreadCount: number;
  onDestination: (destination: FitMeetAppDestination) => void;
  onNewThread: () => void;
  onOpenHelp: () => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  onOpenThread: (threadId: string) => void;
};

type ThreadGroup = { label: string; items: AgentThread[] };

export type FitMeetContextField = { label: string; value: string };

export function FitMeetAgentContextPanel({
  title,
  status,
  fields,
  missingFields,
  candidateCount,
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  onEdit,
  onOpen,
}: {
  title: string;
  status: string;
  fields: FitMeetContextField[];
  missingFields: string[];
  candidateCount: number;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onEdit: () => void;
  onOpen: () => void;
}) {
  const total = Math.max(fields.length + missingFields.length, 1);
  const progress = Math.round((fields.length / total) * 100);
  return <div className={styles.contextPanel}>
    <header>
      <div><strong>当前需求</strong><small>所有真实动作都需要你确认</small></div>
      <button type="button" onClick={onEdit}><FiEdit3 /> 编辑</button>
    </header>
    <section className={styles.contextCard}>
      <div className={styles.contextCardTitle}><strong>{title}</strong><span>{status}</span></div>
      <dl>
        {fields.slice(0, 7).map((field) => <div key={`${field.label}-${field.value}`}><dt><FiCheck />{field.label}</dt><dd>{field.value}</dd></div>)}
        {missingFields.slice(0, 3).map((field) => <div className={styles.contextMissing} key={field}><dt><FiPlus />{field}</dt><dd>等待补充</dd></div>)}
      </dl>
      {candidateCount ? <button type="button" className={styles.contextCandidates} onClick={onOpen}><FiUsers /><span><strong>{candidateCount} 位真实候选人</strong><small>查看共同点与安全边界</small></span><FiChevronDown /></button> : null}
    </section>
    <div className={styles.contextProgress}>
      <div><span>完成进度</span><strong>{progress}%</strong></div>
      <i><b style={{ width: `${progress}%` }} /></i>
    </div>
    <p className={styles.contextNote}>确认后只会提交当前这一步；生成需求卡不会自动发布，发送邀请也不会自动开启私信。</p>
    <button type="button" className={styles.contextPrimary} disabled={primaryDisabled} onClick={onPrimary}>{primaryLabel}<FiChevronDown /></button>
  </div>;
}

const destinationItems: Array<{
  id: Exclude<FitMeetAppDestination, "home">;
  label: string;
  icon: typeof FiCompass;
}> = [
  { id: "moments", label: "发现", icon: FiCompass },
  { id: "messages", label: "消息", icon: FiMessageCircle },
  { id: "profile", label: "我的", icon: FiUser },
];

function dayStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

function groupThreads(threads: AgentThread[]): ThreadGroup[] {
  const today = dayStart(new Date());
  const oneDay = 24 * 60 * 60 * 1000;
  const groups: Record<string, AgentThread[]> = {
    "今天": [],
    "昨天": [],
    "最近 7 天": [],
    "最近 30 天": [],
    "更早": [],
  };

  threads.forEach((thread) => {
    const updated = new Date(thread.updatedAt || thread.createdAt).getTime();
    const age = today - dayStart(new Date(Number.isFinite(updated) ? updated : today));
    const label = age < oneDay
      ? "今天"
      : age < oneDay * 2
        ? "昨天"
        : age < oneDay * 7
          ? "最近 7 天"
          : age < oneDay * 30
            ? "最近 30 天"
            : "更早";
    groups[label].push(thread);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length)
    .map(([label, items]) => ({ label, items }));
}

function statusLabel(status: RealtimeStatus) {
  if (status === "connected") return "实时在线";
  if (status === "reconnecting") return "正在重连";
  if (status === "offline") return "离线，待恢复";
  return "正在连接";
}

export function FitMeetAgentShell({
  activeDestination,
  activeThreadId,
  activeThreadTitle,
  children,
  contextPanel,
  currentDemandTitle,
  currentDemandStatus,
  nickname,
  realtimeStatus,
  threads,
  unreadCount,
  onDestination,
  onNewThread,
  onOpenHelp,
  onOpenMemory,
  onOpenSettings,
  onOpenThread,
}: FitMeetAgentShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedCollapsed = window.localStorage.getItem("fitmeet:web-sidebar-collapsed:v1");
    const storedTheme = window.localStorage.getItem("fitmeet:web-theme:v1");
    if (storedCollapsed === "true") setCollapsed(true);
    if (storedTheme === "dark") setTheme("dark");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((current) => {
          const next = !current;
          window.localStorage.setItem("fitmeet:web-sidebar-collapsed:v1", String(next));
          return next;
        });
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    if (!normalizedQuery) return threads;
    return threads.filter((thread) => `${thread.title} ${thread.preview || ""}`.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
  }, [query, threads]);
  const groupedThreads = useMemo(() => groupThreads(visibleThreads), [visibleThreads]);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("fitmeet:web-sidebar-collapsed:v1", String(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem("fitmeet:web-theme:v1", next);
      return next;
    });
  };

  const navigate = (destination: FitMeetAppDestination) => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    onDestination(destination);
  };

  const openThread = (threadId: string) => {
    setMobileOpen(false);
    onOpenThread(threadId);
  };

  const sidebar = (
    <aside className={styles.sidebar} aria-label="FitMeet 对话导航">
      <header className={styles.sidebarHeader}>
        <button type="button" className={styles.brandButton} onClick={() => navigate("home")} aria-label="返回小福">
          <FitMeetBrandIcon size={28} priority />
          <strong>FitMeet</strong>
        </button>
        <button type="button" className={styles.collapseButton} onClick={toggleCollapsed} aria-label={collapsed ? "展开侧栏" : "折叠侧栏"} title={`${collapsed ? "展开" : "折叠"}侧栏 · ⌘/Ctrl B`}>
          <FiMenu />
        </button>
        <button type="button" className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="关闭导航"><FiX /></button>
      </header>

      <div className={styles.sidebarPrimary}>
        <button type="button" className={styles.newChatButton} onClick={() => { setMobileOpen(false); onNewThread(); }}>
          <FiEdit3 /><span>新对话</span><kbd>⌘ K</kbd>
        </button>
        <label className={styles.searchField}>
          <FiSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索对话" aria-label="搜索对话" />
        </label>
      </div>

      <div className={styles.sidebarScroll}>
        {currentDemandTitle ? <section className={styles.activeDemandSection}>
          <div className={styles.sectionLabel}><span>进行中的需求</span></div>
          <button type="button" className={styles.activeDemandButton} onClick={() => navigate("home")}>
            <i />
            <span><strong>{currentDemandTitle}</strong><small>{currentDemandStatus || "等待你继续"}</small></span>
            <FiChevronDown />
          </button>
        </section> : null}

        <section className={styles.historySection} aria-label="对话历史">
          {groupedThreads.length ? groupedThreads.map((group) => <div className={styles.threadGroup} key={group.label}>
            <div className={styles.sectionLabel}><span>{group.label}</span></div>
            {group.items.map((thread) => <button
              type="button"
              key={thread.id}
              className={`${styles.threadButton} ${thread.id === activeThreadId ? styles.threadButtonActive : ""}`}
              onClick={() => openThread(thread.id)}
              title={thread.title}
              aria-current={thread.id === activeThreadId ? "page" : undefined}
            >
              <FiMessageCircle />
              <span><strong>{thread.title || "新的想法"}</strong><small>{thread.preview || "等待你继续"}</small></span>
            </button>)}
          </div>) : <p className={styles.emptyHistory}>{query ? "没有找到相关对话" : "开始对话后，历史会出现在这里。"}</p>}
        </section>
      </div>

      <footer className={styles.sidebarFooter}>
        <div id="fitmeet-user-menu" className={`${styles.userMenu} ${userMenuOpen ? styles.userMenuOpen : ""}`}>
          <nav aria-label="用户导航">
            {destinationItems.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.id} aria-label={item.label} className={activeDestination === item.id ? styles.userMenuActive : ""} onClick={() => navigate(item.id)}>
                <Icon /><span>{item.label}</span>{item.id === "messages" && unreadCount ? <b>{unreadCount > 99 ? "99+" : unreadCount}</b> : null}
              </button>;
            })}
          </nav>
          <div className={styles.userMenuUtilities}>
            <button type="button" onClick={toggleTheme}>{theme === "light" ? <FiMoon /> : <FiSun />}<span>{theme === "light" ? "深色模式" : "浅色模式"}</span></button>
            <button type="button" onClick={() => { setUserMenuOpen(false); onOpenSettings(); }}><FiSettings /><span>设置与隐私</span></button>
            <button type="button" onClick={() => { setUserMenuOpen(false); onOpenHelp(); }}><FiHelpCircle /><span>帮助与安全</span></button>
          </div>
        </div>

        <button type="button" className={styles.userButton} onClick={() => setUserMenuOpen((current) => !current)} aria-expanded={userMenuOpen} aria-controls="fitmeet-user-menu">
          <span className={styles.userAvatar}>{(nickname || "F").slice(0, 1)}</span>
          <span className={styles.userIdentity}><strong>{nickname || "FitMeet 用户"}</strong><small>{unreadCount ? `${unreadCount} 条未读消息` : realtimeStatus === "offline" ? "预览模式 · 未连接账号" : "账号数据已同步"}</small></span>
          {userMenuOpen ? <FiChevronDown /> : <FiChevronUp />}
        </button>
      </footer>
    </aside>
  );

  const screenTitle = activeDestination === "home"
    ? activeThreadTitle || "小福"
    : activeDestination === "moments"
      ? "发现"
      : activeDestination === "messages"
        ? "消息"
        : "我的";

  return <section className={`${styles.shell} ${collapsed ? styles.collapsed : ""} ${theme === "dark" ? styles.dark : ""}`} data-theme={theme}>
    <div className={styles.desktopSidebar}>{sidebar}</div>

    {mobileOpen ? <div className={styles.mobileShade} role="presentation" onMouseDown={() => setMobileOpen(false)}>
      <div className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="对话与导航" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.drawerHandle} />
        {sidebar}
      </div>
    </div> : null}

    <main className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <button type="button" className={styles.mobileMenuButton} onClick={() => setMobileOpen(true)} aria-label="打开对话与导航"><FiMenu /></button>
        <div className={styles.mobileBrand}><FitMeetBrandIcon size={30} priority /></div>
        <div className={styles.workspaceTitle}>
          <strong>{screenTitle}</strong>
          <small><i className={styles[`status_${realtimeStatus}`]} />{activeDestination === "home" ? statusLabel(realtimeStatus) : realtimeStatus === "offline" ? "预览模式 · 未连接账号" : "FitMeet 真实账号数据"}</small>
        </div>
        <div className={styles.headerActions}>
          {activeDestination === "home" ? <button type="button" onClick={onOpenMemory} aria-label="查看人物画像" title="人物画像"><FiBookOpen /></button> : null}
          {currentDemandTitle ? <button type="button" className={styles.mobileDemandButton} onClick={() => navigate("home")}><FiFileText /><span>当前需求</span></button> : null}
        </div>
      </header>
      <div className={styles.workspaceBody}>{children}</div>
    </main>

    {contextPanel ? <aside className={styles.context} aria-label="当前任务上下文">{contextPanel}</aside> : null}
  </section>;
}
