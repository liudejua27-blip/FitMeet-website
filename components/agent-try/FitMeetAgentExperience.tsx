"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUp,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiEdit3,
  FiHeart,
  FiHome,
  FiImage,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiMic,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import styles from "./fitmeet-agent-experience.module.css";

type TabId = "home" | "moments" | "agent" | "messages" | "profile";
type MessageRole = "assistant" | "user";
type PlanState = "none" | "draft" | "confirmed";
type Overlay = "candidate" | "invite" | "conversation" | "memory" | "publish" | "profile" | null;

type ChatMessage = {
  id: number;
  role: MessageRole;
  body: string;
};

type Candidate = {
  id: string;
  name: string;
  subtitle: string;
  reason: string;
  tags: string[];
  city: string;
  initial: string;
  palette: string;
};

const candidate: Candidate = {
  id: "lin-yi",
  name: "林一",
  subtitle: "羽毛球 · 中级",
  reason: "时间、水平与活动节奏相近",
  tags: ["周末可约", "公共场馆", "AA 更自在"],
  city: "静安",
  initial: "一",
  palette: "#7a8eff",
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    body: "嗨，你好呀！😊 我是小福。今天怎么样？你想和谁一起做点什么，可以慢慢说。",
  },
  { id: 2, role: "user", body: "周六下午想找人打羽毛球，水平差不多就行。" },
  {
    id: 3,
    role: "assistant",
    body: "收到，我先把这次球局整理好。时间、地点和你在意的边界都能随时改；在你确认前，我不会替你发邀请。",
  },
];

const tabItems: Array<{ id: TabId; label: string; icon: typeof FiHome }> = [
  { id: "home", label: "首页", icon: FiHome },
  { id: "moments", label: "发现", icon: FiCompass },
  { id: "agent", label: "小福", icon: FiStar },
  { id: "messages", label: "消息", icon: FiMessageCircle },
  { id: "profile", label: "我的", icon: FiUser },
];

const planFields = [
  { id: "time", label: "时间", value: "周六 16:00", icon: FiCalendar },
  { id: "place", label: "地点", value: "静安体育中心", icon: FiMapPin },
  { id: "people", label: "同行", value: "2 位球友", icon: FiUsers },
  { id: "format", label: "方式", value: "AA 场地 · 90 分钟", icon: FiClock },
] as const;

function SmallBrand({ size = 30 }: { size?: number }) {
  return (
    <Image
      className={styles.brandIcon}
      src="/brand/fitmeet-logo-v2.png"
      width={size}
      height={size}
      alt="FitMeet"
      priority={size >= 40}
    />
  );
}

function UserAvatar({ name = "林", palette = "#627cf5", compact = false }: { name?: string; palette?: string; compact?: boolean }) {
  return <span className={`${styles.avatar} ${compact ? styles.avatarCompact : ""}`} style={{ "--avatar": palette } as React.CSSProperties}>{name}</span>;
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.sheetShade} role="presentation" onMouseDown={onClose}>
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <header className={styles.sheetHeader}><h2>{title}</h2><button type="button" onClick={onClose} aria-label="关闭"><FiX /></button></header>
        {children}
      </section>
    </div>
  );
}

function CandidateAvatar({ person = candidate, size = 54 }: { person?: Candidate; size?: number }) {
  return <span className={styles.candidateAvatar} style={{ width: size, height: size, "--candidate": person.palette } as React.CSSProperties}>{person.initial}</span>;
}

