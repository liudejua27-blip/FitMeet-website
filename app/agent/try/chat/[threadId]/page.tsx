import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "和小福对话 — FitMeet",
  description: "继续一段已经同步到 FitMeet 账号的小福对话。",
};

export default async function AgentThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  return <FitMeetCompleteExperience initialDestination="home" initialThreadId={decodeURIComponent(threadId)} />;
}
