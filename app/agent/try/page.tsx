import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "FitMeet 完整体验账号 — FitMeet",
  description: "FitMeet 移动端完整体验：建档、Agent、发现、消息、关系、邀请与设置。",
  alternates: { canonical: "/agent/try" },
};

export default function AgentTryPage() {
  return <FitMeetCompleteExperience />;
}
