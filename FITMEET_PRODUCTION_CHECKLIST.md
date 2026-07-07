# FitMeet Production Checklist

## V5.112 Full-Site No-Video SignalPrism Checklist

当前官网发布检查以全站无视频方向为准：

- [x] 首页不渲染 `<video>`。
- [x] 首页不请求 MP4 / WebM。
- [x] `/product`、`/community`、`/contact`、`/about`、`/safety` 已移除运行时 `<video>` 组件。
- [x] `components/social-world-page` 已从 `CinematicVideoMedia` 改为静态图片媒体。
- [x] `app/components/lib` 源码无 `.webm` / `.mp4` 页面媒体引用。
- [x] `F` Logo 只出现在左上角品牌锁定区和最终收束，不作为 Hero 主视觉。
- [x] 首屏 3 秒内记住 `Social World`。
- [x] 首屏能看见一个具体真实需求正在被组织，而不是抽象科技海报。
- [x] `企业官网` 图片已进入 `public/images/enterprise` 并被数据源引用。
- [x] `SignalPrism`、`MouseFieldProvider`、`SignalLineCanvas`、`ActivityOrbit`、`SafetyShell` 存在。
- [x] 鼠标交互只增强空间感，不影响阅读。
- [x] GSAP selector 均在组件 scope 内。
- [x] `prefers-reduced-motion` 下信息完整。
- [x] Chrome 桌面检查 `1366x900`、`1440x1000`、`1920x1080`。
- [x] `npm run typecheck` 通过。
- [x] `npm run build` 通过且无 OpenGraph `z-index` 警告。

Evidence:

- `output/qa/v5.111-award-preflight.json`
- `output/qa/v5.111-build.log`
- `output/qa/v5.111-signalprism-homepage-qa.json`
- `output/qa/v5.111-goal-completion-audit.json`

Remaining full-goal blocker:

- [ ] 对 8 个核心页面 + 5 个系统页面做最终整站视觉签收，确认它们都达到当前无视频 SignalPrism 方向下的 2026 潮流获奖级企业官网标准。

## V5.125 Final Signoff Evidence Checklist

当前发布和 goal 完成判断必须以最终签收证据链为准。

- [ ] `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md` 已用于人工逐页检查。
- [ ] `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 已填写命令 evidence。
- [ ] `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 已填写截图 evidence。
- [ ] `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 已填写 8 个核心页 verdict。
- [ ] `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 已填写 5 个系统页 verdict。
- [ ] 所有页面 verdict 为 `Pass` 或明确接受的 `Pass with polish`。
- [ ] 没有 `Needs redesign` 页面。
- [ ] 没有 `Blocked` 页面。
- [ ] `npm run qa:goal-audit:report` 已作为最终审计运行。

在以上项目完成前，不允许声称当前网站已经完成 2026 获奖级企业官网目标。

## Canonical Docs

本文档是发布前检查清单。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Documentation

- [ ] `README.MD` 已说明项目定位和文档优先级。
- [ ] `DESIGN.md` 已定义最高设计标准。
- [ ] `FITMEET_INFORMATION_ARCHITECTURE.md` 已覆盖 8 核心页面 + 5 系统页面。
- [ ] `FITMEET_COPY_SYSTEM.md` 已覆盖中文文案和禁用词。
- [ ] `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md` 已覆盖 image_gen / Runway / Pika / ffmpeg。
- [ ] `FITMEET_MOTION_SYSTEM.md` 已覆盖 GSAP 和 reduced-motion。
- [ ] `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md` 已固定执行流程。
- [ ] `FITMEET_PAGE_ACCEPTANCE_AGENT.md` 已覆盖 Chrome 验收。

## Pages

- [ ] `/` Home 存在并符合 `Social World` 首屏规则。
- [ ] `/product` Product 存在或已规划重定向。
- [ ] `/scenes` Use Cases 存在。
- [ ] `/community` Community 存在或 `/world` 兼容处理明确。
- [ ] `/safety` Trust & Safety 存在。
- [ ] `/about` About 存在。
- [ ] `/journal` Journal 存在或 `/stories` 兼容处理明确。
- [ ] `/contact` Contact / Waitlist 存在。
- [ ] `/privacy` 存在。
- [ ] `/terms` 存在。
- [ ] `/cookies` 存在或明确暂缓。
- [ ] `/not-found` 存在。
- [ ] `/thank-you` 存在或明确暂缓。

## Copy

- [ ] 主创意为 `Social World：一句想法，变成一次真实到场。`
- [ ] 首页主标题为 `Social World`。
- [ ] `F` 只出现在左上角 FitMeet Logo/品牌锁定区，不能成为 Hero 主标题、首页主视觉或装饰巨型字母。
- [ ] 所有核心页面中文优先。
- [ ] 企业合作邮箱 `15253005312@163.com` 可见。
- [ ] 未出现 `AI 革命`、`重新定义社交`、`陌生人速配`、`附近异性`、`灵魂伴侣`。
- [ ] 未出现假用户量、假合作方、假增长率。

## Media

- [ ] Hero 视频存在。
- [ ] Hero poster 存在。
- [ ] Scenes 视频或 poster 存在。
- [ ] Vision 视频或 poster 存在。
- [ ] 视频不内嵌文字。
- [ ] 视频不内嵌 Logo。
- [ ] 视频不内嵌 HUD。
- [ ] 视频没有黑场。
- [ ] 视频体积可控。
- [ ] reduced-motion 下 poster 可见。

推荐路径：

- `public/images/home-v5/`
- `public/videos/home-v5/`

## Motion

- [ ] 首页滚动叙事连续。
- [ ] GSAP 动画目标和视觉区块耦合。
- [ ] 不存在全局动画误伤其他 section。
- [ ] 无小 HUD、小点、小字、小几何遮挡文案。
- [ ] reduced-motion 下内容完整。
- [ ] 无长时间 pin 黑屏。

## SEO

