import type { Metadata } from "next";
import { AgentSemanticPage } from "@/components/agent-semantic/AgentSemanticPage";

export const metadata: Metadata = {
  title: "你的社交助手 — FitMeet",
  description: "说出一件想做的事FitMeet 社交助手帮你整理时间、地点、兴趣与边界让真实的社交计划更容易发生",
  openGraph: {
    title: "你的社交助手 — FitMeet",
    description: "你负责想去社交助手负责把条件整理清楚",
  },
  alternates: { canonical: "/agent" },
};

export default function AgentPage() {
  return <AgentSemanticPage />;
}
