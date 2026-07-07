import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "隐私边界室 | FitMeet",
  description:
    "FitMeet 隐私与数据边界说明：真实需求、敏感信息、社交 Agent 上下文、安全默认值、企业合作边界、删除路径和 Social World。",
  path: "/privacy"
});

export default function PrivacyPage() {
  return <SystemTrustPage content={systemPages.privacy} />;
}
