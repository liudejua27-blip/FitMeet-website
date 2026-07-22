import type { Metadata } from "next";
import { EditorialPolicyPage } from "@/components/editorial-policy/EditorialPolicyPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "服务条款 — FitMeet", description: "FitMeet 服务规则上线前草案", alternates: { canonical: "/terms" } };

const sections = [
  { index: "01", title: "协议范围与状态", body: ["本页为 FitMeet 服务规则的上线前草案", "正式版本将公布服务提供主体、注册地址、适用地区、联系方式、生效日期与完整协议文本"] },
  { index: "02", title: "账号与使用资格", body: ["正式服务将说明适用年龄、账号注册条件、实名或身份核验要求与地区限制", "用户应提供真实准确并保持更新的信息且不得出租、出借、转让或共享账号"] },
  { index: "03", title: "服务内容", body: ["FitMeet 计划为运动、旅行、兴趣与城市活动提供需求表达、计划整理、信息沟通与安全支持能力", "具体功能、可用地区、收费规则与服务节奏以应用内实际开放内容为准"] },
  { index: "04", title: "用户自主决定", body: ["FitMeet 的 agent 用于辅助整理需求与计划不代替用户作出社交决定", "邀请、确认、费用、出行、线下见面与关系建立均由用户独立判断并自行负责"] },
  { index: "05", title: "用户行为规范", body: ["用户不得发布违法、虚假、骚扰、欺诈、胁迫、歧视、侵害隐私、侵犯知识产权或危及他人安全的内容", "用户应尊重拒绝与撤回并在任何线下活动中遵守法律、公共秩序、场地规则与合理安全要求"] },
  { index: "06", title: "内容与知识产权", body: ["用户仅应提交有权使用的文字、照片、昵称、头像与其他内容", "FitMeet 品牌、产品界面、软件、商标与网站内容的权利归相应权利人所有未经许可不得擅自使用"] },
  { index: "07", title: "服务调整与中断", body: ["我们可能因功能迭代、安全维护、法律要求、不可抗力或风险控制调整、暂停或终止部分服务", "如调整对用户权益产生重要影响将依照适用法律与实际情况提供必要提示"] },
  { index: "08", title: "违规处理与申诉", body: ["为维护社区安全与服务秩序我们可以对涉嫌违规内容、功能或账号采取提示、限制、暂停、终止或其他必要处置", "正式上线前将补充处理依据、通知方式、申诉入口、复核流程与紧急风险处置规则"] },
  { index: "09", title: "责任边界与争议", body: ["线下活动存在现实风险用户应自行评估对方、地点、行程、费用与安全条件", "任何责任限制、适用法律与争议解决条款都将以正式版本及适用法律为准"] },
  { index: "10", title: "联系与更新", body: ["条款的重要更新将通过官网或应用内显著方式提示", `条款问题、意见反馈与申诉材料可发送至 ${siteConfig.contactEmail}`] },
];

export default function TermsPage() {
  return <EditorialPolicyPage eyebrow="服务条款" title={["规则清晰", "连接才自由"]} introduction="技术可以减少寻找成本但每个人仍需对真实表达与彼此尊重负责" status="上线前法务审核中" sections={sections} relatedHref="/community-guidelines" relatedLabel="社区准则" navigationContext="服务条款" version="草案 1.0" effectiveDate="待正式发布" updatedAt="2026-07-13" />;
}
