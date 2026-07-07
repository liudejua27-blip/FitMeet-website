# FitMeet 2026 Design Standard

## V5.112 Full-Site No-Video Design Standard

当前设计方向不是“视频企业官网”，而是无视频的 `Interactive Social Signal System`。

适用范围：

1. 首页。
2. 产品页。
3. 场景页。
4. 社区页。
5. 安全页。
6. 关于页。
7. 动态页。
8. 联系页。
9. 系统信任页面。

设计判断：

- 高级感来自真实静态影像的选择、裁切、层叠、鼠标响应、滚动节奏和中文叙事。
- 不靠视频循环、AI 影像、Runway/Pika 动态素材或 MP4/WebM 证明质感。
- 页面必须像一个可交互的城市同频信号系统，而不是静态图册或普通 SaaS 模板。

核心禁令：

- 不使用 `<video>`。
- 不请求 MP4 / WebM。
- 不将视频缺失视为未完成。
- 不将本地 fallback 视频或 Runway/Pika 导出作为当前官网完成条件。

## Canonical Docs

本文档是 FitMeet 官网最高设计标准。执行顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

旧文档只作历史参考。任何与本文档冲突的旧首页方案、旧辅助页方案、旧素材方案，都以本文档为准。

## Design Thesis

FitMeet 是年轻人的城市生活平台，不是 AI 社交工具展示页。

核心创意：

`Social World：一句想法，变成一次真实到场。`

设计目标：

让用户感觉一件真实生活里的事正在发生：有人想夜跑，有人想打球，有人想走进城市，有 Agent 把需求、计划、边界和真人放到正确顺序里。

FitMeet 的高级感来自：

1. 真实影像。
2. 少文案。
3. 强叙事。
4. 企业级秩序。
5. 安全可信。
6. 城市生活密度。
7. 滚动中的连续体验。
8. 代码原生的交互信号系统。

不是来自：

1. 抽象粒子。
2. 头像墙。
3. 复杂 dashboard。
4. 赛博朋克装饰。
5. 小 HUD。
6. 工具名堆叠。

## V5.111 No-Video SignalPrism Standard

当前首页 canonical 方案为 `SignalPrismHomepage`，整站核心页面都不再依赖视频。

设计对象：

`Interactive Social Signal System / 交互式同频信号系统`

首页必须使用：

1. 现有 `企业官网` 真实 PNG 图片作为生活场景证据。
2. `SignalPrism` 作为贯穿首页的同频心核。
3. `MouseFieldProvider` 统一鼠标场。
4. `SignalLineCanvas` 表达城市同频光点和连接线。
5. `ActivityOrbit` 表达真实活动世界，不做普通卡片墙。
6. `SafetyShell` 表达边界层。
7. GSAP ScrollTrigger 做滚动叙事，不做无上下文炫技。

核心官网禁止：

1. `<video>`。
2. MP4 / WebM 作为主视觉。
3. Runway / Pika 输出作为当前首页依赖。
4. 大型 `F` 当 Hero 主视觉。
5. HUD、扫描线、数据大屏、头像墙、AI SaaS dashboard。

判断标准：

首屏必须让用户先记住 `Social World`，同时看到一个具体需求正在被小福组织：真实需求、公开边界、同频到场。动效必须像品牌系统在响应用户，而不是像科技海报在播放特效。

## Brand Narrative

全站叙事顺序固定为：

1. `一句想法`：用户表达真实想做的事。
2. `一次计划`：Agent 整理活动、时间、地点、强度、人数。
3. `一个公开场景`：路线、球馆、桌游空间、街角、集合点先成立。
4. `一组边界`：公开地点、人数偏好、可退出、确认后邀请。
5. `合适的人出现`：人不是被刷出来，而是在同一个计划中自然出现。
6. `Social World`：一个个真实计划连接成城市生活网络。

主文案：

`一句想法，变成一次真实到场。`

首页品牌事件：

`Social World`

品牌标志规则：

`F` 是 FitMeet 企业官网的品牌标志，只能作为左上角 Logo/品牌锁定区使用。不能把 `F` 当成首页主标题、Hero 主视觉、内容符号、巨型装饰字母或产品概念本身。首页记忆点必须是 `Social World`，不是一个单独的 `F`。

辅助句：

`社交不是筛选，是现实里发生。`

