import { SocialWorldPage } from "@/components/social-world-page/SocialWorldPage";
import { pageConfigs } from "@/components/social-world-page/pageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "真实场景系统 | FitMeet",
  description:
    "FitMeet 的真实社交场景系统：约练搭子、城市旅行、附近轻社交和新城市计划，由智能体和安全边界组织。",
  path: "/scenes",
});

export default function ScenesPage() {
  return <SocialWorldPage config={pageConfigs.scenes} />;
}
