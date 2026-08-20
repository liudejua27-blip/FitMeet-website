import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPolicyPage } from "@/components/editorial-policy/EditorialPolicyPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "法律文件版本记录 — FitMeet",
  description: "查阅 FitMeet 用户服务协议与隐私政策的现行版本、生效日期和公开版本快照。",
  alternates: { canonical: "/legal/versions" },
};

const sections = [
  {
    index: "01",
    title: "现行文件",
    body: [
      <>《FitMeet 用户服务协议》现行版本为 1.0，更新及生效日期为 2026-07-29。你可以<Link href="/terms">阅读现行文本</Link>，或打开<Link href="/legal/versions/terms-1.0">版本 1.0 固定快照</Link>。</>,
      <>《FitMeet 隐私政策》现行版本为 1.2，更新及生效日期为 2026-08-20。你可以<Link href="/privacy">阅读现行文本</Link>，或打开<Link href="/legal/versions/privacy-1.2">版本 1.2 固定快照</Link>。版本 1.1 已于 2026-08-19 结束现行效力，其<Link href="/legal/versions/privacy-1.1">固定快照仍可查阅</Link>；版本 1.0 固定快照也继续保留。</>,
      <>第三方服务的处理对象、场景、信息种类和启用条件由<Link href="/privacy/third-parties">《第三方信息处理与共享清单》</Link>持续公开；清单发生实质变化时，我们会同步评估是否需要更新隐私政策版本。</>,
    ],
  },
  {
    index: "02",
    title: "版本留存规则",
    body: [
      "每次正式发布会记录文件名称、版本号、更新日期、生效日期和固定快照地址。新版本不会覆盖已经公开的旧版本快照。",
      "涉及处理目的、敏感个人信息、共享对象、用户权利、责任边界或争议解决的重要变化时，我们会通过应用内弹窗、站内通知或官网显著提示；依法需要重新同意时，会保存用户确认的版本和时间。",
      "版本 1.0 是首个正式公开版本；隐私政策 1.1 自 2026-08-12 起增加附近雷达手动签到规则；隐私政策 1.2 自 2026-08-20 起明确第三方 AI 接收方、数据种类、用途、保护措施、单独授权和撤回路径。旧版本固定快照不会被新版本覆盖。",
    ],
  },
  {
    index: "03",
    title: "法定主体与联系信息",
    body: [
      `FitMeet 的运营主体、协议签约主体及个人信息处理者为“${siteConfig.legalEntityName}”；FitMeet 是产品及服务品牌。政策、账号支持与个人信息权利联系邮箱为 ${siteConfig.contactEmail}。`,
      "依法应公开的联系地址尚待根据营业执照和运营资料核验，因此当前页面不作推测或虚构。ICP备案主体和 App Store Connect 卖方信息仍应在每次发布前与营业执照及平台审核材料交叉核对。",
      "主体、联系地址或平台登记信息发生变化时，我们会同步更新官网、App 内政策链接和平台申报资料；涉及已生效法律文件的重要变化时，会形成新的版本记录并依法提示用户。",
    ],
  },
];

export default function LegalVersionsPage() {
  return (
    <EditorialPolicyPage
      eyebrow="法律文件版本记录"
      title={["变化可追溯", "承诺可核验"]}
      introduction="集中公开现行法律文件、固定版本快照与发布核验边界"
      status="公开记录"
      sections={sections}
      relatedHref="/terms"
      relatedLabel="现行用户协议"
      navigationContext="法律文件版本记录"
      version="1.1"
      effectiveDate="2026-08-20"
      updatedAt="2026-08-20"
      resources={[
        { href: "/privacy", label: "现行隐私政策" },
        { href: "/privacy/third-parties", label: "第三方信息处理与共享清单" },
      ]}
    />
  );
}
