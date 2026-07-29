import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "动态详情 — FitMeet", description: "查看真实动态及其公开互动。" };
export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) { const { postId } = await params; return <FitMeetCompleteExperience initialDestination="moments" initialExperience="post" initialEntityId={decodeURIComponent(postId)} />; }
