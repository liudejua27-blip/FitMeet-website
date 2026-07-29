import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "发现 — FitMeet",
  description: "查看真实动态、社交需求与任务需求。",
};

export default function AgentDiscoverPage() {
  return <FitMeetCompleteExperience initialDestination="moments" />;
}
