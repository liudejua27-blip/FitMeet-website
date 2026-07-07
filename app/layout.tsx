import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { absoluteUrl, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FitMeet | Social World",
  description:
    "Social World：一句想法，变成一次真实到场。FitMeet 用社交 Agent 把年轻人的真实生活需求变成有边界、可执行的线下计划。",
  keywords: [
    "FitMeet",
    "Social World",
    "社交 Agent",
    "城市社交",
    "运动搭子",
    "旅行搭子",
    "附近生活",
    "新城市社交",
    "真实计划"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "FitMeet | Social World",
    description:
      "Social World：一句想法，变成一次真实到场。FitMeet 让真实计划、公开边界和同频到场先发生。",
    url: siteUrl,
    siteName: "FitMeet",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FitMeet Social World - 一句想法，变成一次真实到场"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "FitMeet | Social World",
    description:
      "一句想法，变成一次真实到场。",
    images: ["/twitter-image"]
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/fitmeet-icon.png",
    apple: "/fitmeet-icon.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050101"
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FitMeet",
  url: siteUrl,
  logo: absoluteUrl("/fitmeet-icon.png"),
  description:
    "FitMeet 通过社交 Agent，把年轻人的真实生活需求变成有边界、可执行、能到场的线下计划。",
  sameAs: []
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FitMeet",
  url: siteUrl,
  inLanguage: ["zh-CN"],
  description:
    "Social World：一句想法，变成一次真实到场。FitMeet 是面向青年群体的城市生活社交平台官网。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <StructuredData data={[organizationJsonLd, websiteJsonLd]} />
        {children}
      </body>
    </html>
  );
}
