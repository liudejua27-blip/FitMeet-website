# FitMeet Motion System

## V5.111 No-Video Motion Contract

当前首页动效不依赖视频。动效目标必须和视觉区块严格耦合：

1. `SignalPrism` 只表达同频心核醒来、解析、收束，不承担 Logo 巨幅装饰。
2. `MouseFieldProvider` 只驱动鼠标视差和轻微 3D 透视，不改变内容可读性。
3. `SignalLineCanvas` 只覆盖城市信号图层，不遮挡标题、正文、CTA。
4. `ActivityOrbit` 只表达活动世界展开，不退化为普通卡片墙。
5. `SafetyShell` 只表达边界层，不做恐吓式安全视觉。
6. `prefers-reduced-motion` 下必须停止循环和鼠标增强，保留所有文字和图片。

禁止：

1. 为了动效而添加 `<video>`。
2. 用 HUD、小字、小点、小几何装饰遮挡文案。
3. ScrollTrigger 目标和视觉区块错位。
4. 未 scoped 的 selector 动画。

## V5.111 Motion Evidence

Current homepage motion implementation:

- React lifecycle: `useGSAP` scoped to `pageRef`.
- Scroll narrative: `ScrollTrigger` controls reveal, root `--scroll-signal`, and ActivityOrbit horizontal drift.
- Mouse field: `MouseFieldProvider` writes `--mx`, `--my`, `--tilt-x`, `--tilt-y` through `requestAnimationFrame`.
- Canvas layer: `SignalLineCanvas` handles city nodes and connection lines with reduced-motion fallback.
- 3D layer: `SignalPrism` and `ActivityOrbit` use transform/opacity-oriented CSS, not layout animation.
- Accessibility: `prefers-reduced-motion` disables transforms, loops, transitions and keeps text/images visible.

Verified:

- Chrome QA evidence: `output/qa/v5.111-signalprism-homepage-qa.json`
- reduced-motion reports `motionMode = reduced`.
- No video or media-loop fallback is required for motion.

## Canonical Docs

本文档定义 FitMeet 官网动效系统。所有 GSAP、视频滚动、页面过渡和微交互必须遵守。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Motion Thesis

FitMeet 的动效不是装饰。动效必须让一个真实计划逐步发生。

核心运动路径：

`想法 -> 计划 -> 场景 -> 边界 -> 真人 -> Social World`

每个页面都应让用户感觉内容在被组织，而不是一块块卡片被展示。

## Primary Tools

- GSAP
- `@gsap/react`
- ScrollTrigger
- ffmpeg 输出的视频资产
- CSS reduced-motion 回退

暂不作为主流程：

- Framer Motion：除非后续有明确 UI 小动效需求。
- Spline：除非有明确品牌 3D 标志物。
- Rive：可作为二期机制图，不进入首版强依赖。

## ScrollTrigger Rules

必须：

1. 每条动画绑定明确 section。
2. 每个 section 有 `data-motion-scope`。
3. 复杂视觉有 `data-visual-owner`。
4. 可动画对象使用 `data-motion-target`。
5. timeline 只查询当前 owner 内的目标。
6. reduced-motion 下销毁或降级动画。

禁止：

1. 全局 `querySelectorAll` 驱动跨段文案。
2. 一个 ScrollTrigger 同时控制多个视觉 owner。
3. 旧 HUD、旧路径、旧地图参与新动画。
4. 动画把文案移到不可读区域。
5. pin 造成黑屏或长时间空场。

## Page Motion Direction

### Home

目标：

建立电影级长卷。滚动不是看 section，而是让 Social World 被生成。

节奏：

1. Hero 视频轻微推近。
2. 需求短句进入。
3. 计划轨道形成。
4. 场景视频和 poster 交替出现。
5. 边界先锁定。
6. 真人状态最后出现。
7. Vision 段收束到企业愿景。

### Product

目标：

解释机制。

动效：

- 输入需求进入 Agent。
- 上下文 chips 分组出现。
- 路线和边界逐步成立。
- 计划收据生成。

禁止：

- 聊天窗口打字模拟成为主视觉。
- 魔法光效掩盖机制。

### Scenes

目标：

让具体场景有生活密度。

动效：

- 场景横向或纵向切换。
- 视频短循环。
- plan receipt 随场景变化。
- 边界标签轻量出现。

### Community

目标：

让城市网络生长。

动效：

- 多个真实场景串联。
- 路线只作为连接，不作为 HUD。
- 复访和节点状态逐步出现。

### Safety

目标：

清楚、可信。

动效：

- 边界流程逐步确认。
- 开关、确认门、计划收据轻动效。
- 不做强烈霓虹、不做恐吓。

### About

目标：

公司愿景有重量。

动效：

- 宣言式大字出现。
- 行业痛点和产品信念交替。
- 未来蓝图收束。