- [ ] 每个核心页面有 metadata。
- [ ] Journal 有内容增长入口。
- [ ] OpenGraph 不使用旧紫蓝 AI 风。
- [ ] sitemap/metadata 不指向 Agent 工作台。
- [ ] title 和 description 中文清楚。

## Trust

- [ ] `/safety` 独立完整。
- [ ] 公开地点优先。
- [ ] 退出机制明确。
- [ ] 举报和屏蔽明确。
- [ ] 隐私保护明确。
- [ ] 未成年人边界明确。
- [ ] 企业合作不绕过用户价值。

## Performance

- [ ] 首屏视频有 poster。
- [ ] 非首屏视频懒加载。
- [ ] 图片尺寸明确。
- [ ] 无横向溢出。
- [ ] 无大面积 blur/filter 造成性能问题。
- [ ] 不依赖后端 API 才能显示核心内容。

## Chrome Desktop

视口：

- [ ] `1366x900`
- [ ] `1440x1000`
- [ ] `1920x1080`

检查：

- [ ] 首屏 3 秒内建立 `Social World` 记忆。
- [ ] 无文案重叠。
- [ ] 无视频黑场。
- [ ] 无小碎片遮挡。
- [ ] CTA 可见可点击。
- [ ] Footer 收束清楚。

## Commands

代码改动后：

```bash
npm run typecheck
npm run build
```

文档-only 改动：

- [ ] 确认新增文档命名正确。
- [ ] 确认 canonical docs 顺序一致。
- [ ] 不强制构建。

## Release Decision

只有全部 blocking 项通过，才允许进入发布或视觉验收。

Blocking 项：

- 文案重叠。
- 黑场。
- 横向溢出。
- 假数据。
- dating 语境。
- Trust 缺失。
- 企业邮箱缺失。
- 核心页面 metadata 缺失。

## V5 Route Acceptance Addendum

发布前新增检查：

- `/` 首页使用 `SocialWorldPage`，3 秒内建立 `Social World` 记忆。
- `/product` 解释社交 Agent 如何从需求生成计划，而不是聊天机器人 UI。
- `/scenes` 展示夜跑、球馆、城市漫游、周末短途等具体场景。
- `/community` 表达城市生活网络，不是数据大屏。
- `/safety` 独立完整表达公开地点、退出机制、举报机制、隐私和未成年人边界。
- `/about` 包含现在计划、行业痛点、3-5 年展望和最终愿景。
- `/journal` 作为 SEO 和内容增长入口。
- `/contact` 必须可见 `15253005312@163.com`，并说明企业合作价值。
- `/privacy`、`/terms`、`/cookies`、`/not-found`、`/thank-you` 必须可访问。
- 历史入口 `/agent`、`/world`、`/stories`、`/partners`、`/join`、`/cities`、`/press`、`/investors`、`/faq` 不应再呈现旧视觉系统。

## V5.020 Keyframe Acceptance Addendum

新增媒体检查：

- [ ] `public/images/home-v5/hero-night-run-social-world-keyframe.png` 已接入 Hero / Night Run。
- [ ] `public/images/home-v5/scene-public-plan-plaza-keyframe.png` 已接入 Agent Plan / Public Plan。
- [ ] `public/images/home-v5/scene-court-dispatch-keyframe.png` 已接入 Court / Dispatch。
- [ ] `public/images/home-v5/scene-citywalk-case-keyframe.png` 已接入 Citywalk / Case。
- [ ] `public/images/home-v5/vision-arrival-network-keyframe.png` 已接入 Community / Vision。
- [ ] `public/images/home-v5/scene-weekend-trip-keyframe.png` 已接入 Weekend / Short Trip。
- [ ] `public/images/home-v5/partner-arrival-value-keyframe.png` 已接入 Enterprise / Partner Arrival。
- [ ] 页面不请求尚未生成的 `/videos/home-v5/*.webm`。
- [ ] V5 keyframe 无文字、无 Logo、无 HUD、无小几何污染。
- [ ] Chrome 桌面截图中 keyframe 不呈现黑块、不遮挡标题和 CTA。
- [ ] 后续 Runway/Pika 视频只能在质量高于当前 keyframe 时替换。

## V5.030 Video Ingest Checklist

Runway/Pika 视频下载后新增检查：

- [ ] `FITMEET_VIDEO_ASSET_MANIFEST.json` 中有对应 slug。
- [ ] 通过 `npm run media:ingest -- <asset-slug> <input-mp4>` 生成输出。
- [ ] WebM 输出存在：`public/videos/home-v5/<asset-slug>.webm`。
- [ ] MP4 archive 存在：`public/videos/home-v5/<asset-slug>.mp4`。
- [ ] Poster 存在：`public/images/home-v5/<asset-slug>-poster.jpg`。
- [ ] 视频无文字、Logo、HUD、UI 面板。
- [ ] 视频无黑场、无模糊、无明显人物变形。
- [ ] 质量高于当前 keyframe 后，才更新 `pageData.ts` 的 `video` 字段。
- [ ] 更新 `pageData.ts` 后运行 `npm run typecheck` 和 `npm run build`。

## V5.040 External Video Status

- [ ] Runway/Pika 页面已稳定进入 image-to-video 上传界面。
- [ ] 如果自动化读取外部页面超时，不继续上传，不绕过验证或权限。
- [ ] 用户手动下载 MP4 后，可用 `npm run media:ingest -- <asset-slug> <input-mp4>` 接入候选资产。
- [ ] 未通过视觉 QA 的视频不得写入 `pageData.ts`。

## V5.060 Continuous Corridor Checklist

- [ ] 页面滚动不呈现独立 PPT section 感。
- [ ] `chain` 视觉像连续操作轨道，不像卡片墙。
- [ ] 大型斜切背景不遮挡任何正文、标题、按钮、proof。
- [ ] `--sw-flow` / `--sw-heat` 只驱动背景级视觉。
- [ ] reduced-motion 下背景运动停止，内容完整。
- [ ] 桌面三视口无横向溢出、无文案重叠、无黑场。