export function FitMeetAgentExperience() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [planState, setPlanState] = useState<PlanState>("draft");
  const [isResponding, setIsResponding] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [conversation, setConversation] = useState<ChatMessage[]>([
    { id: 100, role: "assistant", body: "你好，我是林一。看到你也想周末打球，想先确认一下你更偏向轻松练习还是对抗？" },
  ]);
  const [conversationInput, setConversationInput] = useState("");
  const [likedMoment, setLikedMoment] = useState(false);
  const [publishedMoment, setPublishedMoment] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);
  const [profileName, setProfileName] = useState("林川");
  const [profileBio, setProfileBio] = useState("喜欢跑步、咖啡和周末 Citywalk，想认识能轻松聊天也尊重边界的新朋友。");

  const lastAssistant = useMemo(() => [...messages].reverse().find((item) => item.role === "assistant"), [messages]);

  const appendAssistant = (body: string) => {
    setMessages((items) => [...items, { id: Date.now(), role: "assistant", body }]);
  };

  const sendToAgent = () => {
    const message = input.trim();
    if (!message || isResponding) return;
    setMessages((items) => [...items, { id: Date.now(), role: "user", body: message }]);
    setInput("");
    setIsResponding(true);
    window.setTimeout(() => {
      const wantsCandidates = /候选|看看|匹配|找人/.test(message);
      const confirms = /确认|生成需求|发布/.test(message);
      if (confirms) {
        setPlanState("confirmed");
        appendAssistant("好，这张需求卡已经按你的意思确认。接下来我会先把适合的人和理由摆在你面前；要不要继续、邀请谁，都由你决定。 ");
      } else if (wantsCandidates && planState === "confirmed") {
        appendAssistant("我已经找到几位可以先看看的候选人。你不用着急做决定，先看看共同点和活动节奏就好。");
      } else {
        setPlanState("draft");
        appendAssistant("我听到你想要一场不需要太有压力的羽毛球局。先把时间、地点和同行方式整理出来；如果有任何地方不舒服，我们就一起换一种安排。");
      }
      setIsResponding(false);
    }, 520);
  };

  const confirmDemand = () => {
    setPlanState("confirmed");
    appendAssistant("已经确认这次需求。我找到了 3 位可以先看看的候选人；你可以慢慢看，不喜欢也完全没关系。");
  };

  const draftInvite = () => {
    setOverlay("invite");
  };

  const confirmInvite = () => {
    setOverlay(null);
    setActiveTab("messages");
    appendAssistant("邀请草稿已经确认发送。对方接受前不会开放私信；现在先在消息里等对方的回应就好。");
  };

  const sendConversation = () => {
    const message = conversationInput.trim();
    if (!message) return;
    setConversation((items) => [...items, { id: Date.now(), role: "user", body: message }]);
    setConversationInput("");
    window.setTimeout(() => {
      setConversation((items) => [...items, { id: Date.now() + 1, role: "assistant", body: "可以呀。我也更喜欢先把节奏放轻松，到了场馆我们再看看当天状态。" }]);
    }, 420);
  };

  return (
    <main className={styles.page}>
      <section className={styles.device} aria-label="FitMeet 移动端体验账号">
        <div className={styles.appCanvas}>
          {activeTab === "home" ? (
            <HomeScreen
              messages={messages}
              planState={planState}
              isResponding={isResponding}
              lastAssistant={lastAssistant}
              onConfirmDemand={confirmDemand}
              onOpenCandidate={() => setOverlay("candidate")}
              onOpenMemory={() => setOverlay("memory")}
              input={input}
              onInputChange={setInput}
              onSubmit={sendToAgent}
            />
          ) : null}
          {activeTab === "moments" ? <MomentsScreen liked={likedMoment} onLike={() => setLikedMoment((value) => !value)} onPublish={() => setOverlay("publish")} published={publishedMoment} /> : null}
          {activeTab === "agent" ? <XiaofuScreen memorySaved={memorySaved} onSaveMemory={() => setMemorySaved(true)} onOpenMemory={() => setOverlay("memory")} onStart={() => { setActiveTab("home"); appendAssistant("今天先不用想得很清楚，我陪你慢慢说。你最想先完成哪一件小事？"); }} /> : null}
          {activeTab === "messages" ? <MessagesScreen onOpenConversation={() => setOverlay("conversation")} /> : null}
          {activeTab === "profile" ? <ProfileScreen name={profileName} bio={profileBio} onEdit={() => setOverlay("profile")} /> : null}
        </div>
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
      </section>

      {overlay === "candidate" ? <CandidateSheet onClose={() => setOverlay(null)} onInvite={draftInvite} /> : null}
      {overlay === "invite" ? <InviteSheet onClose={() => setOverlay(null)} onConfirm={confirmInvite} /> : null}
      {overlay === "conversation" ? <ConversationSheet messages={conversation} input={conversationInput} onInput={setConversationInput} onSubmit={sendConversation} onClose={() => setOverlay(null)} /> : null}
      {overlay === "memory" ? <MemorySheet saved={memorySaved} onSave={() => setMemorySaved(true)} onClose={() => setOverlay(null)} /> : null}
      {overlay === "publish" ? <PublishSheet onClose={() => setOverlay(null)} onPublish={() => { setPublishedMoment(true); setOverlay(null); }} /> : null}
      {overlay === "profile" ? <ProfileSheet name={profileName} bio={profileBio} onName={setProfileName} onBio={setProfileBio} onClose={() => setOverlay(null)} /> : null}
    </main>
  );
}

