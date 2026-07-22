# FitMeet Social World 全站执行手册 V5.0

## 1. 执行顺序

所有品牌页遵循同一流程：

```text
Research → Document → Visual target → Asset plan
→ Implement first viewport → Browser compare
→ Implement remaining sections → Interaction QA
→ Desktop viewport QA → Typecheck → Build
```

禁止先写页面再补文档。文档可以在设计过程中调整，但代码、视觉目标和文案源必须保持同步。

## 2. 当前状态

### 已实现

- `/` Home / Social Orbit homepage
- `/world` Social Atlas / four destination journey
- `/agent` Semantic Concourse / interactive social plan
- `/safety` Trust Radius / five trust layers
- `/community-guidelines`、`/privacy`、`/terms` editorial reading rooms
- 首页摄影、Agent 演示、Safety 摘要与最终上线舱
- 首页桌面浏览器验收

### 已完成设计合同，待实现或实施中

- `/moments` — direction 1 selected, implementation in progress
- `/about`
- `/app`

### 需要法务正文

- `/privacy`
- `/terms`

## 3. 文档职责

- `README.md`：产品、站点地图、实现状态与运行方式。
- `DESIGN.md`：全站最高视觉与产品表达合同。
- `FITMEET_SITE_ARCHITECTURE.md`：路由、导航、用户路径和转场矩阵。
- `FITMEET_PAGE_STORYBOARDS.md`：全部二级页的桌面滚动分镜。
- `FITMEET_COPY_DECK.md`：唯一正式文案源与禁止表达。
- `FITMEET_HOME_FIELDLINE_LAYOUT.md`：首页已实现分镜。
- `FITMEET_EXECUTION_MANUAL.md`：工作顺序、实现与验收规范。
- `design-qa.md`：当前已实现页面的证据与缺陷记录。

## 4. 参考研究

### Floema

- Home：中心宣言、影像碎片、小图进入全屏章节。
- Products：集合筛选与高密度探索。
- About：大图宣言、拖拽时间轴、设计/建造/实施过程和团队。
- Sustainability：主张、材料系统、项目案例和支柱。
- Journal：分类索引、专题案例和编辑长文。
- Product Detail：单一对象、克制说明、规格和相关内容。
- Case Study：全屏影像、阅读时间、画廊、长文与项目详情。

参考页面只用于提炼空间和内容节奏。不得复制素材、文案、分类和坐标。

## 5. 视觉目标流程

在实现每个品牌页前：

1. 确认 `FITMEET_PAGE_STORYBOARDS.md` 中的本页分镜。
2. 从 `FITMEET_COPY_DECK.md` 提取允许出现的首屏和章节文案。
3. 建立一张完整首屏视觉目标和每个关键章节的独立视觉目标。
4. 记录真实摄影、App UI、图标和视频清单。
5. 视觉目标不清晰、文字不可读或章节缺失时不得开始实现。

每页必须记录：

- 背景温度与明暗。
- 主标题大小与行数。
- 摄影比例、焦点与裁切。
- 允许使用的结构组件。
- 首屏可见文案白名单。
- 主要动效、转场和 Reduced Motion 状态。

## 6. 建议代码结构

```text
app/
  page.tsx
  world/page.tsx
  moments/page.tsx
  agent/page.tsx
  safety/page.tsx
  about/page.tsx
  app/page.tsx
  community-guidelines/page.tsx
  privacy/page.tsx
  terms/page.tsx

components/
  social-world/
    SocialWorldHomepage.tsx
  site-shell/
    GlobalNavigation.tsx
    GlobalFooter.tsx
    StoreCapsule.tsx
    SpatialTransition.tsx
  world-page/
  moments-page/
  agent-page/
  safety-page/
  about-page/
  app-page/
  editorial-page/

lib/
  site-navigation.ts
  world-page-content.ts
  moments-page-content.ts
  agent-page-content.ts
  safety-page-content.ts
  about-page-content.ts
  app-page-content.ts
```

共享导航、页脚和商店舱只保留一个实现。页面专属空间动画不得堆入全局组件。

## 7. 实现顺序

1. `site-shell`：导航、页脚、页面状态和转场遮罩。
2. `/world`：建立多页系统和摄影地图基线。
3. `/agent`：产品理解与真实本地交互。
4. `/safety`：五层信任半径。
5. `/app`：界面轨道与下载转化。
6. `/about`：品牌起点和 NOW/NEXT/LATER。
7. `/moments`：先实现授权等待状态；真实素材到位后再发布故事。
8. `/community-guidelines`、`/privacy`、`/terms`。

