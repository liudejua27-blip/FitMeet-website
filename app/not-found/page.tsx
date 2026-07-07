import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "路线未找到 | FitMeet",
  description:
    "这条路线暂时没有计划。回到 FitMeet Social World，从一个真实需求重新开始。",
  path: "/not-found"
});

export default function NotFoundRoutePage() {
  return <SystemTrustPage content={systemPages.notFound} />;
}
