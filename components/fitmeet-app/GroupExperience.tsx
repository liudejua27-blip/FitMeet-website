'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiUnlock,
  FiUserCheck,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import type {
  FitMeetGroup,
  FitMeetGroupAttendanceStatus,
  FitMeetGroupChatMode,
  FitMeetGroupEvent,
  FitMeetGroupMember,
  FitMeetGroupPoll,
  FitMeetGroupPollOption,
  FitMeetGroupPollType,
} from '@/lib/fitmeet-api-contract';
import type { FitMeetApiClient } from '@/lib/fitmeet-api-client';
import styles from './group-experience.module.css';

type GroupListMode = 'mine' | 'discover';

const statusCopy: Record<FitMeetGroup['status'], string> = {
  forming: '招募中',
  confirmed: '已成局',
  cancelled: '已取消',
  completed: '已完成',
};

const membershipCopy: Record<FitMeetGroup['currentUserMembershipStatus'], string> = {
  none: '尚未加入',
  active: '已加入',
  pending: '等待主理人确认',
  waitlisted: '候补中',
  left: '已退出',
  rejected: '申请未通过',
  removed: '已移出',
};

const attendanceCopy: Record<FitMeetGroupAttendanceStatus, string> = {
  none: '尚未确认',
  attending: '确认参加',
  arrived: '已到场',
  not_attending: '暂不参加',
};

function joinModeCopy(group: FitMeetGroup) {
  if (group.joinMode === 'open') return '开放加入';
  if (group.joinMode === 'request') return '申请后加入';
  return '仅邀请加入';
}

function eventCopy(event: FitMeetGroupEvent) {
  const copy: Record<string, string> = {
    'group.created': '组局已创建',
    'member.joined': '新成员加入组局',
    'member.left': '成员退出组局',
    'membership.requested': '收到加入申请',
    'membership.waitlisted': '一位成员进入候补',
    'membership.rejected': '加入申请未通过',
    'membership.withdrawn': '加入申请已撤回',
    'waitlist.promoted': '候补成员已转为正式成员',
    'group.cancelled': '组局已取消',
    'poll.created': '发起了时间地点投票',
    'poll.finalized': '确认了最终时间或地点',
    'attendance.updated': '更新了参与状态',
    'member.checked_in': '成员已到场签到',
    'member.role.updated': '成员角色已调整',
    'member.removed': '成员已移出组局',
    'group.chat_mode.updated': '群聊发言权限已调整',
  };
  return copy[event.type] || '组局状态已更新';
}

function Avatar({ member }: { member: FitMeetGroupMember }) {
  return member.avatar ? (
    <img src={member.avatar} alt={`${member.name || '成员'}的头像`} />
  ) : (
    <span>{(member.name || '友').slice(0, 1)}</span>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  destructive = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [busy, onCancel]);
  return (
    <div className={styles.confirmShade} role="presentation" onMouseDown={() => { if (!busy) onCancel(); }}>
      <section ref={dialogRef} tabIndex={-1} className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-labelledby="group-confirm-title" aria-describedby="group-confirm-description" onMouseDown={(event) => event.stopPropagation()}>
        <FiShield />
        <h2 id="group-confirm-title">{title}</h2>
        <p id="group-confirm-description">{description}</p>
        <div><button type="button" disabled={busy} onClick={onCancel}>返回</button><button type="button" className={destructive ? styles.dangerConfirm : ''} disabled={busy} onClick={onConfirm}>{busy ? '正在提交…' : confirmLabel}</button></div>
      </section>
    </div>
  );
}

