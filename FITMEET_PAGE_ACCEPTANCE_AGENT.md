# FitMeet Page Acceptance Agent

## V5.112 Full-Site No-Video Acceptance Override

当前验收标准：核心官网页面全部无视频。

必须检查：

- 核心页面 `<video>` 节点数为 `0`。
- 核心页面不请求 MP4 / WebM。
- 真实静态影像可见。
- 页面不是抽象科技海报，也不是普通 AI SaaS 卡片墙。
- SignalPrism / Canvas / 静态图片 / GSAP 的动效目标必须与视觉区块严格耦合。

旧验收记录中关于 Runway/Pika、本地 fallback WebM、视频 poster 和严格媒体审计的内容只作历史证据，不再作为当前官网完成门禁。

## Canonical Docs

本文档定义页面验收标准。验收必须以当前文档体系为准。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Acceptance Scope

验收目标：

确认 FitMeet 是否达到 2026 年潮流获奖级企业官网方向。

核心判断：

1. 是否是年轻人城市生活平台，而不是普通 AI 社交官网。
2. 是否清楚表达 `Social World：一句想法，变成一次真实到场。`
3. 是否有真实摄影级静态影像和代码原生交互，而不是依赖视频。
4. 是否有产品机制、Trust、安全边界和企业合作价值。
5. 是否保留中文主文案。
6. 是否通过桌面 Chrome 视觉验收。

## Desktop Viewports

硬验收视口：

- `1366x900`
- `1440x1000`
- `1920x1080`

移动端不是当前获奖级主目标，但不能明显崩坏。

## Page Gates

### Home

必须通过：

1. 首屏 3 秒内记住 `Social World`。
2. 首屏不堆长文案。
3. Hero 使用真实高清图片、SignalPrism、Canvas 和 CSS 3D，不使用视频。
4. 不出现头像墙。
5. 不出现普通 SaaS 三卡片。
6. 滚动叙事能表达想法、计划、场景、边界、真人、Social World。

### Product

必须通过：

1. 解释需求如何变计划。
2. Agent 是计划生成器，不是聊天机器人。
3. 包含需求理解、上下文判断、计划生成、边界协议、同频匹配。
4. 有计划收据或等价 proof。

### Scenes

必须通过：

1. 至少覆盖夜跑、球馆、桌游、城市漫游。
2. 每个场景有真实地点、真实动作、边界。
3. 不使用抽象插画当主要证明。

### Community

必须通过：

1. 展示城市生活网络。
2. 不做数据大屏。
3. Social World 是真实计划网络，不是抽象地图。

### Safety

必须通过：

1. 公开地点优先。
2. 退出机制明确。
3. 举报和屏蔽明确。
4. 隐私保护明确。
5. 未成年人边界明确。
6. 确认后邀请。

### About

必须通过：

1. 讲清行业痛点。
2. 讲清当前产品/技术计划。
3. 讲清 3-5 年展望。
4. 讲清最终愿景。
5. 未来目标不得伪装为已完成数据。

### Journal

必须通过：

1. 有产品进展、城市观察、技术实验、合作动态方向。
2. 内容服务 SEO。
3. 不写空泛公关稿。

### Contact

必须通过：

1. 个人体验入口清楚。
2. 企业合作入口清楚。
3. 邮箱 `15253005312@163.com` 可见。
4. 说明更精准用户、更省时、更高效、未来效益。

## Visual Gates

Fail 条件：

1. 紫蓝 AI SaaS 风。
2. 头像墙。
3. 卡片墙。
4. 视频黑场。
5. 大面积模糊。
6. 抽象海报过多。
7. 小 HUD、小字、小点、小几何遮挡文案。
8. 两个 section 大标题重叠。
9. CTA 被动效遮挡。
10. 横向溢出。

Pass 条件：

1. 真实影像具体可辨。
2. 文案短、中文、可读。
3. 每页目标明确。
4. 动效服务叙事。
5. 企业可信度成立。

## Media Gates

当前官网 No-Video 门禁：

- 核心页面 `<video>` 节点数必须为 `0`。
- 核心页面不得请求 MP4 或 WebM。
- 首屏真实图片必须可见。
- SignalPrism、城市信号 Canvas、活动轨道和 SafetyShell 必须可见或可滚动到达。
- reduced-motion 下鼠标/滚动增强停止，但信息完整。

历史视频门禁仅适用于旧页面或未来宣传片，不作为当前首页完成条件。

视频必须：

- 有 WebM 或 MP4。
- 有 poster。
- 不请求不存在路径。
- 不内嵌文字。
- 不内嵌 Logo。
- 不内嵌 HUD。
- reduced-motion 下信息完整。

Hero 视频必须：

- 真实人物。
- 真实地点。
- 真实动作。
- 电影感。
- 不抢掉 `Social World` 可读性。

## Copy Gates

必须使用：

- `Social World`
- `一句想法，变成一次真实到场。`
- `先有计划，再出现合适的人。`
- `先确认边界，再靠近彼此。`
- `真实需求，比曝光更接近成交。`

禁止：

- `AI 革命`
- `重新定义社交`
- `陌生人速配`
- `附近异性`
- `灵魂伴侣`
- 假用户数
- 假合作品牌
- 假增长率
- 未证实商业成果

## SEO Gates

核心页面必须有：

1. 独立 title。
2. 独立 description。
3. 中文关键词。
4. 合理 canonical。
5. OpenGraph 继承或专属设置。

Journal 必须能承载长期内容增长，不只是视觉页面。

## Trust Gates

必须确认：

1. 真人出现前先出现边界。
2. 企业合作不绕过用户价值。
3. 隐私和位置边界明确。
4. 未成年人边界明确。
5. 安全不只是 footer 或法律页。

## Command Gates

代码改动后必须运行：

```bash
npm run typecheck
npm run build
```

文档-only 改动不强制构建，但应检查 Markdown 文件存在且命名正确。

## Report Format

验收报告必须包含：

1. Verdict：Pass / Fail。
2. Scope：验收页面和视口。
3. Blocking findings。
4. Non-blocking findings。
5. Media status。
6. SEO status。
7. Trust status。
8. Command evidence。
9. Screenshot evidence。

任何 fail 都必须给出文件、页面、视口和修复建议。

## V5.010 Acceptance Result - Canonical Shell QA

当前验收对象：`V5 Canonical Route Shell`。

已完成工程验收：

- `npm run typecheck` 通过。
- `npm run build` 通过。
- `next build` 仅保留 OpenGraph `z-index is currently not supported` 样式警告，不阻塞页面构建。

已完成浏览器验收：

