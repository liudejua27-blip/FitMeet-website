# FitMeet v5.108 Media Redesign Prompts

本文档优先级：用于替换上一批 `image_gen -> Runway/Pika` 媒体创意。它不改变当前页面结构、不改变最终文件名，只重做 8 条官网视频的画面设定、GPT 出图提示词和 Runway/Pika 视频提示词。

目标：解决旧媒体方案“太像雨夜红线科技海报、场景重复、社交 Agent 表达不够真实”的问题。

新方向：`Social World：一句想法，变成一次真实到场。`

核心设计判断：

- 不再把“红色路线光”当主角，红色只作为环境光、服装细节、门框、地面反射或道具点缀。
- 每个场景必须有真实空间、真实动作、真实到场理由。
- 不做抽象 UI、不做地图、不做 HUD、不做头像墙、不做 dating 感。
- 画面要像 2026 年获奖级企业官网主视觉：纪实摄影、城市青年、黑红高对比、硬边几何、强节奏、真实公共场景。
- 所有图片和视频内禁止出现可读文字、Logo、品牌、标牌、屏幕文字、App UI。

## Global GPT Image Prompt Rules

复制每条图片提示词到 GPT 出图时，统一加上这些规则：

```text
Aspect ratio 16:9, photorealistic editorial photography, cinematic enterprise website hero asset, 1920x1080 or higher, black and deep red high contrast palette, real urban public space, documentary youth lifestyle, hard shadows, sharp architecture, no readable text, no letters, no numbers, no logo, no watermark, no UI, no HUD, no dashboard, no map pins, no floating holograms, no dating mood, no romantic couple framing, no purple-blue SaaS gradient, no abstract illustration, no cartoon, no CGI plastic skin, no distorted faces, no broken hands, no warped bodies.
```

## Scene 01 - Home Hero / City Convergence

最终文件名：`hero-night-run-social-world.mp4`

页面作用：首页首屏。3 秒内建立 `Social World` 记忆。

旧问题：夜跑太普通，红线太像科技模板。

新画面：城市地下通道出口，三个青年从不同方向走向同一个开放公共场地。不是“约会”，是一个真实计划开始发生。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic website hero image for a youth city life platform called FitMeet, no visible text or logo. Scene: a hard-edged urban underpass exit at night, wet concrete floor, black steel beams, red emergency glow reflecting on the ground, warm street light outside the exit. Three young adults in modern streetwear enter the frame from different directions and naturally converge toward an open public plaza beyond the underpass. They are mid-distance, realistic, not posing, not romantic, not fitness models. Leave strong negative space on the left side for HTML title overlay. Mood: black-red, gritty, premium, street-pulse, enterprise technology company, real city arrival. Cinematic lens, 35mm, low angle, sharp architecture, documentary realism, high contrast, no readable signs, no UI, no HUD, no abstract light trails.
```

Runway 视频提示词：

```text
Slow cinematic push forward from a dark urban underpass toward a real public plaza at night. Three young adults converge from different directions and continue walking toward the open public space, wet concrete reflections shifting, red environmental light pulsing subtly from the architecture, warm city light beyond the exit. Premium youth city life platform hero film, realistic bodies, grounded social energy, black red warm white palette. No text, no logo, no signage, no UI, no HUD, no dashboard, no map pins, no dating mood. Smooth 5 second loop.
```

拒绝标准：

- 如果像地铁广告、赛博朋克壁纸、情侣约会、运动品牌广告，拒绝。
- 如果左侧没有标题安全区，拒绝。

## Scene 02 - Product / One Real Need

最终文件名：`scene-night-run.mp4`

页面作用：解释“一句想法”如何从一个人的真实需求开始。

新画面：青年站在居民区外的夜色楼梯口，已经穿好运动外套，手里没有展示屏幕文字，只能看出他准备出门。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic image for a youth social agent website, no visible text or logo. Scene: outside an apartment stairwell or residential community gate at night, wet steps, black metal railings, one young adult in a dark windbreaker and running shoes pauses before heading out, holding a phone face-down with no visible screen, a water bottle and small towel in the other hand. The mood is not lonely and not romantic; it feels like a simple real-life intention becoming ready to happen. Red light comes from a nearby vending machine or doorway reflection, not from a sci-fi line. Hard shadows, real concrete texture, documentary photography, black-red high contrast, premium enterprise website feel, strong empty space for HTML copy.
```

Runway/Pika 视频提示词：

```text
Subtle handheld cinematic drift outside a residential stairwell at night. A young adult finishes getting ready, steps out from the gate with running shoes, phone held face-down with no visible screen, wet steps and black railings reflecting red doorway light. The action should feel like a real need becoming a plan, not loneliness, not dating, not an ad. Premium youth city lifestyle, black red warm white palette. No text, no logo, no readable signage, no UI, no HUD, no screen text. Smooth 5 second loop.
```

拒绝标准：

- 如果人物看起来像孤独恋爱短片，拒绝。
- 如果手机屏幕有字，拒绝。

