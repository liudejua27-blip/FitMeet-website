export type SignalCategory = "sport" | "social" | "interest" | "life" | "safety" | "business";

export type EnterpriseImage = {
  id: string;
  title: string;
  need: string;
  category: SignalCategory;
  src: string;
  alt: string;
  role: string;
};

const base = "/images/enterprise";

export const heroImage: EnterpriseImage = {
  id: "night-run",
  title: "夜跑",
  need: "今晚想夜跑，但不想一个人。",
  category: "sport",
  src: `${base}/night-run.png`,
  alt: "三位年轻人在城市夜色中夜跑，表达 FitMeet 真实到场的 Social World 首屏场景",
  role: "Hero Signal"
};

export const signalImages = {
  coffee: {
    id: "coffee",
    title: "咖啡",
    need: "下班想坐一会儿，但不想硬聊。",
    category: "social" as const,
    src: `${base}/coffee.png`,
    alt: "年轻人在咖啡空间轻松交流，表达真实需求输入",
    role: "Need Input"
  },
  badminton: {
    id: "badminton",
    title: "羽毛球",
    need: "今晚球局差一个同频的人。",
    category: "sport" as const,
    src: `${base}/badminton.png`,
    alt: "年轻人在羽毛球场集合，表达 Agent 计划生成",
    role: "Agent Plan"
  },
  court: {
    id: "court",
    title: "球馆",
    need: "场馆正在承接真实到场需求。",
    category: "business" as const,
    src: `${base}/court.png`,
    alt: "年轻人在球馆入口准备活动，表达企业合作与线下转化",
    role: "Business Value"
  },
  travelPhoto: {
    id: "travel-photo",
    title: "旅游摄影",
    need: "想去城市里走一段，顺便拍照。",
    category: "life" as const,
    src: `${base}/travel-photo.png`,
    alt: "年轻人在城市街区旅行摄影，表达城市同频信号网络",
    role: "City Signal"
  },
  picnic: {
    id: "park-picnic",
    title: "公园野餐",
    need: "想要一个低压力的周末计划。",
    category: "social" as const,
    src: `${base}/park-picnic.png`,
    alt: "年轻人在公园野餐，表达公开场景里的低压力社交",
    role: "Real People"
  },
  safety: {
    id: "medical-companion",
    title: "陪同边界",
    need: "先确认边界，再靠近彼此。",
    category: "safety" as const,
    src: `${base}/medical-companion.png`,
    alt: "年轻人在公共空间陪同等待，表达清楚边界和可信协助",
    role: "Safety Layer"
  }
};

export const needSignals = [
  "今晚想夜跑，但不想一个人。",
  "周末想露营，想找同频的人。",
  "想拍一组 Cos 外景，但缺摄影搭子。",
  "想找一局桌游，不想硬社交。"
];

export const parsingLayers = [
  { label: "时间", value: "今晚 20:00", note: "把模糊想法压成可执行时间" },
  { label: "地点", value: "公开场景", note: "优先球馆、公园、咖啡店、集合点" },
  { label: "兴趣", value: "同频活动", note: "夜跑、桌游、露营、摄影、开黑" },
  { label: "边界", value: "确认后邀请", note: "小组优先、可退出、站内沟通" }
];

export const citySignals = [
  { x: 18, y: 34, label: "滨河夜跑", type: "public route" },
  { x: 34, y: 58, label: "羽毛球场", type: "court" },
  { x: 52, y: 42, label: "桌游空间", type: "group" },
  { x: 66, y: 65, label: "公园野餐", type: "public place" },
  { x: 80, y: 36, label: "旅游摄影", type: "city walk" }
];

export const activitySignals: EnterpriseImage[] = [
  heroImage,
  { id: "gym", title: "健身", need: "想练，但缺一个稳定搭子。", category: "sport", src: `${base}/gym.png`, alt: "年轻人在健身房准备训练", role: "Sport Signal" },
  { id: "climbing", title: "攀岩", need: "想挑战一个新场馆。", category: "sport", src: `${base}/climbing.png`, alt: "年轻人在室内攀岩馆活动", role: "Sport Signal" },
  signalImages.badminton,
  { id: "cycling", title: "骑行", need: "想找一条城市骑行路线。", category: "sport", src: `${base}/cycling.png`, alt: "年轻人在城市河边骑行集合", role: "Sport Signal" },
  signalImages.picnic,
  { id: "board-game", title: "桌游", need: "想找一局轻松的桌游。", category: "social", src: `${base}/board-game.png`, alt: "年轻人在桌游空间一起游戏", role: "Social Signal" },
  signalImages.coffee,
  { id: "cos-partner", title: "Cos 搭子", need: "想一起去展会，不想一个人。", category: "interest", src: `${base}/cos-partner.png`, alt: "年轻人在展会公共空间进行 Cos 活动", role: "Interest Signal" },
  { id: "cos-photo", title: "Cos 摄影", need: "想拍外景，但缺摄影搭子。", category: "interest", src: `${base}/cos-photo.png`, alt: "年轻人在城市户外进行 Cos 摄影", role: "Interest Signal" },
  { id: "gaming", title: "游戏开黑", need: "今晚想开黑，想找同频队友。", category: "interest", src: `${base}/gaming.png`, alt: "年轻人在电竞空间一起游戏", role: "Interest Signal" },
  { id: "music-festival", title: "音乐节", need: "想去现场，但想找同路的人。", category: "interest", src: `${base}/music-festival.png`, alt: "年轻人在音乐节现场同行", role: "Interest Signal" },
  { id: "dog-walk", title: "遛狗搭子", need: "晚上遛狗，想找附近同频路线。", category: "life", src: `${base}/dog-walk.png`, alt: "年轻人在公园遛狗同行", role: "Life Signal" },
  { id: "camping-bbq", title: "露营烧烤", need: "周末想露营，想把计划发起来。", category: "life", src: `${base}/camping-bbq.png`, alt: "年轻人在营地露营烧烤", role: "Life Signal" },
  { id: "hiking", title: "户外徒步", need: "想走一条轻松徒步路线。", category: "life", src: `${base}/hiking.png`, alt: "年轻人在山路徒步", role: "Life Signal" }
];

export const safetyRules = [
  "模糊定位",
  "公共场所",
  "站内沟通",
  "发布前确认",
  "小组优先",
  "可退出"
];

export const businessValues = [
  { label: "精准人群", body: "用户已经说出真实需求，比泛曝光更接近到场。" },
  { label: "线下转化", body: "场馆、活动和品牌可以接住正在形成的计划。" },
  { label: "复访节点", body: "一次好的计划会变成用户愿意再次返回的场景。" }
];