产品主张：

`先有计划，再出现合适的人。`

安全主张：

`先确认边界，再靠近彼此。`

企业合作主张：

`真实需求，比曝光更接近成交。`

公司愿景：

`让年轻人在任何一座城市，都能找到一件可以一起做的事。`

Footer：

`真实计划。真实的人。就在附近。`

## Visual Language

### Overall

视觉关键词：

- 城市夜色
- 真实到场
- 年轻行动
- 黑红高对比
- 锐利几何
- 电影感
- 低噪音科技感
- 企业级秩序

页面不能像模板 landing page。不能是黑底大标题后面接三张卡片。不能靠左右分栏和卡片堆解释产品。

### Color

主色方向：

- Black：深黑、石墨、城市夜色。
- Red：FitMeet 行动线、路线光、到场信号。
- Warm White：中文主文案、企业可信感。
- Small Accent：少量 amber/cyan/lime 只用于状态区分，不得成为主色。

禁用：

- 紫蓝 AI SaaS 渐变。
- 大面积 neon green。
- 大面积玻璃拟态。
- 单一红黑到所有页面失去层次。

### Typography

中文文案必须短、直接、有重量。

排版规则：

1. Hero 可使用超大标题。
2. 内容区标题必须收敛，不要每屏都英雄字号。
3. 正文不写长段解释，改用短句、收据、流程、场景。
4. 按钮文字必须短。
5. 禁止负字距导致中文挤压。
6. 避免小字铺满两侧。
7. 首页 Hero 主体标题固定服务 `Social World`，不能用单独的 `F` 替代产品叙事。

### Layout

页面必须像连续体验，不像一组孤立 section。

布局规则：

1. 使用全宽视觉段和受控内容轨道。
2. 只在重复对象上使用卡片，不把整段页面放进卡片。
3. 不做 UI 卡片套卡片。
4. 不做普通左文右图 hero。
5. 每个核心页面首屏必须有真实视觉信号。
6. 下一段内容应在首屏底部有轻微线索，形成纵深。

### Media

关键视觉必须是摄影级或视频级，不以 SVG 插画作为最终获奖级资产。

影像规则：

1. 视频内不生成文字。
2. 视频内不生成 Logo。
3. 视频内不放 HUD、扫描线、小状态字。
4. 画面必须有真实人物、真实地点、真实动作。
5. 每个视频必须有 poster。
6. 允许少量抽象海报，但不能成为主体。

## Motion Standard

主工具：GSAP ScrollTrigger。

动效目的：

1. 推进叙事。
2. 连接页面段落。
3. 让真实计划逐步形成。
4. 强化品牌记忆。

动效顺序：

`想法 -> 计划 -> 场景 -> 边界 -> 真人 -> Social World`

动效规则：

1. 每个动画必须绑定当前视觉区块。
2. 不允许全局选择器跨段驱动文案。
3. 不允许动画目标和视觉 owner 脱钩。
4. 不允许文案相互遮挡。
5. 不允许小点、线条、小字覆盖内容。
6. `prefers-reduced-motion` 下必须保留信息完整。

禁用：

1. 为了炫而做鼠标尾巴。
2. 长时间 scroll hijacking。
3. 复杂但不表达产品逻辑的 WebGL。
4. 每个区块都独立飞入，导致分块感。

## Page Personality

### Home

电影级、少文案、强记忆。Hero 只服务 `Social World`。

### Product

清楚、结构化、机制可信。证明 Agent 是现实计划生成器。

### Scenes

年轻、具体、有生活密度。让夜跑、球馆、桌游、城市漫游成为产品证据。

### Community

未来感、城市感、网络感。表达 Social World 不是功能集合，而是城市生活层。

### Trust & Safety

克制、可信、低噪音。安全是产品顺序，不是恐吓和免责声明。

### About

公司愿景、产品信念、长期使命。不要写普通团队介绍模板。

### Journal

内容增长和 SEO。视觉保持品牌底盘，不做重视频消耗。

### Contact

直接、可信、转化明确。企业合作邮箱必须可见。

## Tooling Standard

工具分工：

