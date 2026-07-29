import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  agentMemoryUseScopeOptions,
  defaultMemoryUseScope,
  memoryCanChangeScope,
  memoryEvidenceText,
  mergeMemoryUsageEvents,
  memoryTypeLabel,
  memoryUsageContextLabel,
  memoryUsagePath,
  memoryUsagePurposeLabel,
  memoryUseScopePresentation,
} from '../lib/fitmeet-memory-state.ts';

const completeExperienceSource = readFileSync(
  new URL('../components/fitmeet-app/FitMeetCompleteExperience.tsx', import.meta.url),
  'utf8',
);

function sourceBetween(start, end) {
  const startIndex = completeExperienceSource.indexOf(start);
  const endIndex = completeExperienceSource.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing source marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing source marker: ${end}`);
  return completeExperienceSource.slice(startIndex, endIndex);
}

test('memory scopes stay explicit and sensitive proposals default to Agent-only use', () => {
  assert.deepEqual(
    agentMemoryUseScopeOptions.map((option) => option.value),
    ['agent_and_matching', 'agent_only', 'matching_only', 'paused'],
  );
  assert.equal(defaultMemoryUseScope({ sensitivity: 'sensitive' }), 'agent_only');
  assert.equal(defaultMemoryUseScope({ sensitivity: 'normal' }), 'agent_and_matching');
  assert.equal(
    defaultMemoryUseScope({ sensitivity: 'sensitive', useScope: 'paused' }),
    'paused',
  );
  assert.equal(memoryUseScopePresentation('matching_only').label, '仅用于匹配');
  assert.equal(memoryCanChangeScope('confirmed'), true);
  assert.equal(memoryCanChangeScope('proposed'), false);
});

test('memory evidence only presents non-empty unique user evidence', () => {
  assert.deepEqual(
    memoryEvidenceText([
      '我更喜欢公共场所见面',
      { text: '我更喜欢公共场所见面', sourceRole: 'user' },
      { text: '周末下午比较方便', sourceRole: 'user' },
      { text: '助手自己建议的跑步', sourceRole: 'assistant' },
      { text: '  ', sourceRole: 'user' },
    ]),
    ['我更喜欢公共场所见面', '周末下午比较方便'],
  );
  assert.equal(memoryTypeLabel('interaction_boundary'), '互动边界');
  assert.equal(memoryTypeLabel('workout_profile'), '运动画像');
  assert.equal(memoryTypeLabel('frequent_area'), '常去区域');
  assert.equal(memoryTypeLabel('verification_clue'), '认证线索');
});

test('memory usage explains the purpose and only links to known owned surfaces', () => {
  const event = {
    id: 'usage-1',
    memoryId: 'memory-1',
    purpose: 'matching',
    contextType: 'demand',
    contextId: 'demand/1',
    subjectId: 'candidate-1',
    createdAt: '2026-07-29T00:00:00.000Z',
  };
  assert.equal(memoryUsagePurposeLabel(event.purpose), '用于匹配');
  assert.equal(memoryUsageContextLabel(event), '需求候选匹配');
  assert.equal(memoryUsagePath(event), '/agent/try/demands/demand%2F1');
  assert.equal(
    memoryUsagePath({ ...event, contextType: 'unknown', contextId: 'secret' }),
    null,
  );
  assert.deepEqual(
    mergeMemoryUsageEvents([event], [event, { ...event, id: 'usage-2' }]).map((item) => item.id),
    ['usage-1', 'usage-2'],
  );
});

test('memory center clears owner-bound state before another account can render it', () => {
  const ownerReset = sourceBetween(
    'memoryOwnerIdRef.current = memoryOwnerId;',
    "if (overlay === 'memory') void refreshMemoryCenter();",
  );

  assert.match(completeExperienceSource, /session\.state\.status === 'authenticated'[\s\S]*String\(session\.state\.session\.user\.id\)/);
  assert.match(ownerReset, /memoryRefreshRequestRef\.current \+= 1/);
  for (const reset of [
    'setMemories([])',
    'setMemoryControl(null)',
    'setMemoryLoading(false)',
    'setMemoryError(null)',
  ]) {
    assert.match(ownerReset, new RegExp(reset.replace(/[()[\]]/g, '\\$&')));
  }
  assert.match(
    completeExperienceSource,
    /memoryStateBelongsToCurrentOwner \? memories : \[\]/,
  );
  assert.match(
    completeExperienceSource,
    /memoryStateBelongsToCurrentOwner \? memoryControl : null/,
  );
  assert.match(completeExperienceSource, /key={memoryOwnerId \?\? 'anonymous'}/);
});

test('authenticated workbench remounts and keeps API credentials scoped to one owner', () => {
  const sessionBoundary = sourceBetween(
    'export function FitMeetCompleteExperience(props:',
    'function FitMeetAuthenticatedExperience({',
  );
  const authenticatedSetup = sourceBetween(
    'function FitMeetAuthenticatedExperience({',
    "const [surface, setSurface] = useState<'main' | 'onboarding'>(initialSurface);",
  );

  assert.match(sessionBoundary, /key={String\(authenticatedSession\.user\.id\)}/);
  assert.equal((completeExperienceSource.match(/useFitMeetSession\(\)/g) ?? []).length, 1);
  assert.doesNotMatch(authenticatedSetup, /useFitMeetSession\(\)/);
  assert.match(completeExperienceSource, /const sessionAccessToken = session\.state\.session\?\.accessToken/);
  assert.match(completeExperienceSource, /new FitMeetApiClient\(\(\) => sessionAccessToken\)/);
  assert.doesNotMatch(completeExperienceSource, /const api = session\.api/);
});

test('memory has one guarded loader and owner changes preload it automatically', () => {
  const initialization = sourceBetween(
    'const results = await Promise.allSettled([',
    'useEffect(() => {\n    if (!liveApi) return;\n    void Promise.all([',
  );
  const ownerReset = sourceBetween(
    'memoryOwnerIdRef.current = memoryOwnerId;',
    "if (overlay === 'memory') void refreshMemoryCenter();",
  );
  const memoryLoads = completeExperienceSource.match(/api\.listAgentMemories\(\)/g) ?? [];

  assert.equal(memoryLoads.length, 1);
  assert.doesNotMatch(initialization, /listAgentMemories|memoriesResult/);
  assert.match(ownerReset, /if \(memoryOwnerId\) void refreshMemoryCenter\(\)/);
});

test('memory refresh and usage requests reject stale owner or request responses', () => {
  const refresh = sourceBetween(
    'const refreshMemoryCenter = useCallback(async () => {',
    'const applyAgentInboxPage = useCallback',
  );
  const memorySheet = completeExperienceSource.slice(
    completeExperienceSource.indexOf('function MemorySheet({'),
  );

  assert.match(refresh, /const requestOwnerId = memoryOwnerId/);
  assert.match(refresh, /const requestId = \+\+memoryRefreshRequestRef\.current/);
  assert.match(refresh, /!isCurrentMemoryOwner\(requestOwnerId\)/);
  assert.match(refresh, /requestId !== memoryRefreshRequestRef\.current/);
  assert.match(refresh, /requestId === memoryRefreshRequestRef\.current/);

  assert.match(memorySheet, /usageOwnerIdRef\.current = ownerId/);
  assert.match(memorySheet, /usageLoadRequestRef\.current = {}/);
  assert.match(memorySheet, /setUsageByMemory\({}\)/);
  assert.match(
    memorySheet,
    /usageLoadRequestRef\.current\[memoryId\] !== requestId/,
  );
  assert.match(memorySheet, /usageOwnerIdRef\.current !== requestOwnerId/);
});

test('memory mutation responses cannot write into a later session owner', () => {
  const mutationNames = [
    'saveMemory',
    'updateMemory',
    'deleteMemory',
    'rejectMemory',
    'toggleMemoryInference',
    'suppressMemory',
    'removeMemorySuppression',
    'loadMemoryUsage',
  ];

  for (const [index, name] of mutationNames.entries()) {
    const start = `const ${name} =`;
    const end =
      index + 1 < mutationNames.length ? `const ${mutationNames[index + 1]} =` : 'const syncOpenConversation =';
    const mutation = sourceBetween(start, end);
    assert.match(mutation, /const requestOwnerId = memoryOwnerId/);
    assert.match(mutation, /isCurrentMemoryOwner\(requestOwnerId\)/);
  }
});

test('every destructive memory decision is revision-bound and reconciles conflicts', () => {
  const mutationCalls = {
    saveMemory: /confirmAgentMemory\([\s\S]*current\.revision/,
    deleteMemory: /deleteAgentMemory\(id, current\.revision\)/,
    rejectMemory: /rejectAgentMemory\(id, current\.revision\)/,
    suppressMemory: /suppressAgentMemory\(id, current\.revision\)/,
  };

  for (const [name, requestPattern] of Object.entries(mutationCalls)) {
    const start = `const ${name} =`;
    const end =
      name === 'saveMemory'
        ? 'const updateMemory ='
        : name === 'deleteMemory'
          ? 'const rejectMemory ='
          : name === 'rejectMemory'
            ? 'const toggleMemoryInference ='
            : 'const removeMemorySuppression =';
    const mutation = sourceBetween(start, end);
    assert.match(mutation, /memoryForRevisionWrite\(id\)/);
    assert.match(mutation, requestPattern);
    assert.match(mutation, /reconcileMemoryRevisionConflict\(reason, id\)/);
  }

  const conflict = sourceBetween(
    'const reconcileMemoryRevisionConflict =',
    'const saveMemory =',
  );
  assert.match(conflict, /MEMORY_REVISION_CONFLICT/);
  assert.match(conflict, /currentItem\?: FitMeetAgentMemory/);
  assert.match(conflict, /setMemories/);
  assert.match(conflict, /refreshMemoryCenter/);
});