- 内置浏览器桌面视口检查：`1366x900`、`1440x1000`、`1920x1080` 首页通过。
- Chrome 扩展真实会话首页检查通过，实际视口约 `1512x808`。
- 首页 `Social World` 可见、可读，3 秒品牌记忆点成立。
- 8 个核心页面 + 5 个系统页面在 `1440x1000` 下无横向溢出。
- 禁用 dating 语境词检查通过：无 `附近异性`、`陌生人速配`、`灵魂伴侣`、`速配`、`刷人`。
- 企业合作锚点 `/contact#enterprise` 可定位，邮箱 `15253005312@163.com` 可见。
- 企业合作媒体从偏暗视频降级为 poster fallback，避免黑块。
- 历史入口已重定向到 canonical routes，不再展示旧视觉系统。

仍未完成：

- Runway/Pika 正式视频资产未生成。
- 尚未进行全站逐屏人工 Awwwards 级审美评审。
- 尚未进行 reduced-motion 浏览器模拟截图。

## V5.111 Chrome Evidence: SignalPrism No-Video Homepage

当前验收对象：

`SignalPrismHomepage / Interactive Social Signal System`

工程验收：

- `npm run typecheck` passed.
- `npm run qa:award-preflight` passed.
- `npm run build` passed.
- OpenGraph `z-index is currently not supported` warning 已消失。

Chrome 桌面验收：

- Evidence: `output/qa/v5.111-signalprism-homepage-qa.json`
- Viewports: `1366x900`, `1440x1000`, `1920x1080`
- Reduced-motion: `1440x1000`
- Screenshots:
  - `output/qa/v5.111-signalprism-homepage-1366x900.png`
  - `output/qa/v5.111-signalprism-homepage-1440x1000.png`
  - `output/qa/v5.111-signalprism-homepage-1920x1080.png`
  - `output/qa/v5.111-signalprism-homepage-reduced-1440x1000.png`

Passed facts:

- `videoCount = 0`
- MP4/WebM resource requests: `[]`
- `Social World` visible and not clipped in all checked desktop viewports.
- Hero real-scene panel visible in all checked desktop viewports.
- Concrete demand copy `想跑，但不想一个人。` visible.
- `SignalLineCanvas` present.
- `ActivityOrbit` renders 15 activity cards.
- `SafetyShell` renders 6 safety rules.
- Final prism contains `F` only in the final convergence.
- No console errors captured.

Verdict:

Pass for current homepage no-video direction. This does not complete the full website goal because final full-site visual signoff remains pending.

## V5.030 Video Asset Acceptance

每条 Runway/Pika 视频接入前必须单独验收：

1. `FITMEET_VIDEO_ASSET_MANIFEST.json` 中存在对应 slug。
2. `public/videos/home-v5/<slug>.webm` 存在。
3. `public/images/home-v5/<slug>-poster.jpg` 存在。
4. 视频首帧不是黑场。
5. 视频中无文字、Logo、HUD、UI 面板、小字、小点、小几何。
6. 视频中无 dating 语境。
7. 视频人物和空间保持真实，不出现明显变形。
8. 视频在页面截图中不压住标题、正文、按钮和 CTA。
9. reduced-motion 下 poster 可独立表达同一场景。

如果任一项失败，`pageData.ts` 继续使用 keyframe，不接入该视频。

## V5.040 Acceptance Note

新增检查结果：

- `scene-weekend-trip-keyframe.png` 已作为 `/scenes` weekend 段的 V5 fallback。
- 页面不再依赖旧 `home-v3/scene-weekend-cinemagraph.webm` 作为周末短途视觉。
- Runway 自动化读取连续超时，当前不得判定视频生产完成。

验收结论：

- 当前媒体状态是 `keyframe-live-video-pending`，不是最终视频完成态。
- 获奖级目标仍需要 Runway/Pika 产出至少 Hero 正式视频，并通过本文件的 `Video Asset Acceptance` 后再接入。

## V5.050 Acceptance Note

新增检查结果：

- `streetPlaza` 已从旧 V4 poster 切换为 `scene-public-plan-plaza-keyframe.png`。
- `partnerArrival` 已从旧 V4 poster 切换为 `partner-arrival-value-keyframe.png`。
- 页面关键叙事媒体现在统一进入 `public/images/home-v5/`。

仍未完成：

- `scene-public-plan-plaza` 和 `partner-arrival-value` 尚未生成 WebM。
- 这两个视频必须先通过无文字、无 Logo、无 HUD、无假指标、无 dating 语境检查，才允许接入 `pageData.ts` 的 `video` 字段。

## V5.060 Acceptance Note

新增验收重点：

1. 页面滚动应更像一个连续 Social World 走廊，不应像独立 section PPT。
2. `chain` 应被感知为操作轨道，不是卡片墙。
3. 大型斜切背景和 seam 不得遮挡标题、正文、按钮和 proof。
4. 根层 `--sw-flow` / `--sw-heat` 只能作为背景运动，不得控制内容可见性。
5. reduced-motion 下这些背景运动必须停止，信息仍完整。

当前状态：

- 工程已具备 V5.060 连续走廊 CSS 与 ScrollTrigger 变量。
- 仍需 Chrome 三视口视觉截图确认是否有文案重叠或横向溢出。

## V5.061 Acceptance Note

当前验收对象：`V5.060 Continuous Corridor + Reduced Motion`。

已完成 Chrome 桌面验收：

- 首页三视口已保存截图与 JSON：`output/chrome-v5060/home-triview-qa.json`。
- 全路由 `1440x1000` 已保存截图与 JSON：`output/chrome-v5060/routes-1440-qa.json`。
- reduced-motion 全路由 `1440x1000` 已保存 JSON：`output/chrome-v5061/routes-reduced-motion-1440-qa.json`。
- reduced-motion 首页截图已保存：`output/chrome-v5061/home-reduced-motion-1440x1000.png`。

验收结论：

- 首页 `1366x900`、`1440x1000`、`1920x1080` 均无横向溢出。
- 首页 `Social World` H1 可见，CTA 可见，3 秒品牌记忆点成立。
- 8 个核心页面 + 5 个系统页面在 `1440x1000` 下 H1 可见、metadata 存在、近视口图片无破损。
- `/contact` 包含企业合作邮箱 `15253005312@163.com`。
- reduced-motion 模拟已生效，13 个页面均返回 `reducedMotion: true`。
- reduced-motion 下核心文案、H1、CTA、metadata 和近视口媒体仍完整。
- 当前页面没有请求尚未生成的 `/videos/home-v5/*.webm`，避免黑场和伪完成。

非阻塞发现：

- 首页存在一个远离首屏的 lazy image 在初始三视口采集中显示 `complete: false`，但它不在近视口范围内；全路由近视口破损图检查为 0。
- 目前仍是 keyframe-live-video-pending 状态，不是最终 Runway/Pika 视频完成态。