- Codex：代码、文档、验收脚本。
- Chrome：已登录 Runway/Pika 操作和页面验收。
- image_gen：摄影级关键帧。
- Runway：Hero 正式视频、品牌大片。
- Pika：中段实验视频、潮流片段。
- ffmpeg：WebM、poster、压缩、裁切。
- GSAP ScrollTrigger：滚动叙事。
- Creative Production：moodboard、shot intake、镜头方向。
- Next.js App Router：页面结构、SEO metadata、系统页面。

Skill 分工：

- `imagegen`
- `chrome:control-chrome`
- `fitmeet-cinematic-homepage`
- `gsap-scrolltrigger`
- `gsap-react`
- `gsap-timeline`
- `gsap-performance`
- `build-web-apps:frontend-app-builder`
- `build-web-apps:react-best-practices`
- `product-design`

## References

参考什么：

- Cipher Digital：企业节奏、短句、基础设施感、可信收束。
- digitalists.at：年轻创意、视觉人格、互动密度。
- units.gr：真实空间、社区生活方式、生活密度。
- Awwwards：获奖级完整体验标准。
- Codrops：GSAP、WebGL、scroll/image motion 实验。
- Runway：电影级主视觉视频。
- Pika：短视频实验与年轻潮流片段。
- Next.js Docs：App Router、Metadata、系统页面。
- GSAP Docs：ScrollTrigger、pin、scrub、滚动叙事。
- VoltAgent/awesome-design-md：设计文档组织方式。
- greensock/gsap-skills：GSAP 写法和约束。
- codrops/ScrollBasedLayoutAnimations：滚动布局切换参考。

不复制什么：

- 不复制参考站文案。
- 不复制参考站行业语言。
- 不复制视觉皮肤。
- 不引入与 FitMeet 无关的 B2B 数据中心语境。

## Award-Level Bar

一个页面只有好看不够。必须同时通过：

1. 3 秒内理解品牌。
2. 真实影像可识别。
3. 产品顺序清楚。
4. 文案短而有力。
5. Trust 可信。
6. SEO 有增长入口。
7. 动效服务叙事。
8. 桌面 Chrome 无遮挡、无黑场、无溢出。

每次设计完成后必须反思：

1. 是否仍然太抽象。
2. 是否仍然像 AI SaaS。
3. 是否缺少真实场景。
4. 是否把视频当装饰。
5. 是否 Trust 不够清楚。
6. 是否企业合作价值太空。
7. 是否文案重叠或被装饰遮挡。

反思后必须继续升级，而不是只修局部样式。

## V5 Canonical Shell Design Decision

当前官网实现以 `SocialWorldPage` 为统一页面骨架。这个决策的目的不是降低视觉野心，而是消除旧页面各自为战的问题：

1. 全站先统一信息架构和品牌叙事。
2. 每页首屏都必须有真实影像和短句主张。
3. 每页都必须显式展示 `一句想法 -> 公开场景 -> 边界确认 -> 计划生成 -> 真人出现 -> Social World` 的顺序。
4. 黑红锐角、压缩留白、真实影像、短 CTA 是默认视觉底座。
5. 后续 Runway/Pika 视频资产替换必须进入这套骨架，不另起一套页面。

如果后续页面再次变成独立 section 堆叠、抽象海报、HUD 装饰或 AI SaaS dashboard，本轮 V5 目标失败。

## V5.020 Keyframe-First Media Upgrade

当前阶段先用 `image_gen` 生成的摄影级关键帧替换旧 V3 视频帧和部分 V4 poster，目标是先让页面摆脱抽象、黑块和素材拼贴感，再进入 Runway/Pika image-to-video。

已接入的 V5 关键帧：

1. `/images/home-v5/hero-night-run-social-world-keyframe.png`
2. `/images/home-v5/scene-court-dispatch-keyframe.png`
3. `/images/home-v5/scene-citywalk-case-keyframe.png`
4. `/images/home-v5/vision-arrival-network-keyframe.png`

设计判断：

1. 在正式 Runway/Pika 视频生成前，V5 keyframe 是页面主视觉 fallback，不再让旧 cinemagraph 覆盖新影像方向。
2. 页面内不得指向尚未存在的 V5 视频路径，避免黑场或 404 请求。
3. 关键帧必须保持无文字、无 Logo、无 HUD、无 dating 语境。
4. 下一步视频必须由这些 keyframe 推进，而不是重新生成一套不一致的影像。
5. 2026 获奖级目标仍未完成；当前只是把真实影像底座推进到更接近导演级官网。

