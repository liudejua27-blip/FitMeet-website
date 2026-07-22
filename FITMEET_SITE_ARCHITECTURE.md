# FitMeet 全站信息架构与空间导航 V1.0

## 1. 网站角色

FitMeet 官网需要同时完成四件事：

1. 建立一个值得进入的青年 Social World。
2. 让用户理解当前辅助型 Agent，而不是误解为全自动社交代理。
3. 用真实场景与清晰边界建立信任。
4. 在 App 尚未上线时积累期待，而不是制造虚假下载入口。

## 2. 页面层级

```text
Home /
├── World /world
├── Moments /moments
├── Agent /agent
├── Safety /safety
├── App /app
├── About /about
└── Rules
    ├── Community Guidelines /community-guidelines
    ├── Privacy /privacy
    └── Terms /terms
```

## 3. 全局导航

### Brand pages

```text
WORLD / MOMENTS / AGENT / SAFETY / APP
```

- Logo 始终返回首页。
- 首页顶部导航直接进入二级页面；首页对应章节保留自己的场景 CTA。
- 二级页导航保持相同结构，并显示当前页面状态。
- About 进入页脚，避免顶部导航同时承担品牌、产品与公司信息。

### Footer

```text
World
Moments
Agent
Safety
About
App
Community Guidelines
Privacy
Terms
```

## 4. 用户路径

### 情绪型访客

```text
Home → World → Moment/scene → App
```

目标：先被场景吸引，再理解 FitMeet 能让这种经历发生。

### 产品型访客

```text
Home → Agent → Safety → App
```

目标：理解产品如何工作、决定权在哪里、如何降低风险。

### 品牌与合作访客

```text
Home → About → World → Safety
```

目标：理解使命、阶段路线和长期社会价值。

### 内容型访客

```text
Moments → Story → World or App
```

目标：通过真实经历建立信任并回到行动。

## 5. 页面转场矩阵

| From | To | Transition |
| --- | --- | --- |
| Home | World | 当前场景碎片持续放大，成为 World 地图中的入口 |
| Home | Moments | 星图碎片沿水平轴排列为胶片轨道 |
| Home | Agent | Social Orbit 收束为一句需求的语义路径 |
| Home | Safety | 轨迹节点扩张成透明信任半径 |
| Home | App | 路径汇聚到 Logo，再揭示 App 上线舱 |
| World | Moments | 当前人物动作冻结为故事封面 |
| World | Agent | 场景中的需求句从照片中被提取 |
| Moments | Agent | 故事中的原始需求变成语义节点 |
| Agent | Safety | Agent 节点扩张为身份、意愿和地点边界 |
| Safety | App | 五层信任半径聚合成 App 的确认界面 |
| Any | Home | 当前空间缩小为首页影像坐标 |

页面转场不承担数据保存或业务逻辑，只负责保持视觉连续。导航仍需使用标准可访问链接，确保浏览器历史、直接 URL 和键盘操作可靠。

## 6. 页面任务与退出动作

| Page | Three-second message | Primary exit |
| --- | --- | --- |
| Home | FitMeet 是一个值得进入的 Social World | World / App |
| World | 运动、旅行、户外与城市兴趣都可以找到同路的人 | Agent / App |
| Moments | 社交价值在真正发生的经历里 | World / App |
| Agent | Agent 整理需求，但关键决定仍由用户完成 | Safety / App |
| Safety | 陌生社交需要清晰身份、意愿、地点和反馈机制 | Guidelines / App |
| About | FitMeet 从减少寻找成本开始，逐步走向生活协作 | World / App |
| App | 一句话开始，经过理解与确认，走向真实行动 | Store coming-soon state |

## 7. 内容状态

### Current

- 青年运动、旅行与城市兴趣场景。
- 辅助型 Agent 的需求理解、条件整理与计划确认表达。
- App Store / Google Play 即将上线。

### Next

- 逐步建立的身份、评价、异常反馈与社区机制。
- 做饭、遛狗、摄影、陪伴等生活协作方向。

### Requires evidence

- 用户数量、匹配成功率、下载量、评分。
- 真实用户故事、用户评价和人物照片。
- 已实施的身份验证、安全处理和数据保留细节。
- 商店地址、二维码、上线时间。

没有证据的内容不得作为事实发布。

## 8. SEO 与页面标题

| Route | Title |
| --- | --- |
| `/` | `FitMeet — Social World | 让社交更简单` |
| `/world` | `Social World — 运动、旅行与城市搭子 | FitMeet` |
| `/moments` | `Moments — 真正一起发生的社交故事 | FitMeet` |
| `/agent` | `FitMeet Agent — 说出需求，让世界开始组织` |
| `/safety` | `Safety — 见面之前，边界已经开始 | FitMeet` |
| `/about` | `About FitMeet — 少一点寻找，多一点抵达` |
| `/app` | `FitMeet App — 即将上线` |
| `/community-guidelines` | `社区准则 | FitMeet` |
| `/privacy` | `隐私政策 | FitMeet` |
| `/terms` | `用户协议 | FitMeet` |

## 9. 不进入本期范围

- 手机与平板布局。
- 账号、登录、支付、真实匹配和真实消息。
- 邮箱订阅，除非先接入真实数据存储与隐私同意。
- 虚构 App Store / Google Play 地址。
- 多语言切换。
- CMS 与 Moments 真实内容发布后台。
