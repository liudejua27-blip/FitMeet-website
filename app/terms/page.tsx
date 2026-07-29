import type { Metadata } from "next";
import { TermsPolicyV1 } from "@/lib/legal/terms-v1";

export const metadata: Metadata = {
  title: "用户服务协议 — FitMeet",
  description: "FitMeet 用户服务协议，说明账号、Agent、匹配、内容、社交安全、账号注销与争议处理规则。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsPolicyV1 />;
}
