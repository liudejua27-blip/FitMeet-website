import type { Metadata } from "next";
import { MomentsFilmPage } from "@/components/moments-film/MomentsFilmPage";

export const metadata: Metadata = {
  title: "见面片段 | FitMeet",
  description: "探索 FitMeet 的社交场景",
  alternates: { canonical: "/moments" },
};

export default function MomentsPage() {
  return <MomentsFilmPage />;
}
