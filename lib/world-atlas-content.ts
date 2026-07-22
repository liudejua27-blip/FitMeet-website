import type { MediaAssetMeta } from "@/lib/experience-types";

export type WorldModuleId = "life" | "sport" | "social" | "help";

export type WorldModuleImage = MediaAssetMeta & {
  alt: string;
  objectPosition: string;
};

export type WorldModule = {
  id: WorldModuleId;
  index: string;
  name: string;
  shortLine: string;
  title: [string, string];
  body: string;
  tags: string[];
  accent: string;
  images: [WorldModuleImage, WorldModuleImage];
  boundary?: string;
};

export const worldReleaseImage: WorldModuleImage = {
  src: "/images/world-compass/world-invitation-release.jpg",
  source: "generated",
  alt: "一群人在城市屋顶花园自然微笑并伸手邀请观看者加入",
  objectPosition: "50% 50%",
};

export const worldModules: WorldModule[] = [
  {
    id: "life",
    index: "01",
    name: "生活",
    shortLine: "遇到难题先找到对的人",
    title: ["遇到难题", "先找到对的人"],
    body: "找房、临时困难或生活服务不应该先经过层层转述FitMeet 希望减少中间环节和信息差让需要帮助的人与能够回应的人直接说清楚",
    tags: ["找房", "困难求助", "生活服务"],
    accent: "#e0b779",
    images: [
      {
        src: "/images/world-compass/life-home.webp",
        source: "generated",
        alt: "年轻租客在城市公寓里直接与房主沟通",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/world-compass/life-help.webp",
        source: "generated",
        alt: "城市居民正在帮助年轻人处理自行车故障",
        objectPosition: "50% 54%",
      },
    ],
  },
  {
    id: "sport",
    index: "02",
    name: "运动",
    shortLine: "同样的作息也有同样的节奏",
    title: ["作息相近", "节奏才走得远"],
    body: "运动类型、时间、频率和水平都可以提前说明找到的不是随机搭子而是能够保持相似生活节奏的人",
    tags: ["晨跑", "羽毛球", "骑行", "长期搭子"],
    accent: "#77e9c5",
    images: [
      {
        src: "/images/world-compass/sport-run.webp",
        source: "generated",
        alt: "两名作息与配速相近的年轻人在城市公园晨跑",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/world-compass/sport-badminton.webp",
        source: "generated",
        alt: "水平相近的年轻人在城市夜间公共球场打羽毛球",
        objectPosition: "50% 50%",
      },
    ],
  },
  {
    id: "social",
    index: "03",
    name: "社交",
    shortLine: "从共同兴趣出发认识同频的人",
    title: ["从共同兴趣出发", "认识同频的人"],
    body: "寻找搭子、进入圈子或者认真认识理想型先从兴趣、生活方式和关系期待开始而不是快速判断一个陌生人",
    tags: ["兴趣搭子", "圈子", "相亲", "理想型"],
    accent: "#d896e6",
    images: [
      {
        src: "/images/world-compass/social-circle.webp",
        source: "generated",
        alt: "年轻人在城市艺术街区进行摄影漫游并交流作品",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/world-compass/social-meeting.webp",
        source: "generated",
        alt: "两位成年人在开放的城市咖啡花园自然交谈",
        objectPosition: "50% 46%",
      },
    ],
  },
  {
    id: "help",
    index: "04",
    name: "帮助",
    shortLine: "临时需要也不被错过",
    title: ["临时需要", "也不被错过"],
    body: "陪老人散步、办事或就医陪同也可以是照顾宠物双方在开始前明确时间、费用、能力边界与退出方式",
    tags: ["老人陪伴", "办事陪同", "宠物照顾"],
    accent: "#72cfe6",
    boundary: "仅表达非医疗陪伴和生活协助不涉及诊疗、护理或专业医疗服务",
    images: [
      {
        src: "/images/world-compass/help-senior.webp",
        source: "generated",
        alt: "年轻人陪老人散步并协助采购日常用品",
        objectPosition: "50% 28%",
      },
      {
        src: "/images/world-compass/help-pet.webp",
        source: "generated",
        alt: "宠物主人在社区入口向照顾者交接宠物与照顾事项",
        objectPosition: "50% 50%",
      },
    ],
  },
];

export const worldModuleIds = worldModules.map((module) => module.id);

export function getWorldModule(id: WorldModuleId) {
  return worldModules.find((module) => module.id === id) ?? worldModules[0];
}
