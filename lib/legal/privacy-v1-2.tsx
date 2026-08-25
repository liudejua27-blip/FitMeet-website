import Link from "next/link";
import { PrivacyPolicyV1_1, privacyPolicyV1_1Sections } from "@/lib/legal/privacy-v1-1";

const thirdPartyAISection = {
  index: "05",
  title: "Agent 对话、第三方 AI 与单独授权",
  body: [
    "当你主动使用 Agent、需求理解或智能匹配说明功能时，我们会收集你在对应输入框主动提交的文字、语音转写文本、你主动选择的压缩图片内容及图片说明、你主动选择的文档中为当前请求提取的文本、完成当前请求所必需的会话上下文，以及你已经确认并且与当前请求直接相关的资料和需求字段，用于理解你的请求、生成 AI 回复、整理可编辑需求草稿和解释匹配结果。",
    "在把上述信息发送给第三方 AI 前，App 会通过独立的“第三方 AI 数据共享授权”页面明确列出接收方、信息种类和用途，并要求你主动点击“同意并继续”。接收方为 DeepSeek（深度求索）模型 API，由杭州深度求索人工智能基础技术研究有限公司及其关联公司提供。未经该项明确授权，FitMeet 不会向 DeepSeek 发送你的个人信息。",
    "如果你选择“不同意并退出”，App 不会发起第三方 AI 请求，并会退出当前登录账号。你可以重新登录后再次作出选择。授权后，你也可以在“我的—隐私设置—第三方 AI 数据共享授权”撤回；撤回后立即停止新的第三方 AI 数据发送，并退出当前账号。撤回不影响撤回前基于授权已经完成的处理。",
    "我们坚持数据最小化：不会为了 AI 推理发送登录密码、短信验证码、邮箱验证令牌、完整通讯录、设备广告标识、精确住址、证件信息或与当前请求无关的整套私聊记录；除非你在当前请求中主动选择并明确提交，也不会发送图片内容、文档文本、精确位置或未确认的敏感资料。主动选择的图片会在发送前压缩，不读取你的整套相册。",
    "我们通过 FitMeet 服务端代理调用 DeepSeek，不在客户端保存或公开模型密钥；传输使用加密连接，并通过字段白名单、上下文裁剪、访问控制、日志脱敏、权限隔离和保存期限控制降低风险。我们确认并要求 DeepSeek 对从 FitMeet 接收的信息提供与本政策相同或同等级别的保护，包括合理的安全技术和管理措施、必要期限内保存，以及在目的完成或符合法定条件时删除或匿名化。FitMeet 仍对自身的数据选择、授权校验和供应商管理承担责任。",
    <>DeepSeek 的公开隐私与安全规则可在<Link href="/privacy/third-parties">《第三方信息处理与共享清单》</Link>中查看。Agent 输出可能不准确，不会自动发布内容、发送邀请、建立关系或修改你的公开资料；相关操作仍需你另行确认。</>,
  ],
};

