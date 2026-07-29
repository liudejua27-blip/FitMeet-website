import type { Metadata } from "next";
import { PrivacyPolicyV1 } from "@/lib/legal/privacy-v1";

export const metadata: Metadata = {
  title: "隐私政策 1.0 版本快照 — FitMeet",
  description: "FitMeet 隐私政策 1.0 固定公开版本，2026 年 7 月 29 日生效。",
  alternates: { canonical: "/legal/versions/privacy-1.0" },
};

export default function PrivacyV1SnapshotPage() {
  return <PrivacyPolicyV1 snapshot />;
}
