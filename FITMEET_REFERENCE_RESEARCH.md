# FitMeet Reference Research

## Canonical Docs

本文档只定义参考来源和吸收方式，不直接覆盖设计标准。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Reference Principle

参考不是复制。FitMeet 只吸收结构、节奏、方法和质量标准，不复制外部站点文案、资产、行业语言或视觉皮肤。

目标：

`Social World：一句想法，变成一次真实到场。`

参考必须服务这个目标，否则不进入主流程。

## Websites

### Cipher Digital

用途：

- 企业级节奏。
- 短句 Hero。
- 基础设施感。
- 可信 proof。
- 清楚的公司收束。

FitMeet 转化：

- `Built for Hyperscale` 的短句纪律转化为 `Social World`。
- 数据中心能力 proof 转化为真实计划、边界、到场意图 proof。
- 企业资源区转化为企业合作、Trust、About。

禁止：

- 不复制数据中心语境。
- 不使用 MW/GW/capacity 这类无关指标。

### digitalists.at

用途：

- 年轻创意 agency 感。
- 视觉人格。
- 页面互动密度。
- 案例节奏。

FitMeet 转化：

- 用年轻、快速、有态度的视觉节奏表达城市生活。
- 用真实场景代替 agency case。
- 用短句和运动感避免企业官网老气。

禁止：

- 不把 FitMeet 做成设计机构官网。

### units.gr

用途：

- 社区生活方式。
- 真实空间。
- 年轻人生活密度。
- 公共区域和 community 叙事。

FitMeet 转化：

- 把社交从 App 功能升级为城市生活网络。
- 用球馆、桌游空间、街角、路线、短途目的地替代抽象系统图。

禁止：

- 不把 FitMeet 做成地产/公寓站。

### Awwwards

用途：

- 获奖级完整体验标准。
- 视觉、交互、内容、可用性、整体感的综合判断。

FitMeet 转化：

- 每个核心页面必须同时考虑影像、文案、动效、Trust、性能和 SEO。
- 不用“炫”替代“完成度”。

### Codrops

用途：

- GSAP。
- WebGL。
- Scroll-driven image motion。
- Creative frontend experiments。

FitMeet 转化：

- 参考滚动影像、mask、image sequence、layout transition。
- 用在具体产品叙事中，不做无意义 demo 展示。

### Runway

用途：

- 正式 Hero 视频。
- 品牌大片。
- 电影感关键视觉。

FitMeet 转化：

- 首页 Hero 夜跑主视觉。
- Vision 到场意图大片。

### Pika

用途：

- 免费/低成本实验片段。
- 中段潮流短视频。
- 球馆、桌游、城市漫游等场景测试。

FitMeet 转化：

- 先用 Pika 测镜头，再决定是否用 Runway 精修。

## Technical References

### Next.js Docs

用途：

- App Router。
- Metadata API。
- 系统页面。
- SEO 和分享图。

FitMeet 转化：

- 8 个核心页面都必须有独立 metadata。
- `/privacy`、`/terms`、`/cookies`、`/not-found`、`/thank-you` 作为系统页纳入站点结构。

### GSAP ScrollTrigger Docs

用途：

- scroll trigger。
- pin。
- scrub。
- timeline。
- scroll storytelling。

FitMeet 转化：

- 让“想法 -> 计划 -> 场景 -> 边界 -> 真人 -> Social World”在滚动中发生。
- 约束动画目标和视觉 owner。

## GitHub Projects

### VoltAgent/awesome-design-md

用途：

- 学习 `DESIGN.md` 结构。
- 学习 agent-friendly design docs。

FitMeet 转化：

- 文档必须写成可执行标准，而不是审美散文。
- 每份文档要能指导后续 agent 不跑偏。

禁止：

- 不照搬项目中的视觉口径。

### greensock/gsap-skills

用途：

- GSAP 写法约束。
- ScrollTrigger 目标绑定。
- React 生命周期。

FitMeet 转化：

- 每个动画必须绑定 `data-motion-scope` 或明确 owner。
- 禁止跨 section 全局动画目标。

### codrops/ScrollBasedLayoutAnimations

用途：

- 参考滚动布局切换和视觉状态迁移。

FitMeet 转化：

- 用于 Product/Community 的连续叙事。
- 不照搬布局和视觉。

## Tools We Do Not Prioritize

### HeyGen

不进入主流程。只适合未来创始人口播、招聘视频、产品讲解。

### Shutterstock

暂不使用。没有预算时不碰授权素材，不使用水印素材作为最终资产。

### Fal

暂不作为主流程。用户已有 Runway/Pika，优先使用已登录账号和免费/已有额度。

### Spline

暂不进入核心路径。只有明确需要品牌级 3D 标志物时再评估。

### Rive

可作为二期产品机制图和按钮状态，不进入当前文档主依赖。

## Research-to-Design Mapping

| Reference | Absorb | FitMeet Output |
| --- | --- | --- |
| Cipher | 企业节奏、短句、proof | Home / About / Enterprise 合作叙事 |
| digitalists | 年轻视觉和互动 | Scenes / Journal 的年轻感 |
| units | 社区生活方式 | Community / Social World |
| Awwwards | 完成度标准 | Acceptance Agent |
| Codrops | 前端实验 | Motion System |
| Runway | 电影视频 | Hero / Vision |
| Pika | 实验短片 | Scenes |
| Next.js | 路由和 SEO | IA / system pages |
| GSAP | 滚动叙事 | Motion System |

## Research Red Lines

1. 参考站不能成为视觉皮肤复制。
2. GitHub demo 不能直接搬进官网。
3. 视频工具不能代替产品表达。
4. 任何参考都必须落到真实计划、公开场景、边界和到场意图。
5. 不引入与年轻人城市生活无关的抽象科技语境。

## V5.083 Reference Application: Contact Page

Priority: reference usage note for `/contact`.

References applied:
- Cipher Digital: strong enterprise rhythm, short decision paths, company credibility without fake proof.
- digitalists.at: youth-oriented visual pulse and direct rhythm.
- units.gr: real city/community/lifestyle grounding instead of abstract SaaS form language.
- GSAP / greensock skill rules: scoped ScrollTrigger ownership, no global animation selectors, cleanup through React lifecycle.

What was not copied:
- No reference-site layout cloning.
- No fake agency awards, fake partner logos, fake metrics, or decorative dashboard noise.
- No abstract SVG hero art or profile browsing pattern.

## V5.084 Reference Application: Journal Page

Priority: reference usage note for `/journal`.

References applied:
- Cipher Digital: editorial discipline, short enterprise rhythm, credibility without fake proof.
- digitalists.at: younger creative pacing and stronger visual attitude for a content hub.
- units.gr: real places, community context, and lifestyle grounding.
- Codrops / GSAP: scroll rhythm and row-based motion without turning content into a gimmick.

What was not copied:
- No article card-wall clone.
- No fake magazine awards, fake issue dates, fake research, or fake partner logos.
- No profile browsing, dating framing, or abstract SaaS trend copy.

## V5.085 Reference Application: System Pages

Reference interpretation for system pages:

- Cipher Digital influence: enterprise-grade confidence, short language, fixed top navigation, protocol-style right rail.
- digitalists influence: stronger visual personality than a normal legal page, but no decorative clutter.
- units.gr influence: trust language remains grounded in real places, public scenes, and lived social behavior.
- Awwwards/Codrops influence: sharp visual rhythm and strong composition, not unnecessary motion.

Do not copy reference visuals into system pages. These pages translate the FitMeet Social World system into trust, recovery, and confirmation flows.
