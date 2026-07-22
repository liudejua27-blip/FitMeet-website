export const demandExamples = [
  "周末想找旅行搭子",
  "下班后想打羽毛球",
  "想找人拍一组城市照片",
] as const;

export type DemandExample = (typeof demandExamples)[number];

export const socialPlans: Record<
  DemandExample,
  {
    signal: string;
    title: string;
    details: string[];
    match: string;
  }
> = {
  周末想找旅行搭子: {
    signal: "旅行 · 本周末",
    title: "城市出逃计划已生成",
    details: ["3 位同城青年", "周六 08:30 集合", "轻徒步 · 当日往返"],
    match: "相似度 92%",
  },
  下班后想打羽毛球: {
    signal: "运动 · 下班后",
    title: "今晚球局正在组队",
    details: ["2 位水平相近球友", "19:30 城市运动中心", "场地费均摊 · 90 分钟"],
    match: "相似度 96%",
  },
  想找人拍一组城市照片: {
    signal: "共创 · 城市漫游",
    title: "城市摄影搭子已找到",
    details: ["1 位人像摄影爱好者", "周日下午 16:00", "街头光影 · 互拍共创"],
    match: "相似度 89%",
  },
};

export const storySteps = [
  {
    number: "01",
    eyebrow: "说出需求",
    title: "说出你的需求",
    body: "不用研究群聊也不用在无数帖子里碰运气像和朋友说话一样告诉社交助手你想做什么",
    example: "“这个周末我想找三个人去海边”",
  },
  {
    number: "02",
    eyebrow: "理解条件",
    title: "社交助手理解真正的条件",
    body: "时间、地点、兴趣、节奏与安全边界被整理成一份清晰可执行的社交需求",
    example: "周六 · 同城出发 · 轻松路线 · 20–30 岁",
  },
  {
    number: "03",
    eyebrow: "促成行动",
    title: "一起行动的人出现了",
    body: "从匹配到计划确认社交助手帮你减少沟通消耗把线上意愿真正带到线下",
    example: "3 位同行者 · 集合点已确认 · 计划已建立",
  },
] as const;

export const principles = [
  {
    index: "01",
    title: "需求由你定义",
    body: "你决定见谁、做什么、何时发生社交助手只负责让选择更简单",
  },
  {
    index: "02",
    title: "关系保持真实",
    body: "线上帮助你找到彼此线下让共同兴趣变成一段真实经历",
  },
  {
    index: "03",
    title: "安全先于效率",
    body: "逐步建立身份、评价、公开场所见面与异常提醒等安全机制",
  },
] as const;
