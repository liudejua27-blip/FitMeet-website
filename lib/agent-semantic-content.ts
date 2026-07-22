export type AgentScenarioId = "sport" | "travel" | "create";

export type SemanticNodeId =
  | "time"
  | "place"
  | "people"
  | "interest"
  | "budget"
  | "boundary";

export type SemanticNode = {
  id: SemanticNodeId;
  label: string;
  value: string;
  sourceText: string;
  status: "understood" | "needs-confirmation";
};

export type AgentScenario = {
  id: AgentScenarioId;
  index: string;
  category: string;
  intent: string;
  shortIntent: string;
  signal: string;
  planTitle: string;
  backgroundAsset: string;
  focalPoint: string;
  nodes: SemanticNode[];
  details: string[];
  matchReason: string;
};

export type AgentPlanStatus = "idle" | "extracting" | "ready" | "confirmed" | "cancelled";

export const agentScenarios: AgentScenario[] = [
  {
    id: "travel",
    index: "01",
    category: "旅行",
    intent: "周末想找旅行搭子",
    shortIntent: "周末想找旅行搭子",
    signal: "旅行 · 本周末",
    planTitle: "城市出逃计划已生成",
    backgroundAsset: "/images/agent-semantic/agent-intent-concourse-hero-desktop.jpg",
    focalPoint: "48% 52%",
    nodes: [
      { id: "time", label: "时间", value: "周六 08:30", sourceText: "周末", status: "understood" },
      { id: "place", label: "地点", value: "同城集合", sourceText: "旅行", status: "needs-confirmation" },
      { id: "people", label: "人数", value: "3 位青年", sourceText: "搭子", status: "understood" },
      { id: "interest", label: "兴趣", value: "轻徒步", sourceText: "旅行", status: "understood" },
      { id: "budget", label: "预算", value: "费用均摊", sourceText: "待确认", status: "needs-confirmation" },
      { id: "boundary", label: "边界", value: "当日往返", sourceText: "周末", status: "understood" },
    ],
    details: ["3 位同城青年", "周六 08:30 集合", "轻徒步 · 当日往返"],
    matchReason: "出发地、时间与路线偏好一致",
  },
  {
    id: "sport",
    index: "02",
    category: "运动",
    intent: "周六下午想找两三个人打羽毛球预算每人 60 元以内",
    shortIntent: "周六下午想找两三个人打羽毛球",
    signal: "运动 · 周六下午",
    planTitle: "周六 15:00 · 公共运动场馆 · 预计 90 分钟",
    backgroundAsset: "/images/agent-semantic/agent-sport-court-wide-desktop.jpg",
    focalPoint: "52% 50%",
    nodes: [
      { id: "time", label: "时间", value: "周六 15:00", sourceText: "周六下午", status: "understood" },
      { id: "place", label: "地点", value: "等待你选择", sourceText: "没有说明", status: "needs-confirmation" },
      { id: "people", label: "人数", value: "2–3 人", sourceText: "两三个人", status: "understood" },
      { id: "interest", label: "兴趣", value: "羽毛球", sourceText: "打羽毛球", status: "understood" },
      { id: "budget", label: "预算", value: "每人 ¥60 内", sourceText: "60 元以内", status: "understood" },
      { id: "boundary", label: "边界", value: "公共场馆 · 90 分钟", sourceText: "建议", status: "needs-confirmation" },
    ],
    details: ["2 位水平相近球友", "19:30 城市运动中心", "场地费均摊 · 90 分钟"],
    matchReason: "时间、水平与活动节奏相近",
  },
  {
    id: "create",
    index: "03",
    category: "共创",
    intent: "想找人拍一组城市照片",
    shortIntent: "想找人拍一组城市照片",
    signal: "共创 · 城市漫游",
    planTitle: "城市摄影搭子正在出现",
    backgroundAsset: "/images/agent-semantic/agent-create-photo-wide-desktop.jpg",
    focalPoint: "50% 48%",
    nodes: [
      { id: "time", label: "时间", value: "周日 16:00", sourceText: "待确认", status: "needs-confirmation" },
      { id: "place", label: "地点", value: "城市公共空间", sourceText: "城市", status: "understood" },
      { id: "people", label: "人数", value: "1 位摄影爱好者", sourceText: "找人", status: "understood" },
      { id: "interest", label: "兴趣", value: "街头光影", sourceText: "拍照片", status: "understood" },
      { id: "budget", label: "预算", value: "互拍共创", sourceText: "互拍", status: "understood" },
      { id: "boundary", label: "边界", value: "公开场所", sourceText: "城市", status: "understood" },
    ],
    details: ["1 位人像摄影爱好者", "周日下午 16:00", "街头光影 · 互拍共创"],
    matchReason: "时间与互拍方式一致",
  },
];

export const agentBoundaries = [
  {
    index: "01",
    title: "你决定要不要出发",
    body: "社交助手整理条件、减少反复沟通；邀请、确认和见面始终由你决定",
  },
  {
    index: "02",
    title: "先说明边界再连接关系",
    body: "时间、预算、活动强度和公开场所等条件在匹配之前被清楚表达",
  },
  {
    index: "03",
    title: "把线上意愿带到真实生活",
    body: "产品的终点不是更长的聊天而是一场双方确认、可以发生的共同活动",
  },
] as const;
