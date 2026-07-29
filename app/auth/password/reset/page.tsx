import type { Metadata } from 'next';
import { ResetPasswordExperience } from '@/components/fitmeet-app/ResetPasswordExperience';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '重置密码 — FitMeet',
  description: '安全更新 FitMeet 邮箱账号密码。',
  referrer: 'no-referrer',
  robots: { index: false, follow: false, noarchive: true },
};

export default function ResetPasswordPage() {
  return <ResetPasswordExperience />;
}
