import { pageMetadata } from "@/lib/site";
import { ProductExperienceClient } from "./ProductExperienceClient";

export const metadata = pageMetadata({
  title: "产品与服务 | FitMeet",
  description:
    "FitMeet 社交 Agent 把真实生活需求整理成公开场景、边界协议、计划收据和同频连接。先有计划，再出现合适的人。",
  path: "/product"
});

export default function ProductPage() {
  return <ProductExperienceClient />;
}