下一步验收重点：

1. Runway/Pika 生成 `hero-night-run-social-world` 后，必须按 V5.030 视频验收标准重新检查首帧、poster、黑场、文字、Logo、HUD、人物变形和文案遮挡。
2. 接入任何 WebM 后必须重新运行 `npm run typecheck`、`npm run build` 与 Chrome 三视口截图。
3. 不得因为 reduced-motion 已通过就降低视频资产门槛；视频质量必须高于当前 keyframe 才允许替换。

## V5.062 External Video Tool Acceptance Note

当前验收对象：`Runway/Pika Hero Video Production Readiness`。

已确认：

- `hero-night-run-social-world` 的 keyframe、manifest、ingest slug 均已准备好。
- Chrome 中存在 Runway 与 Pika 标签页。
- Runway 页面在自动化读取阶段超时，无法证明其已稳定进入 image-to-video 上传界面。
- 本轮未上传 keyframe，未生成 MP4，未运行 ffmpeg，未接入 WebM。

验收结论：

- Verdict：Fail to proceed, non-code blocker。
- Blocking finding：外部 Runway/Pika 页面控制状态不稳定，不能安全上传项目关键帧或消耗生成额度。
- Media status：`keyframe-live-video-pending`。
- Code status：未修改页面代码，不需要运行 `npm run typecheck` / `npm run build`。

继续验收条件：

1. Runway/Pika 页面必须在 Chrome 中稳定显示 image-to-video 上传入口。
2. 上传前必须使用 `public/images/home-v5/hero-night-run-social-world-keyframe.png`。
3. 下载后必须先通过 `npm run media:ingest -- hero-night-run-social-world <input-mp4>`。
4. 生成的 WebM 必须通过 V5.030 `Video Asset Acceptance`。
5. 通过后才允许改 `components/social-world-page/pageData.ts`。

## V5.063 Local Hero Fallback Acceptance Note

当前验收对象：`Local Cinematic Hero Fallback`。

已生成：

- `output/video-candidates/hero-night-run-social-world-local-push.mp4`
- `public/videos/home-v5/hero-night-run-social-world.mp4`
- `public/videos/home-v5/hero-night-run-social-world.webm`
- `public/images/home-v5/hero-night-run-social-world-poster.jpg`

媒体检查：

- WebM：`vp9`，`1920x1080`，`24fps`，`5.000000s`，约 `375KB`。
- MP4：`h264`，`1920x1080`，`24fps`，`5.000000s`，约 `1.1MB`。
- Poster 目视检查通过：真实夜跑、黑红城市、无文字、无 Logo、无 HUD、无黑场。

验收结论：

- Verdict：Conditional Pass as temporary fallback。
- Media status：`local-cinematic-fallback-live-runway-pending`。
- 该视频允许作为首页 Hero 临时动态 fallback。
- 该视频不得被描述为 Runway/Pika 正式生成结果。

后续必须执行：

1. `npm run typecheck`
2. `npm run build`
3. Chrome 首页 `1366x900`、`1440x1000`、`1920x1080`
4. reduced-motion 首页检查

## V5.064 Local Hero Fallback Final QA

当前验收对象：`Local Hero WebM + Reduced-Motion Media Contract`。

工程验收：

- `npm run typecheck` 通过。
- `npm run build` 通过。
- build 仅保留既有 OpenGraph `z-index is currently not supported` 警告。
- `FITMEET_VIDEO_ASSET_MANIFEST.json` JSON parse 通过。

Chrome 验收：

- 首页三视口视频检查通过：`1366x900`、`1440x1000`、`1920x1080`。
- Hero WebM 被请求：`/videos/home-v5/hero-night-run-social-world.webm`。
- Hero WebM 状态：`readyState=4`，`duration=5`，`videoWidth=1920`，`videoHeight=1080`。
- 首页 H1：`Social World` 可见。
- 首页 CTA 可见。
- 三视口无横向溢出。

Reduced-motion 修复：

- 发现问题：reduced-motion 下 Hero WebM 仍然自动播放。
- 已修复：`CinematicVideoMedia` 在 reduced-motion 下直接渲染 poster `<img>`，不渲染 `<video>`。
- 复测结果：普通模式 `videoCount=1`；reduced-motion 模式 `videoCount=0`。
- reduced-motion poster：`/images/home-v5/hero-night-run-social-world-poster.jpg`，`naturalWidth=1920`。

证据文件：

- `output/chrome-v5063/home-hero-video-qa.json`
- `output/chrome-v5063/home-hero-video-reduced-fix-qa.json`
- `output/chrome-v5063/home-hero-video-normal-after-reduced-fix-1440x1000.png`
- `output/chrome-v5063/home-hero-video-reduced-after-fix-1440x1000.png`

验收结论：

- Verdict：Pass as local cinematic fallback。
- Media status：`local-cinematic-fallback-live-runway-pending`。
- Final Runway/Pika Hero 仍未完成，不能标记为最终视频目标完成。

## V5.065 Acceptance Addendum: Agent Plan Video

本文档优先级继续低于 canonical docs。本次验收新增 Agent Plan 区块专项检查。

### Desktop checks

- Navigate to the homepage Agent Plan section.
- Confirm the heading and media describe the same context: public plan confirmation, not generic social decoration.
- Confirm `/videos/home-v5/scene-public-plan-plaza.webm` loads in normal motion mode.
- Confirm reduced-motion mode removes video playback and uses `/images/home-v5/scene-public-plan-plaza-poster.jpg`.
- Confirm no black frame, no text inside video, no logo, no HUD, no horizontal overflow, and no copy overlap at 1440x1000.

### Pass definition

This asset can pass V5.065 only as a local fallback. It cannot be called final award-level media until Runway/Pika image-to-video output replaces the locally animated keyframe.

## V5.066 Chrome Evidence: Agent Plan Fallback

Agent Plan fallback has been checked in Chrome desktop after V5.065 connection.

### Evidence files

- Normal screenshot: `output/chrome-v5065/home-agent-plan-video-normal-1440x1000.png`
- Reduced-motion screenshot: `output/chrome-v5065/home-agent-plan-video-reduced-1440x1000.png`
- Normal QA JSON: `output/chrome-v5065/home-agent-plan-video-normal-qa.json`
- Reduced-motion QA JSON: `output/chrome-v5065/home-agent-plan-video-reduced-qa.json`
- Viewport matrix: `output/chrome-v5065/home-agent-plan-video-viewport-matrix.json`

### Result