## V5.060 Continuous Corridor Upgrade

当前共享页面壳进入 `continuous corridor` 阶段。

设计判断：

1. V5 真实影像已基本统一，但页面仍可能被感知为一组 section。
2. 获奖级企业官网需要像一个连续的 Social World 运行走廊，而不是黑底大标题加多段卡片。
3. 连续性来自共享滚动热度、斜切背景、弱边界、压缩留白和统一影像调色，不来自小 HUD、小点或更多装饰。

实现原则：

1. `SocialWorldPage` 根层暴露 `--sw-flow` 与 `--sw-heat`，由 ScrollTrigger 驱动大型背景场。
2. `chain` 是操作轨道，不是卡片墙。
3. `storySection` 允许轻微负间距和大斜切 seam，让段落之间互相咬合。
4. 证明对象保持锐角和大字号，不回到密集 dashboard。
5. reduced-motion 下信息完整，动态背景变量归零。

当前仍未完成：

- Runway/Pika 正式视频尚未接入。
- Chrome 三视口视觉验收仍需要在浏览器可用时执行。

## V5.071 Design Addendum: Product Page Standard

The Product page must make FitMeet concrete. It is not allowed to become a generic AI SaaS explanation page.

Required product story:

`一句想法 -> 需求理解 -> 上下文判断 -> 边界协议 -> 计划生成 -> 同频匹配 -> 计划收据 -> 真实到场`

Design rules:

- Use real city/lifestyle media or final generated cinematic media, not abstract SVG illustration.
- Use a mechanism narrative, not a dashboard mockup.
- Use a plan receipt as proof, not fake metrics.
- Keep Chinese display headings controlled with intentional line breaks.
- Keep geometry sharp, dark, redline, and enterprise-grade.
- Do not use profile cards, chat bubbles, avatar walls, dating language, or fake traction.

The Product page should answer one question immediately:

`FitMeet 的社交 Agent 到底如何让社交更简单？`

The answer must be visible in product order, not only in mood, video, or brand language.

## V5.072 Design Addendum: Community Page Standard

The Community page must prove that Social World is a city life network. It is not a profile network, a map dashboard, or a decorative grid.

Required community story:

`真实需求 -> 清楚计划 -> 公开到场 -> 复访节点 -> 城市生活网络 -> Social World`

Design rules:

- Use real city/lifestyle media or final cinematic generated media.
- Make public scenes and personal-location boundaries visible early.
- Avoid abstract network dashboards, fake analytics maps, user dots, fake counts, and profile walls.
- Keep motion sharp. Do not use blur reveals on key copy; blur makes the page feel virtual and undermines the current design direction.
- Scene media must remain visible enough to act as proof, not disappear behind scroll animation states.
- Community copy should make the city feel usable: routes, courts, street corners, cafes, board game rooms, exhibitions, and weekend destinations.

## V5.080 Design Addendum: Trust & Safety Page Standard

The Safety page must make FitMeet credible as a real-world social platform. It is not a legal-disclaimer page, a soft SaaS trust page, or a decorative policy wrapper.

Required safety story:

`公开地点 -> 边界确认 -> 可退出机制 -> 举报和屏蔽 -> 隐私保护 -> 未成年人边界 -> 确认后邀请 -> 安全收据`

Design rules:

- Trust must appear as product order, not as footer legal text.
- The page must use real public-place media and street-level city scenes, not abstract security icons or SVG illustration.
- Chinese safety language must be visible in primary copy. English labels such as `SAFETY RECEIPT` are allowed only as atmosphere, not as the only source of meaning.
- Do not use dating language, profile browsing, avatar walls, fake partner logos, fake user counts, or fake safety certifications.
- Do not make safety feel soft or bureaucratic. The visual language remains black/red, sharp, public, and operational.
- `合作方` style wording should be avoided when it can be misread as fake partner proof. Use `企业合作侧` for data-boundary language.

The Safety page should answer one question immediately:

`FitMeet 如何让一次真实连接在边界清楚之后发生？`

The answer must be proven by visible protocol, gate sequence, and safety receipt, not by generic trust claims.

## V5.081 Design Addendum: About Company Page Standard

The About page must carry company credibility. It is not a founder bio, a generic team page, or a soft mission statement.

Required company story:

