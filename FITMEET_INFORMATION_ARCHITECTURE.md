# FitMeet Information Architecture

## V5.112 Full-Site No-Video IA Override

当前信息架构不再把视频作为任何核心页面的必要模块。

新媒体表达：

1. Home：真实图片 + SignalPrism + 城市信号 Canvas。
2. Product：静态公开场景图 + 计划收据 + 机制轨道。
3. Scenes：静态活动图 + 连续场景走廊。
4. Community：静态城市生活图 + 节点网络。
5. Safety：静态公共空间图 + 边界协议。
6. About：静态城市愿景图 + 公司宣言。
7. Journal：静态 editorial poster + 内容增长入口。
8. Contact：静态到场意图图 + 合作路径。

旧 IA 中关于 Runway、Pika、Hero 视频、实验短片、本地 WebM fallback 的内容降级为历史参考，不再作为当前官网页面目标或验收条件。

## Canonical Docs

本文档定义整站信息架构，优先级高于旧首页专项文档和旧辅助页方案。

阅读顺序：

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
8. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

## Site Thesis

FitMeet 官网不是展示功能清单，而是把一个年轻人的真实想法变成一次真实到场。

核心创意：

`Social World：一句想法，变成一次真实到场。`

站点结构服务三类对象：

1. 年轻用户：理解 FitMeet 怎么降低线下社交启动成本。
2. 企业/场馆/品牌：理解 FitMeet 为什么能带来更精准、更高效的到场意图。
3. 媒体/合作方/未来成员：理解 FitMeet 的公司愿景、技术方向和安全边界。

## Primary Navigation

最终导航建议：

1. 首页：`/`
2. 产品：`/product`
3. 场景：`/scenes`
4. 社区：`/community`
5. 安全：`/safety`
6. 关于：`/about`
7. 动态：`/journal`
8. 联系：`/contact`

CTA：

- 主 CTA：`开始一次真实计划`
- 企业 CTA：`联系企业合作`

历史路由兼容：

- `/world` 可作为 `/community` 的别名或重定向。
- `/agent` 可作为 `/product` 的别名或重定向。
- `/stories` 可作为 `/journal` 的内容入口或重定向。
- `/partners` 可并入 `/contact` 的企业合作模块，或作为 `/contact#enterprise` 的别名。
- `/join` 可并入 `/contact` 的个人 Waitlist 模块。

## Core Pages

### 1. Home `/`

页面目标：

3 秒内建立 `Social World` 记忆，让访客知道 FitMeet 是从真实想法到真实到场的年轻人城市生活平台。

用户：

- 第一次进入官网的年轻用户。
- 企业合作方。
- 媒体和投资观察者。

核心 CTA：

- `开始一次真实计划`
- `了解社交 Agent`

页面模块：

1. Hero：`Social World`，背景是真实城市生活图片、SignalPrism 和 Canvas 信号层。
2. Problem：人很多，但真正能一起做事的人很少。
3. Solution：先有计划，再出现合适的人。
4. Social World：城市里的计划连成社交世界。
5. Vision：让城市重新变得可连接。
6. CTA：从一句真实需求开始。

视觉资产：

- 真实夜跑和城市生活静态影像。
- 真实城市夜色、球馆、街角、到场镜头。
- 少量红色路线光，不能变 HUD。

SEO：

- Title：`FitMeet | Social World`
- Description：`一句想法，变成一次真实到场。FitMeet 用社交 Agent 把真实生活需求变成有边界、可执行的线下计划。`
- Keywords：社交 Agent、城市社交、运动搭子、真实计划、Social World。

Trust 要求：

- 首页必须在真人出现前表达公开场景和边界。
- 不出现假数据和假合作 logo。

### 2. Product `/product`

页面目标：

解释 FitMeet 如何把一句需求变成真实计划。

用户：

- 想理解产品机制的用户。
- 想判断合作价值的企业。
- 想理解技术方向的人。

核心 CTA：

- `体验计划生成`
- `查看真实场景`

页面模块：

1. Hero：`从需求到计划，从计划到真实连接。`
2. Need Understanding：识别活动、时间、地点、强度、人数。
3. Context Analysis：判断路线、距离、社交压力、公开场景。
4. Plan Generation：生成路线、场地、集合点、备选方案。
5. Boundary Protocol：公开地点、可退出、确认后邀请。
6. Match Reason：同频不是头像相似，而是计划合拍。
7. Plan Receipt：展示一次完整计划收据。
8. CTA：`把一个想法交给 Agent`

视觉资产：

- 计划生成轨道。
- 计划收据。
- Agent 机制图。
- 不使用聊天机器人窗口作为主视觉。

SEO：

- Keywords：社交 Agent、AI 计划生成、线下社交、活动匹配、边界确认。

Trust 要求：