const thirdPartyServiceSection = {
  ...privacyPolicyV1_1Sections.find((section) => section.index === "12")!,
  body: [
    "我们仅在提供功能所必需范围内委托服务商处理信息，并通过合同、安全评估和权限控制要求其按我们的指示处理、采取不低于本政策承诺的保护措施，不得擅自用于自身营销。当前真实功能涉及的主要服务如下。",
    "阿里云计算有限公司：提供中国境内云服务器、RDS 数据库、OSS 图片存储、短信验证码和内容安全能力；可能处理手机号及验证码请求、账号与业务数据、你主动上传的图片、待审核内容、IP 和必要运行日志。",
    "DeepSeek（深度求索）模型 API：仅在你完成独立的第三方 AI 数据共享授权后，为 Agent 提供语言理解与生成能力；可能处理你主动提交的文字或语音转写、主动选择的压缩图片内容和文档提取文本、必要会话上下文、经确认且与当前请求相关的资料和需求字段，以及安全控制元数据。我们不会把一般《用户协议》或《隐私政策》的勾选替代这项单独授权。",
    "Apple 系统服务：在你开启相应能力时提供 APNs 推送和系统语音识别；可能处理推送设备令牌、最小化通知内容、语音片段及转写所需技术信息。Apple 也会依据其与你之间的条款处理相关信息。",
    <>阿里企业邮箱投递服务（服务提供者：阿里云计算有限公司）：在你注册邮箱账号、重发验证邮件或找回密码时，按必要范围处理收件邮箱地址、一次性验证或重置通知、投递时间、退信与发送结果，用于完成账号安全通知和排查投递故障。我们不通过这些安全邮件发送个性化广告。你可以查看阿里云的<a href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud201902141711_54837.html" target="_blank" rel="noreferrer">官网隐私权政策</a>；我们仍对作为业务数据控制者应履行的告知和保护义务负责。</>,
    <>各服务商、使用场景、信息种类、处理方式与启用状态见<Link href="/privacy/third-parties">《第三方信息处理与共享清单》</Link>。如需启用新的崩溃监测、统计分析、登录或其他 SDK，我们会先完成数据清单和安全评估，并在实际收集前更新该清单和本政策。开源界面或图片缓存库本身不当然获得你的个人信息。</>,
  ],
};

const retentionSection = {
  ...privacyPolicyV1_1Sections.find((section) => section.index === "15")!,
  body: [
    "账号和资料在账号存续期间保存；需求、动态、照片、关系和消息原则上保存至你删除相应内容或注销账号，以实现多端同步、会话和安全功能。你可以在产品提供的入口删除或修改相应信息。",
    "Agent 会话和经你确认的需求草稿按账号功能所需期限保存，供你继续会话、查看和删除。发送至 DeepSeek 的最小化请求数据，仅允许在完成模型处理、安全防护和适用法律要求所需期限内处理；我们不在 DeepSeek 侧为你创建可公开访问的个人资料。供应商侧删除或匿名化按照采购条款、其公开政策及适用法律执行。",
    "撤回第三方 AI 数据共享授权后，我们立即停止新的 DeepSeek 请求。你还可以删除相关 Agent 会话、注销账号，或通过隐私联系邮箱提出数据删除请求；需要供应商协助处理的，我们会核验后转交并跟进。",
    "验证码在验证目的完成或失效后不再可用；会话令牌按安全期限轮换或撤销；登录、防滥用和安全审计记录在实现安全目的所需的最短期限内保存，法律另有规定或争议仍在处理的除外。",
    "注销账号后，我们会停止提供服务并删除或匿名化与账号关联且无法律保留义务的信息，包括用户生成内容。因备份容灾机制无法立即单独清除的副本会被隔离，不再用于日常业务，并随备份轮换覆盖。",
    "为履行法律义务、解决争议、保护他人权益或证明合规所必须的信息会在必要期限内隔离保存，期限届满后删除或匿名化。我们会依据实际数据库、日志和备份周期维护并执行内部保存期限清单。",
  ],
};

export const privacyPolicyV1_2Sections = privacyPolicyV1_1Sections.map((section) => {
  if (section.index === thirdPartyAISection.index) return thirdPartyAISection;
  if (section.index === thirdPartyServiceSection.index) return thirdPartyServiceSection;
  if (section.index === retentionSection.index) return retentionSection;
  return section;
});

export function PrivacyPolicyV1_2({ snapshot = false }: { snapshot?: boolean }) {
  return (
    <PrivacyPolicyV1_1
      snapshot={snapshot}
      sectionsOverride={privacyPolicyV1_2Sections}
      versionOverride="1.2"
      effectiveDateOverride="2026-08-20"
      updatedAtOverride="2026-08-20"
      statusOverride={snapshot ? "版本 1.2 历史快照" : "现行有效"}
    />
  );
}
