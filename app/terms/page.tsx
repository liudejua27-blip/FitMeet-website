import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "真实社交条款 | FitMeet",
  description:
    "FitMeet 真实社交条款：真实计划、社交 Agent 责任、安全边界、企业合作规则、用户责任、退出权利和 Social World 参与标准。",
  path: "/terms"
});

export default function TermsPage() {
  return <SystemTrustPage content={systemPages.terms} />;
}
