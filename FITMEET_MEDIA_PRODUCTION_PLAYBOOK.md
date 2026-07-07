# FitMeet Media Production Playbook

## V5.112 No-Video Website Override

当前官网 canonical 方向已经从 Runway/Pika 视频官网切换为无视频 `SignalPrism` 网站体系。

本文件中关于 `image_gen -> Runway/Pika -> ffmpeg -> CinematicVideoMedia` 的内容保留为历史视频生产参考，只适用于未来独立宣传片、广告片或非官网实验，不再作为当前官网完成门禁。

当前官网媒体链路：

`企业官网 PNG -> public/images/enterprise -> CinematicImage -> SVG / Canvas / CSS 3D -> GSAP / Chrome 验收`

硬规则：

1. 核心官网页面不使用 `<video>`。
2. 核心官网页面不请求 MP4、WebM 或 Runway/Pika 生成物。
3. 核心官网视觉来自真实图片、SignalPrism、Canvas 信号线、静态 poster 和活动 3D 轨道。
4. `image_gen` 只在现有图片不足时补静态摄影级图，不进入视频链路。
5. Chrome 验收必须检查核心页面 `videoCount === 0`。

## Canonical Docs

本文档定义 FitMeet 官网影像生产流程。任何视频、poster、关键帧接入必须遵守。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Pipeline

标准流程：

`image_gen -> Runway/Pika -> ffmpeg -> public assets -> CinematicVideoMedia -> Chrome 验收`

执行顺序：

1. 写清页面目标和镜头目标。
2. 用 `image_gen` 生成摄影级关键帧。
3. 用 Chrome 打开用户已登录的 Runway 或 Pika。
4. 上传关键帧，执行 image-to-video。
5. 下载 MP4。
6. 用 ffmpeg 转 WebM、截 poster、压缩。
7. 存入 `public/images/...` 和 `public/videos/...`。
8. 用 `CinematicVideoMedia` 接入。
9. 用 Chrome 检查桌面端真实效果。

## Tool Responsibilities

- `image_gen`：摄影级关键帧，不负责最终视频。
- Runway：正式 Hero、品牌大片、主视觉。
- Pika：中段实验镜头、潮流片段、免费额度测试。
- ffmpeg：转码、压缩、poster、裁切、循环。
- Chrome：操作 Runway/Pika 登录会话和页面验收。
- Creative Production：moodboard、shot intake、镜头语言选择。

暂不进入主流程：

- Fal：当前不作为主视频链路，除非 Runway/Pika 不可用。
- HeyGen：只适合未来创始人口播，不用于官网主视觉。
- Shutterstock：没预算时不使用授权素材。

## Asset Directories

图片：

`public/images/home-v5/`

视频：

`public/videos/home-v5/`

命名规则：

- `hero-night-run-social-world-poster.jpg`
- `hero-night-run-social-world.webm`
- `scene-court-dispatch-poster.jpg`
- `scene-court-dispatch.webm`
- `scene-citywalk-case-poster.jpg`
- `scene-citywalk-case.webm`
- `vision-arrival-network-poster.jpg`
- `vision-arrival-network.webm`

## Video Standards

硬规则：

1. 16:9。
2. 优先 1920x1080。
3. 4-6 秒循环。
4. 不黑场。
5. 不模糊。
6. 不抽象。
7. 视频内无文字。
8. 视频内无 Logo。
9. 视频内无 HUD、扫描线、小字、小几何。
10. 必须有真实人物、真实地点、真实动作。
11. 必须有 poster。
12. reduced-motion 下 poster 必须独立成立。

画面风格：

- 城市夜色。
- 红色路线光。
- 暖白人物和环境光。
- 真实场地纹理。
- 轻微未来感，但不能赛博朋克化。

## Core Video Lines

### 1. Hero Night Run

页面：

`/`

工具：

`image_gen -> Runway -> ffmpeg`

输出：

- `public/images/home-v5/hero-night-run-social-world-poster.jpg`
- `public/videos/home-v5/hero-night-run-social-world.webm`

关键帧 prompt：

```text
Photorealistic cinematic wide shot for a premium 2026 youth city lifestyle website. Night run scene in a modern city after rain, wet pavement reflecting warm street lights, two to three young adults preparing to run together near a public riverside route, subtle red route light on the ground, real location, real bodies, natural motion anticipation, high contrast black and warm white with controlled red accent, editorial sports lifestyle photography, no text, no logo, no HUD, no UI, no poster typography, no abstract shapes.
```

Runway motion prompt：

```text
Slow cinematic push-in. The runners shift naturally, city lights flicker softly, reflections move on wet pavement, subtle red route light pulses along the ground. Keep the scene realistic and premium. No text, no logo, no UI, no HUD. Smooth 5 second loop.
```

