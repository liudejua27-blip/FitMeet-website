"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiStar,
  FiSun,
  FiUser,
  FiUsers,
  FiWifiOff,
  FiX,
} from "react-icons/fi";
import type {
  AgentThread,
  FitMeetSearchResponse,
  FitMeetSearchResult,
  FitMeetSearchType,
} from "@/lib/fitmeet-api-contract";
import {
  groupedSearchResults,
  normalizedSearchQuery,
  safeSearchResultPath,
  searchQueryLength,
} from "@/lib/fitmeet-search-state";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import { useAccessibleDialog } from "./useAccessibleDialog";
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
  onOpenSearchResult: (result: FitMeetSearchResult) => void;
  onRetrySync: () => void;
  onSearch: (query: string) => Promise<FitMeetSearchResponse>;
};

type ThreadGroup = { label: string; items: AgentThread[] };

export type FitMeetContextField = { label: string; value: string };
export type FitMeetContextLifecycleStage = "draft" | "published" | "matching";

export function FitMeetAgentContextPanel({
  title,
  status,
  fields,
  missingFields,
  candidateCount,
  lifecycleStage,
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
  lifecycleStage: FitMeetContextLifecycleStage;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onEdit: () => void;
  onOpen: () => void;
}) {
  const total = Math.max(fields.length + missingFields.length, 1);
  const progress = Math.round((fields.length / total) * 100);
  const lifecycleIndex = lifecycleStage === "draft" ? 0 : lifecycleStage === "published" ? 1 : 2;
  const lifecycleLabels = ["草稿", "已发布", "匹配"] as const;
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
    <section className={styles.contextLifecycle} aria-label="需求生命周期">
      <strong>发布流程</strong>
      <ol>
        {lifecycleLabels.map((label, index) => <li key={label} data-state={index < lifecycleIndex ? "complete" : index === lifecycleIndex ? "active" : "pending"}>
          <i>{index < lifecycleIndex ? <FiCheck /> : index + 1}</i>
          <span>{label}</span>
        </li>)}
      </ol>
    </section>
    <div className={styles.contextProgress}>
      <div><span>信息完整度</span><strong>{progress}%</strong></div>
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

const mobileDestinationItems: Array<{
  id: FitMeetAppDestination;
  label: string;
  icon: typeof FiCompass;
}> = [
  { id: "home", label: "小福", icon: FiStar },
  ...destinationItems,
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

function searchTypeIcon(type: FitMeetSearchType) {
  if (type === "friend") return FiUser;
  if (type === "group") return FiUsers;
  if (type === "agent_thread") return FiBookOpen;
  return FiMessageCircle;
}

function searchTypeCount(response: FitMeetSearchResponse | null, type: FitMeetSearchType) {
  if (!response) return 0;
  if (type === "agent_thread") return response.counts.agent_threads;
  if (type === "message") return response.counts.messages;
  if (type === "friend") return response.counts.friends;
  return response.counts.groups;
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
  onOpenSearchResult,
  onRetrySync,
  onSearch,
}: FitMeetAgentShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResponse, setSearchResponse] = useState<FitMeetSearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchRequestRef = useRef(0);
  const desktopUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const pendingMobileUtilityRef = useRef<(() => void) | null>(null);
  const deferredMobileUtilityFrameRef = useRef<number | null>(null);
  const mobileDrawerRef = useAccessibleDialog(
    mobileOpen,
    () => setMobileOpen(false),
    mobileSearchInputRef,
  );

  useEffect(() => {
    const storedCollapsed = window.localStorage.getItem("fitmeet:web-sidebar-collapsed:v1");
    const storedTheme = window.localStorage.getItem("fitmeet:web-theme:v1");
    if (storedCollapsed === "true") setCollapsed(true);
    if (storedTheme === "dark") setTheme("dark");
  }, []);

  useEffect(() => {
    if (mobileOpen || !pendingMobileUtilityRef.current) return;
    const onOpen = pendingMobileUtilityRef.current;
    pendingMobileUtilityRef.current = null;
    deferredMobileUtilityFrameRef.current = window.requestAnimationFrame(() => {
      deferredMobileUtilityFrameRef.current = null;
      onOpen();
    });
    return () => {
      if (deferredMobileUtilityFrameRef.current !== null) {
        window.cancelAnimationFrame(deferredMobileUtilityFrameRef.current);
        deferredMobileUtilityFrameRef.current = null;
      }
    };
  }, [mobileOpen]);

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
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileOpen(false);
        onNewThread();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        if (window.innerWidth <= 767) {
          if (mobileOpen) mobileSearchInputRef.current?.focus();
          else setMobileOpen(true);
        } else {
          setCollapsed(false);
          window.localStorage.setItem("fitmeet:web-sidebar-collapsed:v1", "false");
          window.requestAnimationFrame(() => desktopSearchInputRef.current?.focus());
        }
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onNewThread]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const menu = mobileOpen ? mobileUserMenuRef.current : desktopUserMenuRef.current;
      if (!menu?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [mobileOpen, userMenuOpen]);

  const normalizedQuery = useMemo(() => normalizedSearchQuery(query), [query]);
  const normalizedQueryLength = useMemo(() => searchQueryLength(normalizedQuery), [normalizedQuery]);
  const groupedThreads = useMemo(() => groupThreads(threads), [threads]);
  const searchGroups = useMemo(
    () => groupedSearchResults(searchResponse?.items ?? []),
    [searchResponse],
  );

  useEffect(() => {
    const requestId = ++searchRequestRef.current;
    if (normalizedQueryLength < 2) {
      setSearchResponse(null);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }
    setSearchResponse(null);
    setSearchLoading(true);
    setSearchError(null);
    const timer = window.setTimeout(() => {
      void onSearch(normalizedQuery)
        .then((response) => {
          if (requestId !== searchRequestRef.current) return;
          setSearchResponse(response);
        })
        .catch((reason) => {
          if (requestId !== searchRequestRef.current) return;
          setSearchError(reason instanceof Error ? reason.message : "搜索暂时不可用，请稍后重试。");
        })
        .finally(() => {
          if (requestId === searchRequestRef.current) setSearchLoading(false);
        });
    }, 260);
    return () => {
      window.clearTimeout(timer);
      if (searchRequestRef.current === requestId) searchRequestRef.current += 1;
    };
  }, [normalizedQuery, normalizedQueryLength, onSearch, searchAttempt]);

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

  const openSidebarUtility = (
    instance: "desktop" | "mobile",
    onOpen: () => void,
  ) => {
    setUserMenuOpen(false);
    if (instance === "desktop") {
      onOpen();
      return;
    }

    pendingMobileUtilityRef.current = onOpen;
    setMobileOpen(false);
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

  const openGlobalSearchResult = (result: FitMeetSearchResult) => {
    if (!safeSearchResultPath(result)) {
      setSearchError("这条结果已不可访问，请重新搜索。");
      return;
    }
    setQuery("");
    setMobileOpen(false);
    onOpenSearchResult(result);
  };

  const renderSidebar = (instance: "desktop" | "mobile") => (
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
          <input
            ref={instance === "mobile" ? mobileSearchInputRef : desktopSearchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.stopPropagation();
                setQuery("");
              }
            }}
            placeholder="搜索对话、消息、好友或组局"
            aria-label="全局搜索"
            aria-controls={`fitmeet-global-search-results-${instance}`}
          />
          {query ? <button type="button" aria-label="清除搜索" onClick={() => setQuery("")}><FiX /></button> : null}
        </label>
      </div>

      <div className={styles.sidebarScroll}>
        {normalizedQuery ? <section id={`fitmeet-global-search-results-${instance}`} className={styles.globalSearchResults} aria-label="全局搜索结果">
          {normalizedQueryLength < 2 ? <p className={styles.searchHint}>再输入至少 1 个字，搜索你有权限查看的内容。</p> : null}
          {searchLoading ? <p className={styles.searchStatus} role="status"><FiRefreshCw /> 正在安全搜索…</p> : null}
          {searchError ? <div className={styles.searchError} role="alert"><span>{searchError}</span><button type="button" onClick={() => setSearchAttempt((value) => value + 1)}>重试</button></div> : null}
          {!searchLoading && !searchError && normalizedQueryLength >= 2 && searchGroups.length ? searchGroups.map((group) => <div className={styles.searchGroup} key={group.type}>
            <div className={styles.sectionLabel}><span>{group.label}</span><b>{searchTypeCount(searchResponse, group.type)}</b></div>
            {group.items.map((item) => {
              const Icon = searchTypeIcon(item.type);
              return <button type="button" className={styles.searchResultButton} key={`${item.type}-${item.id}`} onClick={() => openGlobalSearchResult(item)}>
                <Icon />
                <span><strong>{item.title}</strong><small>{item.snippet || item.subtitle || "打开查看最新内容"}</small></span>
              </button>;
            })}
          </div>) : null}
          {!searchLoading && !searchError && normalizedQueryLength >= 2 && searchResponse && !searchGroups.length ? <p className={styles.searchHint}>没有找到你当前有权限查看的内容。</p> : null}
          {normalizedQueryLength >= 2 ? <p className={styles.searchBoundary}>结果会在服务端按成员关系、好友状态和拉黑关系过滤。</p> : null}
        </section> : <>
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
          </div>) : <p className={styles.emptyHistory}>开始对话后，历史会出现在这里。</p>}
        </section>
        </>}
      </div>

      <footer ref={instance === "mobile" ? mobileUserMenuRef : desktopUserMenuRef} className={styles.sidebarFooter}>
        <div id={`fitmeet-user-menu-${instance}`} className={`${styles.userMenu} ${userMenuOpen ? styles.userMenuOpen : ""}`}>
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
            <button type="button" onClick={() => openSidebarUtility(instance, onOpenSettings)}><FiSettings /><span>设置与隐私</span></button>
            <button type="button" onClick={() => openSidebarUtility(instance, onOpenHelp)}><FiHelpCircle /><span>帮助与安全</span></button>
          </div>
        </div>

        <button
          type="button"
          className={styles.userButton}
          onClick={() => setUserMenuOpen((current) => !current)}
          aria-label={`打开用户菜单：${nickname || "FitMeet 用户"}`}
          aria-expanded={userMenuOpen}
          aria-controls={`fitmeet-user-menu-${instance}`}
        >
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

  return <section className={`${styles.shell} ${collapsed ? styles.collapsed : ""} ${theme === "dark" ? styles.dark : ""}`} data-theme={theme} data-destination={activeDestination}>
    <div className={styles.desktopSidebar} aria-hidden={mobileOpen || undefined}>{renderSidebar("desktop")}</div>

    {mobileOpen ? <div className={styles.mobileShade} role="presentation" onMouseDown={() => setMobileOpen(false)}>
      <div ref={mobileDrawerRef as React.RefObject<HTMLDivElement | null>} className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="对话与导航" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.drawerHandle} />
        {renderSidebar("mobile")}
      </div>
    </div> : null}

    <main className={styles.workspace} aria-hidden={mobileOpen || undefined} inert={mobileOpen || undefined}>
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
      {realtimeStatus !== "connected" ? <div className={styles.connectionBanner} data-status={realtimeStatus} role="status" aria-live="polite">
        <FiWifiOff />
        <span>{realtimeStatus === "reconnecting" ? "实时连接中断，正在重连；你的草稿保留在本机。" : realtimeStatus === "connecting" ? "正在连接实时消息；现有页面内容仍可查看。" : "实时连接暂不可用；已提交内容仍以服务端结果为准。"}</span>
        <button type="button" onClick={onRetrySync}><FiRefreshCw /> 重新同步</button>
      </div> : null}
      <div className={styles.workspaceBody}>{children}</div>
      <nav className={styles.mobilePrimaryNav} aria-label="FitMeet 主导航">
        {mobileDestinationItems.map((item) => {
          const Icon = item.icon;
          const active = activeDestination === item.id;
          return <button
            type="button"
            key={item.id}
            className={active ? styles.mobilePrimaryNavActive : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(item.id)}
          >
            <span><Icon />{item.id === "messages" && unreadCount ? <b>{unreadCount > 99 ? "99+" : unreadCount}</b> : null}</span>
            <small>{item.label}</small>
          </button>;
        })}
      </nav>
    </main>

    {contextPanel ? <aside className={styles.context} aria-label="当前任务上下文">{contextPanel}</aside> : null}
  </section>;
}