## V5.061 Chrome Evidence Checklist

- [x] 首页三视口 `1366x900`、`1440x1000`、`1920x1080` 已完成 Chrome 检查。
- [x] 首页三视口无横向溢出。
- [x] 首页 `Social World` H1 可见。
- [x] 首页 CTA 可见。
- [x] 全路由 `1440x1000` H1 可见。
- [x] 全路由 `1440x1000` metadata 存在。
- [x] 全路由 `1440x1000` 近视口图片无破损。
- [x] `/contact` 可见 `15253005312@163.com`。
- [x] reduced-motion 全路由 `1440x1000` 已完成。
- [x] reduced-motion 下 13 个页面核心文案完整。
- [x] reduced-motion 首页截图已保存。
- [ ] Runway/Pika 正式 WebM 已生成并通过视频验收。
- [ ] WebM 接入后重新运行 `npm run typecheck`。
- [ ] WebM 接入后重新运行 `npm run build`。

证据文件：

- `output/chrome-v5060/home-triview-qa.json`
- `output/chrome-v5060/routes-1440-qa.json`
- `output/chrome-v5061/routes-reduced-motion-1440-qa.json`
- `output/chrome-v5061/home-reduced-motion-1440x1000.png`

## V5.062 External Video Readiness Checklist

- [x] Hero keyframe 存在：`public/images/home-v5/hero-night-run-social-world-keyframe.png`。
- [x] Hero keyframe 可作为 Runway/Pika image-to-video 输入。
- [x] manifest 中存在 `hero-night-run-social-world`。
- [x] ingest 脚本支持 `hero-night-run-social-world`。
- [x] Chrome 中发现 Runway 标签页。
- [x] Chrome 中发现 Pika 标签页。
- [ ] Runway 页面已稳定进入 image-to-video 上传界面。
- [ ] Pika 页面已稳定进入 image-to-video 上传界面。
- [ ] Hero MP4 已下载到本机。
- [ ] Hero MP4 已通过 `npm run media:ingest -- hero-night-run-social-world <input-mp4>`。
- [ ] Hero WebM 已人工确认优于当前 keyframe。
- [ ] Hero WebM 已接入 `pageData.ts`。

当前阻塞说明：

- Runway 页面在自动化读取阶段超时。
- Chrome 控制通道随后也出现文档读取超时。
- 不允许在此状态下上传关键帧、消耗额度或接入未验收视频。

## V5.063 Local Hero Fallback Checklist

- [x] 本地 Hero 候选 MP4 已生成：`output/video-candidates/hero-night-run-social-world-local-push.mp4`。
- [x] 已通过 `npm run media:ingest -- hero-night-run-social-world ...`。
- [x] WebM 已存在：`public/videos/home-v5/hero-night-run-social-world.webm`。
- [x] MP4 archive 已存在：`public/videos/home-v5/hero-night-run-social-world.mp4`。
- [x] Poster 已存在：`public/images/home-v5/hero-night-run-social-world-poster.jpg`。
- [x] WebM 为 `1920x1080`、`24fps`、`5s`。
- [x] Poster 目视无文字、无 Logo、无 HUD、无黑场。
- [x] `pageData.ts` 已接入 Hero `video` 字段。
- [x] `npm run typecheck` 通过。
- [x] `npm run build` 通过。
- [x] Chrome 首页三视口视频验收通过。
- [x] reduced-motion 下 Hero 信息完整。
- [x] reduced-motion 下不渲染 `<video>`，只渲染 poster。

注意：

- 该资产是本地 cinematic fallback，不是 Runway/Pika final。
- Runway/Pika 正式 Hero 仍是最终获奖级视频目标。

证据文件：

- `output/chrome-v5063/home-hero-video-qa.json`
- `output/chrome-v5063/home-hero-video-reduced-fix-qa.json`
- `output/chrome-v5063/home-hero-video-normal-after-reduced-fix-1440x1000.png`
- `output/chrome-v5063/home-hero-video-reduced-after-fix-1440x1000.png`

## V5.065 Production Checklist: Agent Plan Fallback

本文档继续作为发布前检查，不替代 DESIGN.md 或媒体生产规范。

### Required before treating Agent Plan as production-ready

- [ ] WebM exists at `public/videos/home-v5/scene-public-plan-plaza.webm`.
- [ ] MP4 backup exists at `public/videos/home-v5/scene-public-plan-plaza.mp4`.
- [ ] Poster exists at `public/images/home-v5/scene-public-plan-plaza-poster.jpg`.
- [ ] Manifest marks the asset as `local-cinematic-fallback-live-runway-pika-pending`.
- [ ] Homepage `streetPlaza` media has both poster and video fields.
- [ ] Chrome normal mode proves the WebM is loaded near Agent Plan.
- [ ] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Runway/Pika replacement remains pending and must not be forgotten.

## V5.066 Checked Evidence: Agent Plan Fallback

### Checked now

- [x] WebM exists at `public/videos/home-v5/scene-public-plan-plaza.webm`.
- [x] MP4 backup exists at `public/videos/home-v5/scene-public-plan-plaza.mp4`.
- [x] Poster exists at `public/images/home-v5/scene-public-plan-plaza-poster.jpg`.
- [x] Manifest marks the asset as `local-cinematic-fallback-live-runway-pika-pending`.
- [x] Homepage `streetPlaza` media has both poster and video fields.
- [x] Chrome normal mode proves the WebM is loaded near Agent Plan.
- [x] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Runway/Pika replacement remains pending and must not be forgotten.

## V5.067 Production Checklist: Real People Citywalk Fallback

### Required before treating Real People as production-ready