function PollComposer({
  busy,
  onCreate,
  onClose,
}: {
  busy: boolean;
  onCreate: (draft: { type: FitMeetGroupPollType; question: string; options: string[] }) => Promise<boolean>;
  onClose: () => void;
}) {
  const [type, setType] = useState<FitMeetGroupPollType>('time');
  const [question, setQuestion] = useState('大家更方便哪个时间？');
  const [options, setOptions] = useState('周六下午\n周日下午');
  const submit = async () => {
    const values = options.split('\n').map((item) => item.trim()).filter(Boolean);
    if (await onCreate({ type, question: question.trim(), options: values })) onClose();
  };
  return (
    <form className={styles.pollComposer} onSubmit={(event) => { event.preventDefault(); void submit(); }} aria-busy={busy}>
      <header><div><strong>发起成员投票</strong><small>主理人最终采用选项后才会写入正式时间或地点</small></div><button type="button" aria-label="关闭投票编辑" onClick={onClose}><FiX /></button></header>
      <label><span>类型</span><select value={type} onChange={(event) => { const next = event.target.value as FitMeetGroupPollType; setType(next); setQuestion(next === 'time' ? '大家更方便哪个时间？' : '大家更方便在哪里见面？'); setOptions(next === 'time' ? '周六下午\n周日下午' : '市中心公共空间\n交通便利的咖啡馆'); }}><option value="time">时间投票</option><option value="location">地点投票</option></select></label>
      <label><span>问题</span><input value={question} maxLength={120} onChange={(event) => setQuestion(event.target.value)} /></label>
      <label><span>选项（每行一个，2–6 个）</span><textarea rows={4} value={options} onChange={(event) => setOptions(event.target.value)} /></label>
      <footer><button type="button" onClick={onClose}>暂不发起</button><button type="submit" disabled={busy || !question.trim() || options.split('\n').filter((item) => item.trim()).length < 2}>{busy ? '正在创建…' : '确认发起投票'}</button></footer>
    </form>
  );
}

function PollCard({
  poll,
  canManage,
  busy,
  onVote,
  onFinalize,
}: {
  poll: FitMeetGroupPoll;
  canManage: boolean;
  busy: boolean;
  onVote: (poll: FitMeetGroupPoll, option: FitMeetGroupPollOption) => void;
  onFinalize: (poll: FitMeetGroupPoll, option: FitMeetGroupPollOption) => void;
}) {
  const maxVotes = Math.max(1, ...poll.options.map((option) => option.voteCount));
  const finalOption = poll.options.find((option) => option.id === poll.finalOptionId);
  return (
    <article className={styles.pollCard} data-status={poll.status}>
      <header><span><FiBarChart2 /><strong>{poll.question}</strong></span><small>{poll.type === 'time' ? '时间' : '地点'} · {poll.status === 'open' ? '投票中' : '已确认'}</small></header>
      <div className={styles.pollOptions}>
        {poll.options.map((option) => (
          <div key={option.id} className={option.id === poll.finalOptionId ? styles.pollOptionFinal : ''}>
            <button type="button" aria-pressed={option.currentUserVoted} disabled={poll.status !== 'open' || busy} onClick={() => onVote(poll, option)}>
              <span><i style={{ width: `${Math.round((option.voteCount / maxVotes) * 100)}%` }} /><em>{option.label}</em></span>
              <strong>{option.voteCount} 票{option.currentUserVoted ? ' · 你的选择' : ''}</strong>
            </button>
            {canManage && poll.status === 'open' ? <button type="button" className={styles.finalizeButton} disabled={busy} onClick={() => onFinalize(poll, option)}>采用</button> : null}
          </div>
        ))}
      </div>
      <footer><span>{poll.createdByName || '组局管理员'}发起</span>{finalOption ? <strong><FiCheck /> 最终采用：{finalOption.label}</strong> : <small>投票只提供参考，最终确认需要管理员明确操作</small>}</footer>
    </article>
  );
}

function GroupCard({ group, onOpen }: { group: FitMeetGroup; onOpen: () => void }) {
  const fill = Math.min(100, Math.round((group.memberCount / group.capacityMax) * 100));
  return (
    <button type="button" className={styles.groupCard} onClick={onOpen}>
      <header>
        <span data-status={group.status}>{statusCopy[group.status]}</span>
        <small>{joinModeCopy(group)}</small>
      </header>
      <h2>{group.title}</h2>
      <p>{group.summary || '主理人尚未补充组局说明。'}</p>
      <div className={styles.metaLine}>
        <span><FiCalendar /> {group.timeWindow || '时间待确认'}</span>
        <span><FiMapPin /> {group.locationText || group.city || '地点待确认'}</span>
      </div>
      <div className={styles.capacityLine}>
        <div><i style={{ width: `${fill}%` }} /></div>
        <strong>{group.memberCount}/{group.capacityMax} 人</strong>
      </div>
      <footer>
        <span>{membershipCopy[group.currentUserMembershipStatus]}</span>
        {group.waitlistCount ? <small>{group.waitlistCount} 人候补</small> : <small>{group.availableSeats} 个名额</small>}
        <FiChevronRight />
      </footer>
    </button>
  );
}

