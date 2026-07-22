import type { Metadata } from "next";
import { AboutNetworkPage } from "@/components/about-network/AboutNetworkPage";

export const metadata: Metadata = {
  title: "关于 FitMeet — 少一点寻找多一点抵达",
  description: "了解 FitMeet 从减少寻找成本开始逐步走向真实生活协作的品牌使命、产品原则与长期愿景",
  openGraph: {
    title: "关于 FitMeet — 少一点寻找多一点抵达",
    description: "不是让技术代替人与人相处而是减少他们相遇之前的阻力",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutNetworkPage />;
}