`行业痛点 -> 当前产品路径 -> 产品信念 -> 3-5 年愿景 -> 最终目标`

Design rules:

- Use black/red enterprise rhythm consistent with the rest of the V5 site.
- Use real city/lifestyle media, not abstract illustration or generic team photos.
- The page must say what FitMeet is solving now: real-world social planning, not more chat.
- The 3-5 year vision must be written as a goal or hope, not as completed traction.
- The final ambition may be large, but it must connect to the concrete product thesis: changing how people and cities connect.
- Do not include banned social/dating terms even in negative copy. Replace them with clean brand language such as `附近可刷列表`, `伴侣化承诺`, `关系货架`, or `暧昧消费` only when needed.
- Do not use fake scale, fake backers, fake proof, fake certification, or fake business outcomes.

The About page should answer one question immediately:

`FitMeet 为什么值得被信任为一家建设 Social World 的公司？`

The answer must be visible through current work, product sequence, safety boundary, future vision, and final ambition.

## V5.083 Contact Conversion Page Standard

Priority: canonical design standard for `/contact`; overrides older generic contact or SocialWorldPage templates.

Design intent:
`/contact` must close the website loop without becoming a normal form page. It is a signal-routing page: one real idea enters the right path, then becomes either early experience, enterprise cooperation, or safety handling.

Visual rules:
- Black/red hard contrast, sharp clipped buttons, thin high-contrast borders, large compressed Chinese headings.
- Real city/lifestyle video is used as evidence of physical arrival, not decoration.
- The page should feel like a continuation of the Social World system, not a separate marketing form.
- Large visual silence is allowed only when it creates pressure and direction; it cannot become empty SaaS whitespace.

Required visible story:
- `从一个真实想法开始。`
- `加入早期体验`
- `联系企业合作`
- `真实需求，比曝光更接近成交。`
- `合作请联系：15253005312@163.com`
- `让一个真实信号，进入正确路径。`

Banned regressions:
- No fake user counts, fake logos, fake partners, or fake growth claims.
- No dating language, no avatar wall, no profile browsing, no soft rounded SaaS form stack.
- No small HUD decoration or noisy pseudo-dashboard fragments.

## V5.084 Journal Content Growth Standard

Priority: canonical design standard for `/journal`; overrides older generic Journal shell templates.

Design intent:
`/journal` must make FitMeet understandable over time. It is an editorial control room for Social World, not a blog index, press room, or AI thought-leadership page.

Required structure:
- Hero: `我们正在记录 Social World 如何发生。`
- Content channels: `产品进展`, `城市观察`, `技术实验`, `合作动态`.
- Topic rail: concrete article directions, not fake published proof.
- Current question: one real-life problem becomes a content investigation.
- SEO / long tail: real search questions around young people, city life, social Agent, and public plans.
- Editorial rules: no PR fluff, no fake research, no AI empty talk, no relationship-matching framing.

Visual rules:
- Keep the same black/red hard editorial system as the rest of V5.
- Use sharp rows and rails instead of soft cards.
- Compress whitespace more than a cinematic homepage; Journal is a reading and growth surface.
- Use poster imagery as atmosphere and proof of real places, not as a fake newsroom decoration.

## V5.085 System Trust Page Standard

The five system pages now use a dedicated `SystemTrustPage` pattern. This is intentional: policy and confirmation pages should not mimic cinematic product pages, and they should not become empty legal templates.

Design principles:

- Use the same black/red high-contrast FitMeet surface as the core site.
- Keep sharp geometry, clipped buttons, hard panels, and compressed desktop rhythm.
- Use text density to build trust; do not use decorative video or abstract illustrations.
- Use large, direct Chinese headings with clear Social World language.
- Keep English marker panels as protocol labels only, not as primary storytelling.

Mandatory system-page structure:

1. Fixed enterprise header with FitMeet logo and core navigation.
2. Large title and short explanation.
3. Two direct CTAs.
4. Right-side protocol marker panel.
5. Rule rows with numbered system logic.
6. Final Social World protocol statement.

Do not force `text-transform: uppercase` on Chinese/brand headings because it corrupts mixed-case copy such as `Cookie` and `Social World`.

## V5.086 Design Addendum: Chinese Hero Readability Lock

The shared `SocialWorldPage` hero style is intentionally oversized and cinematic. It works for `Social World`, but it cannot be used as a dumping ground for long Chinese positioning sentences.