function HomeScreen({ messages, planState, isResponding, lastAssistant, onConfirmDemand, onOpenCandidate, onOpenMemory, input, onInputChange, onSubmit }: {
  messages: ChatMessage[];
  planState: PlanState;
  isResponding: boolean;
  lastAssistant?: ChatMessage;
  onConfirmDemand: () => void;
  onOpenCandidate: () => void;
  onOpenMemory: () => void;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.homeScreen}>
      <header className={styles.agentHeader}>
        <div><strong className={styles.wordmark}>FitMeet</strong><span>AI 帮你更高效的找人</span></div>
        <div className={styles.headerActions}>
          <button type="button" aria-label="新建对话"><FiPlus /></button>
          <button type="button" aria-label="查看历史"><FiClock /></button>
          <button type="button" onClick={onOpenMemory} aria-label="查看记忆"><FiBookOpen /></button>
          <button type="button" aria-label="查看我的需求"><FiMenu /></button>
        </div>
      </header>
      <section className={styles.chatTimeline} aria-live="polite">
        {messages.map((message, index) => <ChatBubble message={message} key={message.id} showPlan={index === 2 && planState !== "none"} planState={planState} onConfirmDemand={onConfirmDemand} onOpenCandidate={onOpenCandidate} />)}
        {isResponding ? <div className={styles.typingRow}><SmallBrand size={29} /><span><i /><i /><i /></span></div> : null}
        {planState === "confirmed" ? <CandidatePreview onOpen={onOpenCandidate} /> : null}
        {lastAssistant?.body.includes("候选") && planState === "confirmed" ? <p className={styles.safetyCopy}><FiShield /> 在你确认前，不会替你发送邀请。</p> : null}
      </section>
      <Composer value={input} onChange={onInputChange} onSubmit={onSubmit} />
    </div>
  );
}

function ChatBubble({ message, showPlan, planState, onConfirmDemand, onOpenCandidate }: { message: ChatMessage; showPlan: boolean; planState: PlanState; onConfirmDemand: () => void; onOpenCandidate: () => void }) {
  const isUser = message.role === "user";
  return (
    <article className={`${styles.chatRow} ${isUser ? styles.chatRowUser : ""}`}>
      {!isUser ? <SmallBrand size={30} /> : null}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}><p>{message.body}</p></div>
      {isUser ? <UserAvatar compact /> : null}
      {showPlan ? <PlanCard state={planState} onConfirm={onConfirmDemand} onOpenCandidate={onOpenCandidate} /> : null}
    </article>
  );
}

