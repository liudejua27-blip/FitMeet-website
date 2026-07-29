import type { Metadata } from 'next';
import { ForgotPasswordExperience } from '@/components/fitmeet-app/ForgotPasswordExperience';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '找回密码 — FitMeet',
  description: '申请 FitMeet 邮箱账号密码重置邮件。',
  referrer: 'no-referrer',
  robots: { index: false, follow: false, noarchive: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordExperience />;
}