## Scene 03 - Product / Plan Becomes Physical

最终文件名：`scene-public-plan-plaza.mp4`

页面作用：表达社交 Agent 把需求转成计划、地点、时间、边界。

新画面：公共运动中心或社区活动桌。几只手把真实物件放到桌面：球拍、水、腕带、路线卡片。卡片必须无文字。

GPT 图片提示词：

```text
Create a photorealistic 16:9 editorial image for a premium youth city platform, no visible text or logo. Scene: a public community sports center table at night, black table surface, wet jackets on chair backs, badminton racket, water bottle, folded blank route card with no writing, plain red wristband, small key tag with no numbers. Three or four young adult hands place these objects on the table as if a real plan is forming. No phone UI, no readable paper, no dashboard. Lighting: hard overhead court light, red edge light from the side, warm background blur. Mood: concrete, tactile, believable, product mechanism expressed through real-world objects, black-red enterprise website style.
```

Runway/Pika 视频提示词：

```text
Close cinematic table-level movement across a public sports center table. Young adult hands place a badminton racket, water bottle, blank folded route card, and plain red wristband on the black table, as if a plan is becoming physical. Background court lights flicker softly out of focus, red side light catches the objects. No readable text, no numbers, no logo, no phone UI, no dashboard, no HUD. Tactile real-world planning moment, premium youth city platform. Smooth 5 second loop.
```

拒绝标准：

- 如果出现任何字、数字、二维码、Logo，拒绝。
- 如果像办公室 SaaS dashboard，拒绝。

## Scene 04 - Scenes / Court Arrival

最终文件名：`scene-court-dispatch.mp4`

页面作用：具体活动场景，证明 FitMeet 不抽象，是“到场”。

新画面：夜间公共球馆入口，门框锐利，场内灯光打开，青年带球拍进入。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic image for an award-level enterprise website, no visible text or logo. Scene: entrance of a public badminton or small sports court at night, black metal door frame, hard rectangular light from inside, polished dark floor, red accent light on the edge of the doorway. Four young adults in street-sport clothing enter naturally with rackets and small sports bags, mid-distance, realistic bodies, not posing. Background shows court depth and players as blurred motion, no scoreboard text, no signage. Mood: action is about to start, accessible public activity, black-red high contrast, urban youth lifestyle, premium but raw.
```

Runway/Pika 视频提示词：

```text
Slow cinematic side push past a black metal public court entrance at night. Interior lights switch on softly as four young adults walk in with rackets and small bags, background players move in restrained blur, red edge light cuts across the doorway and floor. Real public activity arrival, not a sports commercial, not dating. No text, no logo, no signage, no scoreboard text, no UI, no HUD, no dashboard. Smooth 5 second loop.
```

拒绝标准：

- 如果球馆有可读招牌或比分，拒绝。
- 如果像体育用品广告，拒绝。

## Scene 05 - Scenes / Citywalk Without Pressure

最终文件名：`scene-citywalk-case.mp4`

页面作用：展示低压力社交，不是速配。

新画面：雨后街角，青年小队走过便利店/街边窗口。重点是同行节奏，不是自拍或恋爱。

GPT 图片提示词：

```text
Create a photorealistic 16:9 night street editorial image for a youth city life platform, no visible text or logo. Scene: rain-wet city corner beside a warm anonymous convenience-store style window, no readable signage, black asphalt, red traffic reflection, steam or light mist near the street. Three to four young adults walk together casually across the frame, one slightly ahead, others talking naturally, no romance, no selfie, no phone screen. Composition should feel like street photography with flash and cinematic grain, black-red warm palette, authentic citywalk companionship, strong diagonal architecture, premium website asset.
```

Runway/Pika 视频提示词：

```text
Gentle cinematic handheld forward movement along a rain-wet city corner at night. Three to four young adults walk together casually past a warm anonymous storefront with no readable text, red traffic reflection on black asphalt, slight steam in the air. The feeling is low-pressure citywalk companionship, not dating, not nightlife advertising. No text, no logo, no readable signage, no UI, no HUD, no map pins. Smooth 5 second loop.
```

拒绝标准：

- 如果像情侣街拍或夜店宣传，拒绝。
- 如果便利店窗户有字，拒绝。

## Scene 06 - Safety / Boundaries Before Closeness

最终文件名：`scene-weekend-trip.mp4`

页面作用：Trust & Safety 的视觉资产，表达公开地点、可退出、边界清楚。

新画面：明亮公共场所入口，不黑暗、不恐吓。多人保持舒适距离，有开放出口和工作人员式公共秩序，但不要制服特写。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic image for a Trust & Safety page of a youth city social platform, no visible text or logo. Scene: a bright open public cultural center or transit-hub meeting area at early evening, wide exits visible, glass doors, clean concrete, black-red architectural accents, warm overhead light. A small group of young adults stands with comfortable spacing, body language calm and respectful, one person subtly steps aside as if choosing their own boundary. No fear, no police drama, no dating, no dark alley. The image should communicate public place, clear exits, social safety, and low-pressure participation. No readable signs, no UI, no HUD.
```

