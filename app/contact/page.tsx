import { pageMetadata } from "@/lib/site";
import { ContactExperienceClient } from "./ContactExperienceClient";

export const metadata = pageMetadata({
  title: "联系与合作 | FitMeet",
  description:
    "从一个真实想法开始。加入 FitMeet 早期体验，或联系企业合作：真实需求比曝光更接近成交。",
  path: "/contact"
});

export default function ContactPage() {
  return <ContactExperienceClient />;
}
