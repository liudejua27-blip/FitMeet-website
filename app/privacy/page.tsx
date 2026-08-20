import type { Metadata } from "next";
import { PrivacyPolicyV1_2 } from "@/lib/legal/privacy-v1-2";

export const metadata: Metadata = {
  title: "隐私政策 — FitMeet",
  description: "FitMeet 隐私政策，说明账号、资料、照片、近似位置、消息、Agent、匹配及第三方服务中的个人信息处理规则。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicyV1_2 />;
}