function PlanCard({ state, onConfirm, onOpenCandidate }: { state: PlanState; onConfirm: () => void; onOpenCandidate: () => void }) {
  return (
    <section className={styles.planCard} aria-label="周六羽毛球局需求卡">
      <header><span className={styles.planGlyph}>◒</span><strong>周六羽毛球局</strong><button type="button" aria-label="编辑需求"><FiEdit3 /></button></header>
      <div>{planFields.map((field) => { const Icon = field.icon; return <button type="button" className={styles.planRow} key={field.id} aria-label={`修改${field.label}`}><Icon /><span>{field.label}</span><strong>{field.value}</strong><FiEdit3 /></button>; })}</div>
      {state === "draft" ? <button type="button" className={styles.primaryAction} onClick={onConfirm}><FiCheck /> 确认生成需求卡</button> : <button type="button" className={styles.primaryAction} onClick={onOpenCandidate}>查看 3 位候选人 <FiChevronRight /></button>}
    </section>
  );
}

function CandidatePreview({ onOpen }: { onOpen: () => void }) {
  return <section className={styles.candidatePreview}><div className={styles.previewHeader}><span>小福找到 3 位可以先看看的候选人</span><button type="button" onClick={onOpen}>全部查看</button></div><button className={styles.previewBody} type="button" onClick={onOpen}><CandidateAvatar /><span><strong>{candidate.name}</strong><small>{candidate.subtitle}</small><em>{candidate.reason}</em></span><FiChevronRight /></button></section>;
}

function Composer({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><div><button type="button" aria-label="添加图片"><FiImage /></button><button type="button" aria-label="语音输入"><FiMic /></button><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="告诉 Agent 你想找谁" aria-label="告诉 Agent 你想找谁" /><FiStar className={styles.composerSparkle} /></div><button className={styles.sendButton} type="submit" disabled={!value.trim()} aria-label="发送给 Agent"><FiArrowUp /></button></form>;
}

function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (tab: TabId) => void }) {
  return <nav className={styles.tabBar} aria-label="FitMeet 主导航">{tabItems.map((item) => { const Icon = item.icon; const active = activeTab === item.id; if (item.id === "agent") return <button type="button" key={item.id} className={`${styles.tabItem} ${styles.agentTab} ${active ? styles.tabActive : ""}`} onClick={() => onChange(item.id)} aria-label="小福智能体"><span><SmallBrand size={44} /></span><small>小福</small></button>; return <button type="button" key={item.id} className={`${styles.tabItem} ${active ? styles.tabActive : ""}`} onClick={() => onChange(item.id)} aria-current={active ? "page" : undefined}><i /><Icon /><small>{item.label}</small></button>; })}</nav>;
}

function MomentsScreen({ liked, onLike, onPublish, published }: { liked: boolean; onLike: () => void; onPublish: () => void; published: boolean }) {
  return <div className={styles.standardScreen}><header className={styles.screenHeader}><div><h1>发现</h1><p>分享照片、动态，也看看附近真实需求</p></div><button type="button" onClick={onPublish} aria-label="发布动态"><FiPlus /></button></header>{published ? <p className={styles.inlineNotice}><FiCheck /> 已发布到朋友圈</p> : null}<section className={styles.discoveryTabs}><button type="button" className={styles.discoveryActive}>朋友圈</button><button type="button">社交大厅</button><button type="button">任务大厅</button></section><article className={styles.momentCard}><header><UserAvatar name="乔" palette="#ed7f94" /><div><strong>乔乔</strong><span>刚刚 · 静安</span></div><FiMoreHorizontal /></header><p>今天的羽毛球课终于没有迟到。下次想约一场不赶时间的轻松局，慢慢热身也很好。</p><div className={styles.momentImage}><span>J</span></div><footer><button type="button" onClick={onLike} className={liked ? styles.liked : ""}><FiHeart /> {liked ? "已喜欢" : "喜欢"}</button><button type="button"><FiMessageCircle /> 评论</button><button type="button"><FiSend /> 分享</button></footer></article><article className={styles.demandFeedCard}><span><FiCompass /> 社交大厅</span><h2>周日晨跑 · 徐汇滨江</h2><p>希望找能轻松聊天、节奏不用太赶的人。公共区域集合。</p><button type="button">看看详情 <FiChevronRight /></button></article></div>;
}

