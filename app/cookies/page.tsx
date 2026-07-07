import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cookie Policy | FitMeet",
  description:
    "FitMeet Cookie Policy 透明说明官网未来分析、体验改进和合规同意机制的使用边界。",
  path: "/cookies"
});

export default function CookiesPage() {
  return <SystemTrustPage content={systemPages.cookies} />;
}
