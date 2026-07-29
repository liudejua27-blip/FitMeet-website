import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "需求详情 — FitMeet", description: "查看跨端共享的真实需求状态。" };
export default async function DemandPage({ params }: { params: Promise<{ demandId: string }> }) { const { demandId } = await params; return <FitMeetCompleteExperience initialDestination="home" initialExperience="demand" initialEntityId={decodeURIComponent(demandId)} />; }