### Journal

目标：

内容可读。

动效：

- 轻量 reveal。
- 文章卡片不强烈移动。
- 不使用重视频。

### Contact

目标：

减少阻力。

动效：

- 表单状态清晰。
- 企业合作和个人体验分轨。
- 不做复杂提交依赖。

## Visual Noise Budget

禁止可见污染：

- 小 HUD。
- 边缘小字。
- 大量小点。
- 大量小几何。
- 扫描线遮挡正文。
- 鼠标尾巴遮挡内容。
- 纯装饰路线穿过文案。

允许：

- 少量红色路线光。
- 大型锐利裁切。
- 真实视频轻推。
- 背景级低噪音纹理。
- 与计划/边界/场景直接相关的状态。

## Text Safety

每个 viewport 必须满足：

1. 只有当前阶段主标题处于最高可读权重。
2. 不同 section 的大标题不得重叠。
3. 视频和图像不得压住正文。
4. CTA 不得被动效遮挡。
5. 标题不依赖 hover 才可读。

如果截图中两个不同 section 的大标题同时抢主视觉，判定失败。

## Video Motion

视频本身动效要克制：

- 慢推。
- 轻微手持。
- 人物自然动作。
- 灯光轻呼吸。
- 环境反射变化。

禁止：

- 快速镜头切换。
- 强烈摇晃。
- 夸张变形。
- 生成文字。
- UI 覆盖。

## Reduced Motion

必须支持：

```css
@media (prefers-reduced-motion: reduce) {
  /* stop non-essential motion */
}
```

规则：

1. 视频可停止或弱化，但 poster 必须可见。
2. 核心信息不能依赖动画出现。
3. 滚动 pin 不能造成内容缺失。
4. 所有 CTA 保持可点击。

## Performance

必须：

- 非首屏视频懒加载。
- 视频使用 WebM 优先。
- poster 先显示。
- 动画元素数量受控。
- 避免过多 fixed overlay。
- 避免 filter/blur 大面积叠加。
- 避免 scroll handler 每帧做重计算。

## Motion Acceptance

通过标准：

- 首页滚动叙事连续。
- 动画目标和视觉区块严格耦合。
- 无文案重叠。
- 无黑屏 pin。
- 无小碎片遮挡。
- reduced-motion 可读。
- 桌面 Chrome 1366/1440/1920 通过。

## V5 Motion Contract Addendum

统一页面系统必须遵守以下 DOM 合同：

- 每个大视觉段落必须声明 `data-motion-scope`。
- 每个视觉 owner 必须声明 `data-visual-owner`。
- GSAP 只能选择当前 root 内的 `data-motion-target`，不得使用无 scope 的全局类名。
- 影像层允许做 `y`、`scale`、`clipPath`，不得用透明度让主图和正文消失。
- Proof 和文字允许做轻位移，但不允许遮挡标题、按钮和 CTA。
- reduced-motion 下必须清除 transform/clipPath，并保留完整信息。

当前实现位置：

- `components/social-world-page/SocialWorldPage.tsx`
- `components/social-world-page/social-world-page.module.css`

## V5.060 Continuous Corridor Motion

新增 motion contract：

1. `SocialWorldPage` 根节点由 ScrollTrigger 驱动 `--sw-flow` 与 `--sw-heat`。
2. 这两个变量只能控制背景级大型场、斜切 seam、热度和连续感。
3. 不允许用根变量控制正文 opacity、标题可见性、CTA 可点击性或 section 显隐。
4. 所有正文和主影像仍由当前 `data-motion-scope` 与 `data-visual-owner` 管理。
5. 动效属性继续优先使用 transform、clip-path、opacity，不触发布局抖动。

设计目的：

- 让滚动像 Social World 系统推进。
- 减少 section 断裂。
- 保持文字轨道和影像轨道不互相遮挡。

reduced-motion 要求：

- `--sw-flow` 和 `--sw-heat` 必须归零。
- ticker 动画停止。
- 所有正文、proof、CTA 保持完整可读。

## V5.064 Reduced-Motion Media Contract

新增媒体合同：

1. reduced-motion 下不只停止 CSS 动画，还必须停止动态媒体加载和播放。
2. `CinematicVideoMedia` 在 `prefers-reduced-motion: reduce` 命中时必须渲染 poster `<img>`，不得渲染 `<video>`。
3. 浏览器偏好未知时先渲染 poster，偏好确认不是 reduced-motion 后再加载 WebM。
4. poster 必须具备完整视觉表达，不能依赖视频运动才能理解场景。

当前实现位置：

- `components/social-world-page/SocialWorldPage.tsx`

验收证据：

- 普通模式：`videoCount=1`，Hero WebM `readyState=4`，`duration=5`。
- reduced-motion：`videoCount=0`，Hero poster `naturalWidth=1920`，H1 保持 `Social World`。
- 证据文件：`output/chrome-v5063/home-hero-video-reduced-fix-qa.json`。

