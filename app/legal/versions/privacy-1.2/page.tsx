import type { Metadata } from "next";
import { PrivacyPolicyV1_2 } from "@/lib/legal/privacy-v1-2";

export const metadata: Metadata = {
  title: "隐私政策 1.2 版本快照 — FitMeet",
  description: "FitMeet 隐私政策 1.2 固定公开版本，2026 年 8 月 20 日生效。",
  alternates: { canonical: "/legal/versions/privacy-1.2" },
};

export default function PrivacyPolicyV1_2SnapshotPage() {
  return <PrivacyPolicyV1_2 snapshot />;
}