- 1366x900, 1440x1000, and 1920x1080 normal mode load `/videos/home-v5/scene-public-plan-plaza.webm` with `readyState=4` and 1920x1080 intrinsic video.
- 1366x900, 1440x1000, and 1920x1080 reduced-motion mode render `/images/home-v5/scene-public-plan-plaza-poster.jpg` and do not render a video element.
- All checked desktop cases have `horizontalOverflow=false`.
- The result remains a local fallback, not final Runway/Pika production media.

## V5.067 Acceptance Addendum: Real People Citywalk Video

### Desktop checks

- Navigate to the homepage Real People section.
- Confirm the heading and media describe the same context: people appear after a concrete plan, not before it.
- Confirm `/videos/home-v5/scene-citywalk-case.webm` loads in normal motion mode.
- Confirm reduced-motion mode removes video playback and uses `/images/home-v5/scene-citywalk-case-poster.jpg`.
- Confirm no text inside video, no logo, no HUD, no dating cues, no horizontal overflow, and no copy overlap at 1366x900, 1440x1000, and 1920x1080.

### Pass definition

This asset can pass only as local fallback. Final award-level status requires Pika/Runway motion with real walking micro-movement and the same public-space boundary.

## V5.068 Chrome Evidence: Real People Citywalk Fallback

Real People / Citywalk fallback has been checked in Chrome desktop after V5.067 connection.

### Evidence files

- Normal screenshot: `output/chrome-v5067/home-real-people-citywalk-normal-1440x1000.png`
- Reduced-motion screenshot: `output/chrome-v5067/home-real-people-citywalk-reduced-1440x1000.png`
- Normal QA JSON: `output/chrome-v5067/home-real-people-citywalk-normal-qa.json`
- Reduced-motion QA JSON: `output/chrome-v5067/home-real-people-citywalk-reduced-qa.json`
- Viewport matrix: `output/chrome-v5067/home-real-people-citywalk-viewport-matrix.json`

### Result

- 1366x900, 1440x1000, and 1920x1080 normal mode load `/videos/home-v5/scene-citywalk-case.webm` with `readyState=4`, 5 second duration, and 1920x1080 intrinsic video.
- 1366x900, 1440x1000, and 1920x1080 reduced-motion mode render `/images/home-v5/scene-citywalk-case-poster.jpg` and do not render a video element.
- All checked desktop cases have `horizontalOverflow=false`.
- The section id is `real-people`; the checked heading is `真人最后出现。`, so the media and copy are scoped to the correct visual block.
- The result remains a local fallback, not final Pika/Runway production media.

## V5.069 Acceptance Addendum: Social World Vision Video

### Desktop checks

- Navigate to the homepage Social World section.
- Confirm the heading and media describe the same context: city plans connected into a real Social World.
- Confirm `/videos/home-v5/vision-arrival-network.webm` loads in normal motion mode.
- Confirm reduced-motion mode removes video playback and uses `/images/home-v5/vision-arrival-network-poster.jpg`.
- Confirm no text inside video, no logo, no HUD, no fake data dashboard, no horizontal overflow, and no copy overlap at 1366x900, 1440x1000, and 1920x1080.

### Pass definition

This asset can pass only as local fallback. Final award-level status requires Runway motion with real city micro-movement and the same no-HUD enterprise vision language.

## V5.070 Chrome Evidence: Social World Vision Fallback

Social World / Vision fallback has been checked in Chrome desktop after V5.069 connection.

### Evidence files

- Normal screenshot: `output/chrome-v5069/home-social-world-vision-normal-1440x1000.png`
- Reduced-motion screenshot: `output/chrome-v5069/home-social-world-vision-reduced-1440x1000.png`
- Normal QA JSON: `output/chrome-v5069/home-social-world-vision-normal-qa.json`
- Reduced-motion QA JSON: `output/chrome-v5069/home-social-world-vision-reduced-qa.json`
- Viewport matrix: `output/chrome-v5069/home-social-world-vision-viewport-matrix.json`

### Result

- 1366x900, 1440x1000, and 1920x1080 normal mode load `/videos/home-v5/vision-arrival-network.webm` with `readyState=4`, 5 second duration, and 1920x1080 intrinsic video.
- 1366x900, 1440x1000, and 1920x1080 reduced-motion mode render `/images/home-v5/vision-arrival-network-poster.jpg` and do not render a video element.
- All checked desktop cases have `horizontalOverflow=false`.
- The section id is `social-world`; the checked heading is `城市里的计划连成世界。`, so the media and copy are scoped to the correct visual block.
- The result remains a local fallback, not final Runway production media.

## V5.071 Acceptance Addendum: Scenes Court and Weekend Videos

### Desktop checks

- Navigate to `/scenes#court` and `/scenes#weekend`.
- Confirm `/videos/home-v5/scene-court-dispatch.webm` loads in normal motion mode for Court.
- Confirm `/videos/home-v5/scene-weekend-trip.webm` loads in normal motion mode for Weekend.
- Confirm reduced-motion mode removes video playback and uses the matching posters.
- Confirm no text inside video, no logo, no HUD, no fake score/data, no dating cues, no horizontal overflow, and no copy overlap at 1366x900, 1440x1000, and 1920x1080.

### Pass definition

These assets can pass only as local fallbacks. Final award-level status requires Pika/Runway video with real sports and departure micro-motion.

---

## V5.072 Scenes Chrome Acceptance Evidence

Priority: this addendum is canonical for `/scenes` court and weekend media acceptance until Runway/Pika final footage replaces the local cinematic fallback.

Date: 2026-07-07.

Scope:
- Page: `/scenes`.
- Sections: `#court`, `#weekend`.
- Viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Motion modes: normal and `prefers-reduced-motion: reduce`.

Evidence files:
- `output/chrome-v5071/scenes-court-weekend-viewport-matrix.json`
- `output/chrome-v5071/scenes-court-normal-1440x1000-qa.json`
- `output/chrome-v5071/scenes-court-reduced-1440x1000-qa.json`
- `output/chrome-v5071/scenes-weekend-normal-1440x1000-qa.json`
- `output/chrome-v5071/scenes-weekend-reduced-1440x1000-qa.json`
- `output/chrome-v5071/scenes-court-normal-1440x1000.png`
- `output/chrome-v5071/scenes-court-reduced-1440x1000.png`
- `output/chrome-v5071/scenes-weekend-normal-1440x1000.png`
- `output/chrome-v5071/scenes-weekend-reduced-1440x1000.png`