- 明确 Agent 不是陪聊，不替用户制造关系，只组织计划和边界。

### 3. Use Cases `/scenes`

页面目标：

用具体生活场景证明产品，不让网站停留在抽象概念。

用户：

- 年轻用户。
- 场馆和生活方式品牌。

核心 CTA：

- `选择一个真实场景`
- `让场景进入合作`

页面模块：

1. Hero：`每一次连接，都从一件具体的事开始。`
2. Night Run：夜跑，不想一个人。
3. Court：球馆，强度清楚。
4. Board Game：桌游，公开空间和人数边界。
5. Citywalk：城市漫游，低压力同行。
6. Weekend Trip：短途，预算和时间清楚。
7. Scene Receipt：每个场景都有计划、边界、同频理由。
8. CTA：`从你的场景开始`

视觉资产：

- 真实静态图片、锐利裁切、场景证明和滚动连续性。

SEO：

- Keywords：夜跑搭子、羽毛球搭子、桌游搭子、citywalk、城市漫游、周末短途。

Trust 要求：

- 每个场景必须写公开地点、人数范围、可退出机制。

### 4. Community `/community`

页面目标：

把 FitMeet 从一个功能产品升级成城市生活网络。

用户：

- 对长期愿景感兴趣的用户。
- 企业/场馆/城市生活合作方。

核心 CTA：

- `进入 Social World`
- `成为城市节点`

页面模块：

1. Hero：`城市里的计划，正在连成一个社交世界。`
2. City Nodes：夜跑、球馆、桌游、街角、短途节点。
3. Community Loop：需求、计划、到场、复访。
4. Low-pressure Social：低压力社交和公开空间。
5. Partner Nodes：场馆、活动空间、生活方式品牌如何成为节点。
6. Future Blueprint：未来 3-5 年城市社交基础设施。
7. CTA：`让一座城市开始连接`

视觉资产：

- 城市真实影像串联。
- 少量路线光。
- 不做数据大屏。

SEO：

- Keywords：城市社交、社区生活、Social World、年轻人活动、真实到场。

Trust 要求：

- 社区叙事不能暗示公开暴露个人位置。

### 5. Trust & Safety `/safety`

页面目标：

让用户和企业相信 FitMeet 的社交顺序：先边界，再靠近。

用户：

- 担心安全的用户。
- 家庭、媒体、企业合作方。

核心 CTA：

- `在边界内开始`
- `查看隐私规则`

页面模块：

1. Hero：`先确认边界，再靠近彼此。`
2. Public-place First：公开地点先成立。
3. Confirmation Gate：计划确认前不邀请。
4. Exit Mechanism：可退出，不强迫续场。
5. Report / Block：举报和屏蔽入口。
6. Privacy：位置隐私、敏感信息不共享。
7. Minors Boundary：未成年人边界。
8. Safety Receipt：一次计划如何通过安全流程。

视觉资产：

- 清晰流程。
- 低噪音 proof matrix。
- 不做恐吓式视觉。

SEO：

- Keywords：安全社交、公开地点、隐私保护、低压力社交、边界确认。

Trust 要求：

- 本页为 Trust 核心，不可弱化。

### 6. About `/about`

页面目标：

讲清现在计划、行业痛点、技术/产品路径、3-5 年愿景和最终目标。

用户：

- 对公司感兴趣的人。
- 潜在成员。
- 媒体、投资和合作方。

核心 CTA：

- `了解产品与服务`
- `联系企业合作`

页面模块：

1. Hero：`我们不从关系开始。我们从真实生活开始。`
2. Industry Pain：社交行业不是缺人，而是人出现太早、场景出现太晚。
3. Current Plan：用社交 Agent 重新组织真实需求。
4. Product Belief：好的社交让人更接近生活。
5. 3-5 Year Vision：帮助年轻人和场馆形成真实生活连接。
6. Final Ambition：改变人和城市连接的方式。
7. CTA：`一起建设 Social World`

视觉资产：

- 公司宣言。
- 城市影像。
- 未来蓝图。

SEO：

- Keywords：FitMeet 公司、Social World、社交 Agent、城市生活平台。

Trust 要求：

- 未来目标必须写成目标和希望，不伪装为已完成数据。

### 7. Journal `/journal`

页面目标：

承担 SEO、品牌内容增长、产品更新和长期表达。

用户：

- 搜索用户。
- 媒体。
- 合作方。
- 对趋势感兴趣的人。

核心 CTA：

- `阅读产品进展`
- `联系合作`

栏目：

1. 产品进展。
2. 城市观察。
3. 技术实验。
4. 合作动态。

文章方向：

- 社交 Agent 如何理解一句真实需求。
- 为什么先生成计划，再出现真人。
- 年轻人为什么越来越难发起线下小事。
- 真实计划为什么比兴趣标签更重要。
- 品牌如何进入真实到场意图。

