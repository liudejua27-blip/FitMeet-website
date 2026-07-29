import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "消息 — FitMeet",
  description: "查看 FitMeet 私信、邀请、互动与系统通知。",
};

export default function AgentMessagesPage() {
  return <FitMeetCompleteExperience initialDestination="messages" />;
}
