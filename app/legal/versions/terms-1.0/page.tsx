import type { Metadata } from "next";
import { TermsPolicyV1 } from "@/lib/legal/terms-v1";

export const metadata: Metadata = {
  title: "用户服务协议 1.0 版本快照 — FitMeet",
  description: "FitMeet 用户服务协议 1.0 固定公开版本，2026 年 7 月 29 日生效。",
  alternates: { canonical: "/legal/versions/terms-1.0" },
};

export default function TermsV1SnapshotPage() {
  return <TermsPolicyV1 snapshot />;
}
