import { pageMetadata } from "@/lib/site";
import { AboutExperienceClient } from "./AboutExperienceClient";

export const metadata = pageMetadata({
  title: "关于我们 | FitMeet",
  description:
    "FitMeet 正在用社交 Agent，把分散的生活需求变成可发生、可确认、可参与的现实计划，让年轻人在城市里更容易真实到场。",
  path: "/about"
});

export default function AboutPage() {
  return <AboutExperienceClient />;
}
