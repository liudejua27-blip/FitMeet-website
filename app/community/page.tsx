import { pageMetadata } from "@/lib/site";
import { CommunityExperienceClient } from "./CommunityExperienceClient";

export const metadata = pageMetadata({
  title: "城市社区 | FitMeet",
  description:
    "FitMeet Social World 把夜跑、球馆、桌游、城市漫游和企业节点连接成年轻人的城市生活网络。",
  path: "/community"
});

export default function CommunityPage() {
  return <CommunityExperienceClient />;
}
