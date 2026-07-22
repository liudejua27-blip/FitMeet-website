import type { Metadata } from "next";
import { ExperienceShell } from "@/components/experience-shell/ExperienceShell";
import { metadataBase } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: "FitMeet — Social World | 让社交更简单",
  description: "告诉 FitMeet 社交助手你的运动、旅行或兴趣需求找到一起行动的人",
  keywords: ["FitMeet", "社交助手", "运动搭子", "旅行搭子", "青年社交"],
  icons: {
    icon: "/brand/fitmeet-logo.png",
    apple: "/brand/fitmeet-logo.png",
  },
  openGraph: {
    title: "FitMeet — Social World",
    description: "让社交更简单说出你的需求社交助手帮你找到一起行动的人",
    siteName: "FitMeet",
    locale: "zh_CN",
    type: "website",
    ...(metadataBase ? { images: [{ url: "/images/social-world/city-public-space-desktop.jpg", width: 1672, height: 940, alt: "FitMeet Social World" }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "FitMeet — Social World",
    description: "让社交更简单说出你的需求社交助手帮你整理成一起出发的计划",
    ...(metadataBase ? { images: ["/images/social-world/city-public-space-desktop.jpg"] } : {}),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><ExperienceShell>{children}</ExperienceShell></body>
    </html>
  );
}
