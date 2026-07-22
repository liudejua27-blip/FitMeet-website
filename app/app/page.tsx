import type { Metadata } from "next";
import { AppChamberPage } from "@/components/app-chamber/AppChamberPage";

export const metadata: Metadata = {
  title: "FitMeet 应用 — 即将上线",
  description: "从一句话开始经过需求理解、条件调整与计划确认得到一份可以修改的计划FitMeet 应用即将上线",
  openGraph: {
    title: "FitMeet 应用 — 即将上线",
    description: "下一次出发先从一句话开始",
  },
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return <AppChamberPage />;
}