视觉资产：

- 轻视频或静态 poster。
- 不堆重交互。

SEO：

- 每篇文章独立 metadata。
- 长尾关键词围绕场景和问题。

Trust 要求：

- 不写公关稿，不伪造研究数据。

### 8. Contact / Waitlist `/contact`

页面目标：

收敛个人体验、企业合作、测试加入。

用户：

- 想体验产品的用户。
- 企业合作方。
- 媒体和招聘线索。

核心 CTA：

- `加入早期体验`
- `联系企业合作`

必须出现：

`15253005312@163.com`

页面模块：

1. Hero：`从一个真实想法开始。`
2. User Waitlist：写下真实需求。
3. Enterprise Contact：更精准用户、更省时、更高效。
4. Cooperation Value：未来能带来的效益。
5. Direct Email：合作邮箱。
6. Thank You Path：提交成功后进入 `/thank-you`。

视觉资产：

- 清晰表单。
- 计划收据。
- 企业合作 proof。

SEO：

- Keywords：FitMeet 联系、企业合作、社交 Agent 合作、到场意图。

Trust 要求：

- 不承诺未上线能力，不制造虚假客户案例。

## System Pages

### Privacy `/privacy`

必须包含：

- 收集什么。
- 为什么收集。
- 位置和公开场景如何处理。
- 企业合作不共享敏感个人信息。
- 用户如何控制数据。

### Terms `/terms`

必须包含：

- 真实社交契约。
- 用户责任。
- 平台边界。
- 活动风险提示。
- 禁止骚扰、冒充、恶意行为。

### Cookie `/cookies`

必须包含：

- Cookie 类型。
- 分析工具。
- 用户控制方式。
- 未来合规预留。

### 404 `/not-found`

文案：

`这条路线暂时没有计划。`

CTA：

- `回到 Social World`
- `开始一次真实计划`

### Thank You `/thank-you`

文案：

`你的真实需求已进入计划队列。`

CTA：

- `继续了解产品`
- `查看安全边界`


## V5.080 IA Status: Safety / Trust & Safety `/safety`

Current implementation status:

- `/safety` now uses a dedicated Trust & Safety experience instead of the generic SocialWorldPage template.
- Page goal: prove that FitMeet handles real-world social connection through product sequence and boundary controls.
- Primary user: young users deciding whether public social plans feel safe enough to try.
- Secondary user: enterprise/cooperation evaluators checking whether FitMeet has a responsible data and social-boundary story.

Current module structure:

1. Hero: `先确认边界，再靠近彼此。`
2. Safety Protocol: public place, boundary confirmation, exit mechanism, report/block, privacy, minors boundary.
3. Gate Sequence: need, public scene, boundary, confirmation, invitation, safety receipt.
4. Safety Receipt: demand, public location, people preference, exit mechanism, privacy boundary, confirmed invitation, governance entry.
5. Minors Boundary: minors do not enter the default open social flow.
6. Trust Edges: personal, enterprise, city-level responsibilities.
7. CTA: start within boundaries, or read privacy rules.

Current CTA contract:

- Primary: `/contact#waitlist`
- Secondary: `/privacy`

Current SEO contract:

- Title: `安全与边界 | FitMeet`
- Description explains public locations, exit mechanism, report/block, privacy protection, minors boundary, and confirmed invitation.

Non-regression rules:

- Do not collapse `/safety` back into a generic section page.
- Do not remove `未成年人边界`, `退出机制`, `举报`, `屏蔽`, `隐私保护`, `确认后邀请`, or `安全收据` from visible Chinese copy.
- Do not add fake trust badges, fake partners, fake certifications, or dating-oriented language.

## V5.081 IA Status: About `/about`

Current implementation status:

- `/about` now uses a dedicated company narrative experience instead of the generic SocialWorldPage template.
- Page goal: explain why FitMeet exists, what industry pain it addresses, what it is building now, what it hopes to change in 3-5 years, and the final ambition.
- Primary user: visitors deciding whether FitMeet is a credible youth city social platform company.
- Secondary user: future members, partners, media, investors, and collaborators evaluating company direction.

Current module structure:

1. Hero: `我们不从关系开始。我们从真实生活开始。`
2. Industry Pain: social industry pain is not lack of people; people appear too early and scenes appear too late.
3. Current Plan: social Agent reorganizes real needs into real plans.
4. Product Belief: not more chat, more real plans.
5. 3-5 Year Vision: make real social connection part of city infrastructure.
6. Horizon: youth plans, local venues/brands/spaces, public scenes and boundary confirmation.
7. What We Refuse: no profile shelf, no relationship commodity language, no cold-start contact, no fake proof.
8. Final Ambition: change how people and cities connect.
9. CTA: build Social World or read Journal.

Current CTA contract:

- Primary Hero CTA: `/product`
- Secondary Hero CTA: `/safety`
- Final CTA: `/contact#waitlist`
- Secondary Final CTA: `/journal`

Current SEO contract:

- Title: `关于我们 | FitMeet`
- Description explains social Agent, real-life needs, confirmable plans, and real arrival.

Non-regression rules:

- Do not collapse `/about` back into a generic company page.
- Do not remove industry pain, current plan, product belief, 3-5 year vision, or final ambition.
- Do not present future goals as completed data.
- Do not add fake users, fake partners, fake growth, fake logos, or dating-oriented language.

## V5.083 IA Status: `/contact`

Priority: canonical IA status for Contact / Waitlist / Enterprise Cooperation.

Page goal:
Convert three kinds of intent into the correct next path: personal early access, enterprise cooperation, and safety/privacy concerns.

Primary users:
- Young users who want FitMeet to help organize a real city-life plan.
- Enterprise partners such as venues, brands, activity spaces, local services, and city lifestyle operators.
- Users or stakeholders who need safety, privacy, or boundary information.

Core CTA:
- Personal: `加入早期体验`
- Enterprise: `联系企业合作`, `合作请联系：15253005312@163.com`
- Safety: `查看安全边界`

Module order:
- Hero: real idea intake, dual CTA, citywalk media.
- Entry Routes: personal / enterprise / safety paths.
- Waitlist: user signal explanation.
- Enterprise: business value and direct email.
- Value Matrix: precision, time saved, conversion efficiency, real feedback, long-term scene assets.
- Intake Order: demand, boundary, path, next step.
- Boundary: safety and privacy path separation.
- Final CTA: direct mail and thank-you path.

SEO target:
`联系与合作 | FitMeet` must explain early experience, enterprise cooperation, and real-demand conversion.

Trust requirement:
Safety concerns must never be treated as ordinary marketing or partnership leads.

## V5.084 IA Status: `/journal`

Priority: canonical IA status for Journal / Resources.

Page goal:
Support SEO, brand content growth, product updates, and long-term explanation of Social World.

Primary users:
- Search users trying to understand city social friction.
- Media readers looking for company/product framing.
- Early users evaluating whether FitMeet understands real life.
- Business partners evaluating whether FitMeet can connect real demand to real scenes.

Core CTA:
- Primary: `阅读产品进展`
- Secondary: `联系合作`
- Final: `查看产品机制`, `联系合作`

Module order:
- Hero: editorial claim and city-network poster.
- Content Channels: local interactive filter for product, city, lab, cooperation.
- Topic Rail: concrete article directions and SEO terms.
- Current Question: one idea -> one plan -> one arrival.
- SEO / Long Tail: durable search topic queue.
- Editorial Rules: credibility constraints.
- Final CTA: product mechanism and cooperation path.

SEO target:
Journal must rank through specific questions, not fake authority: social Agent, real plans, public locations, young people's offline initiation friction, and scene-based cooperation.

Trust requirement:
Do not invent research data, user numbers, partner proof, or published outcomes.

## V5.085 System Page IA Status

The system page IA is implemented and verified.

Routes and page jobs:

- `/privacy`: explain what FitMeet collects, why it is used, how location/public scenes work, what enterprise cooperation cannot access, and how users control deletion or correction.
- `/terms`: define the real social contract, user responsibility, platform boundary, activity risk, and prohibited behavior including harassment, impersonation, and malicious behavior.
- `/cookies`: explain necessary cookies, future analytics cookies, what FitMeet will not do, and user control through browser settings and future consent paths.
- `/not-found`: make missing routes feel like Social World route recovery, not a generic error.
- `app/not-found.tsx`: route every unknown path into the same Social World 404 language.
- `/thank-you`: confirm that a submitted demand or cooperation signal entered a plan queue, not a generic lead form.

IA rule:

System pages must prove trust before style. They can look strong, but their primary job is clarity, boundaries, and recovery.

## V5.120 Legacy Route Canonicalization

Historical routes are now permanent compatibility redirects, not alternate pages.

Canonical mapping:

1. `/agent` permanently redirects to `/product` because Agent explanation belongs to the Product page.
2. `/world` and `/cities` permanently redirect to `/community` because city/world narrative belongs to Community.
3. `/stories` and `/press` permanently redirect to `/journal` because narrative, content, and media updates belong to Journal.
4. `/partners` permanently redirects to `/contact#enterprise` because enterprise cooperation belongs to Contact.
5. `/join` permanently redirects to `/contact#waitlist` because early access belongs to Contact.
6. `/investors` permanently redirects to `/about` because company thesis and future vision belong to About.
7. `/faq` permanently redirects to `/safety` because user objections and trust concerns must resolve through Trust & Safety.

Design rule:

Do not resurrect these routes as separate template pages. A 2026 award-level site needs a clear information architecture more than many thin pages.