Result:
- Chrome matrix: `12/12` passed.
- Court normal mode uses `/videos/home-v5/scene-court-dispatch.webm` with poster `/images/home-v5/scene-court-dispatch-poster.jpg`.
- Court reduced-motion mode removes the video element and uses `/images/home-v5/scene-court-dispatch-poster.jpg`.
- Weekend normal mode uses `/videos/home-v5/scene-weekend-trip.webm` with poster `/images/home-v5/scene-weekend-trip-poster.jpg`.
- Weekend reduced-motion mode removes the video element and uses `/images/home-v5/scene-weekend-trip-poster.jpg`.
- Both videos report `1920x1080`, `duration: 5`, `readyState: 4`, `loop: true`, `muted: true` in normal mode.
- No horizontal overflow was detected in the tested desktop viewports.
- No dating-language terms were detected in page body text.
- Manual screenshot review confirmed that the visible media is real-scene cinematic imagery, not abstract SVG illustration, and that headings remain readable.

Remaining gap:
- `/scenes` Night Run still needs its own motion asset; do not treat the whole scenes page as final-awards-ready until Night Run is upgraded from static keyframe to video/poster pair.
- Current Court and Weekend videos are local cinematic fallbacks. Replace them with Pika/Runway final outputs before final brand launch.

---

## V5.073 Pending Acceptance: Scenes Night Run Fallback

Acceptance scope:
- Page: `/scenes`.
- Section: `#night-run` or the section containing title `今晚想跑步，但不想一个人。`.
- Viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Motion modes: normal and `prefers-reduced-motion: reduce`.

Expected normal-motion media:
- Video: `/videos/home-v5/scene-night-run.webm`.
- Poster: `/images/home-v5/scene-night-run-poster.jpg`.
- Video must report at least `1280x720`; target is `1920x1080`.
- Video duration should be approximately five seconds.

Expected reduced-motion media:
- No video playback in the Night Run section.
- Poster image: `/images/home-v5/scene-night-run-poster.jpg`.
- Poster natural dimensions should be `1920x1080`.

Design checks:
- Heading and media must describe the same context: public night running, not generic city decoration.
- No text, logo, HUD, fake stats, route labels, or dating UI inside the video.
- No horizontal overflow.
- No title/media overlap at the tested desktop viewports.

Status:
- Pending Chrome evidence until the V5.073 QA matrix is saved.

---

## V5.074 Chrome Evidence: Scenes Night Run Fallback

Priority: this addendum is canonical for `/scenes` Night Run acceptance until Runway/Pika final footage replaces the local cinematic fallback.

Date: 2026-07-07.

Scope:
- Page: `/scenes`.
- Section: `#night-run` or the section containing title `今晚想跑步，但不想一个人。`.
- Viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Motion modes: normal and `prefers-reduced-motion: reduce`.

Evidence files:
- `output/chrome-v5073/scenes-night-run-viewport-matrix.json`
- `output/chrome-v5073/scenes-night-run-normal-1440x1000-qa.json`
- `output/chrome-v5073/scenes-night-run-reduced-1440x1000-qa.json`
- `output/chrome-v5073/scenes-night-run-normal-1440x1000.png`
- `output/chrome-v5073/scenes-night-run-reduced-1440x1000.png`

Result:
- Chrome matrix: `6/6` passed.
- Normal mode uses `/videos/home-v5/scene-night-run.webm` with poster `/images/home-v5/scene-night-run-poster.jpg`.
- Reduced-motion mode removes the video element and uses `/images/home-v5/scene-night-run-poster.jpg`.
- Normal-mode video reports `1920x1080`, `duration: 5`, `readyState: 4`, `loop: true`, `muted: true`.
- Reduced-motion poster reports `1920x1080` natural dimensions.
- No horizontal overflow was detected in the tested desktop viewports.
- No dating-language terms were detected in page body text.
- Manual screenshot review confirmed that the visible media is real night-running city imagery, not abstract SVG illustration, and that the heading remains readable.

Remaining gap:
- This asset is a local cinematic fallback, not Runway/Pika final motion. Replace it with true image-to-video human micro-motion before final brand launch.

---

## V5.075 Chrome Evidence: Scenes Continuous Corridor

Priority: this addendum is canonical for `/scenes` layout continuity acceptance after the corridor compression update.

Scope:
- Page: `/scenes`.
- Viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Motion modes: normal and `prefers-reduced-motion: reduce`.
- Focus: full-page continuity, not a single media asset.

Evidence files:
- `output/chrome-v5075/scenes-current-flow-metrics.json`
- `output/chrome-v5075/scenes-corridor-viewport-matrix.json`
- `output/chrome-v5075/scenes-corridor-hero-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-chain-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-night-run-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-court-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-citywalk-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-weekend-1440x1000.png`
- `output/chrome-v5075/scenes-corridor-weekend-reduced-1440x1000.png`

Result:
- Chrome matrix: `6/6` passed.
- No horizontal overflow in tested desktop viewports.
- No dating-language terms detected.
- All four scenario sections retain correct media owners.
- Normal mode renders four scenario videos.
- Reduced-motion mode renders four scenario poster images.
- At `1440x1000`, total page height reduced from about `6000px` to about `5089px`.
- At `1440x1000`, story section overlap increased to about `-160px`, making the page read more like a continuous route.

Manual screenshot review:
- The page no longer reads as four equally separated posters.
- The process chain, redline background, media edges, and section overlap create stronger continuity.
- Core section headings remain readable.
- No black media frames were observed.

Known tradeoff:
- The design is intentionally more aggressive. Some previous/next-section content may be visible at viewport edges. This is acceptable for the desktop-first corridor direction as long as the active section remains readable and media ownership remains correct.

## V5.071 Chrome Evidence: Product Mechanism Page

Checked page:

- `/product`

Acceptance result:

- Product page is no longer a generic SocialWorldPage instance.
- H1 establishes a product promise: `一句想法，变成一张可执行的计划。`
- Required product mechanism terms are present: `需求理解`、`上下文判断`、`计划生成`、`边界协议`、`同频匹配`、`计划收据`。
- Primary CTA exists: `/contact#waitlist`.
- Safety CTA exists: `/safety`.
- No horizontal overflow at `1366x900`, `1440x1000`, or `1920x1080`.
- No dating language detected.
- No banned commercial proof detected: no fake users, fake partners, fake growth numbers, or fake logos.
- Product videos load as real 1920x1080 media in normal mode.
- Reduced-motion mode replaces product videos with poster images and preserves page information.
- Chinese display headings were visually adjusted after first capture because uncontrolled wrapping made the page feel less enterprise-grade.

Evidence paths:

- `output/chrome-product-v5073/product-qa-results.json`
- `output/chrome-product-v5073/product-hero-1440x1000.png`
- `output/chrome-product-v5073/product-pipeline-1440x1000.png`
- `output/chrome-product-v5073/product-receipt-1440x1000.png`
- `output/chrome-product-v5073/product-reduced-1440x1000.png`

Acceptance note:

`/product` now passes the current product-mechanism acceptance gate. It should not be reverted to a card-wall, chat window, profile browsing page, or AI SaaS dashboard. Future work should improve media originality and GSAP continuity, not replace the mechanism narrative.

## V5.072 Chrome Evidence: Community Social World Page

Checked page:

- `/community`

Acceptance result:

- Community page is no longer a generic SocialWorldPage instance.
- H1 establishes the community promise: `城市里的计划，正在连成 Social World。`
- Required community concepts are present: `Social World`、`城市生活网络`、`城市节点`、`社区`、`复访`、`公开场景`、`个人位置不被公开`。
- Primary CTA exists: `/contact#waitlist`.
- Enterprise/city-node CTA exists: `/contact#enterprise`.
- No horizontal overflow at `1366x900`, `1440x1000`, or `1920x1080`.
- No dating language detected.
- No fake metrics, fake logos, fake partners, or fake growth claims detected.
- Four community videos load in normal mode with 1920x1080 intrinsic size.
- Reduced-motion mode replaces videos with poster images and preserves page information.
- Visual QA removed blur-based reveals because they made the page feel virtual and weakened text clarity.
- Scene video cards remain visible by default so real-place evidence is not hidden during scroll.

Evidence paths:

- `output/chrome-community-v5077/community-qa-results.json`
- `output/chrome-community-v5077/community-hero-1440x1000.png`
- `output/chrome-community-v5077/community-loop-1440x1000.png`
- `output/chrome-community-v5077/community-network-1440x1000.png`
- `output/chrome-community-v5077/community-scenes-1440x1000.png`
- `output/chrome-community-v5077/community-reduced-1440x1000.png`

Acceptance note:

`/community` now passes the current city-network acceptance gate. It should not be reverted to an abstract map, fake analytics network, profile wall, or generic community card grid. Future work should improve media originality and page-to-page continuity, not weaken the public-scene and privacy boundary.

## V5.080 Chrome Evidence: Trust & Safety Page

Checked page:

- `/safety`

Acceptance result:

- Safety page is no longer a generic SocialWorldPage instance.
- H1 establishes the trust promise: `先确认边界，再靠近彼此。`
- Required safety terms are present: `公开地点`、`退出机制`、`举报`、`屏蔽`、`隐私保护`、`未成年人边界`、`确认后邀请`、`安全收据`。
- Primary CTA exists: `/contact#waitlist`.
- Privacy CTA exists: `/privacy`.
- No horizontal overflow at `1366x900` or `1920x1080` in final Chrome QA.
- No dating language detected.
- No fake metrics, fake logos, fake partner proof, or fake growth claims detected.
- Safety videos load as real 1920x1080 media in normal mode.
- Reduced-motion mode removes video elements and renders poster imagery while preserving the Trust page information.
- GSAP production markers are not present.

Evidence paths:

- `output/chrome-safety-v5080/safety-qa-results.json`
- `output/chrome-safety-v5080/safety-hero-1440x1000.png`
- `output/chrome-safety-v5080/safety-protocol-1440x1000.png`
- `output/chrome-safety-v5080/safety-receipt-1440x1000.png`
- `output/chrome-safety-v5080/safety-reduced-1440x1000.png`

Acceptance note:

`/safety` now passes the current Trust & Safety acceptance gate. It should not be reverted to a legal-text-only page, generic security card grid, abstract dashboard, or dating-app safety disclaimer. Future work should improve custom cinematic media and cross-page continuity without weakening the public-place, boundary, exit, privacy, minors, and receipt sequence.

## V5.081 Chrome Evidence: About Company Narrative Page

Checked page:

- `/about`

Acceptance result:

- About page is no longer a generic SocialWorldPage instance.
- H1 establishes the company thesis: `我们不从关系开始。我们从真实生活开始。`
- Required About concepts are present: `真实生活`、`社交 Agent`、`行业的问题`、`不是缺少人`、`现实计划`、`3-5 年`、`城市基础设施`、`改变人和城市`、`Social World`、`真实到场`。
- Primary Hero CTA exists: `/product`.
- Safety CTA exists: `/safety`.
- Final CTA exists: `/contact#waitlist`.
- No horizontal overflow at `1366x900` or `1920x1080` in final Chrome QA.
- No banned social/dating terms detected.
- No fake metrics, fake logos, fake partner proof, fake user-count terms, or fake growth terms detected.
- About videos load as real 1920x1080 media in normal mode.
- Reduced-motion mode removes video elements and renders poster imagery while preserving the About information.
- GSAP production markers are not present.
- Visual screenshot review confirmed the page is black/red, sharp, enterprise-paced, and no longer a green rounded SaaS company page.

Evidence paths:

- `output/chrome-about-v5082/about-qa-results.json`
- `output/chrome-about-v5082/about-hero-1440x1000.png`
- `output/chrome-about-v5082/about-pain-1440x1000.png`
- `output/chrome-about-v5082/about-path-1440x1000.png`
- `output/chrome-about-v5082/about-vision-1440x1000.png`
- `output/chrome-about-v5082/about-final-1440x1000.png`
- `output/chrome-about-v5082/about-reduced-1440x1000.png`

Acceptance note:

`/about` now passes the current company-narrative acceptance gate. It should not be reverted to a generic team page, founder bio, soft SaaS mission page, or abstract AI company page. Future work should improve custom media originality and page-to-page continuity without weakening the industry-pain, product-path, 3-5 year vision, and final-ambition sequence.

## V5.083 Chrome Evidence: `/contact`

Priority: acceptance evidence for Contact / Enterprise Cooperation.

Chrome QA evidence path:
`output/chrome-contact-v5083/contact-qa-results.json`

Screenshots:
- `output/chrome-contact-v5083/contact-hero-1440x1000.png`
- `output/chrome-contact-v5083/contact-routes-1440x1000.png`
- `output/chrome-contact-v5083/contact-waitlist-1440x1000.png`
- `output/chrome-contact-v5083/contact-enterprise-1440x1000.png`
- `output/chrome-contact-v5083/contact-value-1440x1000.png`
- `output/chrome-contact-v5083/contact-final-direct-1440x1000.png`
- `output/chrome-contact-v5083/contact-reduced-1440x1000.png`

Passed checks:
- Required copy present across desktop and reduced-motion states.
- Banned copy absent: no dating language, no fake user counts, no fake partner/growth terms.
- No horizontal overflow at `1366x900`, `1440x1000`, `1920x1080`.
- SEO title and description present.
- `#waitlist` and `#enterprise` anchors present.
- No GSAP markers.
- Motion state uses video; reduced-motion state removes videos and uses poster images.
- `mailto:15253005312@163.com` is present.

## V5.084 Chrome Evidence: `/journal`

