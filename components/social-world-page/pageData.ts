export type MediaAsset = {
  src: string;
  alt: string;
};

export type SocialWorldSection = {
  kicker: string;
  title: string;
  body: string;
  media: MediaAsset;
  proof: Array<{
    label: string;
    value: string;
  }>;
};

export type SocialWorldPageConfig = {
  slug:
    | "home"
    | "product"
    | "scenes"
    | "community"
    | "safety"
    | "about"
    | "journal"
    | "contact"
    | "privacy"
    | "terms"
    | "cookies"
    | "not-found"
    | "thank-you";
  navLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  hero: MediaAsset;
  ticker: string[];
  sections: SocialWorldSection[];
  final: {
    title: string;
    body: string;
    cta: string;
    href: string;
  };
};

const media = {
  heroNightRun: {
    src: "/images/home-v5/hero-night-run-social-world-poster.jpg",
    alt: "雨后城市夜路上年轻人准备夜跑的电影感画面"
  },
  streetPlaza: {
    src: "/images/home-v5/scene-public-plan-plaza-poster.jpg",
    alt: "公共城市广场里年轻人确认计划和集合边界"
  },
  cityNetwork: {
    src: "/images/home-v5/vision-arrival-network-poster.jpg",
    alt: "城市真实场景被计划连接成社交世界"
  },
  partnerArrival: {
    src: "/images/home-v5/partner-arrival-value-poster.jpg",
    alt: "真实到场意图进入场馆和合作空间"
  },
  nightRun: {
    src: "/images/home-v5/scene-night-run-poster.jpg",
    alt: "夜跑公开路线与年轻人行动场景"
  },
  court: {
    src: "/images/home-v5/scene-court-dispatch-poster.jpg",
    alt: "球馆灯光下的低压力运动集合"
  },
  citywalk: {
    src: "/images/home-v5/scene-citywalk-case-poster.jpg",
    alt: "街角和斑马线上的城市漫游同行"
  },
  weekend: {
    src: "/images/home-v5/scene-weekend-trip-poster.jpg",
    alt: "周末短途公开集合与城市出发的电影感场景"
  }
} satisfies Record<string, MediaAsset>;

const coreTicker = [
  "真实需求",
  "公开场景",
  "边界先行",
  "计划收据",
  "同频出现",
  "城市节点",
  "Social World"
];

