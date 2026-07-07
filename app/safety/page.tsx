import { pageMetadata } from "@/lib/site";
import { SafetyExperienceClient } from "./SafetyExperienceClient";

export const metadata = pageMetadata({
  title: "安全与边界 | FitMeet",
  description:
    "FitMeet 把公开地点、小组偏好、退出机制、举报与屏蔽、隐私保护、未成年人边界和确认后邀请放进真实社交计划流程。",
  path: "/safety"
});

export default function SafetyPage() {
  return <SafetyExperienceClient />;
}
