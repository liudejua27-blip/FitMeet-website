# FitMeet Social World

FitMeet 是面向城市青年的辅助社交 Agent。用户说出运动、旅行、摄影或城市活动需求，Agent 理解时间、地点、兴趣和边界，帮助真实的人更容易见面。

品牌主张：

> **SOCIAL WORLD — 让社交更简单。**

产品边界：

> **Agent 让社交更轻，关系仍由人建立。**

## 网站目标

网站不是传统的功能型 SaaS 官网，而是一个持续存在的 Social World。首页先建立向往，二级页面分别解释场景、真实经历、Agent、安全、品牌愿景和 App。

品牌叙事页面以电脑端为主。本阶段验收视口为：

- `1440 × 1000`
- `1680 × 1050`
- `1920 × 1080`

## 信息架构

| Route | Page | Spatial idea | Status |
| --- | --- | --- | --- |
| `/` | Home | Social Orbit 影像星图 | implemented |
| `/world` | Social World | 无限场景地图 | implemented; desktop QA passed |
| `/moments` | Moments | 时间胶片与记忆档案 | temporary homepage bridge; standalone design specified; requires authorised real stories |
| `/agent` | Agent | 一句话形成社交轨道 | implemented; desktop QA passed |
| `/agent/try` | Agent 体验账号 | 移动端 FitMeet Agent 路演体验 | implemented; mobile-first QA passed |
| `/safety` | Safety | 透明边界与信任半径 | implemented; production build passed; visual QA pending browser connection |
| `/support` | Support | 安全问题后的可执行下一步 | implemented; desktop QA passed |
| `/about` | About | 从一个节点扩展到世界 | design specified |
| `/app` | App | 产品界面与上线舱 | design specified |
| `/contact` | Contact & Partnerships | 企业合作与公开联系网络 | implemented; desktop QA passed |
| `/community-guidelines` | Community Guidelines | 编辑型规则页 | implemented |
| `/privacy` | Privacy | 编辑型法务页 | implemented as principles; legal review explicitly pending |
| `/terms` | Terms | 编辑型法务页 | implemented as principles; legal review explicitly pending |

全站固定主导航为：

```text
WORLD / MOMENTS / AGENT / SAFETY / APP
```

About、Contact、Support、Community Guidelines、Privacy 和 Terms 进入统一企业页脚，避免顶部导航过密。二级页面会在品牌胶囊中显示当前页面上下文。

## 参考与原创边界

主要空间参考是 [Floema](https://www.floema.com/)：

- 首页：影像碎片靠近后进入全屏场景。
- Products：集合、筛选和高密度探索。
- About：大比例摄影、横向时间轴和过程叙事。
- Sustainability：宣言、材料、案例和原则逐层展开。
- Journal：编辑部索引、专题和案例长文。
- Product Detail：单一对象、克制说明、规格和相关内容。

只复用其空间语法和内容节奏。FitMeet 的人物、摄影、文案、场景顺序、Social Orbit、Logo 光谱、Agent 产品演示和商店上线舱必须原创。

## 文档

1. `DESIGN.md`：全站品牌与视觉系统最高合同。
2. `FITMEET_FLOEMA_REFERENCE_RESEARCH.md`：Floema 二级页面研究与 FitMeet 转译边界。
3. `FITMEET_SITE_ARCHITECTURE.md`：信息架构、导航和跨页面空间过渡。
4. `FITMEET_PAGE_STORYBOARDS.md`：全部品牌页的桌面分镜。
5. `FITMEET_COPY_DECK.md`：正式品牌文案与禁止表达。
6. `FITMEET_VISUAL_TARGETS.md`：页面视觉方向、选择状态与实现目标。
7. `FITMEET_AGENT_IMPLEMENTATION_SPEC.md`：Agent 页跨视觉方向共用的交互、数据与验收合同。
8. `FITMEET_ASSET_DIRECTION.md`：企业官网素材盘点、页面专属影像领地、生成提示词、命名与重复图片验收规则。
9. `FITMEET_SAFETY_IMPLEMENTATION_SPEC.md`：Safety 方向 1 的信任层级、真实状态、素材、动效与验收合同。
10. `FITMEET_MOMENTS_IMPLEMENTATION_SPEC.md`：Moments 方向 1 的胶片轨道、授权状态、素材与验收合同。
11. `FITMEET_HOME_FIELDLINE_LAYOUT.md`：已实现首页分镜。
12. `FITMEET_EXECUTION_MANUAL.md`：文档、素材、实现和验收操作手册。
13. `design-qa.md`：当前实现的浏览器验收记录。

## 技术栈

- Next.js 16、React 19、TypeScript
- CSS Modules
- GSAP、`@gsap/react`、ScrollTrigger
- Lenis 惯性滚动
- Remotion 品牌视频
- Next Image 场景图片优化

## 本地运行

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

默认访问：`http://localhost:3000/`

### 正式站点 URL

构建或部署前设置公开站点源地址：

```bash
NEXT_PUBLIC_SITE_URL=https://fitmeet.app
```

`metadataBase`、canonical、Open Graph/Twitter 图片、`sitemap.xml` 与 `robots.txt` 中的 sitemap 地址都使用该值。仓库默认使用已经登记在 `.env.example` 中的 `https://fitmeet.app`，部署环境仍应显式配置，避免环境漂移。

当前已实现的 World 页面：`http://localhost:3000/world`

当前已实现的 Agent 页面：`http://localhost:3000/agent`

当前已实现的移动端体验账号入口：`http://localhost:3000/agent/try`。该路由不要求登录，并提供 iOS 同步的五 Tab、Agent、发现、消息、关系、邀请、资料和设置体验；页面刷新后会重置为受控的路演状态。完整九步建档可从个人页进入，或直接打开 `http://localhost:3000/agent/try/onboarding`。

三端接口路径以 iOS `FitMeetCoreEndpoint.swift` 为唯一基线。Web 的路径、认证头和幂等写入规则见 `docs/THREE_CLIENT_API_PARITY.md`；体验账号保留相同字段与状态机，但不会写入真实用户数据。设置 `NEXT_PUBLIC_FITMEET_API_MODE=live` 后，Web 会启用同一 API 客户端的正式请求分支。

当前已实现的 Safety 页面：`http://localhost:3000/safety`

规则阅读室：`http://localhost:3000/community-guidelines`、`http://localhost:3000/privacy`、`http://localhost:3000/terms`

企业联系与支持：`http://localhost:3000/contact`、`http://localhost:3000/support`

## 设计底线

- 每个二级页面必须有独立空间创意，不能复制首页星图。
- 每个一级页面必须拥有独立 Hero Master；同一张主摄影不得跨页全屏复用。
- 世界与真实场景先于产品功能。
- 不使用通用 SaaS 卡片墙、头像墙、虚构指标或大面积 AI 渐变。
- 光谱只用于轨迹、节点、焦点、确认和可信状态。
- Agent 是辅助社交决策层，不是自动代理执行层。
- 当前未完成的能力统一标记为 `NEXT`、`逐步建立` 或 `即将上线`。
- Moments 不制造用户证言；真实故事必须取得人物与摄影授权。
- App Store / Google Play 未上线前不提供虚构地址。
- Privacy 与 Terms 的正式文本必须经过法律审核。
- `prefers-reduced-motion` 下停用惯性、固定卷轴、视差、路径绘制和视频播放。
- 品牌叙事页面暂不实现完整的手机与平板布局；`/agent/try` 是例外，按移动端优先实现并以 `393 × 852` 为验收视口。
