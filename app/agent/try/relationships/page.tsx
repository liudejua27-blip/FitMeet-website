import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "好友与互动 — FitMeet", description: "处理好友申请并查看真实好友关系。" };
export default function RelationshipsPage() { return <FitMeetCompleteExperience initialDestination="messages" initialExperience="relationships" />; }