### 2. Dispatch Court

页面：

`/scenes` 或首页 Dispatch 段。

工具：

`image_gen -> Pika or Runway -> ffmpeg`

输出：

- `public/images/home-v5/scene-court-dispatch-poster.jpg`
- `public/videos/home-v5/scene-court-dispatch.webm`

关键帧 prompt：

```text
Photorealistic indoor badminton court at night, young adults arriving for a low-pressure game, public sports hall, clean court lines, overhead lights, rackets in hand, realistic social energy, premium editorial sports photography, black red warm white palette, no text, no logo, no HUD, no UI, no scoreboard text.
```

Motion prompt：

```text
Subtle camera drift across the court. Players enter the frame naturally, overhead lights shimmer, racket movement is restrained, social arrival energy. No text, no logo, no UI. Smooth short loop.
```

### 3. Citywalk Case

页面：

`/scenes` 或 Case 段。

工具：

`image_gen -> Pika -> ffmpeg`

输出：

- `public/images/home-v5/scene-citywalk-case-poster.jpg`
- `public/videos/home-v5/scene-citywalk-case.webm`

关键帧 prompt：

```text
Photorealistic citywalk scene at dusk, young adults walking through a public street corner with cafe light, crosswalk, convenience store glow, low pressure social mood, real urban texture, cinematic lifestyle photography, subtle red wayfinding light, no text, no logo, no HUD, no UI.
```

Motion prompt：

```text
Gentle handheld forward movement. People walk at a relaxed pace, storefront lights move softly, reflections shift on the street. Keep realistic, warm, low-pressure. No text or UI. Loopable 5 seconds.
```

### 4. Vision Arrival Network

页面：

`/community`、`/about` 或首页 Vision 段。

工具：

`image_gen -> Runway -> ffmpeg`

输出：

- `public/images/home-v5/vision-arrival-network-poster.jpg`
- `public/videos/home-v5/vision-arrival-network.webm`

关键帧 prompt：

```text
Photorealistic cinematic city night montage frame for a future social world company website. Multiple real public spaces connected visually: riverside running route, indoor sports court, board game cafe, city street crossing, young adults arriving in small groups, subtle red route light connecting spaces, premium enterprise vision mood, no text, no logo, no UI, no HUD.
```

Motion prompt：

```text
Slow cinematic parallax across connected city scenes. Small groups arrive naturally, red route light connects public spaces, city lights breathe softly. Premium enterprise vision, realistic motion, no text, no logo, no UI. Smooth 5 second loop.
```

## ffmpeg Recipes

Convert MP4 to WebM:

```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -an output.webm
```

Create poster:

```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg
```

Create compressed MP4 fallback:

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 22 -preset slow -an output.mp4
```

Crop to 16:9 center if needed:

```bash
ffmpeg -i input.mp4 -vf "crop=ih*16/9:ih" -c:v libx264 -crf 22 -an output-16x9.mp4
```

## CinematicVideoMedia Contract

接入示例：

```tsx
<CinematicVideoMedia
  src="/images/home-v5/hero-night-run-social-world-poster.jpg"
  posterSrc="/images/home-v5/hero-night-run-social-world-poster.jpg"
  videoSrc="/videos/home-v5/hero-night-run-social-world.webm"
  owner="hero-night-run-social-world-v5"
  width="1920"
  height="1080"
