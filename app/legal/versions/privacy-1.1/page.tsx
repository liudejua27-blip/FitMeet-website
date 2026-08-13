import type { Metadata } from "next";
import { PrivacyPolicyV1_1 } from "@/lib/legal/privacy-v1-1";

export const metadata: Metadata = {
  title: "隐私政策 1.1 版本快照 — FitMeet",
  description: "FitMeet 隐私政策 1.1 固定公开版本，2026 年 8 月 12 日生效。",
  alternates: { canonical: "/legal/versions/privacy-1.1" },
};

export default function PrivacyV1_1SnapshotPage() {
  return <PrivacyPolicyV1_1 snapshot />;
}
