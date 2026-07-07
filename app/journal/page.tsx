import { pageMetadata } from "@/lib/site";
import { JournalExperienceClient } from "./JournalExperienceClient";

export const metadata = pageMetadata({
  title: "动态与资源 | FitMeet",
  description:
    "FitMeet Journal 记录产品进展、城市社交观察、技术实验和合作动态，让 Social World 成为长期可理解的品牌入口。",
  path: "/journal"
});

export default function JournalPage() {
  return <JournalExperienceClient />;
}
