import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "会话 — FitMeet", description: "继续服务端已确认开放的私信或组局群聊。" };
export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) { const { conversationId } = await params; return <FitMeetCompleteExperience initialDestination="messages" initialExperience="conversation" initialEntityId={decodeURIComponent(conversationId)} />; }
