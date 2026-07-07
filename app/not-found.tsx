import { SystemTrustPage } from "@/components/system-trust-page/SystemTrustPage";
import { systemPages } from "@/components/system-trust-page/systemPageData";

export default function NotFound() {
  return <SystemTrustPage content={systemPages.notFound} />;
}
