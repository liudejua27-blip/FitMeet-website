export type MomentFilm = {
  id: string;
  index: string;
  category: string;
  timeStart: string;
  timeEnd: string;
  title: [string, string];
  need: string;
  plan: string;
  onSite: string;
  asset: string;
  alt: string;
  focalPoint: string;
};

export const momentFilms: MomentFilm[] = [
  {
    id: "after-work",
    index: "01",
    category: "下班之后",
    timeStart: "19:30",
    timeEnd: "20:10",
    title: ["不是自我介绍", "是一起开始"],
    need: "下班后想找两个人一起夜跑",
    plan: "周四 19:30 · 滨水步道 · 40 分钟",
    onSite: "三个人按相近配速完成路线",
    asset: "/images/moments-film/moments-after-work-night-run-desktop.jpg",
    alt: "夜间滨水步道上的青年跑步场景",
    focalPoint: "50% 48%",
  },
  {
    id: "same-court",
    index: "02",
    category: "同一球场",
    timeStart: "20:00",
    timeEnd: "21:30",
    title: ["一场球结束", "关系才刚开始"],
    need: "想找水平相近的人打羽毛球",
    plan: "周四 20:00 · 公共球场 · 3 人",
    onSite: "90 分钟球局场地费按计划均摊",
    asset: "/images/moments-film/moments-same-court-badminton-desktop.jpg",
    alt: "夜间公共球场上的青年羽毛球活动",
    focalPoint: "50% 51%",
  },
  {
    id: "same-route",
    index: "03",
    category: "同一段路",
    timeStart: "08:30",
    timeEnd: "16:40",
    title: ["同一段山路", "让陌生感慢慢退后"],
    need: "周末想找人一起走一条山路",
    plan: "周六 08:30 · 成熟路线 · 当日往返",
    onSite: "三个人按约定路线走到天黑前返程",
    asset: "/images/moments-film/moments-same-route-hiking-desktop.jpg",
    alt: "青年沿山路共同徒步",
    focalPoint: "53% 48%",
  },
  {
    id: "see-the-city",
    index: "04",
    category: "看见城市",
    timeStart: "16:00",
    timeEnd: "19:10",
    title: ["共享一个视角", "也重新看见一座城"],
    need: "想找人一起拍一组城市照片",
    plan: "周日 16:00 · 公共街区 · 2 人",
    onSite: "一起走过三个街区并完成互拍",
    asset: "/images/moments-film/moments-see-city-photo-desktop.jpg",
    alt: "青年在城市街道共同摄影",
    focalPoint: "52% 49%",
  },
];

export const cultureFilm = {
  asset: "/images/moments-film/moments-culture-festival-desktop.jpg",
  alt: "青年在户外文化活动中交流",
};