- [ ] WebM exists at `public/videos/home-v5/scene-citywalk-case.webm`.
- [ ] MP4 backup exists at `public/videos/home-v5/scene-citywalk-case.mp4`.
- [ ] Poster exists at `public/images/home-v5/scene-citywalk-case-poster.jpg`.
- [ ] Manifest marks the asset as `local-cinematic-fallback-live-pika-pending`.
- [ ] Homepage `citywalk` media has both poster and video fields.
- [ ] Chrome normal mode proves the WebM is loaded near Real People.
- [ ] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Pika/Runway replacement remains pending and must not be forgotten.

## V5.068 Checked Evidence: Real People Citywalk Fallback

### Checked now

- [x] WebM exists at `public/videos/home-v5/scene-citywalk-case.webm`.
- [x] MP4 backup exists at `public/videos/home-v5/scene-citywalk-case.mp4`.
- [x] Poster exists at `public/images/home-v5/scene-citywalk-case-poster.jpg`.
- [x] Manifest marks the asset as `local-cinematic-fallback-live-pika-pending`.
- [x] Homepage `citywalk` media has both poster and video fields.
- [x] Chrome normal mode proves the WebM is loaded near Real People.
- [x] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Pika/Runway replacement remains pending and must not be forgotten.

## V5.069 Production Checklist: Social World Vision Fallback

### Required before treating Social World Vision as production-ready

- [ ] WebM exists at `public/videos/home-v5/vision-arrival-network.webm`.
- [ ] MP4 backup exists at `public/videos/home-v5/vision-arrival-network.mp4`.
- [ ] Poster exists at `public/images/home-v5/vision-arrival-network-poster.jpg`.
- [ ] Manifest marks the asset as `local-cinematic-fallback-live-runway-pending`.
- [ ] Homepage `cityNetwork` media has both poster and video fields.
- [ ] Chrome normal mode proves the WebM is loaded near Social World.
- [ ] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Runway replacement remains pending and must not be forgotten.

## V5.070 Checked Evidence: Social World Vision Fallback

### Checked now

- [x] WebM exists at `public/videos/home-v5/vision-arrival-network.webm`.
- [x] MP4 backup exists at `public/videos/home-v5/vision-arrival-network.mp4`.
- [x] Poster exists at `public/images/home-v5/vision-arrival-network-poster.jpg`.
- [x] Manifest marks the asset as `local-cinematic-fallback-live-runway-pending`.
- [x] Homepage `cityNetwork` media has both poster and video fields.
- [x] Chrome normal mode proves the WebM is loaded near Social World.
- [x] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Runway replacement remains pending and must not be forgotten.

## V5.071 Production Checklist: Scenes Court and Weekend Fallbacks

### Required before treating Scenes media as production-ready

- [ ] Court WebM exists at `public/videos/home-v5/scene-court-dispatch.webm`.
- [ ] Court MP4 backup exists at `public/videos/home-v5/scene-court-dispatch.mp4`.
- [ ] Court poster exists at `public/images/home-v5/scene-court-dispatch-poster.jpg`.
- [ ] Weekend WebM exists at `public/videos/home-v5/scene-weekend-trip.webm`.
- [ ] Weekend MP4 backup exists at `public/videos/home-v5/scene-weekend-trip.mp4`.
- [ ] Weekend poster exists at `public/images/home-v5/scene-weekend-trip-poster.jpg`.
- [ ] Manifest marks both assets as `local-cinematic-fallback-live-pika-runway-pending`.
- [ ] `/scenes` `court` and `weekend` media have both poster and video fields.
- [ ] Chrome normal mode proves both WebM assets load in the correct sections.
- [ ] Chrome reduced-motion mode proves both posters render without video.
- [ ] Final Pika/Runway replacements remain pending and must not be forgotten.

---

## V5.072 Production Checklist: Scenes Court and Weekend

Chrome desktop acceptance:
- [x] `/scenes#court` checked at `1366x900`, `1440x1000`, `1920x1080`.
- [x] `/scenes#weekend` checked at `1366x900`, `1440x1000`, `1920x1080`.
- [x] Normal motion checked for both sections.
- [x] `prefers-reduced-motion: reduce` checked for both sections.
- [x] `12/12` viewport and motion matrix passed.

Media acceptance:
- [x] Court WebM is connected to the Court section.
- [x] Court poster is connected and visible in reduced motion.
- [x] Weekend WebM is connected to the Weekend section.
- [x] Weekend poster is connected and visible in reduced motion.
- [x] Both normal-mode videos report `1920x1080`, five-second duration, and ready video state.
- [x] Screenshots were captured for normal and reduced states.

Design acceptance:
- [x] Court and Weekend use realistic city/social imagery instead of abstract SVG illustration.
- [x] Headings remain readable and are not blocked by media.
- [x] No horizontal overflow in tested desktop viewports.
- [x] No dating-language terms in inspected page body.

Still not final:
- [ ] Replace local fallbacks with final Pika/Runway exports before brand launch.
- [ ] Upgrade `/scenes` Night Run from static keyframe to motion media.

---

## V5.073 Production Checklist: Scenes Night Run Fallback

Required before treating Night Run fallback as checked:
- [x] Local candidate exists at `output/video-candidates/scene-night-run-local-drift.mp4`.
- [x] WebM exists at `public/videos/home-v5/scene-night-run.webm`.
- [x] MP4 archive exists at `public/videos/home-v5/scene-night-run.mp4`.
- [x] Poster exists at `public/images/home-v5/scene-night-run-poster.jpg`.
- [x] Manifest marks `scene-night-run` as `local-cinematic-fallback-live-runway-pika-pending`.
- [x] `/scenes` Night Run media has both poster and video fields.
- [ ] Chrome normal mode proves the WebM loads in the correct Night Run section.
- [ ] Chrome reduced-motion mode proves the poster renders without video.
- [ ] Final Runway/Pika replacement remains pending and must not be forgotten.

---

## V5.074 Checked Evidence: Scenes Night Run Fallback

