export type AtlasImage = {
  id: string;
  title: string;
  scene: string;
  status: string;
  image: string;
  role: "hero" | "anchor" | "activity" | "social" | "business" | "final";
  accent?: string;
};

export const heroImage: AtlasImage = {
  id: "social-main",
  title: "真实到场",
  scene: "城市青年活动",
  status: "从一个想法开始",
  image: "/images/enterprise/social-main.png",
  role: "hero",
  accent: "#8da35b"
};

export const activityImages: AtlasImage[] = [
  { id: "night-run", title: "夜跑", scene: "将跑步从独自完成变成节奏同行", status: "同窗同速", image: "/images/enterprise/night-run.png", role: "activity" },
  { id: "badminton", title: "羽毛球", scene: "把下班后的空档变成一场球局", status: "适合新手", image: "/images/enterprise/badminton.png", role: "anchor" },
  { id: "climbing", title: "攀岩", scene: "找到愿意一起挑战的人", status: "公开场地", image: "/images/enterprise/climbing.png", role: "activity" },
  { id: "camping", title: "露营", scene: "周末友好的城市逃离", status: "周末友好", image: "/images/enterprise/camping-bbq.png", role: "activity" },
  { id: "travel", title: "旅游摄影", scene: "把旅行变成共同记忆", status: "城市轻计划", image: "/images/enterprise/travel-photo.png", role: "activity" },
  { id: "dog", title: "遛狗搭子", scene: "低压力的日常相遇", status: "低压力加入", image: "/images/enterprise/dog-walk.png", role: "activity" },
  { id: "cos", title: "Cos 摄影", scene: "兴趣圈层里的真实行动", status: "可先组局", image: "/images/enterprise/cos-photo.png", role: "activity" },
  { id: "gaming", title: "游戏开黑", scene: "从线上默契到线下朋友", status: "适合朋友局", image: "/images/enterprise/gaming.png", role: "activity" },
  { id: "music", title: "音乐节", scene: "一起进入同一个现场", status: "同频节奏", image: "/images/enterprise/music-festival.png", role: "activity" },
  { id: "board", title: "桌游", scene: "轻松开始一场低压力社交", status: "公开场地", image: "/images/enterprise/board-game.png", role: "activity" },
  { id: "cycling", title: "骑行", scene: "让城市路线变成同行节奏", status: "同频节奏", image: "/images/enterprise/cycling.png", role: "activity" }
];

export const planImages: AtlasImage[] = [
  { id: "night-run", title: "夜跑计划", scene: "今晚 · 5km · 公开路线", status: "同节奏", image: "/images/enterprise/night-run.png", role: "activity" },
  { id: "court", title: "球馆计划", scene: "下班后 · 公开场馆", status: "同水平", image: "/images/enterprise/court.png", role: "activity" },
  { id: "coffee", title: "见面缓冲", scene: "先到公开地点", status: "低压力", image: "/images/enterprise/coffee.png", role: "activity" }
];

export const socialImages: AtlasImage[] = [
  { id: "coffee", title: "咖啡", scene: "聊天不用一开始就发生", status: "软着陆", image: "/images/enterprise/coffee.png", role: "social" },
  { id: "picnic", title: "公园野餐", scene: "城市开始有固定遇见", status: "慢社交", image: "/images/enterprise/park-picnic.png", role: "social" },
  { id: "dog-walk", title: "遛狗搭子", scene: "关系从日常路线留下", status: "低压力", image: "/images/enterprise/dog-walk.png", role: "social" }
];

export const businessImages: AtlasImage[] = [
  { id: "court", title: "球馆", scene: "真实活动需求进入公开场馆", status: "公开场地", image: "/images/enterprise/court.png", role: "business" },
  { id: "gym", title: "健身房", scene: "下班后的规律行动", status: "复访关系", image: "/images/enterprise/gym.png", role: "business" },
  { id: "camping", title: "户外营地", scene: "周末计划连接品牌场景", status: "周末计划", image: "/images/enterprise/camping-bbq.png", role: "business" },
  { id: "coffee", title: "咖啡店", scene: "安全缓冲和线下见面点", status: "友好空间", image: "/images/enterprise/coffee.png", role: "business" },
  { id: "pet", title: "宠物友好空间", scene: "日常需求带来稳定到场", status: "社区节点", image: "/images/enterprise/pet-social.png", role: "business" }
];

export const finalImage: AtlasImage = {
  id: "final",
  title: "下一次真实到场",
  scene: "让每一个想法在城市里发生",
  status: "开始出发",
  image: "/images/enterprise/park-picnic.png",
  role: "final"
};
