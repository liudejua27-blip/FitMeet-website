import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {
  groupedSearchResults,
  normalizedSearchQuery,
  safeSearchResultPath,
  searchQueryLength,
} from '../lib/fitmeet-search-state.ts';

test('global search normalizes user input without changing wildcard characters', () => {
  assert.equal(normalizedSearchQuery('  羽毛球   周末  '), '羽毛球 周末');
  assert.equal(normalizedSearchQuery('  %_  '), '%_');
  assert.equal(normalizedSearchQuery('a'.repeat(100)).length, 80);
  assert.equal(searchQueryLength('🙂'), 1);
  assert.equal(searchQueryLength('🙂羽'), 2);
});

test('global search accepts only type-bound FitMeet destinations', () => {
  assert.equal(safeSearchResultPath({ type: 'agent_thread', path: '/agent/try/chat/thread-1' }), '/agent/try/chat/thread-1');
  assert.equal(safeSearchResultPath({ type: 'message', path: '/agent/try/messages/conversation-1' }), '/agent/try/messages/conversation-1');
  assert.equal(safeSearchResultPath({ type: 'friend', path: '/agent/try/users/42' }), '/agent/try/users/42');
  assert.equal(safeSearchResultPath({ type: 'group', path: '/agent/try/groups/group-1' }), '/agent/try/groups/group-1');
  assert.equal(safeSearchResultPath({ type: 'friend', path: '/agent/try/messages/42' }), null);
  assert.equal(safeSearchResultPath({ type: 'message', path: 'https://evil.test/' }), null);
  assert.equal(safeSearchResultPath({ type: 'group', path: '/agent/try/groups/group-1?token=secret' }), null);
  assert.equal(safeSearchResultPath({ type: 'agent_thread', path: '/agent/try/chat/..' }), null);
  assert.equal(safeSearchResultPath({ type: 'agent_thread', path: '/agent/try/chat/%2e%2e' }), null);
  assert.equal(safeSearchResultPath({ type: 'agent_thread', path: '/agent/try/chat/thread\\escape' }), null);
  assert.equal(safeSearchResultPath({ type: 'agent_thread', path: '/agent/try/chat/%2Fadmin' }), null);
});

test('global search groups only safe typed results in stable product order', () => {
  const groups = groupedSearchResults([
    { id: 'g1', type: 'group', title: '周末羽毛球', path: '/agent/try/groups/g1' },
    { id: 'm1', type: 'message', title: '阿青', path: '/agent/try/messages/m1' },
    { id: 'bad', type: 'friend', title: '越权结果', path: '/agent/try/groups/bad' },
    { id: 't1', type: 'agent_thread', title: '找搭子', path: '/agent/try/chat/t1' },
  ]);
  assert.deepEqual(groups.map((group) => group.type), ['agent_thread', 'message', 'group']);
  assert.equal(groups.flatMap((group) => group.items).some((item) => item.id === 'bad'), false);
});

test('mobile global search owns dialog initial focus without collapsed-style leakage', async () => {
  const [dialogHook, shell, shellStyles] = await Promise.all([
    fs.readFile(new URL('../components/fitmeet-app/useAccessibleDialog.ts', import.meta.url), 'utf8'),
    fs.readFile(new URL('../components/fitmeet-app/FitMeetAgentShell.tsx', import.meta.url), 'utf8'),
    fs.readFile(new URL('../components/fitmeet-app/fitmeet-agent-shell.module.css', import.meta.url), 'utf8'),
  ]);

  assert.match(dialogHook, /initialFocusRef\?: RefObject<HTMLElement \| null>/);
  assert.match(dialogHook, /dialogRef\.current\?\.contains\(preferred\)/);
  assert.match(
    shell,
    /useAccessibleDialog\(\s*mobileOpen,\s*\(\) => setMobileOpen\(false\),\s*mobileSearchInputRef,/,
  );
  assert.match(
    shell,
    /ref=\{instance === "mobile" \? mobileSearchInputRef : desktopSearchInputRef\}/,
  );
  assert.match(
    shell,
    /ref=\{instance === "mobile" \? mobileUserMenuRef : desktopUserMenuRef\}/,
  );
  assert.doesNotMatch(shell, /focusMobileSearchOnOpenRef/);
  assert.match(shellStyles, /\.collapsed \.desktopSidebar \.searchField/);
  assert.doesNotMatch(shellStyles, /\.collapsed \.mobileDrawer/);
});