Chrome desktop acceptance:
- [x] `/scenes#night-run` checked at `1366x900`, `1440x1000`, `1920x1080`.
- [x] Normal motion checked.
- [x] `prefers-reduced-motion: reduce` checked.
- [x] `6/6` viewport and motion matrix passed.

Media acceptance:
- [x] Night Run WebM is connected to the Night Run section.
- [x] Night Run poster is connected and visible in reduced motion.
- [x] Normal-mode video reports `1920x1080`, five-second duration, and ready video state.
- [x] Reduced-motion mode removes video playback and renders the poster.
- [x] Screenshots were captured for normal and reduced states.

Design acceptance:
- [x] Night Run uses realistic night-running city imagery instead of abstract SVG illustration.
- [x] Heading remains readable and is not blocked by media.
- [x] No horizontal overflow in tested desktop viewports.
- [x] No dating-language terms in inspected page body.

Still not final:
- [ ] Replace local fallback with final Runway/Pika image-to-video before brand launch.
- [ ] Run full `/scenes` page pass after all local fallbacks are replaced by final external video assets.

---

## V5.075 Production Checklist: Scenes Continuous Corridor

Engineering checks:
- [x] CSS change scoped to `/scenes` through `[data-page="scenes"]`.
- [x] No TSX animation target changes.
- [x] `npm run typecheck` passed.
- [x] `npm run build` passed.

Chrome desktop checks:
- [x] `/scenes` checked at `1366x900`, `1440x1000`, `1920x1080`.
- [x] Normal motion checked.
- [x] `prefers-reduced-motion: reduce` checked.
- [x] `6/6` viewport and motion matrix passed.
- [x] No horizontal overflow detected.
- [x] No dating-language terms detected.

Design checks:
- [x] Scenario sections overlap more aggressively and no longer read as isolated posters.
- [x] Shared corridor field visually connects the scenario sequence.
- [x] Four scenario media blocks remain section-correct.
- [x] Reduced-motion keeps information complete with poster assets.

Still not final:
- [ ] Replace local fallback videos with final Runway/Pika image-to-video exports.
- [ ] Run final full-page visual QA after external video replacement.

## V5.071 Production Checklist: Product Mechanism Page

### Required before treating `/product` as production-ready

- [x] `/product` uses a dedicated product experience, not the generic page template.
- [x] Page explains how FitMeet turns a real need into a real plan.
- [x] Page includes `需求理解`、`上下文判断`、`计划生成`、`边界协议`、`同频匹配`、`计划收据`。
- [x] Page avoids chat UI and AI SaaS dashboard language.
- [x] Page avoids dating language.
- [x] Page avoids fake metrics, fake logos, fake partners, and fake growth claims.
- [x] Desktop Chrome checked at `1366x900`, `1440x1000`, and `1920x1080`.
- [x] No horizontal overflow detected in checked desktop viewports.
- [x] Product videos load in normal mode with 1920x1080 intrinsic size.
- [x] Reduced-motion mode keeps all information and swaps video to poster images.
- [x] `npm run typecheck` passed after implementation.
- [x] `npm run build` passed after implementation.

### Still required for award-level final state

- [ ] Replace reused/fallback product media with final Runway/Pika production media if `/product` becomes a flagship award submission page.
- [ ] Add GSAP section-to-section continuity after the full page set is stable, keeping animation targets strictly coupled to visual blocks.
- [ ] Re-run full-site Chrome acceptance after all 8 core pages are completed.

## V5.072 Production Checklist: Community Social World Page

### Required before treating `/community` as production-ready

- [x] `/community` uses a dedicated community experience, not the generic page template.
- [x] Page explains Social World as city life network, not as abstract community copy.
- [x] Page includes city nodes, public scenes, community loop, repeatable plans, and future blueprint.
- [x] Page states that personal location is not public.
- [x] Page avoids dating language.
- [x] Page avoids fake metrics, fake logos, fake partners, and fake growth claims.
- [x] GSAP selectors are scoped to the community page root and `data-community-*` targets.
- [x] Blur-based reveal motion removed to avoid virtual/unclear page feel.
- [x] Desktop Chrome checked at `1366x900`, `1440x1000`, and `1920x1080`.
- [x] No horizontal overflow detected in checked desktop viewports.
- [x] Community videos load in normal mode with 1920x1080 intrinsic size.
- [x] Reduced-motion mode keeps all information and swaps video to poster images.
- [x] `npm run typecheck` passed after implementation.
- [x] `npm run build` passed after implementation.

### Still required for award-level final state

- [ ] Replace reused/fallback community media with final Runway/Pika production media if `/community` becomes a flagship award submission page.
- [ ] Re-run full-site Chrome acceptance after all 8 core pages are completed.
- [ ] Confirm page-to-page scroll/motion continuity across `/`, `/product`, `/scenes`, `/community`, and `/safety`.

## V5.080 Production Checklist: Trust & Safety Page

### Required before treating `/safety` as production-ready

- [x] `/safety` uses a dedicated Trust & Safety experience, not the generic page template.
- [x] Page explains safety as product order, not as legal disclaimer text.
- [x] Page includes `公开地点`, `退出机制`, `举报`, `屏蔽`, `隐私保护`, `未成年人边界`, `确认后邀请`, and `安全收据`.
- [x] Page avoids dating language.
- [x] Page avoids fake metrics, fake logos, fake partner proof, and fake growth claims.
- [x] Page uses public-place and city-walk media instead of abstract SVG illustration.
- [x] GSAP selectors are scoped to the safety page root and `data-safety-*` targets.
- [x] Desktop Chrome checked at `1366x900`, `1440x1000`, and `1920x1080`.
- [x] No horizontal overflow detected in checked desktop viewports.
- [x] Safety videos load in normal mode with 1920x1080 intrinsic size.
- [x] Reduced-motion mode keeps all information and swaps video to poster images.
- [x] SEO metadata exists for `/safety`.
- [x] `npm run typecheck` passed after implementation.
- [x] `npm run build` passed after implementation.

### Still required for award-level final state