Priority: acceptance evidence for Journal / Content Growth.

Chrome QA evidence path:
`output/chrome-journal-v5084/journal-qa-results.json`

Screenshots:
- `output/chrome-journal-v5084/journal-hero-1440x1000.png`
- `output/chrome-journal-v5084/journal-feed-1440x1000.png`
- `output/chrome-journal-v5084/journal-filter-lab-1440x1000.png`
- `output/chrome-journal-v5084/journal-issue-1440x1000.png`
- `output/chrome-journal-v5084/journal-seo-1440x1000.png`
- `output/chrome-journal-v5084/journal-rules-1440x1000.png`
- `output/chrome-journal-v5084/journal-final-1440x1000.png`
- `output/chrome-journal-v5084/journal-reduced-1440x1000.png`

Passed checks:
- Required Journal copy present.
- Product progress, city observation, technical experiments, and cooperation updates are present.
- Banned dating / fake proof / fake growth terms absent.
- No horizontal overflow at `1366x900`, `1440x1000`, `1920x1080`.
- SEO title and description present.
- No GSAP markers.
- No heavy video on Journal.
- Poster images load.
- Channel filter works; selecting `技术实验` shows the lab topic and hides city topics.

## V5.085 Chrome Acceptance Evidence: System Pages

Chrome QA evidence path:

- `output/chrome-system-v5085/system-qa-results.json`

Routes checked:

- `/privacy`
- `/terms`
- `/cookies`
- `/not-found`
- `/thank-you`
- `/missing-system-qa-route`

Viewports checked:

- `1366x900`
- `1440x1000`
- `1920x1080`

Reduced-motion check:

- `1440x1000` across all checked routes.

Automated result:

- Total checks: 24.
- Failure count: 0.

Checks covered:

- Required page copy present.
- Banned terms absent.
- No horizontal overflow.
- No video elements on system pages.
- FitMeet logo loaded.
- H1 visible.
- Fixed header does not overlap H1.
- Metadata title and description present on routed system pages.

Screenshot evidence:

- `output/chrome-system-v5085/system-privacy-1440x1000.png`
- `output/chrome-system-v5085/system-terms-1440x1000.png`
- `output/chrome-system-v5085/system-cookies-1440x1000.png`
- `output/chrome-system-v5085/system-not-found-1440x1000.png`
- `output/chrome-system-v5085/system-thank-you-1440x1000.png`
- `output/chrome-system-v5085/system-root-404-1440x1000.png`

## V5.086 Full-Site Acceptance Target

This acceptance pass exists because isolated page QA can miss page-to-page continuity problems.

Target QA output:
`output/chrome-fullsite-v5087/fullsite-award-qa-results.json`

Required checks for this pass:
- `/product` must include visible `真实计划` copy.
- `/scenes` hero must read cleanly at `1366x900`, `1440x1000`, and `1920x1080`.
- `/scenes` H1 must not look cropped, broken, or like a poster accidentally scaled into a webpage.
- The full canonical route set must continue to avoid horizontal overflow, dating language, fake proof language, and missing metadata.
- Reduced-motion at `1440x1000` must preserve all key information.

## V5.087 Full-Site Chrome Acceptance Evidence

Chrome QA output:
`output/chrome-fullsite-v5087/fullsite-award-qa-results.json`

Automated result:
- Total checks: 52.
- Failure count: 0.

Coverage:
- 13 canonical routes checked.
- Desktop viewports checked: `1366x900`, `1440x1000`, `1920x1080`.
- Reduced-motion checked at `1440x1000`.

Specific fixes verified:
- `/product` includes visible `真实计划` copy.
- `/scenes` H1 is `先有具体的事。` and no longer breaks into poster-like fragments.
- No horizontal overflow detected in checked viewports.
- No required metadata failures detected.
- No GSAP production markers detected.
- Contact email remains present.

## V5.089 Chrome Evidence: Partner Arrival Enterprise Media

Chrome QA output:
`output/chrome-partner-v5088/partner-arrival-qa-results.json`

Checked route:
`/contact#enterprise`

Result:
- Automated result: passed.
- Desktop viewports checked: `1366x900`, `1440x1000`, `1920x1080`.
- Reduced-motion checked at `1440x1000`.
- Normal mode renders `public/videos/home-v5/partner-arrival-value.webm` through the contact enterprise media block.
- Normal mode reports video metadata as `1920x1080` with `readyState >= 1` and no media error.
- Reduced-motion mode removes the `<video>` element and renders `public/images/home-v5/partner-arrival-value-poster.jpg` with `naturalWidth=1920`.
- No horizontal overflow was detected in the checked desktop viewports.
- No banned dating language, fake metrics, fake logos, or fake partner proof was detected.
- Enterprise cooperation email remains visible: `15253005312@163.com`.

Screenshots:
- `output/chrome-partner-v5088/partner-contact-enterprise-final-1366x900.png`
- `output/chrome-partner-v5088/partner-contact-enterprise-final-1440x1000.png`
- `output/chrome-partner-v5088/partner-contact-enterprise-final-1920x1080.png`
- `output/chrome-partner-v5088/partner-contact-enterprise-final-reduced-1440x1000.png`

## v5.101 Pre-Chrome Gate

Chrome 验收前必须先执行：

```bash
npm run qa:award-preflight
```

如果该命令失败，不进入 Chrome 视觉验收。先修复结构、文档、媒体链路、禁用语、邮箱或动效生产标记问题。

如果该命令通过但存在 warning，验收员需要区分：

- `local media fallback` warning：表示最终 Runway/Pika 视频尚未 ingest，不代表页面结构失败。
- GSAP signal warning：表示当前源码没有明确 `ScrollTrigger` / `useGSAP` 信号，需要人工确认动效实现是否被抽离或命名变化。

Chrome 视觉验收仍按桌面优先执行：`1366x900`、`1440x1000`、`1920x1080`。移动端不作为本轮奖项级目标。

## v5.102 Media Evidence Requirement

Chrome 视觉验收前先读取：

- `output/qa/v5.102-video-asset-audit.json`
- `output/qa/v5.102-award-preflight.json`

验收员必须区分：

- `status = pass-technical-blocked-final-media`：技术规格合格，但 Runway/Pika 接受源视频还缺失，不能宣称最终完成。
- `status = pass`：技术规格和接受源视频都存在，才可以进入最终 Chrome 视觉判定。

Chrome 视觉判定仍以真实画面为准：视频必须像城市生活品牌大片，而不是抽象科技动图或静态插画拉动。

## v5.103 Chrome Desktop Sampling Evidence

本次 Chrome 桌面采样已生成：

