import type { Metadata } from "next";
import { SupportCenterPage } from "@/components/support-center/SupportCenterPage";

export const metadata: Metadata = {
  title: "支持中心 — 安全问题的下一步 | FitMeet",
  description: "FitMeet 当前安全、隐私与规则支持渠道以及遇到异常情况时可以采取的第一步",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportCenterPage />;
}
