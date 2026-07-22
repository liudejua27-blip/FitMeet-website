import type { Metadata } from "next";
import { WorldAtlasPage } from "@/components/world-atlas/WorldAtlasPage";

export const metadata: Metadata = {
  title: "Social World — FitMeet",
  description: "从下班后的球场到周末之外的山野进入 FitMeet 为青年构建的 Social World",
  openGraph: {
    title: "Social World — FitMeet",
    description: "每一种想出发的念头都有可能遇见同路的人",
  },
  alternates: { canonical: "/world" },
};

export default function WorldPage() {
  return <WorldAtlasPage />;
}
