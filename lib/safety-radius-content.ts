export type TrustMechanismState = "principle" | "building";

export type TrustLayerId =
  | "identity"
  | "consent"
  | "public-first"
  | "real-experience"
  | "response";

export type TrustLayer = {
  id: TrustLayerId;
  index: string;
  label: string;
  title: [string, string];
  body: [string, string];
  state: TrustMechanismState;
  asset: string;
  alt: string;
  focalPoint: string;
  radius: number;
  nodeAngle: number;
};

export const trustLayers: TrustLayer[] = [
  {
    id: "identity",
    index: "01",
    label: "身份真实",
    title: ["真实身份", "不等于公开隐私"],
    body: ["必要的验证用于帮助平台判断真实", "不意味着把敏感信息暴露给陌生人"],
    state: "building",
    asset: "/images/safety-radius/safety-identity-public-group-desktop.jpg",
    alt: "青年在开放公共空间自然交流",
    focalPoint: "50% 48%",
    radius: 100,
    nodeAngle: 214,
  },
  {
    id: "consent",
    index: "02",
    label: "明确同意",
    title: ["每一步", "都需要你的确认"],
    body: ["社交助手可以给出建议、整理计划", "但不会越过你的意愿替你作出关键决定"],
    state: "principle",
    asset: "/images/safety-radius/safety-consent-plan-desktop.jpg",
    alt: "青年在公共咖啡空间共同确认时间与计划",
    focalPoint: "55% 50%",
    radius: 82,
    nodeAngle: 224,
  },
  {
    id: "public-first",
    index: "03",
    label: "公共优先",
    title: ["第一次见面", "优先从公共空间开始"],
    body: ["清晰的时间、集合地点和活动安排", "让见面双方都知道将要发生什么"],
    state: "principle",
    asset: "/images/safety-radius/safety-public-plaza-hero-desktop.jpg",
    alt: "青年从不同方向进入开放城市公共广场",
    focalPoint: "52% 54%",
    radius: 65,
    nodeAngle: 232,
  },
  {
    id: "real-experience",
    index: "04",
    label: "真实经历",
    title: ["每一个评价都是", "活动后的真实分享"],
    body: ["未来的信任体系应围绕真实参与、", "履约情况与社区行为逐步建立"],
    state: "building",
    asset: "/images/safety-radius/safety-real-experience-desktop.jpg",
    alt: "青年完成公共球馆活动后整理装备并交流",
    focalPoint: "46% 50%",
    radius: 48,
    nodeAngle: 242,
  },
  {
    id: "response",
    index: "05",
    label: "拒绝与退出",
    title: ["你可以拒绝", "也可以随时退出"],
    body: ["骚扰、虚假身份和不当行为需要清晰的反馈入口", "应用内屏蔽与举报仍在建设中当前可进入支持中心"],
    state: "building",
    asset: "/images/safety-radius/safety-response-plaza-desktop.jpg",
    alt: "青年在傍晚公共广场寻求支持并保持清晰距离",
    focalPoint: "48% 50%",
    radius: 31,
    nodeAngle: 250,
  },
];

export const trustStateCopy: Record<TrustMechanismState, string> = {
  principle: "设计原则",
  building: "建设中",
};
