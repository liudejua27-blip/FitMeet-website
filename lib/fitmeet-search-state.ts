import type {
  FitMeetSearchResult,
  FitMeetSearchType,
} from './fitmeet-api-contract';

export const fitMeetSearchTypes: FitMeetSearchType[] = [
  'agent_thread',
  'message',
  'friend',
  'group',
];

const pathPatterns: Record<FitMeetSearchType, RegExp> = {
  agent_thread: /^\/agent\/try\/chat\/([^/?#]+)$/,
  message: /^\/agent\/try\/messages\/([^/?#]+)$/,
  friend: /^\/agent\/try\/users\/(\d+)$/,
  group: /^\/agent\/try\/groups\/([^/?#]+)$/,
};

export function normalizedSearchQuery(value: string) {
  return Array.from(value.trim().replace(/\s+/g, ' ')).slice(0, 80).join('');
}

export function searchQueryLength(value: string) {
  return Array.from(value).length;
}

export function safeSearchResultPath(result: Pick<FitMeetSearchResult, 'type' | 'path'>) {
  const path = result.path.trim();
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return null;
  const match = pathPatterns[result.type]?.exec(path);
  if (!match) return null;
  try {
    const segment = decodeURIComponent(match[1]);
    if (!segment || segment === '.' || segment === '..' || /[\\/\u0000-\u001f\u007f]/.test(segment))
      return null;
  } catch {
    return null;
  }
  return path;
}

export function searchTypeLabel(type: FitMeetSearchType) {
  if (type === 'agent_thread') return 'Agent 对话';
  if (type === 'message') return '消息';
  if (type === 'friend') return '好友';
  return '组局';
}

export function groupedSearchResults(items: FitMeetSearchResult[]) {
  return fitMeetSearchTypes
    .map((type) => ({
      type,
      label: searchTypeLabel(type),
      items: items.filter((item) => item.type === type && safeSearchResultPath(item)),
    }))
    .filter((group) => group.items.length > 0);
}
