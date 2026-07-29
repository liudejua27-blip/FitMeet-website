import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "私信 — FitMeet", description: "继续双方已确认开放的真实会话。" };
export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) { const { conversationId } = await params; return <FitMeetCompleteExperience initialDestination="messages" initialExperience="conversation" initialEntityId={decodeURIComponent(conversationId)} />; }
