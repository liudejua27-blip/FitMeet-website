import type { Metadata } from "next";
import { FitMeetCompleteExperience } from "@/components/fitmeet-app/FitMeetCompleteExperience";

export const metadata: Metadata = {
  title: "FitMeet 完整建档体验 — FitMeet",
  description: "FitMeet iOS 同步的九步 onboarding 体验。",
  alternates: { canonical: "/agent/try/onboarding" },
};

export default function AgentOnboardingTryPage() {
  return <FitMeetCompleteExperience initialSurface="onboarding" />;
}