- [ ] Replace reused/fallback safety media with final Runway/Pika production media if `/safety` becomes a flagship award submission page.
- [ ] Re-run full-site Chrome acceptance after all 8 core pages are completed.
- [ ] Confirm page-to-page scroll/motion continuity across `/`, `/product`, `/scenes`, `/community`, and `/safety`.

## V5.081 Production Checklist: About Company Narrative Page

### Required before treating `/about` as production-ready

- [x] `/about` uses a dedicated company narrative experience, not the generic page template.
- [x] Page explains why FitMeet exists, not only what it does.
- [x] Page includes industry pain, current product path, product belief, 3-5 year vision, and final ambition.
- [x] Page states future goals as goals, not as completed traction.
- [x] Page avoids banned social/dating terms.
- [x] Page avoids fake metrics, fake logos, fake partner proof, fake user-count language, and fake growth language.
- [x] Page uses real city/lifestyle media instead of abstract SVG illustration.
- [x] GSAP selectors are scoped to the about page root and `data-about-*` targets.
- [x] Core company copy remains readable by default, with motion as enhancement.
- [x] Desktop Chrome checked at `1366x900`, `1440x1000`, and `1920x1080`.
- [x] No horizontal overflow detected in checked desktop viewports.
- [x] About videos load in normal mode with 1920x1080 intrinsic size.
- [x] Reduced-motion mode keeps all information and swaps video to poster images.
- [x] SEO metadata exists for `/about`.
- [x] `npm run typecheck` passed after implementation.
- [x] `npm run build` passed after implementation.

### Still required for award-level final state

- [ ] Replace reused/fallback About media with final Runway/Pika production media if `/about` becomes a flagship award submission page.
- [ ] Re-run full-site Chrome acceptance after all 8 core pages are completed.
- [ ] Confirm page-to-page scroll/motion continuity across `/`, `/product`, `/scenes`, `/community`, `/safety`, and `/about`.

## V5.083 Production Checklist: `/contact`

Priority: release checklist update.

Before release, keep these Contact requirements green:
- `/contact` returns 200 and is statically buildable.
- `npm run typecheck` passes.
- `npm run build` passes.
- The enterprise cooperation email `15253005312@163.com` remains visible and linked with `mailto:`.
- The page contains personal, enterprise, and safety routing.
- `#waitlist` and `#enterprise` anchors work.
- No fake metrics, fake logos, fake partner proof, dating language, or avatar browsing UI appears.
- Videos have posters and reduced-motion fallback.
- Desktop QA evidence is retained under `output/chrome-contact-v5083/`.

## V5.084 Production Checklist: `/journal`

Priority: release checklist update.

Before release, keep these Journal requirements green:
- `/journal` returns 200 and is statically buildable.
- `npm run typecheck` passes.
- `npm run build` passes.
- The page contains product progress, city observation, technical experiments, and cooperation updates.
- Channel filters work without server calls.
- Journal copy stays Chinese-first, concrete, and SEO-oriented.
- No fake research data, fake user volume, fake partner proof, fake growth claims, dating language, or profile browsing appears.
- No heavy video requirement is introduced for this page.
- Desktop QA evidence is retained under `output/chrome-journal-v5084/`.

## V5.085 Production Checklist Update: System Pages

System page release checks are now satisfied for the current implementation.

Passed checks:

- `/privacy` exists and explains privacy boundaries.
- `/terms` exists and explains real social contract boundaries.
- `/cookies` exists and explains Cookie usage and future consent paths.
- `/not-found` exists and uses Social World recovery language.
- Root `app/not-found.tsx` catches unknown routes with the same 404 language.
- `/thank-you` exists and uses plan-queue confirmation language.
- No system page uses video.
- No system page uses fake numbers, fake logos, or dating language.
- Chrome desktop QA passed at `1366x900`, `1440x1000`, and `1920x1080`.
- `npm run typecheck` passed.
- `npm run build` passed.

Evidence:

- `output/chrome-system-v5085/system-qa-results.json`

## V5.086 Production Checklist: Full-Site Continuity Correction

Before treating the current website as globally coherent:
- [x] `/product` visible copy includes `真实计划`.
- [x] `/scenes` hero H1 is shortened for desktop readability.
- [x] `/scenes` keeps the concrete scene list in subtitle/body copy instead of overloading the H1.
- [x] `/scenes` desktop title sizing is constrained separately from the homepage `Social World` treatment and locked to one readable line at desktop widths.
- [x] `npm run typecheck` passes after the correction.
- [x] `npm run build` passes after the correction.
- [x] Full-site Chrome QA passes at `1366x900`, `1440x1000`, and `1920x1080`.
- [x] Reduced-motion full-site QA passes at `1440x1000`.

Evidence target:
- `output/chrome-fullsite-v5087/fullsite-award-qa-results.json`

Evidence for V5.086/V5.087:
- `output/chrome-fullsite-v5087/fullsite-award-qa-results.json`
- `output/chrome-fullsite-v5087/fullsite-scenes-1366x900.png`
- `output/chrome-fullsite-v5087/fullsite-scenes-1440x1000.png`
- `output/chrome-fullsite-v5087/fullsite-scenes-1920x1080.png`
- `output/chrome-fullsite-v5087/fullsite-product-1440x1000.png`

## V5.088 Production Checklist: Partner Arrival Media

Required checks for the enterprise arrival asset:
- [x] Local candidate exists at `output/video-candidates/partner-arrival-value-local-drift.mp4`.
- [x] WebM exists at `public/videos/home-v5/partner-arrival-value.webm`.
- [x] MP4 archive exists at `public/videos/home-v5/partner-arrival-value.mp4`.
- [x] Poster exists at `public/images/home-v5/partner-arrival-value-poster.jpg`.
- [x] Manifest marks `partner-arrival-value` as `local-cinematic-fallback-live-runway-pika-pending`.
- [x] `pageData.ts` `partnerArrival` media has both poster and video fields.
- [ ] Chrome normal mode proves the WebM loads wherever `partnerArrival` appears.
- [ ] Chrome reduced-motion proves the poster renders without video.
- [ ] Final Runway/Pika replacement remains pending and must not be forgotten.

