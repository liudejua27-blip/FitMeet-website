# FitMeet Moments — Memory Film Archive 实施合同

Version: `1.0`  
Status: `selected target · ready for implementation`  
Route: `/moments`  
Viewport: desktop only

## 1. Selected visual target

Authoritative reference:

`design-references/moments-concepts/moments-direction-1.png`

该方向把 Moments 定义为一个横向推进的当代影像档案。它继承 Floema 的“碎片靠近后进入全屏场景”，但将碎片改造成时间胶片，并使用 FitMeet 的精确光谱时间线连接事件前后。

没有授权的真实人物故事前，页面始终是 `BRAND EDITORIAL PREVIEW`，不能将概念影像、地点或写作模板包装为真实评价。

## 2. Page concept

核心隐喻：

> 一段关系不是发生在匹配完成时，而是在一起完成某件事之后，成为一段可被记住的胶片。

Hero 的横向胶片是全页唯一主结构。滚动不是进入传统 Section，而是：

```text
胶片水平推进 → 当前画面增大 → 边缘与注册标记消失
→ 画面成为全屏概念章节 → 退回胶片 → 下一时刻进入
```

## 3. Content truth state

```ts
type MomentPublicationState = "concept" | "authorised"
```

当前所有章节统一为：

```text
state = concept
visible label = CONCEPT STORY / AUTHORISED STORY PENDING
```

禁用：

- 真实用户名、头像、评分、用户数量和成功率。
- 没有授权证据的具体城市、时间和第一人称证言。
- 将概念摄影描述为现有用户经历。

允许：

- 品牌编辑式故事方向。
- 场景类别与非事实型时间锚点，如 `AFTER WORK / 19:30`。
- 明确说明人物、地点与影像待授权。

## 4. First viewport

- 暖纸背景 `#F3F0E9`。
- 共享固定胶囊导航，`MOMENTS` 为当前状态。
- 左上主文案：

```text
社交不是被匹配的一刻，
是后来真的一起发生。

一次夜跑、一段山路、一场球局。
关系从共同完成一件事开始。
```

- 右上授权状态：

```text
BRAND EDITORIAL PREVIEW
REAL STORIES REQUIRE AUTHORISATION
```

- `MOMENTS` 作为胶片后方的超大版式背景。
- 胶片主帧使用夜跑，其余帧为羽毛球、徒步、旅行摄影与文化活动。
- 下方显示 `01 / AFTER WORK` 与 FitMeet 光谱时间线。

## 5. Scroll storyboard

| Range | State | Motion |
| --- | --- | --- |
| `0–180svh` | Film Archive opening | 胶片横移，中心夜跑帧由约 42vw 增大到全屏 |
| `180–330svh` | 01 After Work | 夜跑概念故事，19:30 → 20:10 |
| `330–480svh` | 02 Same Court | 羽毛球共同动作，强调一起完成 |
| `480–630svh` | 03 Same Route | 徒步与同路，强调共同确认计划 |
| `630–780svh` | 04 See the City | 城市摄影，强调共同视角 |
| `780–900svh` | Story collection state | 四张胶片重新聚合，授权征集说明 |
| `900–1000svh` | World / Agent handoff | 原始需求句进入 Social Orbit，链接 `/world` 与 `/agent` |

## 6. Asset data

```ts
type MomentFilm = {
  id: string
  index: string
  category: string
  timeStart: string
  timeEnd: string
  title: [string, string]
  body: string[]
  asset: string
  focalPoint: string
  state: "concept" | "authorised"
}
```

首版使用 `企业官网/` 中未在其他一级页面作为全屏主图使用的四张概念素材，转换后放入 `public/images/moments-film/`。任何正式发布替换必须保持文件语义和焦点记录。

## 7. Interaction

- Hero 胶片跟随纵向滚动水平推进，`ease: none`。
- 当前帧放大进入全屏时，注册线、相邻帧和巨大 `MOMENTS` 后退。
- 四个全屏章节通过从当前胶片边界生长的矩形遮罩连续切换。
- 光谱只标记 `timeStart → timeEnd` 和当前章节节点。
- 导航、World、Agent 和回到顶部均使用真实链接。
- 胶片章节跳转支持键盘。
- 不加入自动播放视频、鼠标拖拽依赖或必须悬停才能阅读的信息。

## 8. Reduced Motion

- 关闭 Lenis、ScrollTrigger、视差和裁切动画。
- Hero 变为普通静态胶片组合。
- 四个故事按文档流依次出现，每个至少 `100svh`。
- 所有授权状态、文案与链接保持完整。

## 9. Acceptance

- `1440×1000` 首屏必须忠于目标的版式比例和胶片层级。
- `1680×1050`、`1920×1080` 无横向滚动和关键人物裁切错误。
- 第一滚必须明显表现为“进入当前胶片”，不是进入下一块内容。
- 页面不得出现任何被误解为真实用户证言的内容。
- Moments 使用的四张全屏资产不得被 Home、World、Agent、Safety 作为全屏主图使用。
- 首屏关键栅格资源目标小于 `1.2 MB`。
- `pnpm typecheck`、`pnpm build`、浏览器控制台和核心链接验证通过。
- `design-qa.md` 最终为 `final result: passed` 后才完成交付。
