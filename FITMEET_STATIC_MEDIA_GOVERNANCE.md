# FitMeet Static Media Governance

本文档优先级：无视频官网媒体治理规则。它低于 `README.MD`、`DESIGN.md`、`FITMEET_INFORMATION_ARCHITECTURE.md`，高于旧 Runway/Pika 视频生产记录和临时素材说明。

当前官网 canonical 方向是无视频 `SignalPrismHomepage`：

`企业官网 PNG -> public/images/enterprise -> enterpriseAssets.ts -> CinematicImage -> SVG / Canvas / CSS 3D -> GSAP / Chrome 验收`

旧的 `image_gen -> Runway/Pika -> ffmpeg -> CinematicVideoMedia` 链路只保留为未来宣传片或广告片参考，不再作为官网完成门禁。

## 1. Source of Truth

当前官网图片资产的唯一代码数据源：

- `components/signal-prism-homepage/enterpriseAssets.ts`

当前官网图片资产目录：

- `public/images/enterprise/`

核心规则：

- 页面不得直接散落硬编码新的企业图片路径，新增图片必须先进入 `enterpriseAssets.ts`。
- 任何图片都必须有 `id`、`title`、`need`、`category`、`src`、`alt`、`role`。
- `alt` 必须说明图片如何服务产品叙事，不写空泛描述。
- `role` 必须对应页面任务：Hero、Need Input、Agent Plan、City Signal、Activity Signal、Safety Layer、Business Value。
- 未进入数据源的图片不得被官网页面直接引用。

## 2. Current Homepage Asset Allocation

### Hero Signal

- Asset: `night-run.png`
- Data key: `heroImage`
- Section: `HeroSignalSection`
- Job: 3 秒内建立 `Social World` 记忆，让用户知道 FitMeet 是真实到场的城市生活平台。
- Visual requirement: 城市夜色、青年行动、真实运动场景、无文字、无 Logo、无 HUD。
- Failure: 看起来像抽象背景、游戏海报、AI 赛博图、广告素材库拼图。

### Need Input

- Asset: `coffee.png`
- Data key: `signalImages.coffee`
- Section: `NeedInputSection`
- Job: 表达低压力真实需求输入，不从刷人开始。
- Visual requirement: 真实空间、轻社交、不尴尬、不约会化。
- Failure: 像约会软件、精致咖啡广告、无产品含义的 lifestyle 图。

### Agent Plan

- Asset: `badminton.png`
- Data key: `signalImages.badminton`
- Section: `ParseSection`
- Job: 说明小福 Agent 把想法拆成时间、地点、兴趣、边界。
- Visual requirement: 公开球馆、多人活动、计划可执行。
- Failure: 像聊天机器人 UI、AI dashboard、运动品牌硬广。

### City Signal

- Asset: `travel-photo.png`
- Data key: `signalImages.travelPhoto`
- Section: `SocialMapSection`
- Job: 说明城市里的公开场景被点亮，而不是展示个人精确位置。
- Visual requirement: 城市街区、同行感、摄影/漫游语境。
- Failure: 像地图大屏、数据中台、城市空镜。

### Business Value

- Asset: `court.png`
- Data key: `signalImages.court`
- Section: `BusinessValueSection`
- Job: 说明场馆、商家、品牌能接住正在形成计划的真实人群。
- Visual requirement: 线下场馆、准备到场、青年真实活动。
- Failure: 假商业数据、假 partner logo、空泛企业宣传图。

### Safety Layer

- Asset: `medical-companion.png`
- Data key: `signalImages.safety`
- Section: `SafetyLayerSection` 或 Trust 页面补充资产
- Job: 说明边界、陪同、公开场景和可信协助。
- Visual requirement: 安静、可信、公共空间、不过度煽情。
- Failure: 恐吓式安全图、医疗广告、隐私恐慌画面。

## 3. Activity Orbit Allocation

`ActivityOrbit` 是三层城市信号带，不是图库轮播。

### Sport Lane

- Lane: `运动轨道`
- Proof: `有强度、有时间、有公开场地`
- Assets: `night-run.png`、`gym.png`、`climbing.png`、`badminton.png`、`cycling.png`
- Job: 展示 FitMeet 最容易真实到场的运动型计划。
- Failure: 运动图片没有集合感、没有公开场地、像健身房广告。

### Low-Pressure Lane