New rule:
- Core page hero H1 copy should be short enough to read in one strong desktop beat.
- Long Chinese sentences must move into subtitle, body, or section copy.
- If a page needs a different language rhythm, constrain that page's hero type scale with a page-specific selector instead of weakening the homepage `Social World` title. For short Chinese scene titles, prefer one readable desktop line over poster-like wrapping.

Scenes page lock:
- Canonical `/scenes` hero title: `先有具体的事。`
- Canonical `/scenes` subtitle: `每一次连接，都从一个真实场景开始。夜跑、球馆、桌游、城市漫游、周末短途都先变成可到场的计划。`

Product page lock:
- `/product` must visibly state `真实计划` because the product promise is not generic plan generation; it is real-world arrival planning.

## V5.087 Design Acceptance Note: Scenes Desktop Hero

The `/scenes` hero has been visually rechecked after the typography correction.

Result:
- `先有具体的事。` now reads as one desktop line at `1366x900`, `1440x1000`, and `1920x1080`.
- The scene list stays in subtitle/body copy, so the page keeps concrete lifestyle meaning without breaking the hero typography.
- The homepage `Social World` scale remains untouched.

This is the correct pattern for future shared-template pages: keep the homepage memory title huge, but make Chinese page titles readable first.

## V5.115 Multi-Page Signal Continuity Standard

Homepage quality is not enough. `/product`, `/scenes`, and `/community` must now read as adjacent chapters of the same Social World system.

Required continuity:

1. Same top-left `F` brand behavior as homepage.
2. Same black/red/warm-white signal atmosphere.
3. Same sharp geometric cuts instead of rounded SaaS cards.
4. Same real-scene image proof instead of abstract tech diagrams.
5. Same no-video contract.
6. Same route logic: demand, context, boundary, plan, people, Social World.

Page-specific rule:

- `/product` explains the Agent mechanism as a plan engine, not a chatbot dashboard.
- `/scenes` may use dynamic scene colors, but the main visual system must not become neon cyber or game UI.
- `/community` must show city nodes as public real-world infrastructure, not a generic network diagram.

Failure condition:

If a user scrolls from homepage to these pages and feels they entered three unrelated websites, the design is not award-level yet.

## V5.116 Trust, Company, and Conversion Page Standard

A 2026 enterprise website cannot rely on the homepage alone. `/safety`, `/about`, and `/contact` must carry the same visual authority as `/`, `/product`, `/scenes`, and `/community`.

Required behavior:

1. `/safety` must feel like a product infrastructure page, not a legal appendix.
2. `/about` must feel like a company manifesto, not a generic mission page.
3. `/contact` must feel like signal intake and enterprise conversion, not a basic form page.
4. All three pages keep the same black/red/warm-white signal shell, sharp geometry, real imagery, fixed brand header, and no-video contract.
5. Trust, company vision, and conversion must remain specific to `Social World：一句想法，变成一次真实到场。`

Failure condition:

If these pages look like lower-effort subpages after the homepage, the website is not award-level yet.

## V5.119 Journal and System Trust Continuity Standard

The website now treats `/journal` and the five system pages as first-class brand surfaces.

Required behavior:

1. `/journal` is an editorial control room for Social World, not a blog index.
2. `/journal` must explain product progress, city observations, technical experiments, and cooperation logic through sharp rows, rails, and evidence-style content.
3. System pages are protocol pages, not forgotten legal templates.
4. Privacy, Terms, Cookies, 404, and Thank You must keep the same black/red/warm-white FitMeet signal shell while preserving text readability.
5. Legal and system copy must remain clear Chinese first. Atmosphere labels may exist, but cannot become the only meaning.
6. No video, no fake newsroom, no fake research, no fake compliance badges, no partner/logo proof without evidence.

Failure condition:

If Journal feels like a generic content index, or if system pages feel visually disconnected from Social World, the site is not yet award-level.

## V5.121 SEO and Share Surface Standard

Search and sharing surfaces are part of the enterprise website experience.

Required behavior:

