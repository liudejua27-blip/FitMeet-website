import type { Metadata } from "next";
import { EditorialPolicyPage } from "@/components/editorial-policy/EditorialPolicyPage";

export const metadata: Metadata = { title: "社区准则 — FitMeet", description: "FitMeet 社区准则", alternates: { canonical: "/community-guidelines" } };

const sections = [
  { index: "01", title: "真实表达", body: ["真实表达自己的身份和需求不要冒用身份不把未经确认的信息包装成事实"] },
  { index: "02", title: "明确同意", body: ["尊重对方的选择与拒绝一次连接、一次邀请或一项计划都不代表持续的同意"] },
  { index: "03", title: "清晰计划", body: ["在行动前说清时间、地点、费用和重要边界计划发生变化时及时、直接地说明"] },
  { index: "04", title: "公共优先", body: ["第一次见面优先选择开放、熟悉且便于离开的公共场所并让可信赖的人知道你的安排"] },
  { index: "05", title: "彼此尊重", body: ["不进行骚扰、歧视、欺骗、胁迫或诱导不利用任何人的脆弱处境获取利益"] },
  { index: "06", title: "异常响应", body: ["遇到异常情况优先结束当前互动并保护自己保留必要信息通过官网支持中心提供的公开渠道反馈", "如果存在即时人身危险应优先离开现场并联系当地紧急服务；FitMeet 不能代替警方、医疗或其他紧急机构"] },
  { index: "07", title: "治理措施", body: ["社区治理将根据行为严重程度、重复情况、风险和可核实信息采取相称措施可能的措施结构包括提醒、内容限制、功能限制、暂停或终止", "具体措施只有在正式产品能力和规则生效后执行；本页不声称当前已经建立完整自动化治理系统"] },
  { index: "08", title: "问题反馈", body: ["反馈时请说明发生了什么、相关时间与必要背景并只提供处理问题所需的信息不要公开传播他人的敏感信息", "当前可通过支持中心页面中的公开邮箱提交；应用内举报能力仍属于建设中状态"] },
  { index: "09", title: "申诉复核", body: ["当账号或内容处理能力正式上线后FitMeet 将提供清晰的通知与申诉入口并由与原处理相区分的流程进行复核", "正式申诉时限、可提交材料与结果通知方式将在治理能力确认后公布"] },
  { index: "10", title: "版本说明", body: ["本准则版本为 0.2最后更新于 2026-07-11正式生效日期将在产品上线和治理流程确认后公布", "规则发生实质变化时应更新版本与日期并通过适当渠道提示用户"] },
];

export default function CommunityGuidelinesPage() {
  return <EditorialPolicyPage eyebrow="社区准则" title={["自由连接", "彼此尊重"]} introduction="每一次认真对待都在帮助 Social World 变得更可信" status="治理能力建设中" sections={sections} relatedHref="/privacy" relatedLabel="隐私政策" navigationContext="社区准则" version="草案 0.2" effectiveDate="待正式发布" updatedAt="2026-07-11" />;
}