Runway/Pika 视频提示词：

```text
Slow stable cinematic drift through a bright public meeting area at early evening. Wide exits and glass doors remain visible, young adults stand with comfortable spacing, one person calmly steps aside while others continue toward the public area. The mood is safety through openness and boundaries, not fear, not surveillance, not dating. Black-red architectural accents, warm public light. No text, no logo, no readable signage, no UI, no HUD. Smooth 5 second loop.
```

拒绝标准：

- 如果像监控、警务、恐怖安全片，拒绝。
- 如果空间不公开或没有出口感，拒绝。

## Scene 07 - Community / City Becomes Social World

最终文件名：`vision-arrival-network.mp4`

页面作用：公司愿景，展示城市不是地图 UI，而是多个真实生活场景同时被点亮。

新画面：高处俯视真实城市公共空间，能看到球场、街角、广场、步道等多个活动点，但不画线、不画点、不做 UI。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic wide image for a company vision section, no visible text or logo. Scene: elevated pedestrian bridge or rooftop edge overlooking a real dense urban neighborhood at blue hour, not futuristic. In the same frame, several public activity pockets are visible: a small sports court, a corner plaza, a riverside path, a warm storefront edge, each with tiny groups of young adults arriving or gathering naturally. Use black shadows, red practical lights, warm windows, wet pavement reflections. No floating lines, no network dots, no map UI, no dashboard. It should feel like a real city becoming socially alive, premium enterprise brand film, sharp architectural geometry, documentary scale.
```

Runway 视频提示词：

```text
Slow cinematic parallax from an elevated pedestrian bridge over a real urban neighborhood at blue hour. Multiple public activity pockets are visible in one frame: a small court, a corner plaza, a path, a warm storefront edge, with small groups of young adults naturally arriving. Red practical lights and wet reflections create rhythm, but no floating lines or UI. Company vision film for a youth city life platform. No text, no logo, no signage, no HUD, no dashboard, no map pins, no network dots, no dating mood. Smooth 5 second loop.
```

拒绝标准：

- 如果像数据大屏、城市地图、科幻网络，拒绝。
- 如果没有真实生活场景，拒绝。

## Scene 08 - Enterprise Cooperation / Real Demand Reaches Places

最终文件名：`partner-arrival-value.mp4`

页面作用：企业合作页，表达真实需求比曝光更接近成交。

新画面：小型运动/生活方式场馆准备迎接到场人群，经营者在开灯、摆水、调整门口，不要握手、不要商业会议。

GPT 图片提示词：

```text
Create a photorealistic 16:9 cinematic image for an enterprise cooperation page, no visible text or logo. Scene: a real independent public sports or lifestyle venue at night, black facade, glass door, warm interior light, red edge lighting, wet pavement outside. A venue operator or staff member is turning on lights and placing water bottles or equipment near the entrance, while a small group of young adults approaches from the sidewalk in the background. No handshake, no office, no fake metrics, no advertisement board, no readable signage. The message is real arrival intent creates value for local venues. Premium enterprise website film, black-red high contrast, sharp geometry, documentary realism.
```

Runway 视频提示词：

```text
Slow cinematic forward drift toward an independent public sports or lifestyle venue at night. A staff member turns on warm interior lights and arranges simple equipment near the entrance while a small group of young adults approaches from the wet sidewalk. The mood is real arrival intent and useful enterprise cooperation, not advertising, not fake metrics, not a handshake stock photo. Black facade, red edge light, warm interior. No text, no logo, no readable signage, no UI, no HUD, no dashboard, no charts. Smooth 5 second loop.
```

拒绝标准：

- 如果像商业握手图库或招商广告，拒绝。
- 如果出现品牌牌匾、海报文字、假数据，拒绝。

## Final Video Acceptance

每条视频生成后都按这个标准选：

- 人体稳定，脸和手不崩。
- 空间真实，不像 AI 概念图。
- 没有任何可读文字、Logo、标识、数字。
- 没有 HUD、UI、地图点、光线网络。
- 没有 dating、情侣、速配暗示。
- 不像紫蓝 AI SaaS。
- 5 秒循环内动作自然，不突兀跳帧。
- 第一帧可以做 poster。
- 比当前 public fallback 视频更真实、更具体、更企业级。

## Save Names

最终下载后仍按当前工程文件名保存：

```text
output/runway-downloads/home-v5/hero-night-run-social-world.mp4
output/runway-downloads/home-v5/scene-night-run.mp4
output/runway-downloads/home-v5/scene-public-plan-plaza.mp4
output/runway-downloads/home-v5/scene-court-dispatch.mp4
output/runway-downloads/home-v5/scene-citywalk-case.mp4
output/runway-downloads/home-v5/scene-weekend-trip.mp4
output/runway-downloads/home-v5/vision-arrival-network.mp4
output/runway-downloads/home-v5/partner-arrival-value.mp4
```