## V5.065 Agent Plan Media Coupling Rule

本文档优先级继续低于 canonical docs。本次规则用于防止 GSAP 段落上下文和视觉区块错位。

### Required coupling

The `streetPlaza` media target belongs only to the Agent Plan context: public plan confirmation, boundary agreement, and real arrival preparation. It must not be reused as generic community filler, hero decoration, or safety-page background unless the copy explicitly talks about public meeting boundaries.

### Animation rule

ScrollTrigger targets for this media must scope to the owning section root. Do not bind `streetPlaza` animation to global selectors, shared video selectors, or copied section timelines. If the copy changes from plan confirmation to another topic, this media must be replaced rather than stretched into a mismatched section.

### Reduced motion

Reduced-motion mode must render the poster and full HTML copy without requiring video playback. Video motion is enhancement only; the section meaning must survive with static poster, heading, body, and CTA.

## V5.067 Real People Media Coupling Rule

The `citywalk` media target belongs to Real People, Citywalk, Exit Mechanism, Community Loop, and privacy/data-use contexts where the page is explicitly talking about low-pressure public同行, not matching, dating, or avatar browsing.

### Animation rule

Any ScrollTrigger that moves `citywalk` must be scoped to its owning section root. Do not animate it from the Agent Plan timeline and do not reuse it as an abstract filler background. The section copy must still explain why real people appear after the plan, not before it.

### Reduced motion

Reduced-motion mode must render `scene-citywalk-case-poster.jpg` with the same copy and CTA. Video motion is optional; the message must remain complete as a static public street scene.

## V5.069 Social World Vision Media Coupling Rule

`cityNetwork` belongs to Social World, Community, About vision, Cookies policy frame, and Thank You continuation contexts only when the copy talks about connected public plans, city nodes, or long-term company vision.

### Animation rule

Do not animate `cityNetwork` as a fake analytics map or generic background. ScrollTrigger targets must be scoped to the owning section root and the copy must preserve the sequence: need -> plan -> real people -> city network.

### Reduced motion

Reduced-motion mode must render `vision-arrival-network-poster.jpg` and keep the Social World heading, body, proof points, and CTA readable without video playback.

## V5.071 Scenes Media Coupling Rule

`court` belongs to sports/court/venue contexts only. `weekend` belongs to public departure/short-trip contexts only. Neither asset may be reused as generic homepage decoration, fake community proof, or abstract AI background.

### Animation rule

If GSAP is added to these sections later, ScrollTrigger targets must scope to the owning section root: `#court` for court and `#weekend` for weekend. Do not bind them from a copied homepage timeline or global video selector.

### Reduced motion

Reduced-motion mode must render the poster for each asset and keep the section heading, body, proof cards, and CTA understandable without video playback.

---

## V5.075 Scenes Corridor Continuity Rule

Priority: this addendum applies to `/scenes` and any future scenario-heavy page that risks feeling like isolated posters.

Problem addressed:
- A scenario page can technically have good media and still feel fragmented if every story block behaves like a separate full-screen poster.
- The previous `/scenes` layout had strong individual blocks: Hero, ticker, process cards, and four scenario sections. Each block was acceptable alone, but the page rhythm felt too segmented.

Motion and layout rule:
- Scenario pages should behave like one continuous route, not a stack of independent cards.
- Adjacent story sections may intentionally overlap vertically when the content remains readable.
- A shared corridor field may run behind all sections to visually bind the sequence.
- Section media must remain coupled to its own section. Overlap is allowed only between visual fields, not between animation targets and the wrong copy.
- The ScrollTrigger owner remains the section itself: `[data-motion-scope]` continues to be the trigger boundary.
- Reduced motion must keep the same corridor layout but remove video playback.

Implementation record:
- `/scenes` now uses `[data-page="scenes"]` CSS overrides in `components/social-world-page/social-world-page.module.css`.
- No TSX animation target logic was changed.
- No global route styling was changed.
- Other SocialWorldPage routes keep the base layout.

Acceptance requirement:
- After corridor compression, re-check `1366x900`, `1440x1000`, and `1920x1080`.
- Confirm there is no horizontal overflow.
- Confirm all four scenario media assets remain section-correct.
- Confirm reduced-motion mode renders poster images instead of videos.

## V5.072 Community Motion Rule

Community page motion must stay hard, readable, and scoped.

Rules:

- The owner root is `[data-community-page]`.
- ScrollTrigger targets must use `data-community-*` selectors scoped through the page root.
- Do not bind community animations through global video selectors or copied homepage timelines.
- Do not use blur reveals for key community copy. The page direction is concrete city life, not virtual haze.
- Animate transform and opacity only for reveal states.
- Scene media cards should remain visible by default; they are proof of real places, not decoration that can disappear during scroll.
- Reduced-motion must render poster images and keep the city-network story readable without video playback.

