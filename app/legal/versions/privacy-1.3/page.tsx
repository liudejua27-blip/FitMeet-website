import type { Metadata } from "next";
import { PrivacyPolicyV1_3 } from "@/lib/legal/privacy-v1-3";

export const metadata: Metadata = {
  title: "隐私政策 1.3 版本快照 — FitMeet",
  description: "FitMeet 隐私政策 1.3 固定公开版本，2026 年 8 月 25 日生效。",
  alternates: { canonical: "/legal/versions/privacy-1.3" },
};

export default function PrivacyPolicyV1_3SnapshotPage() {
  return <PrivacyPolicyV1_3 snapshot />;
}
