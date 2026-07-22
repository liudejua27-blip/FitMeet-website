# FitMeet 全站影像资产方向

Version: `1.0`  
Status: `active production rule`  
Applies to: desktop corporate website

## 1. Purpose

FitMeet 的空间语言不能建立在少量照片跨页反复使用之上。首页、World、Moments、Agent、Safety、About 和 App 必须像同一品牌下的七部短片：共享调色、颗粒、Logo 光谱和人物真实性，但拥有不同地点、镜头、时间与叙事任务。

从本版本开始，以下规则是硬性验收条件：

- 同一张主摄影不得在两个一级页面中作为全屏或首屏媒体重复出现。
- 跨页连续性只能复用上一页画面的局部裁切、冻结帧或过渡片段；进入下一页后必须切换到该页面的专属主资产。
- 每个品牌页面至少有一张专属 Hero Master 和两张专属章节资产。
- 每个页面拥有独立的镜头动词，不能通过换文案伪装成不同页面。
- FitMeet 光谱只标记关系、状态与确认，不作为填满空白的背景渐变。
- Moments 的现有概念摄影只能作为视觉占位或故事征集背景；没有人物授权时不得包装成真实用户证言。

## 2. Existing asset audit

`企业官网/` 当前包含 21 张 `1672 × 941` 横向 PNG，覆盖：

```text
音乐节 / 交友 / 户外徒步 / 宠物领养 / 桌游 / 露营烧烤 / 乐队
骑行 / 攀岩 / 游戏开黑 / 夜跑 / 宠物交友 / 公园野餐 / 遛狗搭子
医院陪同 / cos搭子 / cos摄影 / 球馆 / 羽毛球 / 咖啡 / 旅游摄影
```

Contact sheet: `.codex-audit/enterprise-contact-sheet.jpg`

该目录是源素材库，不是线上发布目录。被选中的图片必须使用英文文件名，转换为优化 JPEG/AVIF，复制到 `public/images/` 的页面专属目录，并在本文件中登记。

## 3. Page-specific visual territories

| Page | Spatial metaphor | Dedicated camera language | Primary asset source | Prohibited reuse |
| --- | --- | --- | --- | --- |
| Home | Social Orbit | 分散碎片聚合成一个世界 | 当前首页主资产 | 二级页不得重复首屏星图 |
| World | Social Atlas | 远景领地、入口放大、全屏旅行 | 当前 World 主资产；`户外徒步 / 攀岩 / 骑行` 作为扩展 | 其他页面不得全屏复用 World 四张主图 |
| Moments | Memory Film | 接触印样、动作冻结、胶片推进、人物细节 | `夜跑 / 羽毛球 / 旅游摄影 / 音乐节` 仅作概念占位 | 禁止产品 UI 与语义主干 |
| Agent | Semantic Concourse | 一句话穿过交通枢纽并分解为六个条件 | 新生成车站大厅 Hero；`咖啡` 只作后续交流细节 | 禁止复用 World 旅行 Hero |
| Safety | Trust Radius | 公共空间定点观察、透明景深层、缓慢半径揭示 | 新生成公共空间信任组图；`医院陪同 / 交友` 只作次级参考 | 禁止车站 Hero 与地图拼贴 |
| About | Growing Node | 纪实观察、共同行动、关系向外生长 | `乐队 / 公园野餐 / 宠物交友 / 露营烧烤` | 禁止产品仪表板和信任半径 |
| App | Launch Chamber | 受控棚拍机位、设备转动、UI 微距 | 代码原生 App UI + 专属设备环境 | 产品之前禁止生活方式蒙太奇 |

## 4. Enterprise library allocation

### World expansion

- `企业官网/户外徒步.png` → 徒步扩展领地。
- `企业官网/攀岩.png` → 室内垂直运动章节。
- `企业官网/骑行.png` → 滨水运动转场。
- `企业官网/音乐节.png` → 未来文化坐标，不作为当前核心能力承诺。

### Moments placeholders

- `企业官网/夜跑.png` → after-work memory film。
- `企业官网/羽毛球.png` → shared-action detail。
- `企业官网/旅游摄影.png` → destination atmosphere。
- `企业官网/音乐节.png` → culture moment。

以上四张在获得真实授权故事之前必须标注 `CONCEPT STORY / AWAITING AUTHORISED STORY`。

Selected production allocation:

| Role | Source | Delivery path | Publication state |
| --- | --- | --- | --- |
| Hero / After Work | `企业官网/夜跑.png` | `public/images/moments-film/moments-after-work-night-run-desktop.jpg` | concept |
| Same Court | `企业官网/羽毛球.png` | `public/images/moments-film/moments-same-court-badminton-desktop.jpg` | concept |
| Same Route | `企业官网/户外徒步.png` | `public/images/moments-film/moments-same-route-hiking-desktop.jpg` | concept |
| See the City | `企业官网/旅游摄影.png` | `public/images/moments-film/moments-see-city-photo-desktop.jpg` | concept |
| Culture frame | `企业官网/音乐节.png` | `public/images/moments-film/moments-culture-festival-desktop.jpg` | concept background only |

The selected visual target is `design-references/moments-concepts/moments-direction-1.png`. These files are page-owned concept media and must be replaced by authorised story sets before any claim of real user history.

### Agent