## 8. GSAP 与滚动规则

- 统一使用 `useGSAP()` 和组件 scope。
- ScrollTrigger 按页面从上到下创建。
- 固定容器不参与 transform，动画内部子层。
- 高频鼠标跟随使用 `gsap.quickTo()`。
- 序列动画使用 timeline 与 position parameter，不堆叠 delay。
- 横向胶片/时间轴的主移动 tween 使用 `ease: "none"`。
- 重叠章节的装饰容器默认不接收鼠标，只恢复实际 CTA。
- 字体和图片改变布局后调用一次 `ScrollTrigger.refresh()`。
- 页面卸载时自动清理 timeline、ScrollTrigger、监听器和视频。

## 9. 页面转场

- 所有导航链接必须是真实路由，不以动画代替浏览器导航。
- 过渡时当前主要视觉扩张、缩小或变成曲线蒙版。
- 转场建议时长 `650–1000ms`。
- 页面内容加载失败时仍需显示目标页语义内容，不停留在转场层。
- Reduced Motion 直接导航，并仅使用短淡入。

## 10. 素材

### 页面素材准入

在实现任何新的一级页面前：

1. 打开 `FITMEET_ASSET_DIRECTION.md`，为该页预留专属 Hero Master。
2. 验证该源图未被其他一级路由作为全屏媒体使用。
3. 构图不合适时必须生成专属资产，不能拉伸、强行裁切或依赖滤镜掩盖问题。
4. 将 `企业官网/` 中选中的 PNG 转换为优化 JPEG/AVIF，以英文文件名存入页面专属 `public/images/{page}/`。
5. 登记源文件、输出路径、焦点、加载策略和文件体积。
6. 在 `design-qa.md` 加入跨页图片重复检查；意外全屏复用记为 P1。

`企业官网/` 只作为源素材库，页面组件不得直接引用该目录。

### World

- 8–10 张横向大场景：夜跑、球场、旅行出发、海岸、露营、徒步、城市摄影、公共活动。
- 4–6 张装备、地图、集合点细节。

### Moments

- 4 组真实授权故事。
- 每组至少包含环境、共同动作和细节照片。
- 未授权时只使用品牌预告，不展示虚构人物证言。

### Agent

- 1 段 8–12 秒真实场景或产品轨迹视频。
- 5–6 个代码原生 App UI 状态。

### Safety

- 3 张公共空间与人物边界摄影。
- 不使用通用盾牌插画。

### About

- 城市观察、需求发生和产品构建细节。
- 不使用虚构团队、办公室或历史档案。

### App

- 一套统一视角的产品界面状态。
- 不使用虚构二维码、评分、下载量和商店评价。

## 11. 视频

- 不进入首页关键媒体路径。
- `preload="none"`，不设置 HTML `autoPlay`。
- IntersectionObserver 进入视口播放，离开暂停。
- Reduced Motion 使用 poster。
- 浏览器视频建议 8–12 秒、无声、H.264、约 6–7MB。

## 12. 桌面浏览器验收

每个品牌页至少检查：

- 首屏。
- 一处代表性空间动效中间状态。
- 最后一章与页脚连续性。
- 页面导航到另一个品牌页。
- Reduced Motion 文档流。

固定视口：

```text
1440 × 1000
1680 × 1050
1920 × 1080
```

必须验证：

- 页面身份、非空内容、无框架错误层。
- 无横向溢出和主要文字裁切。
- 导航、CTA、商店和主要交互键盘可用。
- 图片、视频和 poster 失败状态不闪白。
- 控制台无应用 error/warn。
- 实现截图与视觉目标在相同视口对比。
- 首屏文案与 `FITMEET_COPY_DECK.md` 白名单一致。

## 13. 生产门禁

```bash
pnpm -s typecheck
pnpm -s build
```

最终代码更改之后重新执行，不能使用中间版本的通过结果代替最终验证。

## 14. 发布边界

- 不恢复用户已经删除的 `public/images/home-v5` 与 `public/videos/home-v5`。
- 不接入真实匹配、账号、支付或后端，除非用户明确扩展范围。
- 不制造商店地址、二维码、评价、成功率或合作品牌。
- 不把未来生活服务写成当前上线能力。
- 不把辅助型 Agent 写成全自动代理。
- Privacy 和 Terms 未经法律审核不得标记为正式生效版本。
- 本期不实现手机和平板布局。