/>
```

规则：

- `src` 和 `posterSrc` 必须存在。
- `videoSrc` 不得指向不存在资源。
- 计划中的视频可以写入文档，但不能让页面发出 404 请求。
- 每个 media owner 必须对应页面和 section。

## Quality Gate

进入代码前先检查：

1. 是否有真实人物。
2. 是否有真实地点。
3. 是否有真实动作。
4. 是否没有文字和 Logo。
5. 是否能单帧作为 poster。
6. 是否不抽象。
7. 是否不遮挡网页文案。
8. 是否体积可控。

Chrome 验收：

- 首屏无黑场。
- 视频加载不导致文字跳动。
- reduced-motion 下 poster 完整。
- 桌面 1366/1440/1920 都不糊。

## V5.010 Media Readiness Note

当前页面已具备视频接入位，但正式获奖级视频仍未完成。

当前策略：

- Hero 暂用已有 `home-v3` cinemagraph WebM + `home-v4` poster。
- Enterprise 合作段暂用 `partner-arrival-value-poster.jpg`，不再使用偏暗 webm，避免黑块。
- 后续 Runway/Pika 视频必须优先替换：Hero 夜跑、Dispatch 球馆、Case 城市漫游、Vision 到场意图。
- 替换时只更新 `pageData.ts` 的 media source，不另起页面结构。

## V5.020 Keyframe Batch

本批次使用内置 `image_gen` 生成 4 张摄影级关键帧，并已复制进项目：

1. `public/images/home-v5/hero-night-run-social-world-keyframe.png`
2. `public/images/home-v5/scene-court-dispatch-keyframe.png`
3. `public/images/home-v5/scene-citywalk-case-keyframe.png`
4. `public/images/home-v5/vision-arrival-network-keyframe.png`

当前接入策略：

- `pageData.ts` 暂时使用这些 keyframe 作为主视觉 poster/image fallback。
- 不在页面里提前填写不存在的 `/videos/home-v5/*.webm`，避免黑场和 404。
- 旧 `home-v3` cinemagraph 不再覆盖 Hero、Court、Citywalk 的 V5 视觉方向。
- `CinematicVideoMedia` 保持 video-ready：当 Runway/Pika 输出完成后，只给对应 media asset 增加 `video` 字段。

下一步 Runway/Pika 任务：

1. Hero 夜跑：上传 `hero-night-run-social-world-keyframe.png` 到 Runway，生成 4-6 秒慢推循环。
2. Dispatch 球馆：上传 `scene-court-dispatch-keyframe.png` 到 Pika 或 Runway，生成低频到场动作循环。
3. Citywalk Case：上传 `scene-citywalk-case-keyframe.png` 到 Pika，生成街角同行短循环。
4. Vision 到场意图：上传 `vision-arrival-network-keyframe.png` 到 Runway，生成城市多场景连接大片。

验收重点：

- 视频必须沿用当前 keyframe 的黑红城市电影调性。
- 不能让 image-to-video 增加文字、Logo、HUD、UI 面板或可识别人脸特写。
- 不能让视频首帧比当前 keyframe 更黑、更糊、更抽象。
- 如果生成结果不稳定，页面继续保留 keyframe，不用低质量视频替换高质量静帧。

## V5.030 Runway/Pika Ingest Contract

当前新增项目文件：

1. `FITMEET_VIDEO_ASSET_MANIFEST.json`
2. `scripts/fitmeet-video-ingest.sh`
3. `public/videos/home-v5/.gitkeep`

目的：

- 让 Runway/Pika 下载回来的 MP4 进入一个确定的生产链路。
- 避免手动命名导致页面请求不存在视频。
- 避免低质量视频覆盖当前高质量 keyframe。
- 确保每条视频都有 WebM、MP4 archive 和 poster。

使用方式：

```bash
npm run media:ingest -- hero-night-run-social-world ~/Downloads/runway-hero.mp4
npm run media:ingest -- scene-public-plan-plaza ~/Downloads/pika-public-plan.mp4
npm run media:ingest -- scene-court-dispatch ~/Downloads/pika-court.mp4
npm run media:ingest -- scene-citywalk-case ~/Downloads/pika-citywalk.mp4
npm run media:ingest -- scene-weekend-trip ~/Downloads/pika-weekend.mp4
npm run media:ingest -- partner-arrival-value ~/Downloads/runway-partner.mp4
npm run media:ingest -- vision-arrival-network ~/Downloads/runway-vision.mp4
```

如果需要明确替换已有输出：

```bash
npm run media:ingest -- --force hero-night-run-social-world ~/Downloads/runway-hero-v2.mp4
```

脚本输出：

1. `public/videos/home-v5/<slug>.mp4`
2. `public/videos/home-v5/<slug>.webm`
3. `public/images/home-v5/<slug>-poster.jpg`

接入规则：

- 只有当生成视频通过视觉 QA 后，才允许在 `pageData.ts` 中加入 `video` 字段。
- 如果视频变黑、变糊、人物变形、加入文字或 HUD，不接入，继续使用 keyframe。
- `FITMEET_VIDEO_ASSET_MANIFEST.json` 是 Runway/Pika 提示词、路径、状态和页面媒体 key 的单一清单。

接入示例：

```ts
heroNightRun: {
  poster: "/images/home-v5/hero-night-run-social-world-poster.jpg",
  video: "/videos/home-v5/hero-night-run-social-world.webm",
  alt: "雨后城市夜路上年轻人准备夜跑的电影感画面"
}
```

## V5.040 Weekend Keyframe + Browser Automation Status

新增项目资产：

`public/images/home-v5/scene-weekend-trip-keyframe.png`

目的：

- 移除页面对旧 V3 weekend cinemagraph 的依赖。
- 让 `/scenes` 的周末短途段也进入 V5 真实影像系统。
- 在 Runway/Pika 视频未通过 QA 前，继续使用高清 keyframe，避免旧风格视频和黑场拖低整站质感。

当前 Chrome 状态：

- 已发现用户 Chrome 中存在 Runway 与 Pika 标签页。
- Runway 标签页在自动化读取 DOM 和截图时连续超时，无法安全进入上传流程。
- 本轮不得绕过登录、验证码、额度、权限或站点加载阻塞。
- 后续继续视频生产时，优先让用户手动确认 Runway/Pika 页面已稳定打开到 image-to-video 上传界面，再继续上传关键帧。

Weekend motion prompt：

```text
Gentle forward movement through a public city departure plaza after rain. Four young adults walk with backpacks toward a weekend day-trip meeting point, station lights reflect on wet pavement, subtle red route light slides along the ground. Keep realistic premium youth lifestyle motion, no text, no logo, no UI, no HUD. Loopable 5 seconds.
```

接入规则不变：

- 只有生成视频明显优于当前 keyframe，才允许加入 `video` 字段。
- 如果视频出现文字、Logo、HUD、UI、人物变形、黑场、模糊或 dating 语境，页面继续使用 keyframe。

## V5.050 Old V4 Media Removal

新增项目资产：

1. `public/images/home-v5/scene-public-plan-plaza-keyframe.png`
2. `public/images/home-v5/partner-arrival-value-keyframe.png`

目的：

- 移除 `streetPlaza` 对旧 `home-v4/social-world-street-plaza-poster.jpg` 的依赖。
- 移除 `partnerArrival` 对旧 `home-v4/partner-arrival-value-poster.jpg` 的依赖。
- 让 Agent Plan、Safety、Community、Product、Contact 相关视觉都进入 V5 真实影像体系。
- 保持页面只请求已存在的 keyframe，不请求尚未生成的视频。

新增视频 slug：

1. `scene-public-plan-plaza`
2. `partner-arrival-value`

对应命令：

```bash
npm run media:ingest -- scene-public-plan-plaza ~/Downloads/pika-public-plan.mp4
npm run media:ingest -- partner-arrival-value ~/Downloads/runway-partner.mp4
```

接入标准：

- `scene-public-plan-plaza` 只表达公开计划和边界确认，不出现可读屏幕内容。
- `partner-arrival-value` 只表达真实到场意图，不出现广告 dashboard、假指标、假 logo。
- 两者都必须保持真实公共空间、真实人物、真实动作，不能退回抽象科技海报。

## V5.062 Hero Video Production Status

当前 Hero 视频生产目标：

`hero-night-run-social-world`

当前输入状态：

- 关键帧存在：`public/images/home-v5/hero-night-run-social-world-keyframe.png`。
- 关键帧尺寸：`1672 x 941`，接近 16:9，可作为 Runway image-to-video 输入。
- 目标输出仍不存在：`public/videos/home-v5/hero-night-run-social-world.webm`。
- 当前站点不得请求该 WebM，继续使用 keyframe fallback。

当前 Chrome / Runway 状态：

- Chrome 中存在 Runway 标签页：`https://app.runwayml.com/.../ai-tools/generate`。
- Chrome 中存在 Pika 标签页：`https://pika.art/all?...`。
- Runway 页面在自动化读取页面状态时再次超时，无法安全确认当前是否处于 image-to-video 上传界面。
- 后续一次文档读取 / troubleshooting 读取也触发 Chrome 控制通道超时，说明当前问题是外部浏览器控制链路不稳定，不是 FitMeet 代码问题。

本轮决策：

- 不上传 `hero-night-run-social-world-keyframe.png`。
- 不尝试绕过 Runway/Pika 的加载、登录、验证码、额度或权限状态。
- 不生成低可信候选视频。
- 不把不存在或未验收的视频写入 `pageData.ts`。

继续条件：

1. 用户手动把 Runway 或 Pika 稳定打开到 image-to-video 上传界面，并明确告诉 Codex 页面已稳定。
2. 或者用户手动生成 Hero MP4 并放到本机下载目录。

手动生成后接入命令：

```bash
npm run media:ingest -- hero-night-run-social-world ~/Downloads/runway-hero.mp4
```

如果需要覆盖旧候选：

```bash
npm run media:ingest -- --force hero-night-run-social-world ~/Downloads/runway-hero-v2.mp4
```

接入前必须人工看视频：

1. 无文字、无 Logo、无 HUD、无 UI。
2. 无黑场、无明显模糊、无人物变形。
3. 比当前 keyframe 更真实、更有电影感、更适合 `Social World` 首屏。
4. 不把跑步场景变成广告片、健身房宣传片或 dating 氛围。

## V5.063 Local Cinematic Fallback

本轮新增临时 Hero 动态资产：

- 候选 MP4：`output/video-candidates/hero-night-run-social-world-local-push.mp4`
- 站点 MP4 archive：`public/videos/home-v5/hero-night-run-social-world.mp4`
- 站点 WebM：`public/videos/home-v5/hero-night-run-social-world.webm`
- Poster：`public/images/home-v5/hero-night-run-social-world-poster.jpg`

生成方式：

```bash
ffmpeg -loop 1 -i public/images/home-v5/hero-night-run-social-world-keyframe.png ...
npm run media:ingest -- hero-night-run-social-world output/video-candidates/hero-night-run-social-world-local-push.mp4
```

技术结果：

- WebM：`1920x1080`，`24fps`，`5.000000s`，约 `375KB`。
- MP4：`1920x1080`，`24fps`，`5.000000s`，约 `1.1MB`。
- Poster：`1920x1080`，无文字、无 Logo、无 HUD、无黑场。

产品判断：

- 这是本地 `ffmpeg` 生成的电影感推镜 fallback，不是 Runway/Pika 正式视频。
- 它用于让首页从纯静帧进入可播放的 cinematic 状态。
- 它不得替代最终 Runway Hero 生产任务。
- 后续 Runway 输出只要更真实、有真实身体动作且通过 QA，应替换该 fallback。

接入状态：

- `components/social-world-page/pageData.ts` 的 `heroNightRun` 已接入该 WebM。
- 其他场景仍保持 keyframe，避免全站伪动态化。

## V5.065 Agent Plan Local Cinematic Fallback

本文档优先级继续低于 `README.MD -> DESIGN.md -> FITMEET_INFORMATION_ARCHITECTURE.md -> FITMEET_COPY_SYSTEM.md -> FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md` 的 canonical 顺序。本次更新不替代 Runway/Pika 主流程，只解决当前 Agent Plan 区块仍偏静态、偏插画的问题。

### Connected asset

- Media key: `streetPlaza`
- Product role: Agent Plan / 公共计划边界 / 从一句需求进入真实公共场景
- Source keyframe: `public/images/home-v5/scene-public-plan-plaza-keyframe.png`
- Local candidate: `output/video-candidates/scene-public-plan-plaza-local-drift.mp4`
- Live WebM: `public/videos/home-v5/scene-public-plan-plaza.webm`
- Live MP4 backup: `public/videos/home-v5/scene-public-plan-plaza.mp4`
- Poster: `public/images/home-v5/scene-public-plan-plaza-poster.jpg`

### Asset judgment

This fallback is acceptable because it makes the section more concrete: real night plaza, visible young people, public-space lighting, red route reflection, no text, no logo, no HUD. It is still not final award-level video because it is generated from a single keyframe with local camera drift rather than true Runway/Pika image-to-video motion.

### Next media priority

The next replacement should be a Runway or Pika image-to-video pass that preserves the same composition but adds real human micro-motion: small posture shifts, pavement reflection movement, background passerby motion, and a stable 5 second loop. The video must still contain no text, no interface layer, no logo, and no artificial data visualization.

## V5.067 Real People Citywalk Local Cinematic Fallback

本文档继续低于 canonical docs。本次更新服务首页 Real People 区块，目标是减少“真人最后出现”段落的静态感和抽象感。

### Connected asset

- Media key: `citywalk`
- Product role: Real People / 低压力同行 / 计划之后真人自然出现
- Source keyframe: `public/images/home-v5/scene-citywalk-case-keyframe.png`
- Local candidate: `output/video-candidates/scene-citywalk-case-local-drift.mp4`
- Live WebM: `public/videos/home-v5/scene-citywalk-case.webm`
- Live MP4 backup: `public/videos/home-v5/scene-citywalk-case.mp4`
- Poster: `public/images/home-v5/scene-citywalk-case-poster.jpg`

### Asset judgment

This fallback is acceptable because it shows real street-level citywalk energy: young people moving through a public night street, wet pavement, convenience-store light, red reflection, no UI, no text, no logo, no dating framing. It directly supports the copy `真人最后出现。` and avoids avatar-wall behavior.

### Next media priority

Pika should replace this local drift with real walking micro-motion: subtle steps, passing light, road reflection movement, and a natural loop. Do not add screen overlays, subtitles, app UI, social feed cards, or facial close-ups.

## V5.069 Social World Vision Local Cinematic Fallback

本文档继续低于 canonical docs。本次更新服务首页最终 Social World / Vision 收束段，目标是让“城市里的计划连成世界”不再停留在静态关键帧。

### Connected asset

- Media key: `cityNetwork`
- Product role: Social World / 城市计划网络 / 企业愿景收束
- Source keyframe: `public/images/home-v5/vision-arrival-network-keyframe.png`
- Local candidate: `output/video-candidates/vision-arrival-network-local-parallax.mp4`
- Live WebM: `public/videos/home-v5/vision-arrival-network.webm`
- Live MP4 backup: `public/videos/home-v5/vision-arrival-network.mp4`
- Poster: `public/images/home-v5/vision-arrival-network-poster.jpg`

### Asset judgment

This fallback is acceptable because it connects multiple real city contexts: court, riverside, crossing, social venue, and arrival route. It supports the enterprise vision without becoming a fake data dashboard, abstract HUD, or AI SaaS graphic.

### Next media priority

Runway should replace this local parallax with real cinematic motion: soft city light movement, water reflection movement, subtle group movement, and route-light continuity. Do not add numbers, charts, maps, dashboards, subtitles, app UI, or fake partner logos.

## V5.071 Scenes Court and Weekend Local Cinematic Fallbacks

本文档继续低于 canonical docs。本次更新服务 `/scenes` 页面，目标是让场景页不再只依赖静态关键帧，而是展示真实可到场的运动集合和周末出发场景。

### Connected assets

- Media key: `court`
- Product role: Scenes hero / Court / 公开球馆 / 低压力运动集合
- Source keyframe: `public/images/home-v5/scene-court-dispatch-keyframe.png`
- Local candidate: `output/video-candidates/scene-court-dispatch-local-drift.mp4`
- Live WebM: `public/videos/home-v5/scene-court-dispatch.webm`
- Live MP4 backup: `public/videos/home-v5/scene-court-dispatch.mp4`
- Poster: `public/images/home-v5/scene-court-dispatch-poster.jpg`

- Media key: `weekend`
- Product role: Weekend / 公开交通节点 / 有边界的短途出发
- Source keyframe: `public/images/home-v5/scene-weekend-trip-keyframe.png`
- Local candidate: `output/video-candidates/scene-weekend-trip-local-drift.mp4`
- Live WebM: `public/videos/home-v5/scene-weekend-trip.webm`
- Live MP4 backup: `public/videos/home-v5/scene-weekend-trip.mp4`
- Poster: `public/images/home-v5/scene-weekend-trip-poster.jpg`

### Asset judgment

Court is acceptable because it shows a real sports venue, visible action, and small-group arrival without profile UI or dating cues. Weekend is acceptable because it shows a public transit-adjacent departure scene with young people moving together, clear public-space boundaries, no text, no logo, and no HUD.

### Next media priority

Pika should replace these local drifts with true micro-motion: racket swings, foot movement, court light movement, wet pavement reflection, and public departure movement. Do not add scoreboards, fake stats, app UI, dating cards, subtitles, or brand logos.

---

## V5.073 Scenes Night Run Local Cinematic Fallback

本文档继续低于 canonical docs。本次更新服务 `/scenes` 的 Night Run 区块，目标是消除场景页最后一个静态关键帧缺口，让夜跑、球馆、城市漫游、周末短途都进入 motion-ready 的真实影像系统。

Asset:
- Media key: `nightRun`
- Product role: Scenes Night Run / 公开夜跑路线 / 低压力到场场景
- Source keyframe: `public/images/home-v5/hero-night-run-social-world-keyframe.png`
- Candidate MP4: `output/video-candidates/scene-night-run-local-drift.mp4`
- WebM: `public/videos/home-v5/scene-night-run.webm`
- MP4 archive: `public/videos/home-v5/scene-night-run.mp4`
- Poster: `public/images/home-v5/scene-night-run-poster.jpg`

Production method:
- Local `ffmpeg` zoompan from the existing V5 Hero Night Run keyframe.
- Output duration: five seconds.
- Output size: `1920x1080`.
- Output fps: `24`.
- Video contains no text, no logo, no HUD, no UI.

Why this is acceptable now:
- The source image is already a photorealistic night-running city scene with young people, wet pavement, public route context, and redline direction.
- The fallback fixes the immediate product problem: `/scenes` Night Run no longer depends on a static keyframe while the rest of the page uses motion media.
- The fallback is clearly marked as local and temporary.

What this is not:
- It is not Runway/Pika final image-to-video.
- It is not enough to claim final award-level media.
- It should be replaced by Runway/Pika when external generation is stable and the output has stronger human micro-motion than the local drift.

Next media priority:
- Runway should generate a dedicated Night Run image-to-video asset with realistic foot movement, pavement reflection movement, skyline light movement, and stable five-second looping.
- Do not add subtitles, route labels, app UI, dating cards, HUD elements, fake stats, or brand logos.

## V5.085 System Pages Media Rule

System pages do not use video as a primary asset.

Reason:

- Privacy, Terms, Cookies, 404, and Thank You pages must optimize trust, readability, and fast recovery.
- Video belongs to cinematic brand/product storytelling, not legal or system confirmation surfaces.
- Keeping system pages static improves perceived reliability and avoids accidental black frames or visual distraction.

Allowed media:

- Existing FitMeet F logo.
- CSS background grid and red diagonal slices.
- Static protocol panels.

Disallowed media:

- Runway/Pika video loops.
- Abstract SVG hero illustration.
- HUD-style graphics.
- Fake partner logos or fake trust badges.

## V5.088 Partner Arrival Fallback + Final Queue

This update closes the last V5 media gap where `partnerArrival` was still a static keyframe-only asset.

Connected asset:
- Media key: `partnerArrival`
- Product role: enterprise cooperation / real arrival intent / business value through real scenes
- Source keyframe: `public/images/home-v5/partner-arrival-value-keyframe.png`
- Local candidate: `output/video-candidates/partner-arrival-value-local-drift.mp4`
- Live WebM: `public/videos/home-v5/partner-arrival-value.webm`
- Live MP4 backup: `public/videos/home-v5/partner-arrival-value.mp4`
- Poster: `public/images/home-v5/partner-arrival-value-poster.jpg`

Important judgment:
- This is a local `ffmpeg` cinematic fallback, not Runway/Pika final output.
- It is acceptable because it removes a static-only enterprise value asset and keeps the site video-ready.
- It must be replaced by Runway/Pika final media when a stronger image-to-video export is available.

New production control sheet:
`FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md`

That document is now the operational queue for external video generation and replacement.

## V5.089 Partner Arrival Browser Acceptance

The `partner-arrival-value` local cinematic fallback is now visible in the live enterprise cooperation route.

Route connection:
- Page: `/contact#enterprise`
- Component: `ContactExperienceClient` enterprise media block
- Video: `public/videos/home-v5/partner-arrival-value.webm`
- Poster: `public/images/home-v5/partner-arrival-value-poster.jpg`

Validation:
- `npm run typecheck` passed.
- `npm run build` passed with only the existing static-generation `z-index is currently not supported` warning.
- Chrome desktop QA passed for `1366x900`, `1440x1000`, and `1920x1080`.
- Reduced-motion QA passed at `1440x1000`; video is removed and poster is rendered.

Evidence:
`output/chrome-partner-v5088/partner-arrival-qa-results.json`

Production judgment:
The fallback is acceptable as a connected website asset and removes the previous static-only enterprise media gap. It remains a local fallback and must still be replaced by a stronger Runway/Pika image-to-video export before award-submission positioning.

## v5.109 Cleanup + Media Reset

旧 v5.090-v5.099 的 Runway/Pika 输入包、旧关键帧、旧上传 handoff 和废弃队列已清理，不再作为生产依据。

当前媒体生产以 `FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md` 为准。所有新图像先由 GPT 生成摄影级关键帧，再进入 Runway/Pika：Runway 负责 Hero 与品牌级镜头，Pika 负责更潮流、更短促的中段实验镜头。

硬规则不变：视频内无文字、无 Logo、无 HUD；文案只由 HTML 层叠加；输出必须包含 `mp4`、`webm` 和 poster；不使用抽象 SVG 插画替代真实影像。

## V5.100 Batch Ingest Pipeline

After Runway/Pika exports are generated and visually accepted, use the batch ingest path instead of manually running eight separate commands.

Accepted download directory:
`output/runway-downloads/home-v5`

Recommended filenames:
- `hero-night-run-social-world.mp4`
- `partner-arrival-value.mp4`
- `scene-public-plan-plaza.mp4`
- `vision-arrival-network.mp4`
- `scene-court-dispatch.mp4`
- `scene-citywalk-case.mp4`
- `scene-night-run.mp4`
- `scene-weekend-trip.mp4`

Command:
```bash
npm run media:ingest:batch -- --force --verify
```

Important fix:
`scene-night-run` is now accepted by the single-asset ingest script. Before V5.100, the handoff queue referenced it but the script whitelist did not include it.

Rule:
Only place accepted MP4/MOV files in the downloads directory. Reject outputs with text, logo, HUD, UI, dashboard, charts, map pins, fake metrics, dating mood, black first frame, severe blur, unstable bodies, broken hands, rubber legs, or warped scene geometry.

## v5.102 Video Asset Audit

本文档优先级：媒体生产规则。它约束 `image_gen -> Runway/Pika -> ffmpeg -> public assets -> CinematicVideoMedia`，低于 `DESIGN.md` 的视觉方向，高于临时上传说明。

新增命令：

```bash
npm run media:audit
```

该命令用 `ffprobe` 检查 8 条官网视频资产：

- `public/videos/home-v5/<slug>.mp4`
- `public/videos/home-v5/<slug>.webm`
- `public/images/home-v5/<slug>-poster.jpg`

技术通过条件：

- `1920x1080`。
- 4-6 秒循环，本项目当前目标为 5 秒。
- 无音轨。
- poster 存在且为 `1920x1080`。
- 单条视频体积不超过首页循环的优先目标。

最终媒体接受条件另算：

- `output/runway-downloads/home-v5/<slug>.mp4` 或 `.mov` 必须存在。
- 这些文件必须来自人工接受的 Runway/Pika 输出。
- 技术通过不等于视觉通过；本地 fallback 只能证明格式，不证明获奖级影像。

严格最终检查命令：

```bash
npm run media:audit -- --strict-final
```

当 Runway/Pika 接受源视频还没有放入下载目录时，严格检查必须失败。这样可以避免把“已有本地视频”误判为“最终媒体完成”。

## v5.103 Reduced-Motion Video Contract

`CinematicVideoMedia` 的约束更新：

- 有视频资源时，DOM 中必须保留 `<video>` 节点，便于资产检测和最终 QA。
- `prefers-reduced-motion: reduce` 下不自动播放，依靠 poster 呈现静态画面。
- reduced-motion 不允许用 `<img>` 完全替换视频节点，因为这会让 Chrome 验收误判为没有接入视频资产。
- 最终视觉仍以人工接受的 Runway/Pika 源视频为准。

## v5.106 Final Media Blocker Handling

当前最终媒体状态：

```text
output/qa/v5.106-runway-pika-chrome-attempt.json
```

本次尝试确认：Runway/Pika 页面可见状态不足以证明最终视频完成。奖项级官网必须保留源视频证据链：

1. `image_gen` 摄影级关键帧。
2. Runway/Pika 接受后的 MP4/MOV 源导出。
3. `output/runway-downloads/home-v5/<slug>.mp4` 或 `.mov`。
4. `npm run media:ingest:batch -- --force --verify`。
5. `npm run media:audit -- --strict-final`。
6. Chrome 桌面最终人工视觉验收。

在 Chrome 控制不可用时，不允许绕过 Runway/Pika，不允许用 AppleScript 或其他浏览器脚本代替插件控制，也不允许把 fallback public 视频标记为最终媒体。


## v5.107 Manual Export Fallback

如果 Chrome 能列出 Runway/Pika 标签页，但重型页面截图或 DOM 检查超时，应停止自动化生成流程，改用人工导出兜底。

人工导出目录仍固定为：

```text
output/runway-downloads/home-v5
```

必须放入以下 accepted MP4/MOV：

- `hero-night-run-social-world.mp4`
- `partner-arrival-value.mp4`
- `scene-public-plan-plaza.mp4`
- `vision-arrival-network.mp4`
- `scene-court-dispatch.mp4`
- `scene-citywalk-case.mp4`
- `scene-night-run.mp4`
- `scene-weekend-trip.mp4`

放入后执行：

```bash
npm run media:ingest:batch -- --force --verify
npm run media:audit -- --strict-final
npm run qa:goal-audit
```

## v5.108 Media Redesign Direction

上一批媒体提示词的问题：场景过于重复，过度依赖雨夜红线，容易生成抽象科技海报，不能充分表达“社交 Agent 让真实计划发生”。

新的媒体设计文档：

```text
FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md
```

新规则：

- 仍保留当前 8 条最终文件名，避免破坏 ingest 脚本、manifest 和页面引用。
- 重新生成图片时优先使用 `v5.108` 文档中的 GPT 图片提示词。
- Runway/Pika 生成视频时使用同一文档中的视频提示词。
- 红色不再是悬浮路线主角，只允许作为环境光、门框、地面反射、服装细节或真实道具。
- 每个场景必须有真实人物、真实空间、真实动作、真实到场理由。
## V5.128 Canonical No-Video Media Override

当前官网媒体生产以 `FITMEET_STATIC_MEDIA_GOVERNANCE.md` 为准。

本文件中旧的 Runway/Pika/ffmpeg/CinematicVideoMedia 内容全部降级为历史参考，只适用于未来独立宣传片、广告片、社交媒体素材或非官网实验。

官网当前禁止：

- 新增 `<video>`。
- 请求 MP4 / WebM 作为核心官网体验。
- 把 Runway/Pika fallback 视频重新接入首页。
- 把本地 ffmpeg drift/parallax 文件标记为最终官网资产。

官网当前允许：

- 使用 `public/images/enterprise/*.png` 作为真实生活影像。
- 使用 SVG / Canvas / CSS 3D 构建 SignalPrism、SignalLineCanvas、SafetyShell、ActivityOrbit。
- 必要时用 `image_gen` 补静态摄影级图片，但必须复制进 workspace。
- 后续做 WebP / AVIF 派生优化，但不得覆盖原始 PNG。

当前主链路：

`企业官网精选 PNG -> public/images/enterprise -> enterpriseAssets.ts -> CinematicImage -> SVG / Canvas / CSS 3D -> GSAP ScrollTrigger -> Chrome desktop visual acceptance`