- 必须新增专属资产：电影感青年城市交通大厅，建筑与人物集中在左侧，右侧为适合语义 UI 的纸面负空间。
- `企业官网/咖啡.png` 可用于 `ASSISTED, NOT REPLACED` 的真实交流章节，但不能被写成用户证言。
- 运动、旅行、摄影三个演示场景需使用独立裁切或新生成镜头，不得继续调用 World 的全屏主图。

Selected production assets:

| Role | Source | Delivery path | Size |
| --- | --- | --- | --- |
| Hero / travel | generated from direction 2 composition reference | `public/images/agent-semantic/agent-intent-concourse-hero-desktop.jpg` | ~179 KB |
| Sport scenario | `企业官网/球馆.png` | `public/images/agent-semantic/agent-sport-court-wide-desktop.jpg` | ~216 KB |
| Create scenario | `企业官网/cos摄影.png` | `public/images/agent-semantic/agent-create-photo-wide-desktop.jpg` | ~291 KB |
| Assisted boundary | `企业官网/咖啡.png` | `public/images/agent-semantic/agent-boundary-conversation-wide-desktop.jpg` | ~192 KB |

Agent critical first-viewport raster total is approximately `179 KB`; no Agent full-screen master is shared with Home or World.

### Safety

- 必须新增专属资产：开放公共空间中的首次集合，保留清晰距离、出入口与环境人群，适合信任半径覆盖。
- `企业官网/医院陪同.png` 只能用于未来生态，并明确并非当前已上线能力。
- `企业官网/交友.png` 只能作为一般公共空间社交，不得作为成功匹配证明。

Selected production assets:

| Role | Source | Delivery path | Size |
| --- | --- | --- | --- |
| Hero / Public First | generated from selected Safety direction 1 | `public/images/safety-radius/safety-public-plaza-hero-desktop.jpg` | ~190 KB |
| Identity | `企业官网/交友.png` | `public/images/safety-radius/safety-identity-public-group-desktop.jpg` | ~224 KB |
| Consent | generated public cafe plan review | `public/images/safety-radius/safety-consent-plan-desktop.jpg` | ~185 KB |
| Real Experience | generated public sports-centre follow-through | `public/images/safety-radius/safety-real-experience-desktop.jpg` | ~189 KB |
| Response | generated supported blue-hour public plaza | `public/images/safety-radius/safety-response-plaza-desktop.jpg` | ~219 KB |

The Safety set totals approximately `1.0 MB`; the critical first-viewport Hero is approximately `190 KB`. None of these files is used as a full-screen master by Home, World or Agent.

### About

- `企业官网/乐队.png` → 共同创作。
- `企业官网/公园野餐.png` → 普通社交生活。
- `企业官网/宠物交友.png` → 兴趣成为相遇桥梁。
- `企业官网/露营烧烤.png` → 共同行动成为记忆。

## 5. Generation briefs

### Agent Hero Master

```text
16:9 desktop cinematic documentary photograph. A large contemporary city transit concourse at warm late-afternoon light. Young adults moving naturally toward trains or meeting points, no one looking at camera. Strong architectural canopy entering from the far left, human activity concentrated in the lower-left and centre-left, broad soft atmospheric negative space across the middle-right for semantic UI. Neutral warm paper-compatible highlights, restrained colour, natural skin, subtle film grain, no text, no logo, no phone mockup, no obvious AI faces.
```

### Safety Hero Master

```text
16:9 documentary photograph in a real open civic plaza at blue-hour-to-evening transition. Two small groups approaching a clearly visible public meeting point with comfortable space between them. Architecture and lighting create concentric depth without literal circles. Clear exits and other people remain visible. Empty centre-right regions support transparent trust layers. No text, no shields, no UI, no posed smiles.
```

### App Launch Chamber

```text
Do not rasterise the interface. Generate only the cinematic environment or device shell when required. Product text, controls, semantic nodes and states remain code-native.
```

## 6. Production folders and names

```text
public/images/world-atlas/
public/images/moments-film/
public/images/agent-semantic/
public/images/safety-radius/
public/images/about-network/
public/images/app-chamber/
```

Naming pattern:

```text
{page}-{chapter}-{shot-role}-desktop.{jpg|avif}
```

Examples:

```text
agent-intent-concourse-hero-desktop.jpg
agent-boundary-conversation-wide-desktop.jpg
safety-consent-public-space-hero-desktop.jpg
about-origin-shared-music-wide-desktop.jpg
```

## 7. Delivery budgets

- First viewport critical raster total: target `≤ 3.5 MB`.
- Individual desktop JPEG master: target `250–650 KB` at approximately `1920 × 1080` or the smallest safe crop.
- Below-fold images lazy-load unless a pinned transition requires preloading.
- Video: `8–12s`, muted, with poster, target `≤ 7 MB`, never the homepage LCP.
- Full-screen photography must not ship as PNG unless alpha is genuinely required.

## 8. Visual QA ledger

Every page’s design QA must record:

1. dedicated Hero Master path;
2. every full-screen chapter asset path;
3. whether an asset appears on another top-level page;
4. whether cross-page reuse is a deliberate transition or an accidental duplicate;
5. crop, focal point and colour treatment at all three desktop viewports;
6. loading strategy and total critical media weight.

Any accidental full-screen duplicate across top-level pages is a P1 design defect.