export function GroupExperience({
  api,
  groupId,
  onBack,
  onGroup,
  onConversation,
  onUser,
  onNotice,
}: {
  api: FitMeetApiClient;
  groupId?: string;
  onBack: () => void;
  onGroup: (id: string) => void;
  onConversation: (id: string) => void;
  onUser: (id: number) => void;
  onNotice: (message: string) => void;
}) {
  if (groupId) {
    return (
      <GroupDetail
        api={api}
        groupId={groupId}
        onBack={onBack}
        onConversation={onConversation}
        onUser={onUser}
        onNotice={onNotice}
      />
    );
  }
  return <GroupList api={api} onBack={onBack} onGroup={onGroup} />;
}

function GroupList({ api, onBack, onGroup }: { api: FitMeetApiClient; onBack: () => void; onGroup: (id: string) => void }) {
  const [mode, setMode] = useState<GroupListMode>('mine');
  const [mine, setMine] = useState<FitMeetGroup[]>([]);
  const [discover, setDiscover] = useState<FitMeetGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [mineResult, discoverResult] = await Promise.allSettled([
      api.listGroups('mine'),
      api.listGroups('discover'),
    ]);
    if (mineResult.status === 'fulfilled') setMine(mineResult.value.items);
    if (discoverResult.status === 'fulfilled') setDiscover(discoverResult.value.items);
    if (mineResult.status === 'rejected' && discoverResult.status === 'rejected') {
      setError(mineResult.reason instanceof Error ? mineResult.reason.message : '多人组局暂时无法读取。');
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = mode === 'mine' ? mine : discover;
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <button type="button" className={styles.iconButton} aria-label="返回" onClick={onBack}><FiArrowLeft /></button>
        <div><h1>多人组局</h1><p>成员、候补与群聊权限由服务端同步</p></div>
        <button type="button" className={styles.iconButton} aria-label="刷新组局" onClick={() => void load()}><FiRefreshCw /></button>
      </header>
      <div className={styles.listBody}>
        <div className={styles.tabs} role="tablist" aria-label="组局范围">
          <button type="button" role="tab" aria-selected={mode === 'mine'} onClick={() => setMode('mine')}>我的组局 <span>{mine.length}</span></button>
          <button type="button" role="tab" aria-selected={mode === 'discover'} onClick={() => setMode('discover')}>发现组局 <span>{discover.length}</span></button>
        </div>
        {loading ? <p className={`${styles.state} ${styles.loadingState}`}><FiRefreshCw /> 正在同步真实组局状态…</p> : null}
        {!loading && error ? <section className={styles.state}><strong>暂时无法读取组局</strong><p>{error}</p><button type="button" onClick={() => void load()}>重新加载</button></section> : null}
        {!loading && !error && groups.length ? (
          <section className={styles.groupList} aria-live="polite">
            {groups.map((group) => <GroupCard key={group.id} group={group} onOpen={() => onGroup(group.id)} />)}
          </section>
        ) : null}
        {!loading && !error && !groups.length ? (
          <section className={styles.state}>
            <FiUsers />
            <strong>{mode === 'mine' ? '还没有组局记录' : '暂时没有可加入的组局'}</strong>
            <p>{mode === 'mine' ? '先在一条真实需求详情中确认创建，系统不会自动替你组局。' : '新的公开组局会在服务端确认后出现在这里。'}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function GroupDetail({
  api,
  groupId,
  onBack,
  onConversation,
  onUser,
  onNotice,
}: {
  api: FitMeetApiClient;
  groupId: string;
  onBack: () => void;
  onConversation: (id: string) => void;
  onUser: (id: number) => void;
  onNotice: (message: string) => void;
}) {
  const [group, setGroup] = useState<FitMeetGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [finalizeTarget, setFinalizeTarget] = useState<{ poll: FitMeetGroupPoll; option: FitMeetGroupPollOption } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<FitMeetGroupMember | null>(null);
  const [chatModeTarget, setChatModeTarget] = useState<FitMeetGroupChatMode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setGroup(await api.getGroup(groupId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '组局状态暂时无法读取。');
    } finally {
      setLoading(false);
    }
  }, [api, groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void api.getGroup(groupId).then(setGroup).catch(() => undefined);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [api, groupId]);

  const join = async () => {
    if (!group || busy) return;
    setBusy('join');
    try {
      const result = await api.joinGroup(group.id);
      setGroup(result.group);
      onNotice(result.membership.status === 'active' ? '已加入组局，群聊权限已开放。' : result.membership.status === 'pending' ? '加入申请已提交，等待主理人确认。' : '组局已满，你已进入候补队列。');
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '加入操作未能完成。');
    } finally {
      setBusy('');
    }
  };

  const leave = async () => {
    if (!group || busy) return;
    setBusy('leave');
    try {
      const result = await api.leaveGroup(group.id);
      setGroup(result.group);
      onNotice('已退出当前成员状态；如有候补，服务端会按顺序晋升。');
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '退出操作未能完成。');
    } finally {
      setBusy('');
    }
  };

  const resolve = async (membership: FitMeetGroupMember, decision: 'approve' | 'reject') => {
    if (!group || busy) return;
    setBusy(`${decision}-${membership.id}`);
    try {
      const result = await api.resolveGroupRequest(group.id, membership.id, decision);
      setGroup(result.group);
      onNotice(decision === 'approve' ? '成员申请已通过，群聊权限已同步。' : '成员申请已拒绝。');
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '成员申请未能处理。');
    } finally {
      setBusy('');
    }
  };

  const createPoll = async (draft: { type: FitMeetGroupPollType; question: string; options: string[] }) => {
    if (!group || busy) return false;
    setBusy('create-poll');
    try {
      const result = await api.createGroupPoll(group.id, draft);
      setGroup(result.group);
      onNotice('成员投票已发起；正式时间或地点仍需管理员再次确认。');
      return true;
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '投票未能创建。');
      return false;
    } finally {
      setBusy('');
    }
  };

  const vote = async (poll: FitMeetGroupPoll, option: FitMeetGroupPollOption) => {
    if (!group || busy || poll.status !== 'open') return;
    setBusy(`vote-${poll.id}`);
    try {
      const result = await api.voteGroupPoll(group.id, poll.id, option.id);
      setGroup(result.group);
      onNotice(`已选择“${option.label}”，投票结束前可以修改。`);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '投票未能提交。');
    } finally {
      setBusy('');
    }
  };

  const finalizePoll = async () => {
    if (!group || busy || !finalizeTarget) return;
    setBusy(`finalize-${finalizeTarget.poll.id}`);
    try {
      const result = await api.finalizeGroupPoll(group.id, finalizeTarget.poll.id, finalizeTarget.option.id);
      setGroup(result.group);
      onNotice(`已将“${finalizeTarget.option.label}”写入组局正式${finalizeTarget.poll.type === 'time' ? '时间' : '地点'}。`);
      setFinalizeTarget(null);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '最终选项未能确认。');
    } finally {
      setBusy('');
    }
  };

  const updateAttendance = async (status: Exclude<FitMeetGroupAttendanceStatus, 'none'>) => {
    if (!group || busy) return;
    setBusy(`attendance-${status}`);
    try {
      const result = await api.updateGroupCheckIn(group.id, status);
      setGroup(result.group);
      onNotice(status === 'arrived' ? '到场签到已由服务端记录。' : status === 'attending' ? '已确认参加。' : '已记录本次暂不参加。');
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '参与状态未能更新。');
    } finally {
      setBusy('');
    }
  };

  const updateRole = async (member: FitMeetGroupMember) => {
    if (!group || busy) return;
    const role = member.role === 'cohost' ? 'member' : 'cohost';
    setBusy(`role-${member.id}`);
    try {
      const result = await api.updateGroupMemberRole(group.id, member.id, role);
      setGroup(result.group);
      onNotice(role === 'cohost' ? `${member.name || '成员'}已成为协作者。` : `${member.name || '成员'}已调整为普通成员。`);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '成员角色未能调整。');
    } finally {
      setBusy('');
    }
  };

  const removeMember = async () => {
    if (!group || busy || !removeTarget) return;
    setBusy(`remove-${removeTarget.id}`);
    try {
      const result = await api.removeGroupMember(group.id, removeTarget.id, '管理员在网页端确认移除');
      setGroup(result.group);
      onNotice(`${removeTarget.name || '成员'}已移出组局，群聊权限已同步收回。`);
      setRemoveTarget(null);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '成员未能移除。');
    } finally {
      setBusy('');
    }
  };

  const updateChatMode = async () => {
    if (!group || busy || !chatModeTarget) return;
    setBusy('chat-mode');
    try {
      setGroup(await api.updateGroupChatMode(group.id, chatModeTarget));
      onNotice(chatModeTarget === 'admins_only' ? '群聊已切换为仅主理人和协作者发言。' : '群聊已恢复为所有正式成员发言。');
      setChatModeTarget(null);
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '群聊权限未能调整。');
    } finally {
      setBusy('');
    }
  };

  const cancel = async () => {
    if (!group || busy) return;
    setBusy('cancel');
    try {
      setGroup(await api.cancelGroup(group.id, '主理人在网页端确认取消'));
      setConfirmCancel(false);
      onNotice('组局已取消，群聊写入权限已关闭。');
    } catch (reason) {
      onNotice(reason instanceof Error ? reason.message : '组局未能取消。');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <main className={styles.page}><p className={`${styles.state} ${styles.loadingState}`}><FiRefreshCw /> 正在同步组局详情…</p></main>;
  if (!group || error) return <main className={styles.page}><header className={styles.pageHeader}><button type="button" className={styles.iconButton} aria-label="返回" onClick={onBack}><FiArrowLeft /></button><div><h1>组局详情</h1><p>服务端状态不可用</p></div></header><section className={styles.state}><strong>没有找到这条组局</strong><p>{error || '组局可能已关闭或你没有访问权限。'}</p><button type="button" onClick={() => void load()}>重新加载</button></section></main>;

  const isOpen = ['forming', 'confirmed'].includes(group.status);
  const membership = group.currentUserMembershipStatus;
  const fill = Math.min(100, Math.round((group.memberCount / group.capacityMax) * 100));
  const arrivalReady = group.status === 'confirmed' && Boolean(group.timeFinalizedAt && group.locationFinalizedAt);
  const attendanceSummary = group.attendanceSummary || { attending: 0, arrived: 0, notAttending: 0, unconfirmed: group.memberCount };
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <button type="button" className={styles.iconButton} aria-label="返回" onClick={onBack}><FiArrowLeft /></button>
        <div><h1>组局详情</h1><p>容量、成员和权限以服务端为准</p></div>
        <button type="button" className={styles.iconButton} aria-label="刷新组局" onClick={() => void load()}><FiRefreshCw /></button>
      </header>
      <div className={styles.detailBody}>
        <article className={styles.hero}>
          <header><span data-status={group.status}>{statusCopy[group.status]}</span><small>{joinModeCopy(group)}</small></header>
          <h2>{group.title}</h2>
          <p>{group.summary || '主理人尚未补充组局说明。'}</p>
          <div className={styles.detailMeta}>
            <div><FiClock /><span><small>时间</small><strong>{group.timeWindow || '待成员确认'}</strong></span></div>
            <div><FiMapPin /><span><small>地点</small><strong>{group.locationText || group.city || '待成员确认'}</strong></span></div>
          </div>
          <div className={styles.capacityDetail}>
            <header><span><FiUsers /> 成员进度</span><strong>{group.memberCount}/{group.capacityMax} 人</strong></header>
            <div><i style={{ width: `${fill}%` }} /></div>
            <p>{group.status === 'forming' ? `至少 ${group.capacityMin} 人成局` : group.status === 'confirmed' ? '人数已达到成局条件' : '当前不再接受成员变更'}{group.waitlistCount ? ` · ${group.waitlistCount} 人候补` : ''}</p>
          </div>
          <div className={styles.primaryActions}>
            {membership === 'active' && group.conversationId ? <button type="button" onClick={() => onConversation(group.conversationId!)}><FiMessageCircle /> 进入群聊</button> : null}
            {group.canJoin ? <button type="button" disabled={Boolean(busy)} onClick={() => void join()}><FiUserPlus /> {busy === 'join' ? '正在提交…' : group.joinMode === 'open' ? '立即加入' : '申请加入'}</button> : null}
            {isOpen && ['active', 'pending', 'waitlisted'].includes(membership) && group.currentUserRole !== 'host' ? <button type="button" className={styles.secondaryButton} disabled={Boolean(busy)} onClick={() => void leave()}><FiX /> {membership === 'active' ? '退出组局' : '撤回申请'}</button> : null}
            {!group.canJoin && membership !== 'active' ? <span className={styles.membershipState}><FiShield /> {membershipCopy[membership]}</span> : null}
          </div>
        </article>

        {membership === 'active' ? (
          <section className={styles.panel}>
            <header><div><h3>时间与地点确认</h3><p>成员先投票，管理员确认后才写入正式安排</p></div>{group.canManage ? <button type="button" className={styles.headerAction} onClick={() => setShowPollComposer((current) => !current)}><FiPlus /> 发起投票</button> : <span>{group.polls?.length || 0}</span>}</header>
            {showPollComposer ? <PollComposer busy={busy === 'create-poll'} onCreate={createPoll} onClose={() => setShowPollComposer(false)} /> : null}
            <div className={styles.pollList}>
              {(group.polls || []).length ? group.polls?.map((poll) => <PollCard key={poll.id} poll={poll} canManage={group.canManage} busy={Boolean(busy)} onVote={(item, option) => void vote(item, option)} onFinalize={(item, option) => setFinalizeTarget({ poll: item, option })} />) : <p className={styles.inlineEmpty}>还没有成员投票。现有时间和地点仍是需求中的提议值。</p>}
            </div>
            <div className={styles.attendanceBlock}>
              <header><div><strong>参与与签到</strong><small>{arrivalReady ? '人数、时间和地点已确认，可以到场签到' : '到场签到会在人数、时间和地点全部确认后开放'}</small></div><span>{attendanceCopy[group.currentUserAttendanceStatus || 'none']}</span></header>
              <div className={styles.attendanceStats}><span><strong>{attendanceSummary.attending}</strong> 确认参加</span><span><strong>{attendanceSummary.arrived}</strong> 已到场</span><span><strong>{attendanceSummary.unconfirmed}</strong> 未确认</span></div>
              <div className={styles.attendanceActions}>
                <button type="button" aria-pressed={group.currentUserAttendanceStatus === 'attending'} disabled={Boolean(busy)} onClick={() => void updateAttendance('attending')}><FiCheck /> 确认参加</button>
                <button type="button" aria-pressed={group.currentUserAttendanceStatus === 'not_attending'} disabled={Boolean(busy)} onClick={() => void updateAttendance('not_attending')}><FiX /> 暂不参加</button>
                <button type="button" aria-pressed={group.currentUserAttendanceStatus === 'arrived'} disabled={Boolean(busy) || !arrivalReady} onClick={() => void updateAttendance('arrived')}><FiMapPin /> 到场签到</button>
              </div>
            </div>
          </section>
        ) : null}

        {membership === 'active' ? <section className={styles.panel}>
          <header><div><h3>成员</h3><p>群聊只对正式成员开放</p></div><span>{group.members?.length || 0} 人</span></header>
          <div className={styles.memberList}>
            {(group.members || []).map((member) => (
              <article key={member.id}>
                <button type="button" className={styles.memberProfile} onClick={() => onUser(member.userId)}>
                  <Avatar member={member} />
                  <span><strong>{member.name || 'FitMeet 用户'}</strong><small>{member.role === 'host' ? '主理人' : member.role === 'cohost' ? '协作者' : '成员'} · {attendanceCopy[member.attendanceStatus || 'none']}</small></span>
                </button>
                <div className={styles.memberActions}>
                  {group.currentUserRole === 'host' && member.role !== 'host' ? <button type="button" disabled={Boolean(busy)} onClick={() => void updateRole(member)}>{member.role === 'cohost' ? '取消协作' : '设为协作者'}</button> : null}
                  {group.canManage && member.role !== 'host' && member.userId !== group.hostUserId && !(group.currentUserRole === 'cohost' && member.role === 'cohost') ? <button type="button" aria-label={`移出 ${member.name || '成员'}`} disabled={Boolean(busy)} onClick={() => setRemoveTarget(member)}><FiUserMinus /></button> : null}
                </div>
              </article>
            ))}
          </div>
        </section> : <section className={`${styles.panel} ${styles.privacyPanel}`}><FiShield /><div><h3>成员资料仅正式成员可见</h3><p>加入前只展示人数和名额，不公开完整成员名单、投票或签到状态。</p></div></section>}

        {group.canManage && (group.requests || []).length ? (
          <section className={styles.panel}>
            <header><div><h3>待处理成员</h3><p>审批和候补不会绕过容量锁</p></div><span>{group.requests?.length}</span></header>
            <div className={styles.requestList}>
              {group.requests?.map((member) => (
                <article key={member.id}>
                  <Avatar member={member} />
                  <span><strong>{member.name || 'FitMeet 用户'}</strong><small>{member.status === 'waitlisted' ? '候补中' : '申请加入'}</small></span>
                  <div>
                    <button type="button" aria-label={`拒绝 ${member.name || '成员'}`} disabled={Boolean(busy)} onClick={() => void resolve(member, 'reject')}><FiX /></button>
                    <button type="button" aria-label={`通过 ${member.name || '成员'}`} disabled={Boolean(busy)} onClick={() => void resolve(member, 'approve')}><FiUserCheck /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {group.canManage && isOpen ? (
          <section className={styles.panel}>
            <header><div><h3>群聊与成员治理</h3><p>协作者可审批和发起投票；主理人保留角色与取消权限</p></div>{group.chatMode === 'admins_only' ? <FiLock /> : <FiUnlock />}</header>
            <div className={styles.chatModeChoices} role="group" aria-label="群聊发言权限">
              <button type="button" aria-pressed={group.chatMode === 'all_members'} disabled={Boolean(busy)} onClick={() => { if (group.chatMode !== 'all_members') setChatModeTarget('all_members'); }}><FiUsers /><span><strong>所有成员发言</strong><small>正式成员都可以发送消息</small></span></button>
              <button type="button" aria-pressed={group.chatMode === 'admins_only'} disabled={Boolean(busy)} onClick={() => { if (group.chatMode !== 'admins_only') setChatModeTarget('admins_only'); }}><FiLock /><span><strong>仅管理员发言</strong><small>主理人和协作者可以发送</small></span></button>
            </div>
          </section>
        ) : null}

        {membership === 'active' ? <section className={styles.panel}>
          <header><div><h3>组局动态</h3><p>关键成员变更会留下系统事件</p></div></header>
          <ol className={styles.timeline}>
            {(group.events || []).length ? group.events?.map((event) => (
              <li key={event.id}><i /><span><strong>{eventCopy(event)}</strong><small>{event.actorName || '系统'} · {new Date(event.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small></span></li>
            )) : <li><i /><span><strong>暂无更多动态</strong><small>后续状态会从服务端同步</small></span></li>}
          </ol>
        </section> : null}

        {group.currentUserRole === 'host' && isOpen ? (
          <section className={styles.safetyPanel}>
            <FiShield />
            <div><strong>主理人操作</strong><p>取消后会关闭组局群聊写入，成员会收到正式状态通知。</p></div>
            {!confirmCancel ? <button type="button" onClick={() => setConfirmCancel(true)}>取消组局</button> : <div className={styles.cancelConfirm}><button type="button" onClick={() => setConfirmCancel(false)}>返回</button><button type="button" disabled={Boolean(busy)} onClick={() => void cancel()}>{busy === 'cancel' ? '正在取消…' : '确认取消'}</button></div>}
          </section>
        ) : null}
        {finalizeTarget ? <ConfirmDialog title={`确认采用“${finalizeTarget.option.label}”？`} description={`这会结束当前${finalizeTarget.poll.type === 'time' ? '时间' : '地点'}投票，并把该选项写入所有成员看到的正式安排。`} confirmLabel="确认采用" busy={busy.startsWith('finalize-')} onCancel={() => setFinalizeTarget(null)} onConfirm={() => void finalizePoll()} /> : null}
        {removeTarget ? <ConfirmDialog title={`移出 ${removeTarget.name || '这位成员'}？`} description="移出后会立即收回组局群聊权限；如果有人候补，服务端会按队列自动补位。" confirmLabel="确认移出" destructive busy={busy.startsWith('remove-')} onCancel={() => setRemoveTarget(null)} onConfirm={() => void removeMember()} /> : null}
        {chatModeTarget ? <ConfirmDialog title={chatModeTarget === 'admins_only' ? '切换为仅管理员发言？' : '恢复所有成员发言？'} description={chatModeTarget === 'admins_only' ? '普通成员会立即变为只读，已有消息不会删除。' : '所有正式成员会重新获得发送文字消息的权限。'} confirmLabel="确认调整" busy={busy === 'chat-mode'} onCancel={() => setChatModeTarget(null)} onConfirm={() => void updateChatMode()} /> : null}
      </div>
    </main>
  );
}
