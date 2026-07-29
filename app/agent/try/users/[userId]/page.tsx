import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "用户资料 — FitMeet", description: "查看公开资料并管理真实好友关系。" };
export default async function UserPage({ params }: { params: Promise<{ userId: string }> }) { const { userId } = await params; return <FitMeetCompleteExperience initialDestination="moments" initialExperience="user" initialEntityId={decodeURIComponent(userId)} />; }