New final production queue:
- [x] `FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md` exists.

## V5.089 Partner Arrival Enterprise Media Check

- [x] `/contact#enterprise` renders `partner-arrival-value.webm` in normal motion mode.
- [x] Normal Chrome desktop checks covered `1366x900`, `1440x1000`, and `1920x1080`.
- [x] Normal mode video metadata reports `1920x1080` with no media error.
- [x] Reduced-motion at `1440x1000` removes video playback and renders `partner-arrival-value-poster.jpg`.
- [x] No horizontal overflow detected in the checked desktop viewports.
- [x] No banned dating language or fake proof terms detected in the checked route.
- [x] Enterprise cooperation email `15253005312@163.com` remains visible.
- [x] `npm run typecheck` passed after the media-source fix.
- [x] `npm run build` passed after the media-source fix, with only the existing `z-index is currently not supported` warning.

Evidence:
`output/chrome-partner-v5088/partner-arrival-qa-results.json`

Boundary:
This validates the local cinematic fallback as correctly connected and degradable. It does not make the fallback final award-submission media; Runway/Pika replacement remains required.

## v5.109 Cleanup + Media Reset Checklist

- 旧 `output/runway-inputs`、旧 v3/v4 媒体、旧首页历史文档和旧 Runway/Pika handoff 不再参与验收。
- 新图片生成只参考 `FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md`。
- 新视频生产必须走 `GPT 摄影关键帧 -> Runway/Pika image-to-video -> ffmpeg -> public assets -> CinematicVideoMedia`。
- 新资产验收仍以真实影像、无黑场、无 HUD、无内嵌文字、桌面端首屏冲击力为准。

## V5.100 Batch Ingest Checklist

- [x] `scripts/fitmeet-video-ingest.sh` accepts `scene-night-run`.
- [x] `scripts/fitmeet-video-batch-ingest.sh` exists.
- [x] `npm run media:ingest:batch` exists.
- [x] Accepted-download directory exists at `output/runway-downloads/home-v5`.
- [x] Accepted-download README exists at `output/runway-downloads/home-v5/README.md`.
- [x] Readiness evidence exists at `output/qa/v5.100-media-ingest-readiness.json`.
- [ ] Accepted Runway/Pika MP4/MOV files placed in the downloads directory.
- [ ] `npm run media:ingest:batch -- --force --verify` passes after downloads exist.
- [ ] Chrome desktop QA passes after batch ingest.

## v5.101 本地奖项级预检

发布前新增必跑命令：

```bash
npm run qa:award-preflight
```

通过条件：

- 核心路由、系统路由、Canonical Docs 全部存在。
- 八条 Runway/Pika 输入和提示词仍可定位。
- 上传包、下载目录、单条 ingest 和批量 ingest 脚本存在。
- manifest 版本为 `v5.101`，并包含 `awardPreflight` 块。
- 源码无 `陌生人速配`、`附近异性`、`灵魂伴侣`、`刷人`、`AI 革命`、`重新定义社交`、`dating`、`Tinder` 等禁用语。
- 企业合作邮箱 `15253005312@163.com` 存在。
- 未留下 `markers: true`。

注意：该检查不能证明视觉已经达到 Awwwards 级。最终仍以 Chrome 桌面截图、真实视频质量、滚动上下文耦合和用户验收为准。

## v5.102 视频资产门禁

发布前新增媒体检查：

```bash
npm run media:audit
```

最终验收前必须执行严格模式：

```bash
npm run media:audit -- --strict-final
```

通过标准：

- 8 条 MP4/WebM/poster 全部存在。
- MP4/WebM 均为 `1920x1080`、4-6 秒、无音轨。
- poster 均为 `1920x1080`。
- `output/runway-downloads/home-v5` 中有 8 条人工接受的 Runway/Pika 源视频。
- Chrome 中没有黑场、模糊、文字烧录、Logo、水印、HUD 或抽象插画感。

如果普通 `media:audit` 通过但严格模式失败，状态只能写为：`技术资产合格，最终视频仍未完成`。

## v5.103 Chrome 首页采样检查

当前证据：

```text
output/qa/v5.103-chrome-desktop-sampling.json
```

通过项：

- 首页在三种桌面视口下无横向溢出。
- 首页标题 `Social World` 可见。
- 首屏核心文案可见。
- 首页 `<video>` 节点存在。
- reduced-motion 下 video 节点保留，但不自动播放。
- 无可见禁用 dating 语境。

仍未完成：

- `npm run media:audit -- --strict-final` 尚不能通过，因为 Runway/Pika accepted source exports 还没有放入下载目录。
- 本轮没有宣称整站 Chrome 最终验收完成，只完成首页桌面采样。

## v5.104 全站 Chrome 路由采样

发布前需要保留以下证据：

```text
output/qa/v5.104-fullsite-chrome-sampling.json
output/qa/v5.104-fullsite-chrome/
```

当前通过项：

- 13 个目标页面均可打开。
- 三个桌面视口均无横向溢出硬失败。
- 每页具备 SEO title、SEO description、h1 和主 CTA。
- 禁用 dating / 速配 / 刷人语境未出现在可见主体文案。
- `/contact` 有企业合作邮箱。
- `/safety` 有边界和公开地点语义。
- `/privacy`、`/terms`、`/cookies` 的合规关键词已进入可见文案。

非阻塞 warning：

- `/journal` 和系统页没有视频节点。当前不作为发布硬失败，但最终奖项级视觉验收需要人工确认这些页面没有因此变得空、弱、像模板页。

## v5.105 最终完成审计

最终完成前必须通过：

```bash
npm run qa:goal-audit
```

报告模式：

```bash
npm run qa:goal-audit:report
```