1. Site metadata, manifest, OpenGraph, Twitter image, sitemap, and structured data must all express `Social World：一句想法，变成一次真实到场。`
2. Share cards must use `Social World` as the memory point, not `F`, not generic `AI social`, and not vague youth social wording.
3. The `F` mark may appear as a logo lockup inside share imagery, but it cannot replace the website thesis.
4. Metadata must keep Chinese-first product clarity: real need, public scene, boundary, plan, same-frequency arrival.
5. Do not use fake awards, fake metrics, fake partner logos, fake certification, or growth claims in SEO/share surfaces.
6. Theme color and manifest colors should match the current black/red Social World shell.

Failure condition:

If a shared link looks like a generic AI SaaS product, an abstract tech poster, or a dating/social matching app, the site fails brand continuity before the user even opens the page.

## V5.122 Award Preflight Hardening Standard

The award-level target now includes machine-checkable gates, not only visual judgment.

Required QA coverage:

1. The preflight must verify 8 core pages and 5 system pages exist.
2. The preflight must verify the no-video source contract across app, components, and lib.
3. The preflight must verify SignalPrism, SignalLineCanvas, ActivityOrbit, and SafetyShell remain present.
4. The preflight must verify legacy routes use permanent redirects and do not enter canonical sitemap.
5. The preflight must verify metadata, manifest, OpenGraph, and Twitter share surfaces express `Social World：一句想法，变成一次真实到场。`
6. The preflight must verify forbidden dating/fake-positioning language stays out of source.
7. The preflight must verify enterprise cooperation email `15253005312@163.com` remains visible in source.

Design implication:

A page can look good and still fail the website goal if it weakens route clarity, search/share memory, trust surfaces, no-video contract, or banned-language hygiene.

## V5.123 Chrome Full-Site QA Standard

The award-level website target requires browser evidence, not only source-level preflight.

Required Chrome QA behavior:

1. Test all 8 core pages and 5 system pages.
2. Test desktop viewports `1366x900`, `1440x1000`, and `1920x1080`.
3. Verify each route renders zero `<video>` elements.
4. Verify no MP4/WebM resource requests occur.
5. Verify no horizontal overflow occurs.
6. Verify core route copy snippets are visible.
7. Verify banned dating/fake-positioning language is absent from rendered body text.
8. Verify legacy routes land on their canonical permanent redirect targets.
9. Save JSON evidence and desktop screenshots for review.

Design implication:

The website is not complete until the browser-level experience proves the same story that the source and docs claim: `Social World：一句想法，变成一次真实到场。`

## V5.124 Human Visual Signoff Standard

Automated QA is necessary but not sufficient.

The final website goal cannot be marked complete until the full site is reviewed against `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md`.

Required human review:

1. Review all 8 core pages.
2. Review all 5 system pages.
3. Review desktop viewports `1366x900`, `1440x1000`, and `1920x1080`.
4. Verify each page has the right job, visible product thesis, real-scene grounding, trust logic, and CTA clarity.
5. Label each page as `Pass`, `Pass with polish`, `Needs redesign`, or `Blocked`.

Design failure:

A route can pass typecheck, build, preflight, and Chrome script checks while still failing the website goal if it looks generic, disconnected, abstract, weak, or visually lower effort than the homepage.

## V5.126 Completion Evidence Enforcement

Design quality must be proven by evidence, not intention.

The final completion audit now treats `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` as a required artifact. If the report remains unfilled, the website cannot be considered complete even if individual pages look strong.

This protects the 2026 award-level goal from being reduced to partial implementation, isolated screenshots, or undocumented subjective approval.
## V5.127 Desktop Hero Ratio + Activity Orbit Finish Standard

本文档优先级继续高于所有 `FITMEET_HOMEPAGE_*` 历史文档。本节用于约束无视频版 `SignalPrismHomepage` 的首屏和活动轨道，不允许回退成普通 SaaS 卡片、抽象科技海报或图片展览。

### 首屏视觉比例

- 桌面端首屏必须读成一个完整品牌场景：左侧 `Social World` 是第一记忆点，右侧真实城市图像和同频心核是信号装置，不是两列均分版式。
- `Social World` 标题必须具备压迫感、短距离识别度和企业级重量；不得被右侧图片、心核、卡片或动效抢走主视觉。
- 右侧图片必须是硬边几何切片，承担“真实城市场景”的证据作用；不得变成柔和插画卡、圆角相册或普通 hero mockup。
- 同频心核必须嵌入首屏信号系统，视觉上与城市影像、路线、边界和需求有关联；不得漂浮成装饰性科技球。
- 首屏 CTA 保持双按钮秒杀式，但不能扩大到破坏品牌标题的主导地位。

