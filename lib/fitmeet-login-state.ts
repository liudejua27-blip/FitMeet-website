export type FitMeetAuthMode = 'login' | 'register';
export type FitMeetAuthRequestEpoch = { current: number };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function beginFitMeetAuthRequest(epoch: FitMeetAuthRequestEpoch) {
  epoch.current += 1;
  return epoch.current;
}

export function isCurrentFitMeetAuthRequest(
  epoch: FitMeetAuthRequestEpoch,
  requestEpoch: number,
) {
  return epoch.current === requestEpoch;
}

export function invalidateFitMeetAuthRequest(
  epoch: FitMeetAuthRequestEpoch,
  requestEpoch?: number,
) {
  if (requestEpoch !== undefined && !isCurrentFitMeetAuthRequest(epoch, requestEpoch)) return false;
  epoch.current += 1;
  return true;
}

export function fitMeetSessionCredentialMatches(
  currentAccessToken: string | null | undefined,
  expectedAccessToken: string | null | undefined,
) {
  return Boolean(expectedAccessToken) && currentAccessToken === expectedAccessToken;
}

export function normalizeFitMeetEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidFitMeetEmail(value: string) {
  const normalized = normalizeFitMeetEmail(value);
  return normalized.length <= 254 && emailPattern.test(normalized);
}

export function isValidFitMeetPassword(value: string) {
  return value.length >= 8 && value.length <= 72;
}

export function fitMeetLoginValidationMessage({
  mode,
  email,
  password,
  name,
  passwordConfirmation,
  agreementAccepted,
}: {
  mode: FitMeetAuthMode;
  email: string;
  password: string;
  name?: string;
  passwordConfirmation?: string;
  agreementAccepted: boolean;
}) {
  if (mode === 'register' && !name?.trim()) return '请输入你的展示昵称。';
  if (!isValidFitMeetEmail(email)) return '请输入有效邮箱地址。';
  if (!isValidFitMeetPassword(password)) return '密码需要 8–72 位。';
  if (mode === 'register' && password !== passwordConfirmation) return '两次输入的密码不一致。';
  if (mode === 'register' && !agreementAccepted)
    return '请先同意《用户协议》和《隐私政策》。';
  return '';
}
