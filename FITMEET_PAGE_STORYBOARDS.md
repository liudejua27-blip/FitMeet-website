# FitMeet 品牌页桌面分镜 V1.0

本文件定义首页之外的页面节奏。所有数值用于桌面设计与 ScrollTrigger 规划，可在浏览器视觉验收后微调。

## 1. World — Infinite Social Map

### 页面创意

World 是一张连续的城市与自然地图。访客不是向下阅读四个分类，而是在同一个空间中靠近球场、车站、营地和城市公共空间。

### 分镜

```text
Map Arrival                         0–120svh
Map Exploration / multi-axis       120–300svh
01 Move portal                     300–430svh
02 Go portal                       430–560svh
03 Outdoor portal                  560–690svh
04 Create portal                   690–820svh
NEXT / Social Life expansion       820–960svh
Agent handoff                      960–1040svh
```

#### Map Arrival

- 首页点击的场景继续放大，进入一张高空但非真实地图的场景画布。
- 远处海岸、山地和车站，中景球场和城市广场，近景人物与装备。
- 中心只出现标题与一句说明，不显示分类卡片。
- Social Orbit 从左下穿过四个空间坐标。

#### Map Exploration

- 垂直滚动驱动画布沿 X/Y 两轴移动，并产生 `1.00–1.08` 的缓慢缩放。
- 当前目的地的短标签进入清晰焦点，其他目的地保持低对比。
- 鼠标只改变近景与中景的微小深度，不改变导航位置。

#### Move / Go / Outdoor / Create

- 每次进入目的地，当前照片从地图坐标扩张至至少 85% 视口。
- 场景稳定后出现编号、类别、两行标题和一句需求示例。
- 不出现功能列表或人物头像。
- 每个场景结束时，画面缩回地图，但返回到不同坐标，形成真正的空间旅行。

#### NEXT / Social Life

- 地图继续向外扩张，远处出现做饭、遛狗、摄影、陪伴等较小坐标。
- 这些坐标必须带 `NEXT`，视觉对比低于四个当前场景。
- 文案强调未来方向与规则建设，不宣称已经可用。

#### Agent handoff

- 用户当前选择的场景需求被保留为一句话。
- 其他地图坐标淡出，需求句与 Social Orbit 进入 `/agent`。

## 2. Moments — Memory Film

### 页面创意

Moments 是一本可滚动的动态品牌杂志。它借鉴 Floema Journal 的编辑节奏与 Case Study 的沉浸长文，但不做社交 Feed。

### 内容状态

在真实故事与授权素材准备完成前，页面使用品牌编辑预告：

```text
STORIES ARE BEING MADE
真实故事正在发生。
```

不得把概念人物和模板文案包装为真实用户评价。

### 分镜

```text
Film Archive opening               0–130svh
Story index / horizontal rail      130–300svh
Story 01 full-screen               300–450svh
Story 02 full-screen               450–600svh
Story 03 full-screen               600–750svh
Story 04 full-screen               750–900svh
Next story / App handoff           900–1000svh
```

#### Film Archive opening

- 暖白背景，一条超宽胶片轨道横穿页面。
- 每张胶片仅显示地点、时间和动作短语。
- 标题在胶片后方，照片经过时产生动态混合模式。

#### Story index

- 垂直滚动驱动胶片水平移动。
- 当前故事从约 `12vw` 扩张至全屏，其余胶片降低透明度。
- 胶片不使用厚边框或复古相机装饰，保持当代编辑感。

#### Full story

- 先出现环境全景，再出现共同动作，最后出现细节和结果。
- 文字不是评价卡，而是编辑式旁白。
- 每个故事最多一个核心句子、地点/时间和一段不超过 90 字的正文。

#### Handoff

- 最后一张故事照片缩小，原始需求句从画面中出现。
- CTA 进入 World 或 Agent。

## 3. Agent — Semantic Orbit

### 页面创意

Agent 页面从一句自然语言需求出发。滚动时，句子中的时间、地点、人数、兴趣、预算与边界被提取为节点，最终形成一个可操作的 Social Plan。

### 分镜

```text
Intent opening                     0–140svh
Semantic extraction                140–320svh
Social Plan assembly               320–500svh
Scenario switcher                  500–640svh
Assisted, not replaced             640–760svh
From Social to Life / NEXT         760–880svh
App handoff                        880–980svh
```

#### Intent opening

- 深色真实城市场景，需求句悬浮在空间中心。
- 需求句支持三组本地示例切换。
- 首屏不先展示完整 App UI。

#### Semantic extraction

- 单词/短句对应的节点从需求中离开并分布到轨迹上。
- 节点：`TIME / PLACE / INTEREST / PEOPLE / BUDGET / BOUNDARY`。
- 当前节点进入时，背景对应位置获得轻微光谱脉冲。

#### Social Plan assembly

- 节点在右侧组合成 App 控制界面。
- UI 包含需求、人数、时间、地点、活动边界、匹配理由和确认动作。
- 生成与确认必须改变真实 React 状态。

#### Scenario switcher

- 运动、旅行、城市摄影不是三张卡，而是三条开放式需求轨道。
- 切换后，节点内容、背景照片和计划内容共同改变。

