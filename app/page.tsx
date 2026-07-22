import type { Metadata } from "next";
import { SocialWorldHomepage } from "@/components/social-world/SocialWorldHomepage";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <SocialWorldHomepage />;
}
