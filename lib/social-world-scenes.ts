export type DesktopRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type WorldScene = {
  id: "after-work" | "weekend" | "outdoor" | "city";
  index: string;
  category: string;
  title: [string, string];
  asset: string;
  alt: string;
  focalPoint: string;
  fragmentRect: DesktopRect;
  parallax: { x: number; y: number; scale: number };
  theme: "paper" | "light" | "dark";
  maskOrigin: string;
};

export type OrbitFragment = {
  id: string;
  asset: string;
  alt: string;
  label: string;
  rect: DesktopRect;
  objectPosition: string;
  depth: number;
};

export const worldScenes: WorldScene[] = [
  {
    id: "after-work",
    index: "01",
    category: "下班之后 · 夜间运动",
    title: ["夜晚不散场", "城市仍在回应"],
    asset: "/images/social-world/night-badminton.png",
    alt: "年轻人在城市夜间羽毛球场组队运动",
    focalPoint: "50% 48%",
    fragmentRect: { left: 7, top: 68, width: 12, height: 24 },
    parallax: { x: -3, y: 6, scale: 1.1 },
    theme: "dark",
    maskOrigin: "8% 58%",
  },
  {
    id: "weekend",
    index: "02",
    category: "周末 · 旅行同行",
    title: ["同路的人", "让目的地更近"],
    asset: "/images/social-world/weekend-lakeside-route.png",
    alt: "年轻人在湖边步道规划周末同行路线",
    focalPoint: "50% 50%",
    fragmentRect: { left: 23, top: 7, width: 7, height: 14 },
    parallax: { x: -5, y: 5, scale: 1.1 },
    theme: "light",
    maskOrigin: "94% 46%",
  },
  {
    id: "outdoor",
    index: "03",
    category: "户外 · 山野露营",
    title: ["一起抵达", "远方才成为记忆"],
    asset: "/images/social-world/mountain-camp.png",
    alt: "年轻人在山野营地搭帐篷并围坐交流",
    focalPoint: "52% 46%",
    fragmentRect: { left: 68, top: 12, width: 7, height: 13 },
    parallax: { x: 4, y: 7, scale: 1.11 },
    theme: "dark",
    maskOrigin: "18% 48%",
  },
  {
    id: "city",
    index: "04",
    category: "城市 · 兴趣漫游",
    title: ["兴趣相同的人", "会让一座城变熟"],
    asset: "/images/social-world/city-public-space.png",
    alt: "青年人在城市公共空间集合并开始城市漫游",
    focalPoint: "50% 48%",
    fragmentRect: { left: 83, top: 31, width: 9, height: 16 },
    parallax: { x: 4, y: 6, scale: 1.09 },
    theme: "light",
    maskOrigin: "88% 68%",
  },
];

export const orbitFragments: OrbitFragment[] = [
  {
    id: "station",
    asset: "/images/social-world/travel-meetup-desktop.jpg",
    alt: "旅行途中等待会合的青年",
    label: "出发",
    rect: { left: 23, top: 7, width: 7, height: 14 },
    objectPosition: "17% 48%",
    depth: 1.1,
  },
  {
    id: "waterfront",
    asset: "/images/enterprise/night-run.png",
    alt: "城市滨水空间中的运动人群",
    label: "运动",
    rect: { left: 46, top: 8, width: 5.5, height: 11 },
    objectPosition: "48% 50%",
    depth: 0.75,
  },
  {
    id: "camp-light",
    asset: "/images/social-world/mountain-camp-desktop.jpg",
    alt: "山野露营时亮起的营地灯光",
    label: "停留",
    rect: { left: 70, top: 13, width: 7, height: 13 },
    objectPosition: "74% 66%",
    depth: 1.25,
  },
  {
    id: "racket",
    asset: "/images/social-world/night-badminton-desktop.jpg",
    alt: "夜间球场与羽毛球拍",
    label: "球局",
    rect: { left: 10, top: 30, width: 7, height: 14 },
    objectPosition: "18% 54%",
    depth: 1.35,
  },
  {
    id: "meeting",
    asset: "/images/safety-radius/safety-public-plaza-hero-desktop.jpg",
    alt: "在公共空间等待集合的人",
    label: "会合",
    rect: { left: 84, top: 31, width: 8, height: 15 },
    objectPosition: "77% 54%",
    depth: 1.05,
  },
  {
    id: "runner",
    asset: "/images/moments-film/moments-after-work-night-run-desktop.jpg",
    alt: "城市中结伴跑步的青年",
    label: "跑步",
    rect: { left: 5, top: 57, width: 9, height: 17 },
    objectPosition: "32% 56%",
    depth: 0.85,
  },
  {
    id: "route",
    asset: "/images/moments-film/moments-see-city-photo-desktop.jpg",
    alt: "旅行目的地与同行计划",
    label: "路线",
    rect: { left: 25, top: 71, width: 6, height: 12 },
    objectPosition: "75% 58%",
    depth: 1.18,
  },
  {
    id: "fire",
    asset: "/images/enterprise/park-picnic.png",
    alt: "朋友围坐在营地篝火旁",
    label: "相聚",
    rect: { left: 70, top: 72, width: 7, height: 13 },
    objectPosition: "84% 70%",
    depth: 1.4,
  },
  {
    id: "camera",
    asset: "/images/enterprise/music-festival.png",
    alt: "城市漫游中的摄影活动",
    label: "共创",
    rect: { left: 88, top: 70, width: 5, height: 11 },
    objectPosition: "20% 52%",
    depth: 0.9,
  },
];
