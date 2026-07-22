import type { Metadata } from "next";
import { ContactNetworkPage } from "@/components/contact-network/ContactNetworkPage";

export const metadata: Metadata = {
  title: "联系与合作 — FitMeet",
  description: "联系 FitMeet了解商务合作、品牌内容、媒体沟通与安全隐私联系渠道",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactNetworkPage />;
}
