import type { Metadata } from 'next';
import { EmailVerificationExperience } from '@/components/fitmeet-app/EmailVerificationExperience';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '验证邮箱 — FitMeet',
  description: '完成 FitMeet 邮箱账号验证。',
  referrer: 'no-referrer',
  robots: { index: false, follow: false, noarchive: true },
};

export default function VerifyEmailPage() {
  return <EmailVerificationExperience />;
}
