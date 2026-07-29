import { isValidEmailActionToken } from './fitmeet-email-action-token.ts';

/**
 * Email action credentials are accepted only from the URL fragment. Browsers
 * do not send fragments to the origin server, reverse proxy, analytics or
 * access logs. The calling page must remove the fragment immediately after
 * reading it and keep the returned value in memory only.
 */
export function fitMeetEmailActionTokenFromFragment(fragment: string) {
  if (!fragment.startsWith('#')) return null;
  const value = new URLSearchParams(fragment.replace(/^#/, '')).get('token');
  return isValidEmailActionToken(value) ? value.trim() : null;
}
