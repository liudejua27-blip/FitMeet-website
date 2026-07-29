import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = { title: "通知中心 — FitMeet", description: "查看跨端同步的关系、私信、需求与安全通知。" };
export default function NotificationsPage() { return <FitMeetCompleteExperience initialDestination="messages" initialExperience="notifications" />; }