- `output/qa/v5.103-chrome-desktop-sampling.json`
- `output/qa/v5.103-chrome-desktop/1366x900-home.png`
- `output/qa/v5.103-chrome-desktop/1440x1000-home.png`
- `output/qa/v5.103-chrome-desktop/1920x1080-home.png`

采样结论：

- 首页在 `1366x900`、`1440x1000`、`1920x1080` 下无横向溢出。
- `Social World` 主标题和 `一句想法，变成一次真实到场` 叙事线可被检测。
- 可见内容没有 dating / 速配 / 刷人语境。
- 首页视频节点已进入 DOM。Chrome 当前 reduced-motion 环境下，视频保留 `<video>` 节点但不自动播放，显示 poster，符合 reduced-motion 信息完整要求。

限制：

- 本证据只覆盖首页首屏采样，不等于整站最终验收。
- 最终验收仍需要 Runway/Pika accepted source exports、严格媒体审计、批量 ingest、工程构建和人工视觉判断。

## v5.104 Full-Site Chrome Route Sampling

本次全站 Chrome 桌面采样证据：

- `output/qa/v5.104-fullsite-chrome-sampling.json`
- `output/qa/v5.104-fullsite-chrome/`

采样范围：

- 8 个核心页面：`/`、`/product`、`/scenes`、`/community`、`/safety`、`/about`、`/journal`、`/contact`
- 5 个系统页面：`/privacy`、`/terms`、`/cookies`、`/not-found`、`/thank-you`
- 桌面视口：`1366x900`、`1440x1000`、`1920x1080`

结果：

- `hardFailures = 0`
- 无横向溢出。
- 无可见 dating / 速配 / 刷人语境。
- 每页有 `h1`、SEO title、SEO description 和主要 CTA。
- `/contact` 包含 `15253005312@163.com`。
- `/safety` 包含边界和公开地点语义。
- `/privacy` 已明确写入 `敏感信息`。
- `/terms` 已明确写入 `条款`。
- `/cookies` 已明确写入 `透明`。

Warning 解释：

- `/journal` 和系统页面没有 `<video>` 节点。当前接受为非硬失败，因为 Journal 是内容增长页，系统页是合规/支持页，不承担首页级电影主视觉。
- 最终视觉验收仍必须在 Runway/Pika accepted source exports 完成后执行。

## v5.105 Completion Evidence Rule

验收员不能只凭页面看起来可用就宣布完成。必须检查：

```text
output/qa/v5.105-goal-completion-audit.json
```

只有当该文件 `status = complete`，并且 `blockers = []`、`hardFailures = []` 时，才允许进入 goal 完成判断。

如果状态为 `incomplete`，需要逐项处理 blockers。当前主要 blocker 应是 Runway/Pika accepted source exports、batch ingest verify 和 final human visual review。

## v5.106 Browser-Control Evidence Rule

验收员必须读取：

```text
output/qa/v5.106-runway-pika-chrome-attempt.json
```

如果该文件结论为 `blocked-final-media-and-browser-control`，则不能执行最终通过判定。

判断规则：

- Chrome 插件安装、启用、native host 正常，只能证明本机配置存在，不等于浏览器控制会话可用。
- Runway/Pika 标签页存在，只能证明用户可能已登录或打开过页面，不等于生成、下载、接受视频已完成。
- 只有 8 条 accepted source exports 存在并完成 batch ingest 后，才允许进入最终人工视觉验收。


## v5.107 Runway/Pika Heavy Page Timeout Rule

验收员必须读取：

```text
output/qa/v5.107-chrome-heavy-page-timeout.json
```

如果结论为 `blocked-heavy-runway-pika-pages-and-missing-final-media`，不允许宣称最终媒体完成。

此状态表示：Chrome 能看到 Runway/Pika 标签页，但不能稳定检查重型生成页面，更不能证明视频已经生成、下载、接受或接入。
## V5.127 Acceptance Addendum: SignalPrism First Fold and Orbit

本节是 `SignalPrismHomepage` 的桌面视觉验收规则。它用于 Chrome 人工验收和截图回归，不替代 `typecheck` / `build`。

### 必查视口

- `1366x900`
- `1440x1000`
- `1920x1080`

### 首屏通过标准

- 3 秒内必须记住 `Social World`。
- F 图标只作为左上角企业品牌标志出现，不得占据首屏主视觉中心。
- 首屏必须像一个“交互式同频信号系统”，不是普通 AI SaaS 首屏。
- 左侧标题、短文案、双 CTA、证明条必须形成一个紧凑叙事块。
- 右侧真实图片、心核、几何切片必须形成一个城市信号装置。
- 鼠标移动时可以看到轻微空间响应，但文字不得漂移、重叠或抖动。
- 不得出现 video、黑场、加载占位视频、MP4/WebM 请求。

### 活动轨道通过标准

- 活动轨道必须像三层城市信号带，不是图库轮播。
- 每条轨道的标题和证明句必须清楚表达“为什么这个计划能发生”。
- 图片暗部、切片、边框、轨道线必须形成统一材质语言。
- 卡片 hover 必须增强层级，不得遮挡标题和活动需求。
- 活动内容必须保持青年真实生活语境，不得进入 dating、附近异性、刷人语境。

### 失败条件

- 首屏像抽象科技海报。
- 首屏像 AI SaaS dashboard。
- 右侧图片只是装饰，无法证明真实活动。
- 心核像无意义科技球。
- 活动轨道像模板卡片墙。
- 任何文案、CTA、轨道标题在桌面视口下重叠或被裁切。
## V5.128 Static Media Acceptance

Chrome 验收时必须同时检查图片资产，不只检查布局。

### Required Checks

- `/` 首屏 `night-run.png` 是否让 `Social World` 更真实。
- Need Input 的 `coffee.png` 是否表达低压力真实需求，而不是 dating 场景。
- Agent Plan 的 `badminton.png` 是否表达公开场地和可执行计划。
- City Signal 的 `travel-photo.png` 是否表达城市同行和公开场景。
- Business Value 的 `court.png` 是否表达线下到场与企业合作价值。
- ActivityOrbit 三条轨道是否各自成立：运动、低压力、兴趣。

### Static Media Failures

- 图片有水印。
- 图片里有文字、Logo、HUD、UI 或假数据。
- 图片只是装饰，没有证明真实活动。
- 图片像抽象科技海报、AI SaaS dashboard、游戏海报或 stock photo 拼贴。
- 图片让产品误读成 dating、速配、附近异性或头像筛选。
- 图片被 CSS 裁切到主体不可读。

### Evidence

- 验收截图必须覆盖首屏和 ActivityOrbit。
- 验收结论必须写明图片是否承担了对应产品任务。
- 不能只用 `typecheck` / `build` 证明视觉完成。