export const pageConfigs: Record<SocialWorldPageConfig["slug"], SocialWorldPageConfig> = {
  home: {
    slug: "home",
    navLabel: "首页",
    eyebrow: "FitMeet = Social World",
    title: "Social World",
    subtitle: "社交不是筛选，是现实里发生。一句想法，变成一次真实到场。",
    primaryCta: { label: "开始一次真实计划", href: "/contact#waitlist" },
    secondaryCta: { label: "了解社交 Agent", href: "/product" },
    hero: media.heroNightRun,
    ticker: coreTicker,
    sections: [
      {
        kicker: "Need",
        title: "先说你想做什么。",
        body: "今晚想夜跑、周末想打球、下班想走一段。FitMeet 不从头像开始，而从一个真实生活需求开始。",
        media: media.nightRun,
        proof: [
          { label: "输入", value: "一句真实想法" },
          { label: "场景", value: "时间 / 地点 / 强度" },
          { label: "节奏", value: "低压力，可确认" }
        ]
      },
      {
        kicker: "Agent Plan",
        title: "Agent 把念头压成计划。",
        body: "社交 Agent 整理路线、集合点、人数范围、退出方式和同频理由。先有安排，再出现合适的人。",
        media: media.streetPlaza,
        proof: [
          { label: "计划", value: "路线 / 时间 / 备选" },
          { label: "边界", value: "公开地点，可退出" },
          { label: "邀请", value: "确认后出现" }
        ]
      },
      {
        kicker: "Real People",
        title: "真人最后出现。",
        body: "不是筛选，不靠头像判断。人因为同一个计划、同一个边界、同一个场景自然出现。",
        media: media.citywalk,
        proof: [
          { label: "同频", value: "同一时间" },
          { label: "同场", value: "同一公开地点" },
          { label: "同边界", value: "都知道怎么退出" }
        ]
      },
      {
        kicker: "Social World",
        title: "城市里的计划连成世界。",
        body: "夜跑、球馆、桌游、城市漫游、短途出发，一个个真实计划变成城市生活网络。",
        media: media.cityNetwork,
        proof: [
          { label: "城市节点", value: "可复访的真实计划" },
          { label: "公司愿景", value: "让城市重新可连接" },
          { label: "企业价值", value: "真实需求接近成交" }
        ]
      }
    ],
    final: {
      title: "真实计划。真实的人。就在附近。",
      body: "从一个真实需求开始，让社交回到城市里。",
      cta: "进入 Social World",
      href: "/contact#waitlist"
    }
  },
  product: {
    slug: "product",
    navLabel: "产品",
    eyebrow: "Social Agent",
    title: "先有计划，再出现合适的人。",
    subtitle: "FitMeet 的 Agent 不是陪聊机器人。它把需求、场景、边界和计划整理成一次可以真实发生的线下行动。",
    primaryCta: { label: "体验计划生成", href: "/contact#waitlist" },
    secondaryCta: { label: "查看真实场景", href: "/scenes" },
    hero: media.streetPlaza,
    ticker: ["需求理解", "上下文判断", "边界协议", "计划收据", "同频理由", "确认后邀请"],
    sections: [
      {
        kicker: "Demand Intake",
        title: "一句需求，先被拆清楚。",
        body: "活动类型、时间窗口、地点半径、强度、人数、预算和社交压力先被理解，避免把人直接推向陌生关系。",
        media: media.nightRun,
        proof: [
          { label: "活动", value: "夜跑 / 球局 / 漫游" },
          { label: "上下文", value: "时间、距离、强度" },
          { label: "压力", value: "低压力优先" }
        ]
      },
      {
        kicker: "Boundary Protocol",
        title: "边界是产品的一部分。",
        body: "公开地点、小组偏好、可退出机制、确认后邀请先进入计划。安全不是政策页，它在行动发生之前。",
        media: media.court,
        proof: [
          { label: "地点", value: "公开场景优先" },
          { label: "退出", value: "不合适可以停下" },
          { label: "邀请", value: "确认后出现真人" }
        ]
      },
      {
        kicker: "Plan Receipt",
        title: "计划需要可回看。",
        body: "每次连接都应该留下计划收据：为什么见、在哪里见、怎么退出、谁适合加入。",
        media: media.partnerArrival,
        proof: [
          { label: "收据", value: "活动、路线、集合点" },
          { label: "理由", value: "同频不是头像相似" },
          { label: "结果", value: "可复访的生活节点" }
        ]
      }
    ],
    final: {
      title: "把一个想法交给 Agent。",
      body: "让它变成有边界、可确认、能到场的真实计划。",
      cta: "开始产品体验",
      href: "/contact#waitlist"
    }
  },
  scenes: {
    slug: "scenes",
    navLabel: "场景",
    eyebrow: "Use Cases",
    title: "先有具体的事。",
    subtitle: "每一次连接，都从一个真实场景开始。夜跑、球馆、桌游、城市漫游、周末短途都先变成可到场的计划。",
    primaryCta: { label: "选择一个真实场景", href: "/contact#waitlist" },
    secondaryCta: { label: "查看安全边界", href: "/safety" },
    hero: media.court,
    ticker: ["夜跑", "球馆", "桌游", "城市漫游", "周末短途", "公开集合"],
    sections: [
      {
        kicker: "Night Run",
        title: "今晚想跑步，但不想一个人。",
        body: "公开路线、轻松配速、2 到 4 人、跑后可直接离开。真实运动需求先成立。",
        media: media.nightRun,
        proof: [
          { label: "路线", value: "公开跑道" },
          { label: "强度", value: "轻松配速" },
          { label: "边界", value: "小组优先" }
        ]
      },
      {
        kicker: "Court",
        title: "球馆见，比聊天自然。",
        body: "球馆、强度、新手友好、人数上限。计划越清楚，社交压力越低。",
        media: media.court,
        proof: [
          { label: "场地", value: "公开球馆" },
          { label: "人数", value: "4 到 6 人" },
          { label: "确认", value: "预约前确认" }
        ]
      },
      {
        kicker: "Citywalk",
        title: "低压力同行，不强迫续场。",
        body: "街角、便利店、斑马线、咖啡停靠。年轻人的轻社交应该有退出空间。",
        media: media.citywalk,
        proof: [
          { label: "路线", value: "公开街区" },
          { label: "节奏", value: "慢速同行" },
          { label: "结束", value: "可继续可离开" }
        ]
      },
      {
        kicker: "Weekend",
        title: "短途也能有边界。",
        body: "预算清楚、白天路线、公开集合、日落前结束。出发之前，先把不确定性降下来。",
        media: media.weekend,
        proof: [
          { label: "集合", value: "公开交通节点" },
          { label: "预算", value: "透明" },
          { label: "时间", value: "白天结束" }
        ]
      }
    ],
    final: {
      title: "从你的场景开始。",
      body: "真实生活越具体，社交越容易发生。",
      cta: "提交一个场景",
      href: "/contact#waitlist"
    }
  },
  community: {
    slug: "community",
    navLabel: "社区",
    eyebrow: "Community",
    title: "城市里的计划，正在连成一个社交世界。",
    subtitle: "FitMeet 不是一个功能工具，而是一层年轻人可以复访、加入和继续生活的城市网络。",
    primaryCta: { label: "进入 Social World", href: "/contact#waitlist" },
    secondaryCta: { label: "成为城市节点", href: "/contact#enterprise" },
    hero: media.cityNetwork,
    ticker: ["城市节点", "真实计划网络", "低压力社交", "社区复访", "生活方式合作"],
    sections: [
      {
        kicker: "City Nodes",
        title: "节点不是地图点，是正在发生的事。",
        body: "球馆、路线、桌游空间、街角、目的地，都因为真实计划变成可以加入的城市节点。",
        media: media.streetPlaza,
        proof: [
          { label: "节点", value: "场景先成立" },
          { label: "复访", value: "计划可继续" },
          { label: "低压力", value: "公开空间" }
        ]
      },
      {
        kicker: "Community Loop",
        title: "需求、计划、到场、复访。",
        body: "一次行动结束后，不是关系被强迫延续，而是留下下一次可以自然出现的城市生活线索。",
        media: media.citywalk,
        proof: [
          { label: "开始", value: "真实需求" },
          { label: "发生", value: "公开计划" },
          { label: "继续", value: "可复访节点" }
        ]
      },
      {
        kicker: "Partner Nodes",
        title: "企业进入真实意图，不打断体验。",
        body: "场馆、活动空间、生活方式品牌可以成为计划节点，而不是在用户没有需求时制造打扰。",
        media: media.partnerArrival,
        proof: [
          { label: "价值", value: "到场意图" },
          { label: "效率", value: "更精准承接" },
          { label: "未来", value: "城市生活基础设施" }
        ]
      }
    ],
    final: {
      title: "让一座城市开始连接。",
      body: "Social World 从真实生活节点开始增长。",
      cta: "联系城市合作",
      href: "/contact#enterprise"
    }
  },
  safety: {
    slug: "safety",
    navLabel: "安全",
    eyebrow: "Trust & Safety",
    title: "先确认边界，再靠近彼此。",
    subtitle: "社交产品必须把安全放进产品顺序里。FitMeet 先确认公开地点、退出机制和邀请边界，再让真人出现。",
    primaryCta: { label: "在边界内开始", href: "/contact#waitlist" },
    secondaryCta: { label: "查看隐私规则", href: "/privacy" },
    hero: media.streetPlaza,
    ticker: ["公开地点", "确认后邀请", "可退出", "举报屏蔽", "隐私保护", "未成年人边界"],
    sections: [
      {
        kicker: "Public Place First",
        title: "公开地点先成立。",
        body: "路线、球馆、桌游空间、街区集合点先被确认。任何连接都不从私密空间开始。",
        media: media.court,
        proof: [
          { label: "地点", value: "公开优先" },
          { label: "模糊", value: "不暴露住址" },
          { label: "确认", value: "计划先行" }
        ]
      },
      {
        kicker: "Exit Mechanism",
        title: "不合适，可以停下。",
        body: "计划需要有结束点、退出方式和重新确认机制。低压力不是口号，是产品结构。",
        media: media.citywalk,
        proof: [
          { label: "退出", value: "活动中可停止" },
          { label: "续场", value: "不默认继续" },
          { label: "举报", value: "入口靠近计划" }
        ]
      },
      {
        kicker: "Minor Boundary",
        title: "未成年人边界必须清楚。",
        body: "涉及年龄、活动风险和公开场景时，FitMeet 采用更严格的参与限制、内容保护和人工治理入口。",
        media: media.weekend,
        proof: [
          { label: "年龄", value: "更严格限制" },
          { label: "风险", value: "活动前提示" },
          { label: "隐私", value: "敏感信息不共享" }
        ]
      }
    ],
    final: {
      title: "边界清楚，连接才可信。",
      body: "FitMeet 不用恐吓式安全文案，而用可执行的产品顺序建立信任。",
      cta: "阅读隐私边界",
      href: "/privacy"
    }
  },
  about: {
    slug: "about",
    navLabel: "关于",
    eyebrow: "About FitMeet",
    title: "我们不从关系开始。我们从真实生活开始。",
    subtitle: "我们正在用社交 Agent 解决年轻人线下社交启动难、边界不清、计划难成行的问题。",
    primaryCta: { label: "了解产品与服务", href: "/product" },
    secondaryCta: { label: "联系企业合作", href: "/contact#enterprise" },
    hero: media.cityNetwork,
    ticker: ["现在计划", "行业痛点", "3-5 年展望", "改变世界", "城市生活平台"],
    sections: [
      {
        kicker: "Now",
        title: "先解决社交启动成本。",
        body: "年轻人不是不想见人，而是不知道从哪里开始、怎么保持边界、怎样让一次活动真的发生。",
        media: media.nightRun,
        proof: [
          { label: "痛点", value: "有需求，难启动" },
          { label: "技术", value: "Agent 组织计划" },
          { label: "产品", value: "边界先行" }
        ]
      },
      {
        kicker: "3-5 Years",
        title: "帮助更多人重新进入真实生活。",
        body: "未来 3-5 年，FitMeet 希望帮助更多年轻人在新城市、下班后、周末和运动场景中找到可以一起做的事。",
        media: media.streetPlaza,
        proof: [
          { label: "个人", value: "更容易开始" },
          { label: "企业", value: "更精准承接" },
          { label: "城市", value: "更多真实节点" }
        ]
      },
      {
        kicker: "Final Goal",
        title: "让城市重新变得可连接。",
        body: "最终目标不是制造更多在线关系，而是让真实世界里的一件件小事重新把人连接起来。",
        media: media.cityNetwork,
        proof: [
          { label: "愿景", value: "改变社交顺序" },
          { label: "世界", value: "从计划开始" },
          { label: "原则", value: "真实生活优先" }
        ]
      }
    ],
    final: {
      title: "让年轻人在任何一座城市，都能找到一件可以一起做的事。",
      body: "这是 FitMeet 的长期方向。",
      cta: "联系我们",
      href: "/contact"
    }
  },
  journal: {
    slug: "journal",
    navLabel: "动态",
    eyebrow: "Journal",
    title: "记录城市社交如何重新发生。",
    subtitle: "这里不是公关稿列表，而是 FitMeet 的产品进展、城市观察、技术实验和合作动态。",
    primaryCta: { label: "订阅产品进展", href: "/contact#waitlist" },
    secondaryCta: { label: "提交合作线索", href: "/contact#enterprise" },
    hero: media.citywalk,
    ticker: ["产品进展", "城市观察", "技术实验", "合作动态", "年轻人生活方式"],
    sections: [
      {
        kicker: "Product Notes",
        title: "我们公开产品判断。",
        body: "从需求理解、边界协议、计划收据到视频化官网，我们记录每次让真实社交更清楚的产品选择。",
        media: media.streetPlaza,
        proof: [
          { label: "栏目", value: "产品进展" },
          { label: "读者", value: "用户 / 合作方" },
          { label: "目标", value: "长期可信" }
        ]
      },
      {
        kicker: "City Notes",
        title: "观察年轻人的城市生活。",
        body: "夜跑、球馆、桌游、城市漫游和短途出发，都是理解年轻人社交变化的真实入口。",
        media: media.court,
        proof: [
          { label: "SEO", value: "场景内容增长" },
          { label: "城市", value: "真实地点" },
          { label: "洞察", value: "需求先于人" }
        ]
      }
    ],
    final: {
      title: "让内容成为 Social World 的长期入口。",
      body: "酷炫首页不能代替增长入口。Journal 负责让品牌长期被理解。",
      cta: "加入内容更新",
      href: "/contact#waitlist"
    }
  },
  contact: {
    slug: "contact",
    navLabel: "联系",
    eyebrow: "Contact",
    title: "个人体验、企业合作、测试加入，都从这里进入。",
    subtitle: "如果你想体验 FitMeet，或希望把场馆、活动、品牌接入真实到场意图，请联系我们。",
    primaryCta: { label: "加入测试", href: "mailto:15253005312@163.com?subject=FitMeet%20%E6%B5%8B%E8%AF%95%E5%8A%A0%E5%85%A5" },
    secondaryCta: { label: "企业合作", href: "mailto:15253005312@163.com?subject=FitMeet%20%E4%BC%81%E4%B8%9A%E5%90%88%E4%BD%9C" },
    hero: media.partnerArrival,
    ticker: ["个人体验", "企业合作", "城市节点", "场馆接入", "15253005312@163.com"],
    sections: [
      {
        kicker: "Waitlist",
        title: "把你的真实需求交给我们。",
        body: "夜跑、球局、桌游、城市漫游、短途出发。告诉我们你最希望 FitMeet 先解决哪一种真实社交场景。",
        media: media.nightRun,
        proof: [
          { label: "入口", value: "个人体验" },
          { label: "方式", value: "邮件说明需求" },
          { label: "反馈", value: "进入计划队列" }
        ]
      },
      {
        kicker: "Enterprise",
        title: "真实需求，比曝光更接近成交。",
        body: "企业合作请联系 15253005312@163.com。FitMeet 能帮助企业获得更精准的用户、更省时的承接和更高效的到场转化。",
        media: media.partnerArrival,
        proof: [
          { label: "更精准", value: "用户已有真实需求" },
          { label: "更省时", value: "计划先被整理" },
          { label: "更高效", value: "合作进入到场时刻" }
        ]
      }
    ],
    final: {
      title: "合作请联系我们。",
      body: "15253005312@163.com",
      cta: "发送邮件",
      href: "mailto:15253005312@163.com?subject=FitMeet%20%E5%90%88%E4%BD%9C%E5%92%A8%E8%AF%A2"
    }
  },
  privacy: {
    slug: "privacy",
    navLabel: "隐私",
    eyebrow: "Privacy",
    title: "位置、需求和边界，都需要被谨慎处理。",
    subtitle: "FitMeet 的隐私原则：只为生成计划使用必要信息，不把敏感信息交给合作方，不公开个人住址和精确轨迹。",
    primaryCta: { label: "联系隐私问题", href: "mailto:15253005312@163.com?subject=FitMeet%20%E9%9A%90%E7%A7%81%E9%97%AE%E9%A2%98" },
    secondaryCta: { label: "查看条款", href: "/terms" },
    hero: media.streetPlaza,
    ticker: ["必要信息", "位置隐私", "合作不共享敏感信息", "删除路径", "公开场景"],
    sections: [
      {
        kicker: "Data Use",
        title: "数据只服务计划。",
        body: "活动类型、时间偏好、距离范围和边界偏好用于生成计划，不用于制造无关推荐。",
        media: media.citywalk,
        proof: [
          { label: "使用", value: "计划生成" },
          { label: "限制", value: "不共享敏感信息" },
          { label: "删除", value: "可请求处理" }
        ]
      }
    ],
    final: {
      title: "隐私不是附录，是 Social World 的底线。",
      body: "如有隐私问题，请通过企业邮箱联系。",
      cta: "邮件联系",
      href: "mailto:15253005312@163.com?subject=FitMeet%20%E9%9A%90%E7%A7%81%E9%97%AE%E9%A2%98"
    }
  },
  terms: {
    slug: "terms",
    navLabel: "条款",
    eyebrow: "Terms",
    title: "真实社交需要共同契约。",
    subtitle: "用户需要对自己的真实需求、活动行为、边界选择和线下安全负责。FitMeet 提供计划组织与边界工具，不替代个人判断。",
    primaryCta: { label: "返回安全页", href: "/safety" },
    secondaryCta: { label: "联系支持", href: "mailto:15253005312@163.com?subject=FitMeet%20%E6%9D%A1%E6%AC%BE%E9%97%AE%E9%A2%98" },
    hero: media.weekend,
    ticker: ["用户责任", "平台边界", "活动风险", "举报处理", "真实计划契约"],
    sections: [
      {
        kicker: "Contract",
        title: "平台组织计划，不保证关系结果。",
        body: "FitMeet 帮助用户组织公开计划、边界和同频理由，但线下活动仍需要用户自主判断和遵守法律法规。",
        media: media.streetPlaza,
        proof: [
          { label: "责任", value: "用户行为自负" },
          { label: "平台", value: "提供组织工具" },
          { label: "治理", value: "举报与限制" }
        ]
      }
    ],
    final: {
      title: "真实连接，需要真实责任。",
      body: "条款服务于更清楚、更有边界的线下社交。",
      cta: "查看隐私规则",
      href: "/privacy"
    }
  },
  cookies: {
    slug: "cookies",
    navLabel: "Cookie",
    eyebrow: "Cookie Policy",
    title: "我们只预留必要的体验和分析边界。",
    subtitle: "当前官网以品牌展示和联系入口为主。未来如接入分析、表单或个性化体验，将清楚说明 Cookie 使用范围。",
    primaryCta: { label: "返回首页", href: "/" },
    secondaryCta: { label: "联系支持", href: "mailto:15253005312@163.com?subject=FitMeet%20Cookie%20%E9%97%AE%E9%A2%98" },
    hero: media.cityNetwork,
    ticker: ["必要 Cookie", "分析预留", "同意机制", "未来合规", "透明说明"],
    sections: [
      {
        kicker: "Policy",
        title: "Cookie 不能变成暗箱。",
        body: "任何用于分析、体验改进或合作转化的 Cookie，都应在上线前写清楚目的、范围和关闭方式。",
        media: media.partnerArrival,
        proof: [
          { label: "必要", value: "基础访问" },
          { label: "分析", value: "上线前声明" },
          { label: "选择", value: "预留关闭机制" }
        ]
      }
    ],
    final: {
      title: "透明，是企业官网的基础设施。",
      body: "Cookie Policy 为未来增长和合规预留清晰边界。",
      cta: "返回 Social World",
      href: "/"
    }
  },
  "not-found": {
    slug: "not-found",
    navLabel: "404",
    eyebrow: "404",
    title: "这条路线暂时没有计划。",
    subtitle: "你访问的页面还没有进入 Social World。回到首页，或者从一个真实需求重新开始。",
    primaryCta: { label: "回到首页", href: "/" },
    secondaryCta: { label: "联系我们", href: "/contact" },
    hero: media.streetPlaza,
    ticker: ["路线未生成", "回到首页", "重新开始", "Social World"],
    sections: [
      {
        kicker: "Route Missing",
        title: "不是所有路线都会成行。",
        body: "但真实需求可以重新进入计划队列。",
        media: media.nightRun,
        proof: [
          { label: "状态", value: "未找到页面" },
          { label: "下一步", value: "返回首页" },
          { label: "入口", value: "联系 FitMeet" }
        ]
      }
    ],
    final: {
      title: "重新开始一条路线。",
      body: "Social World 从下一句真实想法继续。",
      cta: "返回首页",
      href: "/"
    }
  },
  "thank-you": {
    slug: "thank-you",
    navLabel: "成功",
    eyebrow: "Thank You",
    title: "你的真实需求已进入计划队列。",
    subtitle: "感谢你关注 FitMeet。我们会围绕真实场景、公开边界和可执行计划继续推进。",
    primaryCta: { label: "回到首页", href: "/" },
    secondaryCta: { label: "查看产品", href: "/product" },
    hero: media.heroNightRun,
    ticker: ["需求已收到", "计划队列", "边界先行", "真实到场"],
    sections: [
      {
        kicker: "Received",
        title: "下一步不是筛选，是整理计划。",
        body: "我们会继续围绕真实生活需求，把 FitMeet 做成更清楚、更安全、更容易到场的 Social World。",
        media: media.cityNetwork,
        proof: [
          { label: "状态", value: "已收到" },
          { label: "方向", value: "真实计划" },
          { label: "原则", value: "边界先行" }
        ]
      }
    ],
    final: {
      title: "真实计划。真实的人。就在附近。",
      body: "感谢进入 FitMeet 的 Social World。",
      cta: "继续浏览",
      href: "/"
    }
  }
};
