import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "提交成功 | FitMeet",
  description:
    "你的真实需求已进入 FitMeet 计划队列。Social World 从下一次真实到场继续。",
  path: "/thank-you"
});

export default function ThankYouPage() {
  return <SystemTrustPage content={systemPages.thankYou} />;
}
