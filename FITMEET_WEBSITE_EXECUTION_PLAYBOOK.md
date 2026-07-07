# FitMeet Website Execution Playbook

## V5.112 Current Execution Direction

当前执行方向固定为：

`页面结构 -> 品牌叙事 -> 关键视觉 -> SignalPrism 交互 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

当前官网核心页面不使用视频，不进入 Runway/Pika，不使用 ffmpeg，不接入 MP4/WebM。

实现顺序：

1. 先确认 `Social World：一句想法，变成一次真实到场。`
2. 再把 `企业官网` 图片整理为真实场景数据源。
3. 用 `SignalPrism`、`SignalLineCanvas`、`ActivityOrbit`、`SafetyShell`、静态场景图和页面级 GSAP 表达同频信号系统。
4. 用 GSAP 做 section 级叙事，不做失控装饰。
5. 用 Chrome 桌面检查核心页面比例、鼠标响应、滚动截图、无视频节点和 reduced-motion。

## V5.114 Current Homepage Refinement Rule

当前首页精修进入 `SignalPrismHomepage` 细节阶段：

1. 首屏优先检查 `Social World`、CTA、证明条、真实场景图、SignalPrism 是否同时在桌面首屏内。
2. 活动轨道允许有镜头式裁切，但不能裁掉主要活动名称和需求收据。
3. GSAP 横向位移只负责制造滚动方向感，不能把它当成主要视觉冲击来源。
4. 轨道质感优先来自真实图片、透视、红色到场线、锐角容器、hover 抬升和层间深度。
5. 每轮视觉精修后必须保存 Chrome 桌面截图和 audit JSON 到 `output/qa`。

## V5.111 Execution Evidence

This pass completed the current homepage execution loop:

1. Page structure: Home uses `SignalPrismHomepage`.
2. Brand narrative: Hero keeps `Social World` and adds concrete demand proof: `想跑，但不想一个人。`
3. Key visual: existing `企业官网` PNG assets drive real city/lifestyle scenes.
4. SignalPrism interaction: SVG/CSS 3D prism, mouse field, Canvas signal lines, activity orbit, safety shell.
5. GSAP scroll: scoped `useGSAP` + `ScrollTrigger`, no production markers.
6. SEO/Trust/performance: build passes, OpenGraph warning removed, no homepage video requests.
7. Chrome acceptance: `output/qa/v5.111-signalprism-homepage-qa.json`.

The active goal remains open because full-site final visual signoff is still required.

## Canonical Docs

本文档定义执行顺序。任何页面设计、视频生产、代码实现、验收都必须遵守。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Fixed Execution Flow

固定流程：

`页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

不得从工具、视频、动效或视觉特效开始。

## Step 1: Page Structure

先确认页面属于哪一类：

- 8 个核心页面。
- 5 个系统页面。
- 历史兼容路由。

每个页面必须写清：

1. 页面目标。
2. 用户对象。
3. 核心 CTA。
4. section 顺序。
5. Trust 责任。
6. SEO 目标。
7. 关键视觉资产。

参考：

- `FITMEET_INFORMATION_ARCHITECTURE.md`

## Step 2: Brand Narrative

每个页面必须落到主叙事：

`一句想法 -> 一次计划 -> 一个公开场景 -> 一组边界 -> 合适的人出现 -> Social World`

必须使用中文短句。

参考：

- `DESIGN.md`
- `FITMEET_COPY_SYSTEM.md`

## Step 3: Key Visual

先设计关键视觉，再生产视频。

视觉检查：

1. 是否真实具体。
2. 是否有人、地点、动作。
3. 是否能作为 poster。
4. 是否不写文字进画面。
5. 是否不依赖抽象科技图。

工具：

- image_gen
- Creative Production
- Runway/Pika

参考：

- `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`

## Step 4: Runway/Pika Video

视频生成原则：

- 首页 Hero 用 Runway。
- Scenes 中段实验用 Pika。
- Vision 可用 Runway。
- 没有必要全站堆视频。

下载后必须：

1. 用 ffmpeg 转 WebM。
2. 截 poster。
3. 压缩体积。
4. 放到指定目录。
5. 通过 `CinematicVideoMedia` 接入。

禁止：

- 页面请求不存在视频。
- 视频里出现文字、Logo、HUD。
- 免费额度实验片直接当最终资产，不做验收。

## Step 5: GSAP Motion

动效目标：

- 让计划逐步发生。
- 让页面连续。
- 让视频和内容配合。

实现要求：

1. 使用 `data-motion-scope`。
2. 复杂 section 使用 `data-visual-owner`。
3. 动画目标使用 `data-motion-target`。
4. ScrollTrigger 只控制当前 owner。
5. reduced-motion 有完整回退。

参考：

- `FITMEET_MOTION_SYSTEM.md`

## Step 6: SEO / Trust / Performance

SEO：

- 核心页面必须有 metadata。
- Journal 承担内容增长。
- 不用假数据做 SEO。

Trust：

- `/safety` 独立完整。
- 所有涉及真人出现的页面先出现边界。
- 企业合作必须说明隐私和用户价值。

Performance：

- 视频 WebM + poster。
- 非首屏视频懒加载。
- 图片尺寸明确。
- 控制 fixed overlay 和 filter。

## Step 7: Chrome Acceptance

验收视口：

- `1366x900`
- `1440x1000`
- `1920x1080`

检查：

1. 首页 3 秒内建立 `Social World` 记忆。
2. 视频无黑场。
3. 文案不重叠。
4. 无小 HUD、小字、小点、小几何遮挡。
5. 无横向溢出。
6. reduced-motion 信息完整。
7. 企业合作邮箱可见。
8. metadata 存在。
9. Trust & Safety 完整。

参考：

- `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Implementation Notes

路由：

- 最终 IA 使用 `/product`、`/community`、`/journal`。
- 当前已有旧路由可保留或重定向。
- 不要一次性删除历史页面，除非明确安排迁移。

文档：

- 新文档优先。
- 旧文档只作历史参考。

代码：

- 不写单文件巨型页面。
- 不引入后端依赖作为核心内容显示条件。
- 不把 Waitlist 变成必须依赖 API 才能表达的页面。

## Self Review

每次设计或实现后必须回答：

1. 是否仍然太抽象。
2. 是否缺少真实场景。
3. 是否工具先于信息架构。
4. 是否视频替代了产品表达。
5. 是否 Trust 不够完整。
6. 是否企业合作价值清楚。
7. 是否存在文字遮挡或视觉噪音。
8. 是否符合 `一句想法，变成一次真实到场`。

## V5 Canonical Route Shell Implementation

本轮实现决策：先建立整站 canonical route shell，再继续视频和精修。

已经落地：

1. `components/social-world-page/SocialWorldPage.tsx` 作为 2026 官网统一页面骨架。
2. `components/social-world-page/pageData.ts` 作为 8 个核心页面 + 5 个系统页面的数据源。
3. `components/social-world-page/social-world-page.module.css` 作为桌面优先黑红锐角视觉系统。
4. 历史路由只做 redirect，不再承载独立视觉系统。
5. Motion 使用 `data-motion-scope`、`data-visual-owner`、`data-motion-target` 三层合同，避免 GSAP 段落上下文错位。

下一步执行顺序：

1. 用 Chrome 桌面验收 `/`、`/product`、`/scenes`、`/community`、`/safety`、`/about`、`/journal`、`/contact`。
2. 对首屏、video/poster、CTA、文案遮挡、横向溢出做问题清单。
3. 再进入 Runway/Pika 视频资产替换，不在页面结构未验收前生成大量视频。
4. 视频替换后运行 `npm run typecheck` 和 `npm run build`。

## V5.010 Next Execution Direction

本轮验证后，当前最优下一步不是继续重写信息架构，而是进入视觉与视频增强：

1. 保持 `SocialWorldPage` 作为唯一 canonical shell。
2. 使用 image_gen 先生成 Hero / Dispatch / Citywalk / Vision 的摄影级关键帧。
3. 使用 Runway 生成 Hero 与 Vision 正式视频。
4. 使用 Pika 生成 Dispatch / Scenes 潮流短视频。
5. 用 ffmpeg 输出 WebM、poster、循环优化。
6. 将视频接入现有 `CinematicVideoMedia`，不改变页面结构。
7. 再做 Chrome 三视口截图验收。

本轮发现并修复：

- `Social World` 字体过度压缩导致不可读，已改为更清晰的硬朗黑体栈。
- `/contact#enterprise` 锚点缺失，已为 section 自动生成稳定 id。
- 企业合作视频帧过黑，已先切换到 poster fallback。
- 成功页出现禁用词，已改为 `不是筛选`。

## V5.030 Video Production Execution

当前执行重点从静态关键帧进入视频生产闭环。

新增执行规则：

1. 使用 `FITMEET_VIDEO_ASSET_MANIFEST.json` 选择要生成的视频资产。
2. 在 Runway/Pika 上传对应 `sourceKeyframe`。
3. 使用 manifest 中的 `motionPrompt` 生成 4-6 秒视频。
4. 下载 MP4 后运行：

```bash
npm run media:ingest -- <asset-slug> <input-mp4>
```