#### Assisted, not replaced

- 产品 UI 缩回轨迹，现实人物重新进入画面。
- 三条边界依次出现：不替你邀请、不替你承诺、不代替真实相处。

#### From Social to Life

- 当前社交节点向外生长为做饭、遛狗、摄影、陪伴等低对比坐标。
- 明确显示 `NEXT` 和“逐步建立”。

## 4. Safety — Trust Radius

### 页面创意

Safety 不是盾牌图标和合规卡片，而是一组围绕真实人物逐层展开的透明信任半径。

### 分镜

```text
Trust before meeting               0–130svh
01 Identity radius                 130–250svh
02 Consent radius                  250–370svh
03 Public first radius             370–490svh
04 Real experience radius          490–610svh
05 Response radius                 610–730svh
Data with a purpose                730–840svh
Guidelines handoff                 840–930svh
```

#### Opening

- 高亮公共空间摄影，人物位于视觉中心但不看镜头。
- 一个近乎不可见的圆形边界从人物周围出现。
- 标题进入时不使用警示红色或安全盾牌。

#### Five radii

- 每个滚动阶段增加一层同心或偏心透明半径。
- 当前层使用一段窄光谱，其余层为低对比结构线。
- 每层只出现一个原则、两句说明和真实世界细节照片。
- 已实施与未来机制必须用不同状态标记：`PRINCIPLE` / `BUILDING`。

#### Data

- 所有半径收束到一个最小数据核心。
- 只表达最少必要、用途明确、用户可控的设计原则。
- 链接 Privacy，但不在品牌页伪造法务承诺。

## 5. About — Origin to World

### 页面创意

About 借鉴 Floema About 的大图宣言、拖拽时间轴和过程分镜，但 FitMeet 当前不伪造历史年份与团队规模。页面从“一个简单问题”出发，扩张为 NOW / NEXT / LATER。

### 分镜

```text
Origin question                    0–130svh
Problem landscape                  130–260svh
Belief rail / draggable            260–440svh
NOW / NEXT / LATER horizon         440–650svh
Long-term manifesto                650–780svh
World handoff                      780–880svh
```

#### Origin question

- 暖白空间中只有一句问题和一个很小的场景坐标。
- 坐标随滚动靠近，展示城市中“想做事但找不到人”的真实瞬间。

#### Problem landscape

- 多幅现实场景不是团队或办公室，而是寻找成本：空球场、独自出发、未成行的活动。
- 文案解释复杂的不是需求，而是找到合适的人、说清条件和建立信任。

#### Belief rail

- 三条品牌信念在横向轨道上出现：People、Plans、Trust。
- 支持拖拽，也可由纵向滚动驱动。

#### NOW / NEXT / LATER

- 时间轴不使用虚构年份。
- NOW 为运动、旅行与城市活动。
- NEXT 为更多生活需求与安全机制。
- LATER 为更直接可信的人与人协作网络。

## 6. App — Launch Chamber

### 页面创意

App 页面是一条界面轨道。用户从一句话开始，经过理解、调整、确认，再回到现实场景。产品 UI 是主角，但仍嵌在真实世界中。

### 分镜

```text
Launch chamber                     0–120svh
01 Say it                          120–240svh
02 Shape it                        240–360svh
03 Confirm it                      360–480svh
04 Live it                         480–620svh
Interface constellation            620–760svh
Store chamber                      760–880svh
```

#### Opening

- 深色空间，Logo 轨迹穿过一组高质量 App 界面。
- 标题与双商店状态在首屏可见，但界面保持主要视觉焦点。

#### Product sequence

- 每个状态进入中央主界面，其他状态退到轨道远处。
- UI 文字和控件代码原生，App 画框只提供空间边界。
- 需求切换、生成、调整和确认具有真实本地状态。

#### Live it

- 最终确认界面淡出，背景中的人物开始行动。
- 表达产品只是进入现实的入口。

#### Store chamber

- App Store / Google Play 共享完整胶囊。
- 两个按钮均显示 `即将上线`，不出现二维码、评分或虚构下载量。

## 7. Community Guidelines / Privacy / Terms

### 页面创意

规则页是同一品牌世界的安静阅读室。它们不需要固定卷轴和全屏视频，但必须保持排版、导航、轨迹和页脚的一致性。

### 分镜

```text
Editorial opening                  0–70svh
Sticky table of contents           document flow
Long-form content                  document flow
Related policy / footer            final
```

- 左侧或顶部使用轻量目录，但不得成为被用户否定的左侧产品说明布局。
- 正文最大宽度约 `760–860px`。
- 当前章节可通过细线和小型编号表示。
- Privacy 与 Terms 在没有法务文本前显示审核状态，不发布生成式法律条款。

## 8. 跨页连续性

- 每页最后一个视觉状态应能自然生成下一页首屏素材。
- 页脚不是硬切黑块；上一页的轨迹、胶片、半径或地平线延续到页脚。
- Logo 返回首页时，当前页面缩小为首页星图中的一个影像坐标。
- Reduced Motion 下所有跨页空间转场降级为标准链接导航和短淡入。
