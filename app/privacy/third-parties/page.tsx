import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPolicyPage } from "@/components/editorial-policy/EditorialPolicyPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "第三方信息处理与共享清单 — FitMeet",
  description: "说明 FitMeet 接入的云服务、模型、邮件与 Apple 系统服务，以及对应场景、信息种类和启用条件。",
  alternates: { canonical: "/privacy/third-parties" },
};

const sections = [
  {
    index: "01",
    title: "清单说明",
    body: [
      <>本清单是<Link href="/privacy">《FitMeet 隐私政策》</Link>的组成部分，用于具体说明受托处理方、独立第三方或系统服务可能接触的信息。是否实际处理取决于你使用的功能、授权状态和当时启用的生产配置。</>,
      "我们区分服务端 API、操作系统能力和客户端 SDK。仅被编译进应用但没有收到个人信息的开源代码库，不会因为存在于安装包中就被列为信息接收方；一旦其服务端、遥测或上传能力被启用，会在处理发生前更新本清单。",
      `本清单由 FitMeet 的运营主体及个人信息处理者 ${siteConfig.legalEntityName} 维护，隐私问题可发送至 ${siteConfig.contactEmail}。我们不会将本清单解释为允许服务商把数据用于其自身广告营销。`,
    ],
  },
  {
    index: "02",
    title: "阿里云基础设施与安全服务",
    body: [
      "服务提供者：阿里云计算有限公司。角色：按照 FitMeet 指示提供受托处理能力。使用场景：云服务器、RDS 数据库、OSS 图片存储、短信验证码、图片或内容安全审核，以及必要的运行与安全日志。",
      "可能处理的信息：手机号和验证码请求记录、账号与业务数据、用户主动上传的图片、待审核内容、IP 地址、请求时间、接口结果及必要安全日志。处理方式：加密网络传输、在授权云资源内存储或计算；只有对应功能启用且请求发生时才处理。",
      <>使用目的：完成账号登录、业务数据存储、图片展示、内容安全和故障排查。我们按照生产资源的实际地域与保存期限配置最小权限。服务方政策可查看<a href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud201902141711_54837.html" target="_blank" rel="noreferrer">阿里云官网隐私权政策</a>。</>,
    ],
  },
  {
    index: "03",
    title: "阿里企业邮箱投递服务",
    body: [
      "服务提供者：阿里云计算有限公司。角色：按照 FitMeet 指示提供安全邮件投递。使用场景：邮箱注册验证、重新发送验证邮件、忘记密码和账号安全通知。",
      "可能处理的信息：收件邮箱地址、一次性验证或重置通知、投递时间、发送结果、退信和必要的邮件安全日志。邮件中的一次性令牌仅用于对应安全操作，不用于个性化广告。",
      <>启用条件：只有用户主动发起相应账号流程并且生产 SMTP 配置通过安全校验时才发送。服务方条款可查看<a href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20231121171207894/20231121171207894.html" target="_blank" rel="noreferrer">阿里企业邮箱产品服务条款</a>。</>,
    ],
  },
  {
    index: "04",
    title: "DeepSeek 模型 API",
    body: [
      "服务名称与接收方：DeepSeek（深度求索）模型 API，由杭州深度求索人工智能基础技术研究有限公司及其关联公司提供。角色：为 FitMeet Agent 提供语言理解与生成计算。使用场景：用户主动发起 Agent 对话、需求草稿整理和匹配理由解释。",
      "授权条件：只有用户在 App 内独立的“第三方 AI 数据共享授权”页面看到接收方、信息种类和用途并主动点击“同意并继续”后，服务端才允许调用 DeepSeek。不同意或撤回后不会继续发送，并退出当前账号；一般用户协议或隐私政策勾选不会替代该项授权。",
      "可能处理的信息：用户主动输入的文字、语音转写文本、主动选择的压缩图片内容和图片说明、主动选择的文档中为当前请求提取的文本、完成当前请求所需的最小会话上下文、经确认且与当前请求直接相关的资料与需求字段，以及请求时间、模型结果和必要安全元数据。不会为无关目的发送登录密码、验证码、精确住址、证件、通讯录或整套私聊记录，也不会读取整套相册。",
      "用途：仅用于理解当前请求、生成 AI 回复、整理可编辑需求草稿、解释匹配结果和进行必要的安全控制，不用于跨应用广告跟踪。",
      <>保护方式：FitMeet 使用服务端代理、加密传输、字段白名单、上下文裁剪、访问控制、日志脱敏和权限隔离，并要求 DeepSeek 对接收的信息提供与 FitMeet 隐私政策相同或同等级别的保护。DeepSeek 公开政策说明其采用安全技术和管理措施、加密存储与传输、最小化收集，并在必要期限届满后删除或匿名化。FitMeet 仍负责授权校验、最小化发送、供应商管理以及协助用户行使删除权。详情可查看<a href="https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html" target="_blank" rel="noreferrer">DeepSeek 隐私政策</a>。</>,
    ],
  },
  {
    index: "05",
    title: "Apple 系统服务",
    body: [
      "服务名称：Apple Push Notification service（APNs）与系统语音识别。角色：由 Apple 按设备地区、系统设置和用户与 Apple 之间的条款提供操作系统能力。",
      "可能处理的信息：APNs 推送设备令牌、最小化通知内容、发送状态；用户主动开始语音输入时的语音片段、语言设置和转写所需技术信息。FitMeet 不在后台持续监听，也不把通知正文扩大到超出提醒所必需的范围。",
      <>启用条件：语音识别须取得麦克风和语音识别权限；APNs 仅在用户允许通知且生产推送凭据配置完成后启用。处理地点可能受 Apple 服务架构影响，详见<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noreferrer">Apple 隐私政策</a>。</>,
    ],
  },
  {
    index: "06",
    title: "未启用能力与变更规则",
    body: [
      "当前不启用跨应用广告跟踪，不接入广告投放 SDK，不以基本社交功能为由读取通讯录。Apple 一键登录、Google 一键登录以及新的崩溃监测或统计服务，仅在完成服务商、信息种类、目的、权限、保存期限和跨境影响核验后开放。",
      "新增接收方、改变处理目的、扩大信息种类或启用新的 SDK 前，我们会先更新本清单；依法需要单独同意或重新同意时，会在处理发生前向用户提供选择。",
      <>本清单版本为 1.1，更新及生效日期为 2026-08-20。历史政策版本可在<Link href="/legal/versions">法律文件版本记录</Link>中查阅。</>,
    ],
  },
];

export default function ThirdPartyDisclosurePage() {
  return (
    <EditorialPolicyPage
      eyebrow="第三方信息处理与共享清单"
      title={["谁参与处理", "为何需要信息"]}
      introduction="按服务、场景和启用条件公开 FitMeet 的外部信息处理边界"
      status="现行有效"
      sections={sections}
      relatedHref="/privacy"
      relatedLabel="隐私政策"
      navigationContext="第三方信息处理与共享清单"
      version="1.1"
      effectiveDate="2026-08-20"
      updatedAt="2026-08-20"
      notice={{
        title: "先说明边界",
        body: [
          "列入本清单不表示服务商可以独立决定如何使用信息。受托服务商仅应在 FitMeet 指示和提供功能所必需的范围内处理。",
          "当功能未启用、用户未触发或权限未授予时，不会仅因为清单列明就发生对应处理。",
        ],
      }}
      resources={[
        { href: "/terms", label: "用户服务协议" },
        { href: "/legal/versions", label: "法律文件版本记录" },
      ]}
    />
  );
}