- Lane: `低压力轨道`
- Proof: `先有场景，再慢慢靠近`
- Assets: `park-picnic.png`、`board-game.png`、`coffee.png`、`dog-walk.png`、`camping-bbq.png`
- Job: 展示不尴尬、不硬聊的生活计划。
- Failure: 变成 dating、附近异性、陌生人速配、精致生活方式杂志。

### Interest Lane

- Lane: `兴趣轨道`
- Proof: `共同目的比头像更可靠`
- Assets: `cos-partner.png`、`cos-photo.png`、`gaming.png`、`music-festival.png`、`hiking.png`
- Job: 展示青年兴趣场景如何被组织成真实计划。
- Failure: 变成二次元海报墙、游戏广告、音乐节宣传单、兴趣标签堆叠。

## 4. Media Quality Gate

所有官网图片必须满足：

- 无水印。
- 无 in-image 文案。
- 无 Logo。
- 无 HUD。
- 无 UI 面板。
- 无假数据。
- 无假 partner logo。
- 无 dating 暗示。
- 不出现“附近异性”“灵魂伴侣”“速配”语境。
- 不出现可识别个人隐私信息。
- 不作为视频帧占位图引用。

如果图片不满足要求：

- 不能通过裁切、遮挡、模糊水印来强行上线。
- 必须替换为合规图片，或从页面数据源中移除。
- 未经明确批准，不做破坏性删除；先标记为 unassigned 或 archive candidate。

## 5. Image Generation Rule

只有当现有 `public/images/enterprise/` 图片不足以支撑页面任务时，才使用 `image_gen` 生成新图。

生成规则：

- 使用内置 `image_gen`，不默认使用 CLI。
- 项目图片生成后必须复制进当前 workspace，不能只留在 `$CODEX_HOME/generated_images`。
- 文件命名必须稳定、语义化、版本化，例如 `night-run-v2.png`。
- 新图进入官网前必须更新 `enterpriseAssets.ts`。
- 新图必须写入本治理文档的分配表。
- 新图不得包含文字、Logo、HUD、UI、假数据或水印。

推荐 prompt 方向：

```text
Use case: photorealistic-natural
Asset type: FitMeet enterprise website static scene image
Scene/backdrop: real public city space for young adults
Subject: small group of young people arriving for a clear activity plan
Style/medium: cinematic editorial photography, realistic, premium company website
Composition/framing: wide desktop crop, strong subject zone, enough dark space for HTML overlay
Lighting/mood: city evening or indoor activity lighting, grounded, not cyberpunk
Constraints: no text, no logo, no watermark, no HUD, no UI, no fake data, no dating app mood
Avoid: abstract tech poster, AI SaaS dashboard, avatar wall, glossy stock-photo smile, game poster
```

## 6. Optimization Rule

当前精选 PNG 可以继续作为设计验收资产。后续性能优化时：

- 优先生成 WebP / AVIF 派生文件，不覆盖原始 PNG。
- 派生文件必须保留同等构图、暗部质感和人物可读性。
- 不允许为了压缩导致画面糊、脸部怪异、暗部脏块明显。
- 图片切换格式后必须重新做 Chrome 截图验收。

## 7. Acceptance Evidence

视觉签收必须证明：

- `/` 首屏使用 `night-run.png` 建立 Social World 记忆。
- Need、Agent Plan、City Signal、Business、Safety 各自图片承担明确叙事任务。
- ActivityOrbit 三条轨道都能被读成真实活动计划，而不是图片墙。
- 页面 DOM 不包含 `<video>`。
- 网络请求不包含 MP4 / WebM 作为核心官网依赖。
- reduced-motion 下图片和文案仍能完整表达产品。

## 8. Deletion and Archive Rule

当前不自动删除媒体文件。

允许删除或归档的条件：

- 图片不再被任何页面、数据源、文档、验收脚本引用。
- 图片含水印、文字、HUD、假数据、隐私风险或 dating 误导。
- 用户明确批准删除或归档。

推荐归档路径：

- `public/images/enterprise/_archive/`

删除前必须列出：

- 文件名。
- 当前引用状态。
- 删除原因。
- 替代资产。

## 9. Award-Level Media Standard

FitMeet 官网不是图片越多越高级，而是每一张图片都证明一个真实计划正在发生。

最终判断：

- 图片是否让 Social World 更真实。
- 图片是否让青年用户感觉这是自己的城市生活。
- 图片是否让企业用户理解“真实需求比曝光更接近成交”。
- 图片是否服务同频信号系统，而不是装饰页面。