function XiaofuScreen({ memorySaved, onSaveMemory, onOpenMemory, onStart }: { memorySaved: boolean; onSaveMemory: () => void; onOpenMemory: () => void; onStart: () => void }) {
  return <div className={styles.xiaofuScreen}><header className={styles.xiaofuHeader}><button type="button" aria-label="查看记录"><FiClock /></button><div><SmallBrand size={56} /><h1>小福</h1><p>陪你慢慢说</p></div><button type="button" onClick={onOpenMemory} aria-label="查看记忆"><FiBookOpen /></button></header><section className={styles.xiaofuHero}><div className={styles.xiaofuHalo}><SmallBrand size={92} /></div><h2>今天先不用想得很清楚，<br />我陪你慢慢说。</h2><p>我会参考你的兴趣、边界和附近范围理解；不急着替你做决定。</p><button type="button" onClick={onStart}>开始聊聊 <FiArrowUp /></button></section><section className={styles.memoryPrompt}><div><FiStar /><span><strong>{memorySaved ? "已记住你的偏好" : "要记住「先聊天再见面」吗？"}</strong><small>你可以随时修改或删除</small></span></div>{memorySaved ? <FiCheck /> : <button type="button" onClick={onSaveMemory}>记住</button>}</section></div>;
}

function MessagesScreen({ onOpenConversation }: { onOpenConversation: () => void }) {
  return <div className={styles.standardScreen}><header className={styles.messageHeader}><h1>消息</h1><p>私信、互动和通知</p></header><button type="button" className={styles.searchBar}><FiSearch /> 搜索消息</button><section className={styles.quickMessages}><button type="button"><span><FiHeart /></span>互动消息<small>1</small></button><button type="button"><span><FiBell /></span>系统通知<small>2</small></button><button type="button"><span><FiStar /></span>待处理<small>1</small></button></section><h2 className={styles.listTitle}>全部消息</h2><button type="button" className={styles.messageRow} onClick={onOpenConversation}><CandidateAvatar size={48} /><span><strong>林一</strong><small>可以呀。我也更喜欢先把节奏放轻松…</small></span><time>刚刚</time></button><button type="button" className={styles.messageRow}><span className={styles.noticeIcon}><FiCalendar /></span><span><strong>羽毛球局等待确认</strong><small>确认后才会向对方发送邀请</small></span><time>12:18</time></button></div>;
}

function ProfileScreen({ name, bio, onEdit }: { name: string; bio: string; onEdit: () => void }) {
  return <div className={styles.profileScreen}><header><button type="button" aria-label="隐私设置"><FiShield /></button><button type="button" aria-label="设置"><FiSettings /></button></header><section className={styles.profileHero}><UserAvatar name={name.slice(0, 1)} palette="#657cf3" /><div><h1>{name}</h1><p>24 · 上海</p><span>已完成资料</span></div><button type="button" onClick={onEdit}>编辑资料</button></section><p className={styles.profileBio}>{bio}</p><section className={styles.profileStats}><span><strong>3</strong>朋友圈</span><span><strong>5</strong>兴趣</span><span><strong>92%</strong>完成度</span></section><div className={styles.profileTags}><span>跑步</span><span>咖啡</span><span>Citywalk</span></div><section className={styles.profileRows}>{[["社交目的", "认识新朋友", FiStar], ["偏好边界", "公共场所 / 先聊天", FiShield], ["隐私设置", "附近开启", FiUser], ["更多设置", "通知 / 好友 / 安全", FiSettings]].map(([title, value, Icon]) => { const RowIcon = Icon as typeof FiSettings; return <button type="button" key={String(title)}><span><RowIcon /></span><strong>{String(title)}</strong><small>{String(value)}</small><FiChevronRight /></button>; })}</section></div>;
}

