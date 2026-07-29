import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "我的 — FitMeet",
  description: "管理 FitMeet 资料、隐私、关系与安全边界。",
};

export default function AgentProfilePage() {
  return <FitMeetCompleteExperience initialDestination="profile" />;
}
