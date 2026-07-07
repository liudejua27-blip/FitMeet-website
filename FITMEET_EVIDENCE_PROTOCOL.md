# FitMeet Evidence Protocol

本文档优先级：验收证据协议。它约束 2026 获奖级官网目标的证据版本、命令顺序和最终签收口径。它不替代 `DESIGN.md` 的视觉标准，也不替代 Chrome 人工视觉判断。

## Current Evidence Version

当前证据链版本：`v5.129`

旧证据只能作为历史记录：

- `output/qa/v5.122-award-preflight.json`
- `output/qa/v5.123-fullsite-award-qa.json`
- `output/qa/v5.123-goal-completion-audit.json`

这些旧文件不能证明当前无视频静态媒体治理版本已经完成。

## Required Evidence Files

最终完成前必须具备以下当前版本证据：

- `output/qa/v5.129-build.log`
- `output/qa/v5.129-award-preflight.json`
- `output/qa/v5.129-fullsite-award-qa.json`
- `output/qa/v5.129-fullsite-award-screenshots/`
- `output/qa/v5.129-goal-completion-audit.json`
- `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`

## Command Order

推荐执行顺序：

```bash
npm run typecheck
npm run build 2>&1 | tee output/qa/v5.129-build.log
npm run qa:award-preflight
npm run qa:chrome-fullsite
npm run qa:goal-audit:report
```

如果 `qa:chrome-fullsite` 因 Playwright 环境缺失阻塞，必须使用 Chrome / Browser 插件做人工桌面截图验收，并把截图路径和结论写入 `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md`。

## Evidence Rules

- `typecheck` 只能证明 TypeScript 无错误。
- `build` 只能证明 Next.js 生产构建成功。
- `qa:award-preflight` 只能证明文档、路由、无视频、静态媒体 source-of-truth 和基本代码结构符合约束。
- `qa:chrome-fullsite` 只能证明桌面路由、文案、重定向、无视频资源和横向溢出等自动可测项。
- 截图只能作为视觉证据，不能单独证明完整产品体验。
- 最终是否达到 2026 潮流获奖级企业官网，必须由 `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 的逐页人工签收判断。

## Visual Evidence Scope

最终视觉签收必须至少覆盖：

- `/` 首屏：`1366x900`、`1440x1000`、`1920x1080`
- `/` ActivityOrbit：`1366x900`、`1440x1000`、`1920x1080`
- `/product`
- `/scenes`
- `/community`
- `/safety`
- `/about`
- `/journal`
- `/contact`
- `/privacy`
- `/terms`
- `/cookies`
- `/not-found`
- `/thank-you`

每个核心页面必须判断：

- 是否符合 Social World 主叙事。
- 是否避免 AI SaaS dashboard 语境。
- 是否避免抽象科技海报。
- 是否服务青年城市生活平台。
- 是否存在 video、HUD、假数据、dating 误读。
- 是否有明确 CTA。

## Static Media Evidence

当前无视频官网必须证明：

- 企业图片通过 `components/signal-prism-homepage/enterpriseAssets.ts` 进入页面。
- `public/images/enterprise` 图片有清楚页面任务。
- `FITMEET_STATIC_MEDIA_GOVERNANCE.md` 已记录图片分配、失败条件和删除/归档规则。
- ActivityOrbit 三条轨道都有完整静态媒体分配。
- 页面 DOM 中核心官网不含 `<video>`。
- 核心官网不请求 MP4 / WebM。

## Final Completion Rule

只有当以下条件同时满足，才允许把 active goal 标记为完成：

- 当前版本证据文件全部存在。
- `qa:award-preflight` 为 `pass`。
- `qa:chrome-fullsite` 为 `pass`，或 Chrome 插件人工截图验收已完整记录。
- `qa:goal-audit:report` 没有 hard failure。
- `FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md` 不再包含 `Pending`、`TBD`、`Not signed off`。
- 最终决策明确为 `Signed off`。

任何旧版本证据、局部截图、单页构建成功或主观口头判断，都不能单独证明目标完成。