function CandidateSheet({ onClose, onInvite }: { onClose: () => void; onInvite: () => void }) {
  return <Sheet title="候选人" onClose={onClose}><div className={styles.sheetLead}><p>先看共同点和活动节奏，再决定要不要继续。没有“必须合适”的人。</p></div><article className={styles.candidateDetail}><header><CandidateAvatar size={70} /><div><h3>{candidate.name}</h3><p>{candidate.subtitle} · {candidate.city}</p></div></header><p className={styles.candidateReason}><FiStar /> {candidate.reason}</p><div className={styles.tagList}>{candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p className={styles.sheetSafety}><FiShield /> 小福不会替你私信。确认邀请后，对方接受才能聊天。</p><button type="button" className={styles.primaryAction} onClick={onInvite}>先生成邀请草稿 <FiChevronRight /></button></article></Sheet>;
}

function InviteSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <Sheet title={`邀请 ${candidate.name} 一起打球`} onClose={onClose}><div className={styles.inviteDraft}><span>邀请说明</span><p>嗨，看到我们都想在周末打羽毛球，时间和节奏也比较接近。想先约一场轻松的球局，如果你方便，我们可以再确认场馆和时间。</p><small>发送前可以随时修改；对方接受前不会开放私信。</small></div><button type="button" className={styles.primaryAction} onClick={onConfirm}><FiSend /> 确认发送邀请</button></Sheet>;
}

function ConversationSheet({ messages, input, onInput, onSubmit, onClose }: { messages: ChatMessage[]; input: string; onInput: (value: string) => void; onSubmit: () => void; onClose: () => void }) {
  return <Sheet title="林一" onClose={onClose}><div className={styles.thread}><p className={styles.threadNote}><FiShield /> 这是一段已获双方同意的体验会话</p>{messages.map((message) => <div key={message.id} className={`${styles.threadBubble} ${message.role === "user" ? styles.threadBubbleUser : ""}`}>{message.body}</div>)}</div><form className={styles.sheetComposer} onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><input value={input} onChange={(event) => onInput(event.target.value)} placeholder="说点什么" aria-label="消息内容" /><button type="submit" disabled={!input.trim()} aria-label="发送消息"><FiSend /></button></form></Sheet>;
}

function MemorySheet({ saved, onSave, onClose }: { saved: boolean; onSave: () => void; onClose: () => void }) {
  return <Sheet title="人物画像" onClose={onClose}><p className={styles.sheetLeadText}>小福只会在你确认后保存偏好。你可以随时修改或删除。</p><section className={styles.memoryList}><article><span>社交边界</span><strong>先聊天再见面</strong><p>推荐时优先解释共同点和安全边界。</p><button type="button">删除</button></article><article><span>开场风格</span><strong>自然一点</strong><p>邀请文案避免太正式或太急。</p><button type="button">删除</button></article></section>{!saved ? <button type="button" className={styles.primaryAction} onClick={onSave}>记住「周末更合适」</button> : <p className={styles.savedNotice}><FiCheck /> 已保存到体验账号</p>}</Sheet>;
}

function PublishSheet({ onClose, onPublish }: { onClose: () => void; onPublish: () => void }) {
  return <Sheet title="发布动态" onClose={onClose}><textarea className={styles.publishInput} defaultValue="今天想约一场不赶时间的羽毛球局。先热身、再慢慢打，有人想一起吗？" aria-label="动态内容" /><div className={styles.publishOptions}><span><FiMapPin /> 模糊定位</span><span><FiUsers /> 是否公开</span></div><button type="button" className={styles.primaryAction} onClick={onPublish}>发布到朋友圈</button></Sheet>;
}

function ProfileSheet({ name, bio, onName, onBio, onClose }: { name: string; bio: string; onName: (value: string) => void; onBio: (value: string) => void; onClose: () => void }) {
  return <Sheet title="编辑资料" onClose={onClose}><label className={styles.fieldLabel}>昵称<input value={name} onChange={(event) => onName(event.target.value)} /></label><label className={styles.fieldLabel}>自我介绍<textarea value={bio} onChange={(event) => onBio(event.target.value)} /></label><button type="button" className={styles.primaryAction} onClick={onClose}>保存修改</button></Sheet>;
}