完成条件：

- `npm run qa:award-preflight` 通过。
- `output/qa/v5.104-fullsite-chrome-sampling.json` 无 hard failure。
- `npm run media:audit -- --strict-final` 通过。
- 8 条 Runway/Pika accepted source exports 存在。
- `npm run media:ingest:batch -- --force --verify` 已在最终视频后运行。
- `npm run build` 通过。
- 最终人工视觉验收通过。

当前 `v5.105` 状态只能写为：工程 build 已通过，goal completion audit 已就绪，但最终媒体和人工视觉验收仍阻塞完成。

## v5.106 Runway/Pika 与 Chrome 控制阻塞

新增证据：

```text
output/qa/v5.106-runway-pika-chrome-attempt.json
```

当前发布状态不能写为完成。原因：

- Runway/Pika accepted source exports 仍缺失。
- `npm run media:ingest:batch -- --force --verify` 不能在源视频缺失时运行为最终通过。
- 最终 Chrome 视觉验收不能在 Chrome 控制通道不可用时完成。

解除阻塞后必须按顺序执行：

```bash
npm run media:ingest:batch -- --force --verify
npm run media:audit -- --strict-final
npm run qa:goal-audit
```

如果 `qa:goal-audit` 仍显示 incomplete，不允许进入最终发布或 goal complete。


## v5.107 恢复尝试后的最终媒体阻塞

新增证据：

```text
output/qa/v5.107-chrome-heavy-page-timeout.json
output/qa/v5.107-goal-completion-audit.json
```

当前结论：

- Chrome 控制可恢复到列出标签页，但 Runway/Pika 重型生成页截图会导致控制内核超时重置。
- 这不足以支撑自动化完成 Runway/Pika 上传、生成、下载和视觉验收。
- 发布检查仍必须等待 8 条 accepted source exports。

## V5.126 Goal Audit Enforcement Checklist

Final completion audit now blocks on the final visual signoff report.

- [ ] `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` final decision changed from `Not signed off` to `Signed off` only after evidence exists.
- [ ] No `Pending` remains in the report.
- [ ] No `TBD` remains in the report.
- [ ] `npm run qa:goal-audit:report` confirms the report instead of blocking on it.

If any item above is false, the active website goal is still incomplete.
## V5.127 Production Checklist Addendum

发布前必须完成以下桌面视觉证据，否则不能宣称达到 2026 潮流获奖级企业官网：

- `npm run typecheck` 通过。
- `npm run build` 通过。
- Chrome 截图覆盖 `/` 的 `1366x900`、`1440x1000`、`1920x1080`。
- 首屏截图中 `Social World` 是第一视觉记忆。
- F Logo 位于左上角并保持品牌标志角色，不作为首屏中心图形。
- 首屏无 video、无 MP4/WebM 请求、无黑场。
- 首屏右侧真实图片与同频心核形成一个信号装置，而不是普通图片卡。
- 活动轨道截图能看出三层结构：运动轨道、低压力轨道、兴趣轨道。
- 活动轨道图片没有水印、没有视频帧 UI、没有假 HUD、没有 in-image 文案。
- reduced-motion 下页面信息仍完整。
- 若任一截图显示页面空、虚、抽象，必须回到 `DESIGN.md` 的 v5.127 标准继续精修。
## V5.128 Static Media Checklist

发布前必须检查：

- `FITMEET_STATIC_MEDIA_GOVERNANCE.md` 已更新。
- 所有首页图片来自 `enterpriseAssets.ts`。
- 没有在组件中新增散落的企业图片硬编码路径。
- 核心官网页面没有 `<video>`。
- 核心官网页面没有 MP4 / WebM 请求。
- `public/images/enterprise` 图片没有水印、文字、Logo、HUD、UI 面板、假数据。
- ActivityOrbit 三条轨道的图片都能解释为真实活动计划。
- 如果使用 `image_gen` 新图，最终文件已经复制进 workspace。
- 新图没有只停留在 `$CODEX_HOME/generated_images`。
- 不删除任何未归档评审的资产；删除前必须列出引用状态和替代资产。

## V5.129 Automated Static Media Gate

发布前必须补齐以下证据：

- `npm run qa:award-preflight` 生成 `output/qa/v5.129-award-preflight.json`。
- 预检结果中 `static media source of truth` 为 `pass`。
- 预检结果中 `enterprise image data source coverage` 为 `pass`。
- 预检结果中 `enterprise asset role coverage` 为 `pass`。
- 预检结果中 `ActivityOrbit media allocation coverage` 为 `pass`。
- `npm run qa:goal-audit:report` 生成 `output/qa/v5.129-goal-completion-audit.json`。
- 如果预检通过但截图失败，以截图失败为准，继续精修视觉。

## V5.129 Evidence Version Checklist

发布前不得混用旧证据版本：

- 不使用 `output/qa/v5.122-award-preflight.json` 作为当前完成依据。
- 不使用 `output/qa/v5.123-fullsite-award-qa.json` 作为当前完成依据。
- 不使用 `output/qa/v5.123-goal-completion-audit.json` 作为当前完成依据。
- 必须按 `FITMEET_EVIDENCE_PROTOCOL.md` 生成当前版本证据。
- `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 必须逐项填写 v5.129 evidence 状态。

## V5.130 Homepage Screenshot Checklist

已产生首页局部视觉证据，但不能替代全站签收：

- `output/qa/v5.130-homepage-visual-screenshots/` 存在。
- 三个 hero 截图存在。
- 三个 ActivityOrbit 截图存在。
- `npm run typecheck` 已通过。
- `npm run build` 已通过。
- `npm run qa:award-preflight` 已通过。
- `npm run qa:goal-audit:report` 仍为 `INCOMPLETE`，这是正确状态。

发布前还必须完成：

- 全站核心页面 Chrome 视觉检查。
- 系统页面 Chrome 视觉检查。
- `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 从 Pending 改为真实签收结论。