## V5.080 Safety Motion Rule

Safety page motion must reinforce product order and must never decouple safety copy from the visual block it owns.

Rules:

- The owner root is `[data-safety-page]`.
- ScrollTrigger targets must use `data-safety-*` selectors scoped through the page root.
- The page progress trigger is allowed to use the page root only.
- The protocol timeline belongs only to `[data-safety-protocol]` and its protocol cards/lines.
- Do not bind safety animations through global video selectors, shared homepage timelines, or copied community timelines.
- Do not animate safety copy with blur. Trust copy must stay hard, legible, and operational.
- Animate transform, opacity, scale, and CSS variables only. Do not animate width, height, top, left, margin, or padding for the main sequence.
- Reduced-motion must set safety content visible, set progress complete, remove video playback, and render poster images while preserving all page information.

Media coupling:

- `scene-public-plan-plaza` belongs to public-place-first, boundary-confirmation, and safety contexts only.
- `scene-citywalk-case` may support low-pressure public同行 and gate/receipt contexts only.
- Neither asset may be reused as abstract security decoration, fake dashboard background, or dating/social-match filler.

Acceptance requirement:

- Check `1366x900`, `1440x1000`, and `1920x1080`.
- Confirm no GSAP marker elements are present in production view.
- Confirm no horizontal overflow.
- Confirm reduced-motion removes videos and keeps safety information complete.

## V5.081 About Motion Rule

About page motion must support company narrative and keep all mission-critical copy readable.

Rules:

- The owner root is `[data-about-page]`.
- ScrollTrigger targets must use `data-about-*` selectors scoped through the page root.
- The product-belief sequence belongs only to `[data-about-path]`.
- Do not bind About animations through generic SocialWorldPage selectors or copied Safety/Community timelines.
- About reveal motion must be readable by default. Core company copy may start at partial opacity, but must not be hidden in a way that makes screenshots or fast scrolling look empty.
- Do not use blur reveal on key company copy.
- Animate transform, opacity, scale, and CSS variables only.
- Reduced-motion must render poster images, remove video playback, and keep all company narrative information complete.

Media coupling:

- `vision-arrival-network` belongs to company vision, Social World, and city-network contexts.
- `hero-night-run-social-world` may support the 3-5 year city-infrastructure vision only when the copy is about young people moving from plan to real arrival.

Acceptance requirement:

- Check `1366x900`, `1440x1000`, and `1920x1080`.
- Confirm visible copy includes industry pain, current plan, 3-5 year vision, and final ambition.
- Confirm no banned social/dating terms or fake proof terms appear anywhere in page text.
- Confirm no horizontal overflow and no production GSAP markers.

## V5.083 Contact Motion Rule

Priority: canonical motion rule for `/contact`.

GSAP ownership:
- Root scope: `[data-contact-page]`
- Route timeline trigger: `[data-contact-router]`
- Reveal selector: `[data-contact-reveal]`
- Route selector: `[data-contact-route]`
- Slice selector: `[data-contact-slice]`
- Progress selector: `[data-contact-progress]`

Motion rules:
- Use `useGSAP` with scoped selectors and `revertOnUpdate` so ScrollTrigger cleanup stays local to the Contact page.
- Animate only transform and opacity-like properties; do not animate layout properties for the main flow.
- The route timeline must bind to the route section only. Do not bind Contact animations to global selectors or other pages.
- Reduced motion must replace video with posters and keep all text, links, and CTAs visible.
- No GSAP production markers are allowed.

## V5.084 Journal Motion Rule

Priority: canonical motion rule for `/journal`.

GSAP ownership:
- Root scope: `[data-journal-page]`
- Progress selector: `[data-journal-progress]`
- Reveal selector: `[data-journal-reveal]`
- Rail selector: `[data-journal-rail]`
- Cover selector: `[data-journal-cover]`
- Track trigger: `[data-journal-track]`

Motion rules:
- Motion supports reading rhythm only. It must not hide text or turn Journal into a video-first page.
- Channel filtering is local React state and must remain functional without server calls.
- Reduced motion must keep all text, images, links, and filters visible.
- No GSAP markers are allowed in production.

## V5.085 System Page Motion Rule

System pages are intentionally low-motion.

Rules:

- No GSAP ScrollTrigger is required for system pages.
- No scroll-pinned cinematic sections on Privacy, Terms, Cookies, 404, or Thank You.
- Header hover transitions are allowed only if `prefers-reduced-motion` can remove them.
- The information hierarchy must be complete with motion disabled.
- Do not bind system copy to scroll animation targets.

Rationale:

The goal for these pages is not spectacle. The goal is protocol clarity. This prevents the previous class of problems where animation targets and visual sections become loosely coupled or contextually wrong.