### 活动轨道质感

- `ActivityOrbit` 必须读成三层城市信号带：运动轨道、低压力轨道、兴趣轨道。它不是横向卡片列表。
- 图片卡片必须有层级、切片、内发光、暗部压制和轨道线连接，形成“城市计划被点亮”的结构感。
- 每张图片必须服务于一个真实活动计划：夜跑、健身、攀岩、球馆、骑行、野餐、桌游、咖啡、遛狗、露营、Cos、游戏、音乐节、徒步等。
- 图片上不得直接写 UI 文案、Logo、HUD、小点阵或假数据；文案必须由 HTML 层表达。
- 鼠标交互只能增强空间深度，不得造成文字遮挡、图片晃动过度或 GPU 负担失控。

### GSAP 与性能边界

- 继续使用 `useGSAP` 的 scoped 动画写法；ScrollTrigger 只能绑定顶层 tween/timeline，不允许嵌套到子 tween。
- 动效优先使用 transform、opacity、CSS variable；不得用 top/left/width/height 做滚动主动画。
- reduced-motion 下必须保留完整信息结构，禁用高频位移和轨道倾斜。
- 首屏和活动轨道不得引入 video、MP4、WebM 或远程运行时素材。

### 桌面验收口径

- `1366x900`：首屏不应像元素挤压后的响应式妥协版；标题、CTA、证明条、右侧图像和心核都必须可读。
- `1440x1000`：首屏应形成最标准的官网展示比例，可作为主验收截图。
- `1920x1080`：首屏必须有足够品牌冲击力，不允许大片空洞黑场或元素过散。
- 活动轨道在三个桌面视口下都必须保持“信号带”观感，不允许退化成普通轮播。
## V5.128 Static Media Governance Standard

当前官网视觉资产必须遵守 `FITMEET_STATIC_MEDIA_GOVERNANCE.md`。

核心判断：

- 官网不是用图片填满页面，而是用图片证明真实计划正在发生。
- `public/images/enterprise/*.png` 必须通过 `enterpriseAssets.ts` 进入页面，不允许散落硬编码。
- 每张图必须对应一个页面任务：Hero、Need Input、Agent Plan、City Signal、Activity Signal、Safety Layer、Business Value。
- 图片不得包含水印、文字、Logo、HUD、UI 面板、假数据、假合作方或 dating 暗示。
- 如果现有图片不足，才使用 `image_gen` 生成摄影级静态图；生成后必须复制进 workspace 并更新数据源和治理文档。
- 旧视频生产链路不能反向影响当前无视频官网设计，官网不得为了“像电影”而重新引入 `<video>`。

设计原则：

- 真实图片负责“生活发生了”。
- SVG / Canvas / CSS 3D 负责“同频信号系统”。
- HTML 文案负责“产品解释”。
- GSAP 负责“滚动叙事与空间响应”。

任何一层越界都会降低完成度：图片不能变成 UI，SVG 不能假装真实生活，文案不能写进图片，动效不能掩盖资产质量不足。

## V5.130 Homepage Chrome Visual QA Repair

本节来自 Chrome 三视口截图验收：

- Evidence directory: `output/qa/v5.130-homepage-visual-screenshots/`
- Viewports: `1366x900`、`1440x1000`、`1920x1080`

修正结论：

- 首屏桌面 caption 与 CTA / 证明条发生视觉干扰，因此桌面端隐藏 `heroSceneCaption`，保留真实夜跑图片作为背景证据。
- 右侧同频心核需要更明确地承担信号装置角色，因此增强 opacity、尺寸和红色发光，但不让它抢走 `Social World` 主记忆。
- ActivityOrbit 原截图中卡片露出太晚，像标题页；修正后卡片轨道提前进入视口，三条信号带更清楚。
- ActivityOrbit 标题从竖向碎裂恢复为横向强标题，避免像排版事故。

当前判断：

- 首页首屏比 v5.129 更接近“品牌场景”而不是 SaaS hero。
- ActivityOrbit 比 v5.129 更接近“城市同频信号带”而不是图库轮播。
- 仍不能签收最终获奖级，因为只完成首页局部截图验收，未完成全站 Chrome 签收。
