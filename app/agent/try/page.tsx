import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "小福 — FitMeet Web Agent",
  description: "把想法整理成需求卡，由你确认发布、查看候选并继续连接。",
  alternates: { canonical: "/agent/try" },
};

export default function AgentTryPage() {
  return <FitMeetCompleteExperience />;
}
