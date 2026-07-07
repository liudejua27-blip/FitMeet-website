# FitMeet 2026 企业官网

## V5.112 Full-Site No-Video Direction

当前 canonical 方向：FitMeet 官网核心页面不使用视频。

范围：

- `/`
- `/product`
- `/scenes`
- `/community`
- `/safety`
- `/about`
- `/journal`
- `/contact`
- 系统页 `/privacy`、`/terms`、`/cookies`、`/not-found`、`/thank-you`

当前实现原则：

1. 不使用 `<video>`。
2. 不请求 MP4 / WebM。
3. 不把 Runway/Pika/ffmpeg 作为官网完成门禁。
4. 使用真实静态影像、SignalPrism、Canvas、CSS 3D、GSAP 和中文短句完成企业级叙事。
5. 旧视频 manifest、ingest 脚本、媒体审计脚本只保留为历史和未来独立宣传片基础设施，不参与当前官网验收。

当前最高执行顺序：

`页面结构 -> 品牌叙事 -> 关键视觉 -> SignalPrism 交互 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

## Canonical Docs

本仓库以以下文档为最高优先级。后续 agent、工程师、设计师必须按顺序阅读：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`
9. `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md`
10. `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`

历史文档处理：

- `FITMEET_HOMEPAGE_*` 是首页历史演进记录，只能作为参考，不再覆盖整站信息架构。
- `FITMEET_MULTI_PAGE_DESIGN_PLAN.md` 是旧辅助页面方案，只能作为历史辅助页参考。
- `FITMEET_CIPHER_SOCIAL_REBUILD_STANDARD.md` 保留 Cipher 方法论，但以 `DESIGN.md` 为最终设计标准。
- `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md` 是最终人工视觉签收矩阵，配合 Chrome/Playwright evidence 使用。
- `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 是最终签收报告模板，未填写 evidence 前不能作为完成证明。

## Project Positioning

FitMeet 官网不是普通 AI 社交官网，也不是功能卡片型 SaaS landing page。它是一个面向年轻人的城市生活平台企业官网。

核心创意：

`Social World：一句想法，变成一次真实到场。`

主叙事：

1. 用户说出一个真实想法。
2. 社交 Agent 理解活动、时间、地点、强度、人数和边界。
3. 公开场景先成立。
4. 合适的人最后出现。
5. 一个个真实计划连接成 Social World。

全站必须中文优先。`FitMeet`、`Social World`、`Agent` 可以作为品牌词保留英文。

## Execution Order

任何新设计、新页面、新资产或重构必须按这个顺序推进：

`页面结构 -> 品牌叙事 -> 关键视觉 -> SignalPrism 交互 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`

不要从插件、特效或视频开始。当前首页 canonical 方向为无视频 `Interactive Social Signal System`：使用现有真实 PNG、SVG、Canvas、CSS 3D 和 GSAP，不使用 `<video>`、MP4 或 WebM 作为首页主视觉。

## Core Pages

最终官网按 `8 个核心页面 + 5 个系统页面` 设计。

核心页面：

1. `/` Home：首页，建立 `Social World` 记忆。
2. `/product` Product：解释 FitMeet 如何把需求变成真实计划。
3. `/scenes` Use Cases：夜跑、球馆、桌游、城市漫游、周末短途。
4. `/community` Community：城市生活网络、社区复访、Social World 城市层。
5. `/safety` Trust & Safety：公开地点、退出机制、举报机制、隐私和未成年人边界。
6. `/about` About：现在计划、行业痛点、3-5 年展望、最终愿景。
7. `/journal` Journal：产品进展、城市观察、技术实验、合作动态。
8. `/contact` Contact / Waitlist：个人体验、企业合作、测试加入。

系统页面：

1. `/privacy`
2. `/terms`
3. `/cookies`
4. `/not-found`
5. `/thank-you`

当前仓库已有 `/world`、`/agent`、`/stories`、`/partners` 等历史路由。它们可以保留为兼容入口或后续重定向，但新信息架构以以上 8 个核心页面为准。

## Technical Stack

当前项目使用：

- Next.js App Router
- React
- TypeScript
- GSAP
- `@gsap/react`
- ScrollTrigger

当前官网生产工具链：

- `企业官网/*.png`：真实青年城市生活图片源。
- SVG / Canvas / CSS 3D：SignalPrism、城市信号线、活动轨道和安全壳。
- GSAP + ScrollTrigger：滚动叙事和 section 进场。
- Chrome：桌面端鼠标交互、滚动和截图验收。
- `image_gen`：仅在现有图片不足时生成新的摄影级静态关键图；不作为默认动作。
- Runway / Pika / ffmpeg：保留为未来独立宣传片或外部视频实验，不参与当前官网实现门禁。

## Local Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run qa:award-preflight
npm run qa:chrome-fullsite
npm run qa:goal-audit:report
```

文档修改不强制运行构建。页面代码、路由、metadata、视频接入或组件改动后必须至少运行：

```bash
npm run typecheck
npm run build
```

## Non-Negotiable Design Rules

必须做到：

1. 首页 3 秒内建立 `Social World` 记忆。
2. 首屏少文案，可以只保留 `Social World`。
3. 关键视觉必须真实、高清、具体，不依赖抽象海报。
4. 所有核心页面中文优先。
5. 安全与边界必须早于真人出现。
6. 企业合作必须表达更精准用户、更省时、更高效和未来效益。
7. Journal 必须承担 SEO 和长期内容增长。
8. 核心官网页面不得使用 `<video>`、MP4 或 WebM；reduced-motion 下信息必须仍完整。

禁止：

1. 卡片墙。
2. 头像墙。
3. 普通 AI SaaS 紫蓝渐变。
4. 小 HUD、小字、小点、小几何遮挡文案。
5. 视频内嵌文字、Logo、扫描线。
6. 假数据、假合作方、假 logo。
7. dating 语境，例如陌生人速配、附近异性、灵魂伴侣。
8. 把 Agent 表现成聊天机器人或拟人吉祥物。

## Acceptance

最终验收以 Chrome 桌面为准：

- `1366x900`
- `1440x1000`
- `1920x1080`

通过标准：

- 无横向溢出。
- 无文案重叠。
- 无黑场。
- 无小碎片遮挡。
- 核心官网页面无 `<video>` 节点，SignalPrism / Canvas / 图片层和静态影像加载正常。
- SEO metadata 存在。
- Trust & Safety 完整。
- 企业合作邮箱 `15253005312@163.com` 可见。
- `npm run typecheck` 和 `npm run build` 在代码改动后通过。

## Implementation Note - V5 Canonical Route Shell

当前实现已进入 `V5 Canonical Route Shell`：

- 8 个核心页面已落到 canonical routes：`/`、`/product`、`/scenes`、`/community`、`/safety`、`/about`、`/journal`、`/contact`。
- 5 个系统页面已落到 routes：`/privacy`、`/terms`、`/cookies`、`/not-found`、`/thank-you`，并提供 root `not-found.tsx`。
- 新增统一组件 `components/social-world-page/SocialWorldPage.tsx`，用于保持页面结构、品牌叙事、真实影像、CTA 和 GSAP motion owner 一致。
- 历史入口 `/agent`、`/world`、`/stories`、`/partners`、`/join`、`/cities`、`/press`、`/investors`、`/faq` 已收敛为 canonical route redirect。

后续页面实现必须优先增强 `SocialWorldPage` 和 `pageData.ts`，不要继续扩写旧 V3/V4 页面补丁链。

## V5.111 SignalPrism No-Video Homepage Evidence

当前首页已经切换为 `SignalPrismHomepage`：

- 首页入口：`app/page.tsx`
- 首页组件：`components/signal-prism-homepage/SignalPrismHomepage.tsx`
- 图片数据源：`components/signal-prism-homepage/enterpriseAssets.ts`
- 样式系统：`components/signal-prism-homepage/signal-prism-homepage.module.css`

本轮验收结果：

- `npm run typecheck` passed.
- `npm run qa:award-preflight` passed, evidence: `output/qa/v5.111-award-preflight.json`.
- `npm run build` passed, evidence log: `output/qa/v5.111-build.log`.
- Chrome homepage QA passed, evidence: `output/qa/v5.111-signalprism-homepage-qa.json`.
- Desktop screenshots: `output/qa/v5.111-signalprism-homepage-1366x900.png`, `output/qa/v5.111-signalprism-homepage-1440x1000.png`, `output/qa/v5.111-signalprism-homepage-1920x1080.png`.
- Reduced-motion screenshot: `output/qa/v5.111-signalprism-homepage-reduced-1440x1000.png`.

Key verified facts:

- 首页 `<video>` 节点数为 `0`。
- 首页没有 MP4/WebM 请求。
- `Social World` 在 `1366x900`、`1440x1000`、`1920x1080` 均可见且未裁切。
- `SignalLineCanvas` 存在。
- `ActivityOrbit` 渲染 15 个活动卡片。
- `SafetyShell` 渲染 6 条边界规则。
- reduced-motion 下信息完整。
- OpenGraph `z-index` build warning 已清理。

当前 goal 状态：

- `npm run qa:goal-audit:report` 输出 `INCOMPLETE`，但没有 hard failure。
- blocker 只剩整站最终视觉签收：当前证据证明首页无视频方向，不证明所有核心页面已经达到最终奖项级。

## V5.083 Contact / Enterprise Cooperation Implementation Evidence

Priority: this entry is part of the canonical execution trail for the 2026 award-level FitMeet website goal.

`/contact` is now a dedicated desktop-first conversion and enterprise cooperation page, not a generic form page. It follows the fixed website direction: `页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`.

Implementation evidence:
- Page: `/contact`
- Files: `app/contact/page.tsx`, `app/contact/ContactExperienceClient.tsx`, `app/contact/contact.module.css`
- QA evidence: `output/chrome-contact-v5083/contact-qa-results.json`
- Key screenshots: `contact-hero-1440x1000.png`, `contact-routes-1440x1000.png`, `contact-enterprise-1440x1000.png`, `contact-final-direct-1440x1000.png`, `contact-reduced-1440x1000.png`
- Engineering gates: `npm run typecheck` passed; `npm run build` passed.

Non-negotiable page rules:
- Keep `15253005312@163.com` visible as the enterprise cooperation email.
- Keep the page split into three paths: personal early access, enterprise cooperation, and safety boundary.
- Do not replace this page with a soft SaaS form, fake partner logos, fake metrics, dating language, avatar walls, or generic card-wall layout.
- Desktop visual quality is the priority; mobile is not a design target for this phase.

## V5.084 Journal / Content Growth Implementation Evidence

Priority: this entry is part of the canonical execution trail for the 2026 award-level FitMeet website goal.

`/journal` is now a dedicated desktop-first content growth page, not a generic page shell and not a normal blog card wall. It explains Social World through product progress, city observation, technical experiments, and cooperation updates.

Implementation evidence:
- Page: `/journal`
- Files: `app/journal/page.tsx`, `app/journal/JournalExperienceClient.tsx`, `app/journal/journal.module.css`
- QA evidence: `output/chrome-journal-v5084/journal-qa-results.json`
- Key screenshots: `journal-hero-1440x1000.png`, `journal-feed-1440x1000.png`, `journal-filter-lab-1440x1000.png`, `journal-seo-1440x1000.png`, `journal-rules-1440x1000.png`, `journal-reduced-1440x1000.png`
- Engineering gates: `npm run typecheck` passed; `npm run build` passed.

Non-negotiable page rules:
- Keep Journal as the long-term SEO and brand explanation layer.
- Keep the four content rails: product progress, city observation, technical experiments, cooperation updates.
- Keep content claims grounded. No fake research data, fake metrics, fake partnerships, or vague AI trend essays.
- Journal may use light poster media, but should not become a heavy video page.

## V5.085 System Trust Pages Implementation Evidence

System pages are now implemented as dedicated trust/protocol pages instead of generic marketing wrappers.

Implemented routes:

- `/privacy`: privacy boundary and data context rules.
- `/terms`: real social contract and prohibited behavior rules.
- `/cookies`: explainable Cookie and future consent rules.
- `/not-found`: explicit Social World 404 route.
- `app/not-found.tsx`: root-level missing route fallback.
- `/thank-you`: signal received and next-step confirmation page.

Implementation files:

- `components/system-trust-page/SystemTrustPage.tsx`
- `components/system-trust-page/SystemTrustPage.module.css`
- `components/system-trust-page/systemPageData.ts`

Verification evidence:

- `npm run typecheck`: passed.
- `npm run build`: passed.
- Chrome desktop QA: `output/chrome-system-v5085/system-qa-results.json`.
- Checked viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Checked reduced motion: `1440x1000` across system routes.
- Screenshot set: `output/chrome-system-v5085/system-*-1440x1000.png`.

Design lock:

- System pages must stay lightweight, direct, and trust-oriented.
- Do not add video to system pages.
- Do not add decorative HUD, abstract SVG illustration, avatar walls, fake metrics, fake logos, or dating language.
- Keep the black/red hard-edge Social World visual system.

## V5.086 Full-Site Continuity Correction

Priority: canonical goal evidence for the 2026 award-level website direction.

This pass corrects the first full-site Chrome audit issues instead of treating individual page QA as enough. The goal remains the full website standard: `页面结构 -> 品牌叙事 -> 关键视觉 -> Runway/Pika 视频 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收`.

Changes locked in this pass:
- `/product` now includes the exact product promise `真实计划` in visible hero copy.
- `/scenes` hero title is shortened to `先有具体的事。` so the first viewport reads as a designed desktop website, not a cropped poster.
- `/scenes` desktop hero title sizing is constrained separately from the `Social World` homepage title and locked to one readable line.
- Full-site QA target is `output/chrome-fullsite-v5087/fullsite-award-qa-results.json`.

Design implication:
- Do not use long Chinese hero sentences inside the shared giant `SocialWorldPage` H1 treatment. Long explanation belongs in subtitle/body copy.

## V5.087 Full-Site Chrome Acceptance Evidence

Current full-site correction is verified.

Evidence:
- `npm run typecheck`: passed.
- `npm run build`: passed with the existing static-generation `z-index is currently not supported` warning only.
- Chrome full-site QA: `output/chrome-fullsite-v5087/fullsite-award-qa-results.json`.
- Total checks: 52.
- Failure count: 0.
- Checked routes: `/`, `/product`, `/scenes`, `/community`, `/safety`, `/about`, `/journal`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/not-found`, `/thank-you`.
- Checked desktop viewports: `1366x900`, `1440x1000`, `1920x1080`.
- Checked reduced-motion viewport: `1440x1000`.

Key screenshot evidence:
- `output/chrome-fullsite-v5087/fullsite-scenes-1440x1000.png`
- `output/chrome-fullsite-v5087/fullsite-product-1440x1000.png`
- `output/chrome-fullsite-v5087/fullsite-home-1440x1000.png`

## V5.088 Media Production Progress

Current media state:
- All key Social World media slots now have either a live WebM fallback or a safe poster fallback.
- `partnerArrival` now has a local cinematic fallback and is connected through `CinematicVideoMedia`.
- A dedicated external production queue now exists: `FITMEET_RUNWAY_PIKA_PRODUCTION_QUEUE.md`.

Important boundary:
- Local fallback video is not final award-level media.
- Runway/Pika final exports are still required before calling the site fully award-submission ready.

## V5.089 Partner Arrival Route Fix

`partner-arrival-value` is now connected to an active visible route, not only defined in shared media data.

Changed route:
- `/contact#enterprise`

Validated asset:
- `public/videos/home-v5/partner-arrival-value.webm`
- `public/images/home-v5/partner-arrival-value-poster.jpg`

Validation:
- `npm run typecheck`: passed.
- `npm run build`: passed with only the existing `z-index is currently not supported` warning.
- Chrome desktop QA: `output/chrome-partner-v5088/partner-arrival-qa-results.json`.
- Screenshots: `output/chrome-partner-v5088/partner-contact-enterprise-final-1440x1000.png` and `output/chrome-partner-v5088/partner-contact-enterprise-final-reduced-1440x1000.png`.

Boundary:
This closes the visible route connection for the local fallback. The site is still not final award-submission ready until Runway/Pika final media replaces the local fallback set.

## v5.109 Cleanup + Media Reset

旧 `output/runway-inputs` 上传包、v3/v4 媒体、首页历史文档和旧 handoff 已清理。后续图片与视频生成不再使用 v5.090-v5.099 的旧提示词。

当前媒体方向以 `FITMEET_V5_108_MEDIA_REDESIGN_PROMPTS.md` 为准：先用 GPT 生成摄影级关键帧，再进入 Runway/Pika 做 image-to-video，最后用 `ffmpeg` 转 WebM、截 poster，并接入 `public/videos/home-v5` 与 `public/images/home-v5`。

## V5.100 Batch Ingest Pipeline Ready

The project now supports batch ingest after Runway/Pika video generation.

Accepted downloads directory:
`output/runway-downloads/home-v5`

Command after accepted videos are downloaded:
```bash
npm run media:ingest:batch -- --force --verify
```

This command ingests any accepted files found in the downloads directory, then runs `npm run typecheck` and `npm run build` when `--verify` is used.

`scene-night-run` is now included in the single ingest script whitelist, so all eight queued media slugs can be ingested through the same pipeline.

## v5.101 Award Preflight

本项目新增本地奖项级预检：

```bash
npm run qa:award-preflight
```

它用于在进入 Runway/Pika 最终视频 ingest 和 Chrome 桌面验收前，快速确认页面结构、Canonical Docs、媒体生产链路、禁用文案、企业合作邮箱、CinematicVideoMedia 接入和 GSAP 生产卫生没有偏离 `Social World：一句想法，变成一次真实到场。` 的最终目标。

该命令不是最终验收。最终完成仍必须有真实可接受的 Runway/Pika 视频、`ffmpeg` ingest、`npm run typecheck`、`npm run build` 和 Chrome 桌面视觉验收。

## v5.102 Video Asset Audit

新增视频资产检查：

```bash
npm run media:audit
```

它验证当前 `public/videos/home-v5` 和 `public/images/home-v5` 是否满足官网视频硬指标，并明确区分：

- 技术合格的 public 视频。
- Runway/Pika 人工接受后的源视频。
- Chrome 页面里的最终视觉接受。

最终验收前必须跑严格模式：

```bash
npm run media:audit -- --strict-final
```

如果严格模式失败，说明最终 Runway/Pika 视频链路还没完成，即使页面已经有 fallback 视频，也不能标记 goal 完成。

## v5.103 Chrome Homepage Sampling

已生成首页 Chrome 桌面采样证据：

```text
output/qa/v5.103-chrome-desktop-sampling.json
```

截图：

```text
output/qa/v5.103-chrome-desktop/1366x900-home.png
output/qa/v5.103-chrome-desktop/1440x1000-home.png
output/qa/v5.103-chrome-desktop/1920x1080-home.png
```

本次修正 reduced-motion 下视频节点丢失的问题：视频资源存在时仍渲染 `<video>`，但 reduced-motion 下关闭 autoplay 并显示 poster。

## v5.104 Full-Site Chrome Sampling

已完成 8 个核心页面 + 5 个系统页面的 Chrome 桌面采样：

```text
output/qa/v5.104-fullsite-chrome-sampling.json
output/qa/v5.104-fullsite-chrome/
```

结果：`hardFailures = 0`，状态为 `pass-with-warnings`。Warnings 来自 Journal 和系统页没有视频节点，当前不作为硬失败；最终完成仍取决于 Runway/Pika accepted source exports、strict media audit、batch ingest 和最终人工视觉验收。

## v5.105 Final Goal Audit

新增最终 goal 完成审计：

```bash
npm run qa:goal-audit
npm run qa:goal-audit:report
```

本轮 build 已通过：

```text
output/qa/v5.105-build.log
output/qa/v5.105-build.json
```

`qa:goal-audit` 是最终完成门禁。当前它应保持 incomplete，因为 Runway/Pika accepted source exports 还未进入 `output/runway-downloads/home-v5`，也没有最终 batch ingest verify 和人工视觉验收。

## V5.120 Canonical Redirect Hygiene

Legacy marketing routes are compatibility entrances only. They are not part of the canonical 2026 IA and must not receive separate page designs unless the information architecture changes.

Permanent redirects:

- `/agent` -> `/product`
- `/world` -> `/community`
- `/stories` -> `/journal`
- `/press` -> `/journal`
- `/partners` -> `/contact#enterprise`
- `/join` -> `/contact#waitlist`
- `/cities` -> `/community`
- `/investors` -> `/about`
- `/faq` -> `/safety`

Sitemap rule:

Only the 8 core pages and 5 system pages belong in `siteRoutes`. Legacy redirects must stay out of canonical sitemap output so search engines and future agents do not treat old page concepts as active design surfaces.
## V5.128 Static Media Governance

新增 canonical 文档：

- `FITMEET_STATIC_MEDIA_GOVERNANCE.md`

它约束当前无视频官网的图片资产分配、禁用项、`image_gen` 落地规则、ActivityOrbit 三条轨道和删除/归档流程。当前官网媒体主链路是：

`public/images/enterprise -> enterpriseAssets.ts -> CinematicImage -> SVG / Canvas / CSS 3D -> Chrome 验收`

旧 Runway/Pika/ffmpeg 视频链路只保留为未来宣传片参考，不再作为官网上线门禁。

## V5.129 Static Media Preflight

`npm run qa:award-preflight` 现在必须检查静态媒体治理：

- `FITMEET_STATIC_MEDIA_GOVERNANCE.md` 存在。
- 企业图片必须通过 `components/signal-prism-homepage/enterpriseAssets.ts` 进入页面。
- `app/` 和 `components/` 中不得散落硬编码 `/images/enterprise/...`，唯一例外是 `enterpriseAssets.ts`。
- ActivityOrbit 的运动、低压力、兴趣三条轨道必须都有治理过的图片分配。
- 预检证据输出：`output/qa/v5.129-award-preflight.json`。

新增 canonical 证据协议：

- `FITMEET_EVIDENCE_PROTOCOL.md`

当前完成证据统一使用 `v5.129`：

- `output/qa/v5.129-build.log`
- `output/qa/v5.129-award-preflight.json`
- `output/qa/v5.129-fullsite-award-qa.json`
- `output/qa/v5.129-goal-completion-audit.json`

旧 `v5.122` / `v5.123` 证据只能作为历史记录，不能证明当前静态媒体治理版本已经完成。
