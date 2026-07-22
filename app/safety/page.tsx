import type { Metadata } from "next";
import { SafetyRadiusPage } from "@/components/safety-radius/SafetyRadiusPage";

export const metadata: Metadata = {
  title: "安全设计 — 见面之前边界已经开始 | FitMeet",
  description: "了解 FitMeet 对身份、确认、公共场所、真实经历与反馈机制的设计原则",
  openGraph: {
    title: "安全设计 — FitMeet",
    description: "把安全边界说清才能安心靠近",
  },
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return <SafetyRadiusPage />;
}