5. 先人工检查 `public/videos/home-v5/<asset-slug>.webm` 和 `public/images/home-v5/<asset-slug>-poster.jpg`。
6. 只有视频质量高于 keyframe 时，才更新 `components/social-world-page/pageData.ts` 的 `poster` 和 `video`。
7. 运行 `npm run typecheck` 与 `npm run build`。
8. 用 Chrome 桌面检查对应页面首屏或 section。

失败处理：

- 如果视频黑场，删除本次输出或保留但不接入页面。
- 如果视频内出现文字、Logo、HUD、UI、可疑品牌或 dating 语境，不接入。
- 如果视频动作过猛、人物变形或场景不真实，不接入。
- 如果 Pika 结果不稳定，优先用 Runway 重试 Hero / Vision；Scenes 可继续用 keyframe 作为 fallback。

## V5.040 Execution Update

本轮继续按最高顺序推进：

`页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

当前完成：

1. 保持 V5 canonical route shell，不再重写页面结构。
2. 补齐 `scene-weekend-trip-keyframe.png`，移除 `/scenes` 对旧 V3 weekend 视频的依赖。
3. `FITMEET_VIDEO_ASSET_MANIFEST.json` 增加 `scene-weekend-trip` 资产条目。
4. `scripts/fitmeet-video-ingest.sh` 增加 `scene-weekend-trip` slug，保证 manifest 与命令一致。
5. Runway Chrome 自动化检查出现连续超时，暂不上传，避免误操作外部账号或接入低质量视频。

后续继续条件：

- 用户在 Chrome 中确认 Runway 或 Pika 已稳定停在 image-to-video 上传界面。
- 或者用户手动生成并下载 MP4 后，把文件放到本机，再运行 `npm run media:ingest -- <asset-slug> <input-mp4>`。

当前不做的事：

- 不把不存在的 `/videos/home-v5/*.webm` 写进页面。
- 不用旧 V3/V4 视频伪装 V5 完成度。
- 不绕过 Runway/Pika 的登录、验证、额度或权限限制。

## V5.050 Execution Update

本轮设计反思：

1. 页面结构已经稳定，但仍有旧 V4 媒体资产在 Agent Plan 和企业合作相关段落中承担主视觉。
2. 旧资产会让整站质感不统一，削弱 `更黑、更硬、更街头脉冲式` 的 V5 方向。
3. 获奖级企业官网不能靠混用历史素材维持完整度，必须让每个关键叙事点都有同一代视觉资产。

本轮完成：

1. 新增 `scene-public-plan-plaza-keyframe.png`，用于公开计划、边界确认、Agent Plan。
2. 新增 `partner-arrival-value-keyframe.png`，用于企业合作和真实到场意图。
3. `pageData.ts` 中 `streetPlaza` 与 `partnerArrival` 已切换到 V5 keyframe。
4. `FITMEET_VIDEO_ASSET_MANIFEST.json` 与 `fitmeet-video-ingest.sh` 已同步新增视频 slug。

下一步优先级：

1. 继续等待 Runway/Pika 稳定进入 image-to-video 上传界面。
2. 优先生成 `hero-night-run-social-world` 正式视频。
3. 其次生成 `scene-public-plan-plaza`，因为它是 Agent Plan 的核心解释镜头。
4. 最后生成 `partner-arrival-value`，支撑企业合作页的可信度。

## V5.060 Execution Update

本轮设计反思：

1. 页面已经有 V5 真实影像，但共享页面壳仍有 section 分块感。
2. 继续增加小装饰会违反用户对小 HUD、小点、小几何的禁令。
3. 正确升级方向是用大形态、滚动变量、斜切 seam 和压缩留白建立连续走廊。

本轮完成：

1. `SocialWorldPage.tsx` 新增根层 ScrollTrigger，驱动 `--sw-flow` 与 `--sw-heat`。
2. `social-world-page.module.css` 新增固定大型斜切背景场。
3. `chain` 从硬卡片排布调整为连续操作轨道。
4. `storySection` 降低硬分割，增加负间距和跨段 seam。
5. CTA、header、proof 对象加强锐利 hover 和桌面冲击。

下一步：

1. 浏览器可用时执行 1366 / 1440 / 1920 Chrome 验收。
2. 若验收出现文案重叠，优先修阅读轨道，不回退到更弱视觉。
3. 视频生成恢复后，优先接入 Hero Runway 视频。

## V5.061 Execution Update

本轮执行结果：

1. 使用 Chrome 对首页完成 `1366x900`、`1440x1000`、`1920x1080` 三视口验收。
2. 使用 Chrome 对 8 个核心页面 + 5 个系统页面完成 `1440x1000` 路由验收。
3. 使用 Chrome 模拟 `prefers-reduced-motion: reduce`，完成 13 个页面 reduced-motion 验收。
4. 保存验收证据到 `output/chrome-v5060/` 与 `output/chrome-v5061/`。

当前判断：

1. V5.060 连续走廊方向没有被浏览器验收推翻。
2. 首页首屏能建立 `Social World` 记忆，且 reduced-motion 下仍可读。
3. 当前工程状态满足继续进入视频资产生产的前置条件。
4. 最终获奖级目标仍未完成，因为正式 Runway/Pika WebM 尚未生成并接入。

下一步执行顺序：

1. 优先生成并接入 `hero-night-run-social-world` Runway 视频。
2. 其次生成 `scene-public-plan-plaza`，解决 Agent Plan 的核心机制镜头。
3. 再生成 `scene-court-dispatch` 与 `scene-citywalk-case`，增强中段真实场景冲击。
4. 每个视频必须先通过 `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md` 与 `FITMEET_PAGE_ACCEPTANCE_AGENT.md` 的视频验收，再写入 `pageData.ts`。
5. 视频接入后重新跑工程命令和 Chrome 三视口验收。

## V5.062 Execution Update

本轮执行重点：

进入最高流程中的 `Runway/Pika 视频` 环节，优先推进 Hero 视频 `hero-night-run-social-world`。

当前确认：

1. Hero keyframe 已存在，路径为 `public/images/home-v5/hero-night-run-social-world-keyframe.png`。
2. Hero keyframe 尺寸为 `1672 x 941`，可作为 image-to-video 输入。
3. `FITMEET_VIDEO_ASSET_MANIFEST.json` 中 `hero-night-run-social-world` 的 provider、prompt、输出路径和状态一致。
4. `scripts/fitmeet-video-ingest.sh` 支持 `hero-night-run-social-world` slug。

Chrome 外部状态：

1. 已发现 Runway 标签页和 Pika 标签页。
2. Runway 标签页在页面读取阶段超时，无法安全确认上传界面。
3. 重新连接 Chrome 后，文档 / troubleshooting 读取也出现控制通道超时。
4. 本轮没有上传文件，没有生成视频，没有改动页面代码。

设计判断：

1. 当前阻塞点不是设计方向，也不是 Next.js 工程，而是外部视频工具页面可控性。
2. 继续强行自动化会增加误上传、误生成、误消费额度和接入低质量视频的风险。
3. 获奖级企业官网不能把不稳定外部生成结果当完成态；宁可保持高质量 keyframe，也不接入低质量 WebM。

下一步执行顺序：

1. 用户手动确认 Runway/Pika 已稳定在 image-to-video 上传界面后，再让 Codex 上传关键帧和 prompt。
2. 如果用户已手动下载 MP4，直接执行 `npm run media:ingest -- hero-night-run-social-world <input-mp4>`。
3. 通过人工视频 QA 后，再写入 `pageData.ts` 的 `poster` 和 `video` 字段。
4. 视频接入后运行 `npm run typecheck`、`npm run build`、Chrome 三视口和 reduced-motion 验收。

## V5.063 Execution Update

本轮执行重点：

在 Runway/Pika 外部页面不稳定时，不停在等待状态，而是用本地可控方式推进首页动态体验。

本轮完成：

1. 使用现有 `hero-night-run-social-world-keyframe.png` 生成 5 秒本地电影感推镜 MP4。
2. 通过项目 `npm run media:ingest` 生成 WebM、MP4 archive 和 poster。
3. 将 `heroNightRun` 接入 `CinematicVideoMedia` 的 `video` 字段。
4. 更新 `FITMEET_VIDEO_ASSET_MANIFEST.json`，明确该资产是 `local-cinematic-fallback-live-runway-pending`。

设计判断：

1. 本地推镜不能替代 Runway/Pika 正式 image-to-video。
2. 但它比纯静帧更接近企业官网首屏电影感，且不会引入文字、Logo、HUD、dating 语境或假数据。
3. 只让 Hero 动起来，不把所有场景都伪动态化，避免廉价感。

下一步：

1. 运行 `npm run typecheck` 与 `npm run build`。
2. 用 Chrome 检查首页三视口，重点看视频是否黑场、是否遮挡 `Social World`。
3. 继续等待 Runway/Pika 稳定后，用真实 image-to-video 替换本地 fallback。

## V5.064 Execution Update

本轮执行结果：

1. `npm run typecheck` 通过。
2. `npm run build` 通过，只有既有 OpenGraph `z-index` 警告。
3. Chrome 首页三视口视频验收通过。
4. 发现并修复 reduced-motion 下 Hero WebM 仍自动播放的问题。
5. `CinematicVideoMedia` 现在在 reduced-motion 下渲染 poster，不渲染 `<video>`。

当前状态：

1. 首页 Hero 已从静态 keyframe 升级为本地 cinematic WebM fallback。
2. 普通模式加载 5 秒 1920x1080 WebM。
3. reduced-motion 模式只显示 1920x1080 poster。
4. 页面仍不冒充 Runway/Pika final。

下一步：

1. 继续优先获取 Runway/Pika 正式 Hero image-to-video。
2. 如果外部视频仍不可控，下一步可对 `scene-public-plan-plaza` 生成同类本地 fallback，但必须谨慎，避免全站伪动态化。
3. 更推荐先等待 Runway/Pika 稳定，因为真实人物动作仍是最终获奖级关键。

## V5.065 Execution Update: Agent Plan Concrete Media

本文档继续执行最高顺序：页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收。

### What changed

The Agent Plan section now receives a live cinematic fallback through `streetPlaza.video`. This moves the page away from static illustration and toward the target language: a real public place where a plan can safely become arrival.

### Why this is aligned

- It supports the product claim `先有计划，再出现合适的人。`
- It shows public context instead of abstract AI UI.
- It keeps the video free of text, logo, HUD, fake data, and dating cues.
- It remains a temporary fallback until Runway/Pika final motion is generated.

### Next execution target

Do not generate more disconnected decoration. The next visual pass should either replace this fallback with true Runway/Pika motion or connect another missing page-critical media asset only when its page role is explicit in `FITMEET_INFORMATION_ARCHITECTURE.md`.

## V5.066 Execution Evidence: Agent Plan Fallback

The Agent Plan fallback is now implemented and verified as a concrete page asset.

### Completed checks

- `FITMEET_VIDEO_ASSET_MANIFEST.json` parses and marks `scene-public-plan-plaza` as `local-cinematic-fallback-live-runway-pika-pending`.
- `npm run typecheck` passes.
- `npm run build` passes with only existing OpenGraph `z-index` warnings.
- Chrome validates normal and reduced-motion behavior across 1366x900, 1440x1000, and 1920x1080 for the Agent Plan section.

### Design decision

This change is aligned because it replaces static abstraction with a public-place plan scene while preserving the final target: Runway/Pika must still produce true human micro-motion before this can be considered final award-level media.

## V5.067 Execution Update: Real People Concrete Media

The homepage now has concrete media for three major beats: Hero, Agent Plan, and Real People. This improves narrative continuity: a need appears, the Agent structures it, then people enter a real public scene.

### Why this matters

- It reinforces `社交不是筛选，是现实里发生。`
- It avoids avatar-wall and dating-product patterns.
- It makes the Social World story feel less abstract before the final city-network beat.
- It remains marked as local fallback until Pika produces true image-to-video human motion.

### Next execution target

The next homepage weakness is `cityNetwork`: the final Social World / Vision beat still depends on a keyframe. That section should receive either Runway final motion or a clearly marked local fallback only if it preserves enterprise vision and avoids fake data visualization.

## V5.068 Execution Evidence: Real People Citywalk Fallback

The Real People / Citywalk fallback is now implemented and verified as a concrete page asset.

### Completed checks

- `FITMEET_VIDEO_ASSET_MANIFEST.json` parses and marks `scene-citywalk-case` as `local-cinematic-fallback-live-pika-pending`.
- `npm run typecheck` passes.
- `npm run build` passes with only existing OpenGraph `z-index` warnings.
- Chrome validates normal and reduced-motion behavior across 1366x900, 1440x1000, and 1920x1080 for the Real People section.

### Design decision

This change is aligned because it completes the homepage story beat where people appear after a plan, instead of pushing users into profile browsing, avatar walls, or dating-style matching.

## V5.069 Execution Update: Social World Vision Concrete Media

The homepage now has concrete media for all four core beats: Hero, Agent Plan, Real People, and Social World. This improves the landing narrative from a sequence of sections into one staged plan becoming a city life network.

### Why this matters

- It makes the final memory point visible: Social World is not a feature list; it is a connected city system.
- It avoids fake metrics, dashboards, maps, HUDs, and data-wall aesthetics.
- It keeps the company vision grounded in real places and real young people.
- It remains marked as local fallback until Runway produces final cinematic motion.

### Next execution target

After Chrome validation, the homepage media fallback layer is coherent. The next work should either produce final Runway/Pika replacements or move to the highest-impact secondary page still lacking video specificity: Product, Scenes, or Trust & Safety.

## V5.070 Execution Evidence: Social World Vision Fallback

The Social World / Vision fallback is now implemented and verified as a concrete page asset.

### Completed checks

- `FITMEET_VIDEO_ASSET_MANIFEST.json` parses and marks `vision-arrival-network` as `local-cinematic-fallback-live-runway-pending`.
- `npm run typecheck` passes.
- `npm run build` passes with only existing OpenGraph `z-index` warnings.
- Chrome validates normal and reduced-motion behavior across 1366x900, 1440x1000, and 1920x1080 for the Social World section.

### Design decision

This change is aligned because the homepage now has a visible final memory point: real plans connect into a city network. It avoids fake metrics and abstract SaaS dashboards while keeping enterprise vision grounded in real places.

## V5.071 Execution Update: Scenes Concrete Media

`/scenes` now receives concrete video fallback assets for the page hero/court story and the weekend story. This moves the site beyond homepage-only polish and directly addresses the earlier problem: the product felt abstract because real scenarios were not concrete enough.

### Why this matters

- Scenes is the proof page for `每一次连接，都从一件具体的事开始。`
- Court proves social can start from activity, not chat.
- Weekend proves even higher-friction plans can have public boundaries.
- Both assets avoid avatar walls, profile browsing, fake metrics, and AI SaaS dashboards.

### Next execution target

After Chrome validation, `/scenes` should be reviewed as a full page. Remaining gaps: Night Run still uses the section keyframe path and final Runway/Pika motion is still pending for every local fallback.

---

## V5.072 Execution Evidence: `/scenes` Court and Weekend Acceptance

This execution record confirms that the scenes page now has concrete real-scene media for two additional sections and that the media is coupled to the correct visual blocks.

Validated flow:

`页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

Current step status:
- Page structure: `/scenes` keeps the scenario structure: Night Run, Court, Citywalk, Weekend.
- Brand narrative: Court and Weekend remain concrete low-pressure social scenarios, not abstract AI SaaS panels.
- Key visual: Court and Weekend now use real-scene cinematic assets with redline/night-city styling.
- Runway/Pika video: final external video generation remains pending, but local cinematic fallback videos are live and correctly named.
- GSAP/scroll coupling: acceptance verified the media inside the correct `#court` and `#weekend` blocks instead of relying on global page assumptions.
- SEO/Trust/performance: no fake metrics, no dating language, no horizontal overflow in tested desktop viewports.
- Chrome acceptance: `12/12` matrix passed across `1366x900`, `1440x1000`, and `1920x1080`, including normal and reduced-motion states.

Artifacts:
- `public/videos/home-v5/scene-court-dispatch.webm`
- `public/videos/home-v5/scene-court-dispatch.mp4`
- `public/images/home-v5/scene-court-dispatch-poster.jpg`
- `public/videos/home-v5/scene-weekend-trip.webm`
- `public/videos/home-v5/scene-weekend-trip.mp4`
- `public/images/home-v5/scene-weekend-trip-poster.jpg`
- `output/chrome-v5071/scenes-court-weekend-viewport-matrix.json`

Implementation notes:
- Normal motion must render the correct WebM asset in the matching section.
- Reduced motion must render the matching poster image and remove video playback from the inspected section.
- Do not generalize this evidence to Night Run; that section still needs a motion upgrade.

---

## V5.073 Execution Update: Scenes Night Run Motion Gap Closed

This update closes the last static-media gap inside `/scenes` by connecting the Night Run scenario to its own video/poster pair.

Validated flow:

`页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

Current step status before Chrome acceptance:
- Page structure: `/scenes` keeps Night Run, Court, Citywalk, and Weekend as concrete scenarios.
- Brand narrative: Night Run remains a public, low-pressure plan, not a dating or swipe metaphor.
- Key visual: Night Run now uses a real city night-running scene with red route light and young people in motion.
- Runway/Pika video: final external generation remains pending; local fallback is used only because external browser generation has been unstable.
- GSAP/scroll coupling: the media key is section-specific (`nightRun`) and must be validated against the Night Run section, not inferred from the Hero section.
- SEO/Trust/performance: no fake metrics, no dating language, no text inside video.
- Chrome acceptance: must be run for normal and reduced-motion states at desktop viewports before this update is treated as checked.

Artifacts:
- `public/videos/home-v5/scene-night-run.webm`
- `public/videos/home-v5/scene-night-run.mp4`
- `public/images/home-v5/scene-night-run-poster.jpg`
- `output/video-candidates/scene-night-run-local-drift.mp4`

Implementation rule:
- Do not point `/scenes` Night Run back to `hero-night-run-social-world-keyframe.png` after this update.
- If Runway/Pika final replaces this local fallback, keep the same `nightRun` media key and update only the asset paths after video QA passes.

---

## V5.074 Execution Evidence: Scenes Night Run Acceptance

This execution record confirms that `/scenes` now has motion-ready concrete media for Night Run, Court, Citywalk, and Weekend.

Validated flow:

`页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

Current evidence:
- `nightRun` media key now points to `/videos/home-v5/scene-night-run.webm` and `/images/home-v5/scene-night-run-poster.jpg`.
- `FITMEET_VIDEO_ASSET_MANIFEST.json` is now `v5.073` and includes `scene-night-run` with status `local-cinematic-fallback-live-runway-pika-pending`.
- `npm run typecheck` passed.
- `npm run build` passed with only the existing OpenGraph `z-index` warnings.
- Chrome desktop acceptance passed `6/6` for Night Run across `1366x900`, `1440x1000`, and `1920x1080`, including normal and reduced-motion modes.

Artifacts:
- `public/videos/home-v5/scene-night-run.webm`
- `public/videos/home-v5/scene-night-run.mp4`
- `public/images/home-v5/scene-night-run-poster.jpg`
- `output/chrome-v5073/scenes-night-run-viewport-matrix.json`

Design consequence:
- `/scenes` no longer has a static Night Run gap.
- The page still cannot be called final award-level because the motion layer is local fallback, not external Runway/Pika image-to-video with real human micro-motion.

---

## V5.075 Execution Update: Scenes Continuous Corridor

This update addresses the earlier design criticism that the site can feel too separated by section. The target was not to add another asset, but to make `/scenes` read as one continuous Social World route.

Changed file:
- `components/social-world-page/social-world-page.module.css`

Change scope:
- CSS only.
- Scoped to `.page[data-page="scenes"]`.
- No TSX changes.
- No media asset changes.
- No global SocialWorldPage changes.

Design changes:
- The ticker now cuts upward into the Hero instead of sitting like a separate strip.
- The process chain now overlaps into Night Run instead of forming a hard divider.
- Story sections now overlap more aggressively: section gaps changed from about `-20px` to about `-160px` at `1440x1000`.
- The page has a shared redline corridor field behind the scenario sequence.
- Media blocks keep sharp geometry but feel connected by redline cuts and shared background slices.
- Total `/scenes` page height at `1440x1000` changed from about `6000px` to about `5089px`, reducing empty scroll and tightening rhythm.

Validation evidence:
- `npm run typecheck` passed.
- `npm run build` passed with only existing OpenGraph `z-index` warnings.
- Chrome matrix passed `6/6` across `1366x900`, `1440x1000`, `1920x1080`, normal and reduced-motion.
- Evidence: `output/chrome-v5075/scenes-corridor-viewport-matrix.json`.
- Screenshots: `output/chrome-v5075/scenes-corridor-hero-1440x1000.png`, `output/chrome-v5075/scenes-corridor-chain-1440x1000.png`, `output/chrome-v5075/scenes-corridor-night-run-1440x1000.png`, `output/chrome-v5075/scenes-corridor-citywalk-1440x1000.png`, `output/chrome-v5075/scenes-corridor-weekend-reduced-1440x1000.png`.

Remaining gap:
- This improves continuity and rhythm, but local fallback videos still need final Runway/Pika image-to-video replacement before the page can be called final award-level.

## V5.071 Execution Update: Product Mechanism Page

`/product` has been rebuilt from a generic SocialWorldPage instance into a dedicated product mechanism page. The page now explains FitMeet as a real-world plan generation system instead of a generic AI social landing section.

Implementation files:

- `app/product/page.tsx`
- `app/product/ProductExperienceClient.tsx`
- `app/product/product.module.css`

Design decision:

- Product is now expressed as `一句想法 -> 需求理解 -> 上下文判断 -> 边界协议 -> 计划生成 -> 同频匹配 -> 计划收据 -> CTA`.
- The page uses real existing FitMeet media assets instead of SVG illustration or abstract dashboard mockups.
- The page avoids chat UI, avatar walls, profile browsing, fake metrics, fake partner proof, dating language, and AI SaaS dashboard patterns.
- Key Chinese display headings use controlled line breaks because arbitrary Chinese wrapping damaged the enterprise-level rhythm.
- Desktop remains the priority. Responsive fallback exists only to avoid breakage; mobile is not a design target for this phase.

Validation evidence:

- `npm run typecheck` passed.
- `npm run build` passed.
- Chrome desktop checks covered `1366x900`, `1440x1000`, and `1920x1080`.
- Product QA output: `output/chrome-product-v5073/product-qa-results.json`.
- Screenshots saved:
  - `output/chrome-product-v5073/product-hero-1440x1000.png`
  - `output/chrome-product-v5073/product-pipeline-1440x1000.png`
  - `output/chrome-product-v5073/product-receipt-1440x1000.png`
  - `output/chrome-product-v5073/product-reduced-1440x1000.png`

Result:

- `/product` now supports the core brand claim: `社交 Agent 让社交更简单`.
- `/product` proves the product mechanism with concrete plan language instead of relying on cinematic mood alone.
- Remaining award-level gap: final Runway/Pika production media is still needed for the product page hero and mechanism beats if the page is submitted as an award-level production experience.

## V5.072 Execution Update: Community Social World Page

`/community` has been rebuilt from a generic SocialWorldPage instance into a dedicated Social World city network page. The page now explains FitMeet as a youth city life network, not as an abstract community slogan.

Implementation files:

- `app/community/page.tsx`
- `app/community/CommunityExperienceClient.tsx`
- `app/community/community.module.css`

Design decision:

- Community is now expressed as `真实需求 -> 计划 -> 到场 -> 复访 -> 城市节点 -> Social World`.
- Hero uses `vision-arrival-network` media to connect the page to the city-network memory point.
- The page foregrounds a trust boundary early: only public scenes and plan nodes are connected; personal location is not public.
- GSAP is scoped to `[data-community-page]` and `data-community-*` targets only. No global selectors are used for the community timeline.
- ScrollTrigger drives page progress, section reveal, a scoped city-node timeline, and a horizontal keyword rail.
- Blur was removed from community reveal motion after visual QA because it made key headings feel virtual and unclear. Community motion should stay hard, sharp, and readable.
- Scene video cards stay visible by default so real-place media does not disappear while scrolling.

Validation evidence:

- `npm run typecheck` passed.
- `npm run build` passed.
- Chrome desktop checks covered `1366x900`, `1440x1000`, and `1920x1080`.
- Community QA output: `output/chrome-community-v5077/community-qa-results.json`.
- Screenshots saved:
  - `output/chrome-community-v5077/community-hero-1440x1000.png`
  - `output/chrome-community-v5077/community-loop-1440x1000.png`
  - `output/chrome-community-v5077/community-network-1440x1000.png`
  - `output/chrome-community-v5077/community-scenes-1440x1000.png`
  - `output/chrome-community-v5077/community-reduced-1440x1000.png`

Result:

- `/community` now supports the Social World claim with city nodes, public scenes, repeatable plans, and real video evidence.
- The page is no longer a generic section page or abstract map story.
- Remaining award-level gap: final Runway/Pika city-community hero footage can still improve originality, but the page now has the correct information architecture and motion coupling.

## V5.080 Execution Update: Trust & Safety Page

`/safety` has been rebuilt from a generic SocialWorldPage instance into a dedicated Trust & Safety page. The page now makes safety a product sequence instead of a legal disclaimer or abstract trust block.

Implementation files:

- `app/safety/page.tsx`
- `app/safety/SafetyExperienceClient.tsx`
- `app/safety/safety.module.css`

Design decision:

- Safety is now expressed as `公开地点 -> 边界确认 -> 可退出机制 -> 举报和屏蔽 -> 隐私保护 -> 未成年人边界 -> 确认后邀请 -> 安全收据`.
- Hero uses real public-place city media to show that trust begins in visible public contexts.
- The page includes explicit minors boundary language and does not place minors in the default open social flow.
- The page uses `企业合作侧` language for data boundaries to avoid any fake partner-proof reading.
- GSAP is scoped to `[data-safety-page]` and `data-safety-*` targets only. No global selectors are used for the safety timeline.
- Reduced-motion swaps videos to poster images and keeps the page information complete.

Validation evidence:

- `npm run typecheck` passed.
- `npm run build` passed with only the existing `z-index is currently not supported` warning during static page generation.
- Chrome desktop checks covered `1366x900`, `1440x1000`, and `1920x1080`.
- Safety QA output: `output/chrome-safety-v5080/safety-qa-results.json`.
- Screenshots saved:
  - `output/chrome-safety-v5080/safety-hero-1440x1000.png`
  - `output/chrome-safety-v5080/safety-protocol-1440x1000.png`
  - `output/chrome-safety-v5080/safety-receipt-1440x1000.png`
  - `output/chrome-safety-v5080/safety-reduced-1440x1000.png`

Result:

- `/safety` now supports the required Trust & Safety gate for a real-world social platform.
- Required safety terms are present: `公开地点`, `退出机制`, `举报`, `屏蔽`, `隐私保护`, `未成年人边界`, `确认后邀请`, `安全收据`.
- No dating language, fake partner proof, fake metrics, fake logos, or fake growth claims were detected in Chrome QA.
- Remaining award-level gap: final Runway/Pika custom safety media can improve originality, but the page now has the correct information architecture, motion scope, and trust sequence.

## V5.081 Execution Update: About Company Narrative Page

`/about` has been rebuilt from a generic SocialWorldPage route into a dedicated company narrative page. The page now explains FitMeet as a company building Social World, not as a generic AI social landing page.

Implementation files:

- `app/about/page.tsx`
- `app/about/AboutExperienceClient.tsx`
- `app/about/about.module.css`

Design decision:

- About is now expressed as `行业痛点 -> 当前产品路径 -> 产品信念 -> 3-5 年愿景 -> 最终目标`.
- Hero establishes the company thesis: `我们不从关系开始。我们从真实生活开始。`
- The page states the industry pain directly: people appear too early and scenes appear too late.
- The page explains current work: social Agent reorganizes real needs into real plans.
- The page writes the 3-5 year vision as a goal, not a completed result.
- The page states the final ambition: changing how people and cities connect.
- Banned words were removed even from negative statements so brand language and automated acceptance stay clean.
- GSAP is scoped to `[data-about-page]` and `data-about-*` targets only.
- Reveal motion was adjusted after screenshot QA so company copy remains readable by default instead of disappearing during fast scroll or screenshot capture.

Validation evidence:

- `npm run typecheck` passed.
- `npm run build` passed with only the existing `z-index is currently not supported` warning during static page generation.
- Chrome desktop checks covered `1366x900`, `1440x1000`, and `1920x1080`.
- About QA output: `output/chrome-about-v5082/about-qa-results.json`.
- Screenshots saved:
  - `output/chrome-about-v5082/about-hero-1440x1000.png`
  - `output/chrome-about-v5082/about-pain-1440x1000.png`
  - `output/chrome-about-v5082/about-path-1440x1000.png`
  - `output/chrome-about-v5082/about-vision-1440x1000.png`
  - `output/chrome-about-v5082/about-final-1440x1000.png`
  - `output/chrome-about-v5082/about-reduced-1440x1000.png`

Result:

- `/about` now supports enterprise credibility for the Social World company story.
- Required company terms are present: `真实生活`, `社交 Agent`, `行业的问题`, `不是缺少人`, `现实计划`, `3-5 年`, `城市基础设施`, `改变人和城市`, `Social World`, `真实到场`.
- No banned social/dating terms, fake proof terms, horizontal overflow, or GSAP production markers were detected in Chrome QA.
- Remaining award-level gap: final custom Runway/Pika company-vision media can improve originality, but the information architecture and narrative standard are now correct.

## V5.083 Execution Update: Contact / Enterprise Cooperation Page

Priority: canonical execution update.

Completed implementation:
- `/contact` now uses a dedicated `ContactExperienceClient` instead of the old generic SocialWorldPage template.
- The page explicitly supports personal early access, enterprise cooperation, and safety/privacy routing.
- Enterprise cooperation email is visible and linked: `15253005312@163.com`.
- Videos are pulled from the existing home-v5 cinematic asset set and are replaced by posters under reduced motion.

Validation evidence:
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Chrome desktop QA: `output/chrome-contact-v5083/contact-qa-results.json`.
- Desktop viewports checked: `1366x900`, `1440x1000`, `1920x1080`.

Result:
Contact is no longer a support-form page. It is the conversion closure for Social World: real idea -> correct path -> real next step.

## V5.084 Execution Update: Journal / Content Growth Page

Priority: canonical execution update.

Completed implementation:
- `/journal` now uses dedicated `JournalExperienceClient` and `journal.module.css` instead of the generic SocialWorldPage template.
- The page supports four content rails: product progress, city observation, technical experiments, cooperation updates.
- The channel filter is functional and verified in Chrome.
- The visual system uses hard editorial rows and rails, not a soft blog card wall.
- Media is poster-based, intentionally light, and does not add heavy video load.

Validation evidence:
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Chrome desktop QA: `output/chrome-journal-v5084/journal-qa-results.json`.
- Desktop viewports checked: `1366x900`, `1440x1000`, `1920x1080`.

Result:
Journal now serves the long-term Social World explanation layer and SEO growth path without fake proof or generic AI thought leadership.

## V5.085 Execution Update: System Trust Pages

Completed execution step:

`SEO/Trust/性能 -> Chrome 验收`

System page implementation is now complete enough to serve as the trust baseline for the current website.

Execution details:

- Replaced generic system route wrappers with dedicated `SystemTrustPage` implementation.
- Centralized system page copy in `systemPageData.ts`.
- Added black/red hard-edge CSS specific to trust and protocol pages.
- Removed title uppercase transformation to preserve `Cookie` and `Social World` casing.
- Added explicit `恶意行为` language to Terms.
- Verified no video on system pages.
- Verified no banned dating or fake-metric language.

Next execution focus:

After this trust layer, the next meaningful goal-level pass should audit the full 8 core pages together for story continuity, not isolated page polish.

## V5.086 Execution Update: Full-Site Continuity Correction

Execution step:
`SEO/Trust/性能 -> Chrome 验收`

Reason:
The first full-site desktop QA exposed two problems that isolated page work did not fully catch:
- `/product` needed the exact `真实计划` phrase to make the product promise unambiguous.
- `/scenes` used a long Chinese sentence in an oversized cinematic H1, which harmed desktop webpage readability.

Correction:
- Product copy now states that the Agent creates `一张真实计划`.
- Scenes hero title is now `先有具体的事。` with the longer explanation moved to subtitle.
- Scenes desktop H1 has page-specific sizing so the homepage can keep its larger `Social World` treatment.

Next execution focus:
Run full-site Chrome QA and use the result to decide whether the next improvement should be page continuity, final Runway/Pika media originality, or deeper GSAP narrative coupling.

## V5.087 Execution Result: Full-Site Chrome QA Passed

Validation completed after the `/product` copy lock and `/scenes` desktop H1 correction.

Evidence:
- `npm run typecheck`: passed.
- `npm run build`: passed with only the existing static-generation `z-index is currently not supported` warning.
- Chrome QA JSON: `output/chrome-fullsite-v5087/fullsite-award-qa-results.json`.
- Total checks: 52.
- Failure count: 0.

Decision:
The immediate full-site continuity blocker is resolved. The next goal-level improvement should focus on final media originality and cinematic quality: replacing reused/fallback imagery with stronger Runway/Pika video assets where the current screenshots still feel less than award-submission quality.

## V5.088 Execution Update: Partner Arrival Media and Runway/Pika Queue

Execution step:
`关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

Completed in this pass:
- Added a local cinematic fallback for `partner-arrival-value` from the existing V5 keyframe.
- Ingested the fallback through the same `npm run media:ingest` contract used by other assets.
- Connected `partnerArrival` to `CinematicVideoMedia` by adding a WebM source in `pageData.ts`.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to version `v5.088` and added a final-production queue rule set.
- Added `FITMEET_RUNWAY_PIKA_PRODUCTION_QUEUE.md` as the operational control sheet for external image-to-video replacement.

Decision:
Do not create more local pseudo-final videos. The next media step should be actual Runway/Pika production using the queue document, then ingest and Chrome QA.

## V5.089 Execution Result: Partner Arrival Visible Route Fix

Execution step:
`Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

Problem found:
Chrome QA showed that `partner-arrival-value.webm` existed and was defined in shared page data, but no active checked route was actually rendering it. This meant the media gap was not closed from a user-facing page perspective.

Fix:
- Updated `/contact#enterprise` enterprise media to use `partner-arrival-value.webm` and `partner-arrival-value-poster.jpg`.
- Kept the existing contact page structure, GSAP scopes, typography, CTA copy, and enterprise cooperation narrative unchanged.

Validation:
- `npm run typecheck` passed.
- `npm run build` passed with only the existing `z-index is currently not supported` warning.
- Chrome QA passed for `/contact#enterprise` across `1366x900`, `1440x1000`, and `1920x1080`.
- Reduced-motion QA passed at `1440x1000`.
- Evidence: `output/chrome-partner-v5088/partner-arrival-qa-results.json`.

Decision:
The enterprise media connection is now valid. The next goal-level improvement should not produce more local fallback videos; it should use Runway/Pika to replace the current fallback with a stronger final export.

## V5.090 Execution Update: Hero Runway Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated a new photographic Hero keyframe using `image_gen`.
- Copied the generated image into the project under `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Runway input version with ffmpeg.
- Added a Runway prompt and rejection rules for the Hero image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.090` with a `ready-for-runway-upload` candidate.

Decision:
This improves the production chain but does not yet improve the live website. The next required action is Runway image-to-video generation, followed by `npm run media:ingest`, `npm run typecheck`, `npm run build`, and Chrome desktop QA before replacing the current Hero fallback.

## V5.091 Execution Update: Runway Upload Blocked by Chrome File Permission

Execution step:
`Runway/Pika 视频`

Runway readiness confirmed:
- Existing logged-in Runway tab was available in Chrome.
- The page was not at login, CAPTCHA, or payment wall.
- The page showed `500 credits`.
- A media upload input existed and accepted image/video files.

Blocked action:
- Uploading the prepared Hero keyframe could not proceed because the Chrome control bridge failed to trigger the file chooser from both the visible `Add media` button and the real `input[type=file]`.

Required user action:
Enable file URL access for the Codex Chrome extension:
`chrome://extensions -> Codex extension -> Details -> Allow access to file URLs`.

Decision:
Do not redesign the Hero again. The next productive step is to retry the Runway upload after extension file access is enabled, then ingest the resulting MP4 if it passes visual acceptance.

## V5.092 Execution Update: Partner Arrival Runway Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated a new photographic Partner Arrival keyframe using `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Runway input version with ffmpeg.
- Added a Runway prompt and rejection rules for the Partner Arrival image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.092` with a `ready-for-runway-upload` candidate.

Decision:
This improves the production chain but does not yet improve the live website. The next external-media action remains blocked by Chrome extension file URL access; once fixed, upload Hero first, then Partner Arrival.

## V5.093 Execution Update: Public Plan Plaza Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated a public-plan photographic keyframe using `image_gen`.
- Rejected the first candidate because visible storefront signage broke the no-text/no-signage rule.
- Accepted the clean second candidate: public plaza, route confirmation gesture, wet pavement, red route reflection, no readable text.
- Copied the accepted generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Pika / Runway input version with ffmpeg.
- Added a prompt and rejection rules for the `scene-public-plan-plaza` image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.093`.

Decision:
This moves the third priority media asset closer to final external video production. It does not change the live website yet. The next external-media step remains blocked until Chrome extension file URL access is enabled.

## V5.094 Execution Update: Vision Arrival Network Runway Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Accepted a new photographic Vision Arrival Network keyframe generated with `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Runway input version with ffmpeg.
- Added a Runway prompt and rejection rules for the `vision-arrival-network` image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.094`.

Decision:
This moves the fourth-priority brand-vision media asset closer to final external video production. It does not change the live website yet. The next external-media step remains blocked until Chrome extension file URL access is enabled.

## V5.095 Execution Update: Court Dispatch Pika / Runway Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated and accepted a photographic Court Dispatch keyframe with `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Pika / Runway input version with ffmpeg.
- Added a prompt and rejection rules for the `scene-court-dispatch` image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.095`.

Decision:
This improves the concrete activity layer of the site and addresses the earlier problem of the website feeling too abstract. It does not change the live website yet. The next external-media step remains blocked until Chrome extension file URL access is enabled.

## V5.096 Execution Update: Citywalk Case Pika Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated and accepted a photographic Citywalk Case keyframe with `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Pika input version with ffmpeg.
- Added a prompt and rejection rules for the `scene-citywalk-case` image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.096`.

Decision:
This strengthens the youth city-life layer and makes the site less abstract. It does not change the live website yet. The next external-media step remains blocked until Chrome extension file URL access is enabled.

## V5.097 Execution Update: Night Run Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated and accepted a photographic Night Run keyframe with `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Pika / Runway input version with ffmpeg.
- Added a prompt and rejection rules for the `scene-night-run` image-to-video job.

Decision:
This strengthens the core action scene. It does not change the live website yet. The next external-media step remains blocked until Chrome extension file URL access is enabled.

## V5.098 Execution Update: Weekend Trip Input Ready

Execution step:
`关键视觉 -> Runway/Pika 视频`

Completed:
- Generated and accepted a photographic Weekend Trip keyframe with `image_gen`.
- Copied the generated image into `output/runway-inputs/home-v5/`.
- Produced a `1920x1080` Pika / Runway input version with ffmpeg.
- Added a prompt and rejection rules for the `scene-weekend-trip` image-to-video job.
- Updated `FITMEET_VIDEO_ASSET_MANIFEST.json` to `v5.098` with all eight image-to-video inputs ready.

Decision:
This completes the planned external video input set. The site is still not final award-submission ready until Runway/Pika exports are generated, ingested, and accepted through build and Chrome desktop QA.


## V5.099 Execution Update: Upload Handoff Package Ready

Execution step:
`Runway/Pika 视频`

Completed:
- Confirmed all eight image-to-video inputs are ready.
- Attempted to continue through Chrome, but claiming the Runway tab timed out twice.
- Created `FITMEET_VIDEO_UPLOAD_HANDOFF.md` and `output/runway-inputs/home-v5/upload-queue-v5.099.json`.
- Packaged all inputs and prompts under `output/runway-inputs/home-v5/upload-pack-v5.099`.

Decision:
Do not continue producing more local fallback assets. The project is now waiting on external Runway/Pika video generation. Manual upload or a later Chrome retry should use the V5.099 queue order.

## V5.100 Execution Update: Batch Ingest Pipeline Ready

Execution step:
`Runway/Pika 视频 -> SEO/Trust/性能 -> Chrome 验收`

Completed:
- Added `scripts/fitmeet-video-batch-ingest.sh` for accepted Runway/Pika downloads.
- Added `npm run media:ingest:batch`.
- Added the accepted-download staging directory: `output/runway-downloads/home-v5`.
- Fixed `scripts/fitmeet-video-ingest.sh` so `scene-night-run` is a valid ingest slug.
- Recorded readiness evidence at `output/qa/v5.100-media-ingest-readiness.json`.

Decision:
The project now has a clean handoff from external video generation to local website replacement. Once accepted MP4/MOV files exist, place them in `output/runway-downloads/home-v5` and run `npm run media:ingest:batch -- --force --verify`. After that, run Chrome desktop QA.

## v5.101 Award Preflight Gate

本文档优先级：执行层文档。低于 `README.MD`、`DESIGN.md`、信息架构、文案系统和媒体生产手册；高于历史首页专项文档。

新增本地奖项级预检命令：

```bash
npm run qa:award-preflight
```

该命令只检查当前仓库是否仍然朝最终目标推进，不代替 Chrome 视觉验收，也不伪造 Runway/Pika 已产出最终视频。它覆盖：

- 8 个核心页面和 5 个系统页面是否存在。
- Canonical Docs 是否存在。
- Runway/Pika 八条视频输入、提示词、上传包、下载目录和 ingest 脚本是否完整。
- `FITMEET_VIDEO_ASSET_MANIFEST.json` 是否声明 `v5.101` 预检门禁。
- 源码层是否出现禁用社交/dating 文案、假数据语气或生产 GSAP markers。
- 企业合作邮箱 `15253005312@163.com` 是否仍在应用源码中。
- `CinematicVideoMedia` 与 GSAP/React 动效接入信号是否存在。

预检通过只代表“结构、文档、媒体链路和代码语言门禁可执行”。最终奖项级完成仍必须继续执行：

`Runway/Pika 生成并人工接受视频 -> npm run media:ingest:batch -- --force --verify -> Chrome 1366x900 / 1440x1000 / 1920x1080 视觉验收`

## v5.102 Media Acceptance Separation

新增媒体门禁：

```bash
npm run media:audit
```

它把视频状态拆成三层：

1. `technical public asset`：`public/videos` 和 `public/images` 中的 MP4/WebM/poster 已经满足分辨率、时长、无音轨等硬指标。
2. `accepted source export`：Runway/Pika 人工接受后的源 MP4/MOV 已经放入 `output/runway-downloads/home-v5`。
3. `final visual acceptance`：Chrome 桌面页面中视频无黑场、无模糊、无文字、无 HUD，并且服务 Social World 叙事。

当前执行原则：

- `npm run media:audit` 允许在源视频未下载时通过技术层，但会输出 `finalMediaBlockers`。
- `npm run media:audit -- --strict-final` 必须在最终验收前通过。
- 最终 goal 不能只凭 public 里的 fallback 视频完成，必须有 accepted source export 和 Chrome 视觉验收。

## v5.103 Chrome Homepage Sampling

新增 Chrome 首页采样证据：

```text
output/qa/v5.103-chrome-desktop-sampling.json
```

采样视口：

- `1366x900`
- `1440x1000`
- `1920x1080`

本次修正：`components/social-world-page/SocialWorldPage.tsx` 中的 `CinematicVideoMedia` 不再在 reduced-motion 下替换成 `<img>`。现在逻辑为：

- 有 video 资源时始终渲染 `<video>`。
- reduced-motion 下关闭 autoplay，使用 poster 呈现静态画面。
- 非 reduced-motion 下继续 autoplay / muted / loop / playsInline。

这样同时满足两个目标：视频资产可被真实接入和检测，reduced-motion 下信息完整且不强制播放。

## v5.104 Full-Site Chrome Sampling Result

新增全站采样结果：

```text
output/qa/v5.104-fullsite-chrome-sampling.json
```

这一步把 `Chrome 验收` 从首页扩展到 8 个核心页面和 5 个系统页面。它验证页面能打开、基础 SEO 存在、主标题存在、主 CTA 存在、无横向溢出、无禁用社交语境、联系邮箱存在、Trust & Safety 文案可见。

修正项：

- `/privacy` 可见文案加入 `敏感信息`。
- `/terms` 可见文案加入 `条款`。
- `/cookies` 可见文案加入 `透明`。

剩余限制：

- 本采样不等于最终奖项级视觉验收。
- Journal 与系统页当前没有视频节点，被记录为 warning 而非 hard failure。
- 最终仍需 `Runway/Pika accepted source exports -> strict media audit -> batch ingest --verify -> final Chrome visual review`。

## v5.105 Final Goal Completion Audit

新增最终完成审计命令：

```bash
npm run qa:goal-audit
```

当前状态下该命令应返回 incomplete，因为 Runway/Pika accepted source exports 仍缺失。需要只生成报告、不让命令以非零退出时使用：

```bash
npm run qa:goal-audit:report
```

本轮新增 build 证据：

```text
output/qa/v5.105-build.log
output/qa/v5.105-build.json
```

`npm run build` 已通过，说明 Next.js 生产构建、TypeScript 和目标路由生成没有当前工程阻塞。最终 goal 仍不能完成，原因不是代码构建，而是最终媒体链路和最终人工视觉验收缺失。

## v5.106 Runway/Pika Chrome Attempt

新增证据：

```text
output/qa/v5.106-runway-pika-chrome-attempt.json
```

本次推进结论：

- `output/runway-downloads/home-v5` 仍没有 8 条人工接受的 Runway/Pika 源视频。
- Chrome 中能观察到 Runway 和 Pika 标签页曾存在，但读取 Runway/Pika 重型生成页面时浏览器控制内核超时重置。
- 重连后轻量 `openTabs` 重试仍返回 Chrome 控制不可用。
- 本地检查显示 Chrome 正在运行、Codex Chrome Extension 已安装启用、native host manifest 正确。

执行规则更新：

- 不能把当前 public fallback 视频当成最终获奖级视频资产。
- 不能在 Chrome 控制通道不可用时宣称完成 Runway/Pika 生成或最终视觉验收。
- 下一步只有两条有效路径：用户允许打开新的 Chrome 窗口并重试控制，或用户手动把接受后的 Runway/Pika 导出放入 `output/runway-downloads/home-v5`。


## v5.107 Resumed Goal Attempt

新增证据：

```text
output/qa/v5.107-chrome-heavy-page-timeout.json
output/qa/v5.107-goal-completion-audit.json
```

本次恢复后确认：

- Chrome 轻量 `openTabs` 已恢复，可观察到 Runway 与 Pika 标签页。
- 对 Runway/Pika 当前重型生成页进行截图检查时，浏览器控制内核再次 60 秒超时并重置。
- `output/runway-downloads/home-v5` 仍没有 accepted MP4/MOV。

执行结论：

- 不能继续自动上传/生成/下载，因为当前 Runway/Pika 页面对浏览器控制不稳定。
- 继续推进需要新 Chrome 窗口/稳定会话，或用户手动导出 8 条 accepted source exports。
- `npm run qa:goal-audit:report` 已升级为 `v5.107` 输出，避免后续只看到旧 `v5.105` 状态。



## v5.109 Cleanup Rule

项目结构以 canonical docs、8 个核心页面、5 个系统页面、`home-v5` 当前媒体资产为准。旧截图、旧 v3/v4 媒体、旧 Runway/Pika 上传包、旧首页历史文档、旧多页面方案和被重定向替代的旧页面实现不再作为执行依据。

后续设计与生成图片/视频时，只参考 `FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md`、`FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`、`DESIGN.md` 和 `FITMEET_INFORMATION_ARCHITECTURE.md`。

## V5.115 Core Page Continuity Pass

Current execution moves beyond homepage-only polish.

Scope:

1. `/product`
2. `/scenes`
3. `/community`

Implementation decisions:

1. Keep existing IA and React structure; do not rebuild the pages from scratch.
2. Add a shared SignalPrism visual shell through page CSS overrides.
3. Keep all media image-based; no video tags, MP4, or WebM.
4. Replace `/scenes` historical navigation targets with canonical product/community/safety/contact routes.
5. Reduce neon/cyan/green dominance on `/scenes`; keep only restrained scene accents.
6. Make the three pages feel like chapters after homepage rather than separate templates.

Acceptance for this pass:

1. Header language and geometry align with homepage.
2. Hero sections use real image or signal-stage proof with sharp cuts.
3. CTA routes point to current canonical pages.
4. No rounded SaaS/pill-heavy drift on desktop.
5. Product, Scenes, and Community each retain their distinct job while sharing the same brand substrate.

## V5.116 Trust / About / Contact Continuity Pass

Scope:

1. `/safety`
2. `/about`
3. `/contact`

Implementation decisions:

1. Keep existing React structure and page IA.
2. Add a shared Social World visual substrate through CSS overrides.
3. Keep all media image-based; no video tag, MP4, or WebM dependency.
4. Make `/safety` express boundary-first product infrastructure.
5. Make `/about` express company thesis and long-term city-life ambition.
6. Make `/contact` express signal intake, waitlist, and enterprise conversion.

Acceptance for this pass:

1. The three pages should not feel visually weaker than homepage/core pages.
2. Headers, CTA geometry, image treatment, red signal layers, and section cadence should align with the homepage system.
3. Contact page must continue to expose `15253005312@163.com` for enterprise cooperation.
4. Trust pages must stay concrete and clear; visual drama cannot obscure safety copy.

## V5.119 Journal and System Trust Continuity Pass

Scope:

1. `/journal` is upgraded as Social World's editorial control room.
2. System trust pages keep the dedicated `SystemTrustPage` pattern but receive stronger protocol-level visual authority.
3. The pass does not introduce video, fake research, fake badges, fake partners, or external dependencies.

Implementation rules:

1. Improve through CSS and existing data first; do not rewrite page logic unless the information architecture changes.
2. Keep Journal interactive channel filtering intact.
3. Keep system-page text readable and legally understandable.
4. Use black/red/warm-white, sharp clipped panels, red signal rails, and dense desktop rhythm.
5. Preserve reduced-motion behavior and avoid new scroll hijacking.

Acceptance:

1. `/journal` must read as a growth and evidence surface for `Social World`, not a normal blog.
2. `/privacy`, `/terms`, `/cookies`, `/not-found`, and `/thank-you` must feel like FitMeet protocol pages, not disconnected templates.
3. The no-video contract remains intact.
4. Desktop Chrome validation should inspect `/journal`, `/privacy`, `/terms`, `/cookies`, `/not-found`, and `/thank-you` after this pass.

## V5.120 Canonical Redirect Hygiene Pass

Scope:

1. Historical routes are preserved only as permanent redirects.
2. Canonical sitemap remains limited to 8 core pages and 5 system pages.
3. Old page concepts such as Agent, World, Stories, Partners, Join, Cities, Press, Investors, and FAQ cannot become independent design surfaces without a new IA decision.

Implementation:

- Use `permanentRedirect()` from `next/navigation` for legacy route compatibility.
- Keep redirected routes out of `siteRoutes`.
- Do not add visuals, metadata, copy, or tracking to legacy redirect pages.

Reason:

The FitMeet website must feel like one enterprise-grade Social World system. Extra historical routes create SEO ambiguity, dilute the product narrative, and invite lower-quality pages back into the experience.

## V5.121 SEO and Share Surface Pass

Scope:

1. `app/layout.tsx` owns global metadata and structured data.
2. `lib/site.ts` owns route metadata helper and canonical sitemap route data.
3. `app/manifest.ts` owns app manifest naming, color, category, and icon behavior.
4. `app/opengraph-image.tsx` owns link-share brand memory.
5. `app/twitter-image.tsx` reuses OpenGraph output and must stay aligned.

Implementation rules:

1. Use `Social World` as the share-card memory point.
2. Use `一句想法，变成一次真实到场。` as the short share promise.
3. Keep sequence language concrete: `想法 -> 公开场景 -> 边界 -> 计划 -> 同频到场`.
4. Keep the top-left `F` as brand lockup only.
5. Keep redirected legacy routes out of canonical sitemap.
6. Do not add videos, external share-image services, or generated bitmap dependencies for this pass.

Acceptance:

1. Global metadata, manifest, OpenGraph alt text, and route metadata helper all speak the same Social World language.
2. Share output does not mention fake traction, generic AI revolution, dating, profile browsing, or unsupported claims.
3. Next step after this pass should be `typecheck + build`, then Chrome desktop page/share inspection when explicitly requested.

## V5.122 Award Preflight Hardening Pass

Scope:

1. Upgrade `scripts/fitmeet-award-preflight.mjs` from the older no-video homepage gate into a current full-site Social World gate.
2. Upgrade `scripts/fitmeet-goal-completion-audit.mjs` so final completion cannot ignore canonical redirects, sitemap clarity, or share surfaces.
3. Keep validation scripts local and dependency-free.

Preflight must check:

1. Core routes, system routes, canonical docs, SignalPrism components, and enterprise images.
2. No `<video>`, MP4, WebM, poster/video contracts, or `CinematicVideoMedia` in current app/components/lib source.
3. Legacy routes use `permanentRedirect()` and stay out of canonical sitemap.
4. `lib/site.ts`, `app/layout.tsx`, `app/manifest.ts`, and `app/opengraph-image.tsx` all preserve the Social World share promise.
5. Banned dating/fake-positioning terms do not re-enter source.
6. `15253005312@163.com` remains present for enterprise cooperation.
7. Production GSAP markers remain off.

Usage:

Run after code or route/metadata changes:

```bash
npm run qa:award-preflight
```

Run before claiming the full goal complete:

```bash
npm run qa:goal-audit:report
```

This pass does not replace Chrome visual QA. It makes Chrome QA meaningful by preventing known IA, SEO, share, and no-video regressions before browser review.

## V5.123 Chrome Full-Site QA Script

New script:

```bash
npm run qa:chrome-fullsite
```

Purpose:

This script uses Playwright when available in the runtime to perform desktop Chrome/Chromium QA against a running FitMeet website.

Default target:

```bash
FITMEET_QA_BASE_URL=http://localhost:3000
```

Expected setup:

1. Run the site locally through `npm run dev` or a production server.
2. Ensure Playwright is available in the project/runtime, or use the Codex Chrome/browser plugin for equivalent manual QA.
3. Run `npm run qa:chrome-fullsite`.

Evidence output:

- `output/qa/v5.123-fullsite-award-qa.json`
- `output/qa/v5.123-fullsite-award-screenshots/*.png`

Checked gates:

1. 8 core routes and 5 system routes load successfully.
2. Desktop viewports: `1366x900`, `1440x1000`, `1920x1080`.
3. Route body text contains required Social World/product/trust snippets.
4. Rendered DOM has zero `<video>` nodes.
5. Network resource log contains no MP4/WebM requests.
6. No route has horizontal overflow.
7. Banned dating/fake-positioning copy does not appear.
8. Legacy routes resolve to canonical redirect targets.

This script does not replace human visual judgment. It creates stable evidence before final Chrome visual signoff.

## V5.124 Full-Site Visual Acceptance Matrix

New document:

`FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md`

Purpose:

Automated checks prove route, source, and browser hygiene. They do not prove award-level taste. The visual acceptance matrix defines the human review layer that must happen before claiming the full goal complete.

Required use:

1. Run engineering and QA gates first.
2. Capture the required desktop screenshots.
3. Review each core page and system page against the matrix.
4. Label each page as `Pass`, `Pass with polish`, `Needs redesign`, or `Blocked`.
5. Do not mark the goal complete until all pages are `Pass` or explicitly accepted as `Pass with polish`.

Failure mode:

If a page passes automation but feels like generic SaaS, abstract tech poster, image gallery, weak legal template, or disconnected subpage, the website is still incomplete.

## V5.125 Final Visual Signoff Report

New document:

`FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`

Purpose:

This report is the final evidence holder for the active goal. It is intentionally a template with `Pending` and `TBD` fields until real evidence exists.

Required use:

1. Run `npm run typecheck`.
2. Run `npm run build`.
3. Run `npm run qa:award-preflight`.
4. Run `npm run qa:chrome-fullsite` or collect equivalent Codex Chrome/browser evidence.
5. Capture required screenshots.
6. Review every page against `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md`.
7. Fill `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`.
8. Run `npm run qa:goal-audit:report`.

Rule:

The report cannot be used as proof of completion while any command evidence, screenshot evidence, page verdict, or global invariant remains `Pending` or `TBD`.

## V5.126 Goal Audit Final Signoff Enforcement

`npm run qa:goal-audit:report` now reads `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`.

The goal audit remains incomplete if any of these are true:

1. The final signoff report is missing.
2. The report still says `Not signed off`.
3. The report contains any `Pending` field.
4. The report contains any `TBD` field.
5. Command evidence is not filled.
6. Screenshot evidence is not filled.
7. Page-by-page verdicts are not filled.
8. Global invariant evidence is not filled.

This prevents an empty signoff template from being mistaken for completion evidence.
## V5.127 Execution Addendum: Hero Ratio + Activity Orbit Finish

当前执行方向仍是：

`页面结构 -> 品牌叙事 -> 关键视觉 -> 无视频静态媒体系统 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

本轮 v5.127 已完成代码侧首屏比例和活动轨道质感精修，并通过：

- `npm run typecheck`
- `npm run build`

### 后续执行顺序

1. 先做桌面 Chrome 视觉验收，不再继续凭代码想象页面是否高级。
2. 首屏截图优先使用 `1440x1000`，辅助检查 `1366x900` 和 `1920x1080`。
3. 验收首屏时只看五件事：`Social World` 是否第一眼成立、F Logo 是否只在左上角作为品牌标志、右侧影像是否像真实城市信号装置、心核是否嵌入系统、CTA 是否抢眼但不压过标题。
4. 验收活动轨道时只看五件事：是否像三层城市信号带、图片是否有真实活动语境、轨道线是否连贯、卡片是否有硬边材质、hover 是否增强质感而不是炫技。
5. 如果 Chrome 截图显示页面仍然空、虚、抽象，下一步不是加更多 section，而是压缩留白、提高真实图片占比、减少装饰网格。
6. 如果 Chrome 截图显示页面太花，下一步不是删主视觉，而是降低小纹理、小线条、小辉光的透明度，让标题和真实活动图片重新成为主角。

### 禁止回退

- 不允许重新引入视频。
- 不允许把活动轨道改回普通卡片墙。
- 不允许把首屏改回左右均分的 SaaS hero。
- 不允许用更多 HUD、小点、小线条掩盖真实活动语境不足。
- 不允许为了移动端牺牲桌面端获奖级首屏，本阶段桌面优先。
## V5.128 Static Media Execution Addendum

执行顺序继续保持：

`页面结构 -> 品牌叙事 -> 关键视觉 -> 无视频静态媒体系统 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

静态媒体执行规则：

1. 先查 `enterpriseAssets.ts`，确认页面图片是否已有明确任务。
2. 再查 `FITMEET_STATIC_MEDIA_GOVERNANCE.md`，确认图片是否符合场景和失败条件。
3. 不直接在组件里硬编码新图片路径。
4. 不因页面缺质感就加视频。
5. 不用 HUD、小点、小字、假数据弥补图片叙事不足。
6. 如果图片不合格，先替换图片或调整分配，不先加动效遮丑。
7. 如果需要新图，使用 `image_gen` 生成静态摄影图，并复制进 workspace 后再接入。

完成标准：

- 每个首屏和核心段落都能回答“这张图片证明了什么真实计划？”
- ActivityOrbit 三条轨道不是图片列表，而是活动计划网络。
- Chrome 截图验收必须同时看资产内容、版式比例和交互状态。

## V5.129 Static Media Preflight Addendum

在进入 Chrome 视觉验收前，必须先让静态媒体预检规则具备拦截能力。

新增自动预检目标：

1. 阻止企业图片路径散落到任意组件。
2. 阻止 ActivityOrbit 少图、漏图或绕过 `enterpriseAssets.ts`。
3. 阻止静态媒体治理文档缺失或没有写清无视频规则。
4. 阻止旧视频链路重新成为官网完成门禁。

执行顺序：

1. `npm run typecheck`
2. `npm run build`
3. `npm run qa:award-preflight`
4. 启动本地站点做 Chrome 三视口视觉验收
5. 填写 `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`

注意：`qa:award-preflight` 只能证明结构和规则存在，不能证明页面已经好看。最终仍以 Chrome 桌面截图和人工视觉签收为准。

## V5.129 Evidence Protocol Addendum

后续所有完成判断必须使用 `FITMEET_EVIDENCE_PROTOCOL.md` 的证据链。

关键规则：

1. 旧 `v5.122` / `v5.123` 证据只代表历史状态。
2. 当前完成证据统一为 `v5.129`。
3. `qa:chrome-fullsite` 的截图目录也必须升级为 `output/qa/v5.129-fullsite-award-screenshots/`。
4. 最终签收报告必须填入当前版本证据路径。
5. 如果自动化 QA 与人工视觉判断冲突，以更严格的一项为准。

## V5.130 Homepage Chrome QA Result

已使用本机 Google Chrome headless DevTools Protocol 生成首页局部截图：

- `output/qa/v5.130-homepage-visual-screenshots/1366x900-hero.png`
- `output/qa/v5.130-homepage-visual-screenshots/1440x1000-hero.png`
- `output/qa/v5.130-homepage-visual-screenshots/1920x1080-hero.png`
- `output/qa/v5.130-homepage-visual-screenshots/1366x900-activity-orbit.png`
- `output/qa/v5.130-homepage-visual-screenshots/1440x1000-activity-orbit.png`
- `output/qa/v5.130-homepage-visual-screenshots/1920x1080-activity-orbit.png`

根据截图已完成一轮 CSS 精修：

1. 隐藏桌面首屏 caption，消除 CTA/证明条干扰。
2. 增强首屏同频心核存在感。
3. 压缩 ActivityOrbit 上方空白。
4. 让活动轨道卡片提前进入三视口截图。
5. 保持无视频、无 MP4/WebM、无 HUD。

下一步不能继续只精修首页。必须进入全站页面视觉验收：`/product`、`/scenes`、`/community`、`/safety`、`/about`、`/journal`、`/contact` 和系统页面。
