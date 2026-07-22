import type { Metadata } from "next";
import { EditorialPolicyPage } from "@/components/editorial-policy/EditorialPolicyPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "隐私政策 — FitMeet", description: "FitMeet 个人信息处理规则上线前草案", alternates: { canonical: "/privacy" } };

const sections = [
  { index: "01", title: "适用范围", body: ["本政策适用于 FitMeet 官网以及后续应用内涉及个人信息处理的功能", "正式上线前将补充服务提供主体名称、注册地址、应用版本、处理者联系方式与生效日期"] },
  { index: "02", title: "我们可能处理的信息", body: ["根据具体功能可能处理手机号、昵称、头像、联系邮箱、活动需求、时间地点人数、沟通内容、安全反馈、设备与日志信息", "定位、身份证明、生物识别、支付、健康、行踪轨迹与未满十四周岁信息等敏感个人信息只会在具有特定目的和必要性时单独说明"] },
  { index: "03", title: "处理目的与方式", body: ["信息可能用于账号与身份管理、理解社交需求、生成或调整计划、保障安全、处理反馈、排查故障与改进服务", "我们会在功能使用前说明处理目的、信息类别、保存期限、使用方式以及用户行使权利的路径"] },
  { index: "04", title: "授权与撤回", body: ["需要同意的处理活动会在用户知情后由用户自主选择", "用户可以通过应用内入口或公开联系渠道撤回授权、停止使用非必要功能或申请删除相关信息"] },
  { index: "05", title: "共享、委托与第三方服务", body: ["云服务、对象存储、消息通知、安全防护、统计分析等服务只会在提供对应能力所必需的范围内接入", "正式上线前会列明第三方或受托方类别、处理目的、信息范围、隐私政策链接以及必要的授权方式"] },
  { index: "06", title: "保存与删除", body: ["信息会在实现处理目的所需的最短期限内保存", "达到保存期限、用户提出有效删除请求或服务停止后将按适用法律与技术能力删除或匿名化处理"] },
  { index: "07", title: "安全措施", body: ["我们将采取访问控制、权限管理、传输保护、日志留存、备份恢复与安全事件响应等合理措施保护个人信息", "发生可能影响个人权益的安全事件时将依照适用法律和实际风险采取处置与通知措施"] },
  { index: "08", title: "敏感信息、跨境与未成年人", body: ["处理敏感个人信息前将说明必要性、对个人权益的影响与单独授权方式", "如发生跨境提供或涉及未成年人信息的情况将依法履行额外告知、同意与保护义务"] },
  { index: "09", title: "你的权利与申请", body: ["你可以依法申请查阅、复制、更正、补充、删除个人信息以及撤回同意、注销账号或解释处理规则", `可发送邮件至 ${siteConfig.contactEmail} 提交请求并说明账号线索、请求事项与必要核验信息` ] },
  { index: "10", title: "更新与联系", body: ["本政策更新后将通过官网或应用内显著方式提示重要变化", `隐私问题、删除请求或意见反馈可发送至 ${siteConfig.contactEmail}`] },
];

export default function PrivacyPage() {
  return <EditorialPolicyPage eyebrow="隐私政策" title={["信息被说明", "选择被保留"]} introduction="FitMeet 会在功能上线前以清晰方式说明个人信息处理规则" status="上线前法务审核中" sections={sections} relatedHref="/terms" relatedLabel="服务条款" navigationContext="隐私政策" version="草案 1.0" effectiveDate="待正式发布" updatedAt="2026-07-13" />;
}
