export type SystemPageKey = "privacy" | "terms" | "cookies" | "notFound" | "thankYou";

export type SystemPageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  marker: string;
  panels: Array<{
    id: string;
    title: string;
    body: string;
    items: string[];
  }>;
  closing: {
    title: string;
    body: string;
  };
};

export const systemPages: Record<SystemPageKey, SystemPageContent> = {
  privacy: {
    eyebrow: "PRIVACY / BOUNDARY",
    title: "隐私边界先于连接。",
    subtitle:
      "FitMeet 只在组织真实计划、确认公开场景、维护安全边界时使用必要信息。位置、需求、敏感信息和合作数据必须被解释清楚，而不是被默认扩散。",
    primaryCta: { label: "查看安全边界", href: "/safety" },
    secondaryCta: { label: "联系 FitMeet", href: "/contact" },
    marker: "DATA STAYS IN CONTEXT",
    panels: [
      {
        id: "01",
        title: "我们收集什么",
        body: "FitMeet 围绕真实需求和计划上下文工作，不把社交变成无边界资料展示。",
        items: ["账号与基础联系信息", "你主动输入的生活需求", "计划偏好、时间、公开地点和退出方式", "安全反馈、举报、屏蔽和客服沟通记录"]
      },
      {
        id: "02",
        title: "为什么收集",
        body: "信息只服务于把一句想法组织成一次更安全、更清楚、更容易发生的真实到场。",
        items: ["理解需求场景", "生成可执行计划", "确认边界和公开地点", "减少骚扰、冒充和恶意行为"]
      },
      {
        id: "03",
        title: "位置和公开场景",
        body: "FitMeet 优先使用公开地点和场景级信息，不把精确个人位置作为社交展示素材。",
        items: ["公开地点优先", "个人位置不默认公开", "可退出机制优先于连接", "敏感场景进入更严格的安全处理"]
      },
      {
        id: "04",
        title: "企业合作边界",
        body: "企业合作不能绕过用户价值，也不能拿到不必要的敏感个人信息或敏感信息明细。",
        items: ["不共享敏感个人信息", "不出售个人联系信息", "合作只围绕真实场景价值", "报告只做必要、聚合、可解释的趋势说明"]
      },
      {
        id: "05",
        title: "用户控制方式",
        body: "你应该能理解、调整、退出或删除自己的数据路径。",
        items: ["查看和修改基础信息", "撤回或结束计划", "举报和屏蔽不适行为", "通过联系入口请求数据删除或更正"]
      }
    ],
    closing: {
      title: "没有边界，就没有真实连接。",
      body: "Social World 不是把人暴露给更多人，而是让真实需求在清楚边界里进入现实。"
    }
  },
  terms: {
    eyebrow: "TERMS / REAL SOCIAL CONTRACT",
    title: "真实社交条款，需要共同遵守边界。",
    subtitle:
      "FitMeet 条款不是为了制造门槛，而是让公开场景、真实计划和低压力连接可以持续发生。使用 FitMeet，意味着你同意先尊重计划、边界和他人安全。",
    primaryCta: { label: "查看安全机制", href: "/safety" },
    secondaryCta: { label: "回到 Social World", href: "/" },
    marker: "REAL PLANS NEED REAL RULES",
    panels: [
      {
        id: "01",
        title: "真实社交契约",
        body: "FitMeet 围绕现实计划组织连接，不支持伪装身份、误导计划或制造骚扰。",
        items: ["真实表达需求", "尊重公开场景", "按确认后的计划参与", "允许他人拒绝、退出和沉默"]
      },
      {
        id: "02",
        title: "用户责任",
        body: "每个参与者都需要对自己的表达、到场行为和互动边界负责。",
        items: ["不冒充他人", "不发布虚假或诱导信息", "不持续打扰已经拒绝的人", "不把平台用于违法、危险、恶意行为或伤害行为"]
      },
      {
        id: "03",
        title: "平台边界",
        body: "FitMeet 可以帮助组织计划和降低发起成本，但不能替代线下判断和专业服务。",
        items: ["不保证每个计划一定发生", "不保证所有参与者完全符合预期", "不替代医疗、法律、金融或心理专业建议", "安全事件将按规则处理，但紧急危险应先联系当地紧急服务"]
      },
      {
        id: "04",
        title: "活动风险提示",
        body: "运动、出行、聚会和城市活动都可能存在现实风险。计划越清楚，风险越容易被看见和处理。",
        items: ["确认地点和时间", "选择公开或可信场所", "保留退出方式", "根据自身健康和环境条件决定是否参与"]
      },
      {
        id: "05",
        title: "禁止行为",
        body: "任何破坏真实到场、侵犯他人边界或制造安全风险的行为都不被允许。",
        items: ["骚扰、威胁、辱骂或跟踪", "冒充、欺骗或恶意引导", "发布违法、色情、暴力或危险内容", "绕过举报、屏蔽、退出和安全机制"]
      }
    ],
    closing: {
      title: "先守住边界，再靠近彼此。",
      body: "真实社交不是更快接触更多人，而是让一件可以一起做的事安全地发生。"
    }
  },
  cookies: {
    eyebrow: "COOKIE / EXPLAINABLE TRACKING",
    title: "我们只使用必要、透明且可解释的 Cookie。",
    subtitle:
      "FitMeet 官网的 Cookie 原则很简单：让页面能稳定运行、理解内容是否有效、用透明方式为未来合规预留控制能力。不使用 Cookie 制造不可解释的个人画像。",
    primaryCta: { label: "查看隐私边界", href: "/privacy" },
    secondaryCta: { label: "联系 FitMeet", href: "/contact" },
    marker: "NO DARK TRACKING",
    panels: [
      {
        id: "01",
        title: "必要 Cookie",
        body: "必要 Cookie 用于页面基础运行、偏好保存和安全状态，不用于扩大社交曝光。",
        items: ["基础页面状态", "安全和防滥用状态", "语言或体验偏好", "表单提交后的状态提示"]
      },
      {
        id: "02",
        title: "分析 Cookie",
        body: "未来如果启用分析工具，只用于理解页面是否清楚、内容是否有效、入口是否可用。",
        items: ["页面访问趋势", "CTA 是否被看见", "内容阅读路径", "错误和性能信号"]
      },
      {
        id: "03",
        title: "不会做什么",
        body: "Cookie 不应该成为不可解释的追踪网络，也不应该绕过真实需求和边界确认。",
        items: ["不出售个人联系信息", "不做不可解释的敏感画像", "不把 Cookie 结果作为线下安全判断", "不把企业合作凌驾于用户控制之上"]
      },
      {
        id: "04",
        title: "用户控制方式",
        body: "你可以通过浏览器设置清除或限制 Cookie。未来如启用更多工具，FitMeet 应提供更清楚的同意和撤回路径。",
        items: ["浏览器清除 Cookie", "浏览器限制第三方 Cookie", "通过联系入口询问数据使用", "未来预留同意管理机制"]
      }
    ],
    closing: {
      title: "可解释，才值得被保留。",
      body: "Social World 需要可信的底层规则。任何追踪都必须服务于清楚体验，而不是制造黑箱。"
    }
  },
  notFound: {
    eyebrow: "404 / ROUTE MISSING",
    title: "这条路线暂时没有计划。",
    subtitle:
      "你到达了一个还没有被组织起来的页面。回到 Social World，从一个真实需求、公开场景和清楚边界重新开始。",
    primaryCta: { label: "回到 Social World", href: "/" },
    secondaryCta: { label: "开始一次真实计划", href: "/product" },
    marker: "NO PLAN ON THIS ROUTE",
    panels: [
      {
        id: "01",
        title: "路线不存在",
        body: "这个地址没有对应的可访问页面，可能是链接过期、路径输入错误，或计划尚未公开。",
        items: ["检查地址", "返回首页", "查看产品机制", "从联系入口告诉我们问题"]
      },
      {
        id: "02",
        title: "你可以继续",
        body: "FitMeet 的核心不是这个错误页面，而是把真实想法变成现实里的下一步。",
        items: ["查看 Social World", "理解社交 Agent", "查看安全边界", "进入联系入口"]
      }
    ],
    closing: {
      title: "没有这条路，也可以重新发起。",
      body: "一句想法，仍然可以变成一次真实到场。"
    }
  },
  thankYou: {
    eyebrow: "THANK YOU / SIGNAL RECEIVED",
    title: "你的真实需求已进入计划队列。",
    subtitle:
      "这不是一句自动回复。FitMeet 的下一步是把需求、公开场景、时间、边界和可执行计划组织起来，让真实到场更容易发生。",
    primaryCta: { label: "查看产品机制", href: "/product" },
    secondaryCta: { label: "继续了解 Social World", href: "/community" },
    marker: "SIGNAL INTO PLAN",
    panels: [
      {
        id: "01",
        title: "需求已收到",
        body: "你的输入会被当作真实生活信号，而不是普通营销线索。",
        items: ["理解你想做什么", "确认场景和时间", "判断公开地点", "准备边界和退出方式"]
      },
      {
        id: "02",
        title: "下一步会发生什么",
        body: "FitMeet 会优先把模糊想法整理成可以执行的计划路径。",
        items: ["计划先成形", "边界先确认", "同频的人后出现", "安全问题单独处理"]
      },
      {
        id: "03",
        title: "如果你来自企业合作",
        body: "合作需求会进入真实场景价值判断，不会绕过用户安全和隐私边界。",
        items: ["场景是否真实", "是否帮助年轻人到场", "是否尊重隐私", "是否能沉淀长期价值"]
      }
    ],
    closing: {
      title: "Social World 从下一次真实到场继续。",
      body: "真实计划。真实的人。就在附近。"
    }
  }
};
