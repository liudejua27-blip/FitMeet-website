# FitMeet Agent — Shared Implementation Contract

Version: `1.0`  
Status: direction 2 selected · implementation in progress  
Applies to: `/agent`, desktop only

This document fixes the Agent page's product behaviour, content model and acceptance rules before a visual direction is selected. The chosen concept may change layout, camera, masks and spatial choreography; it must not change the assisted-social product boundary or fabricate capabilities.

## 1. User outcome

Within the first two scroll stages, a visitor must understand:

```text
说出一件想做的事
→ Agent 整理条件
→ 用户调整并确认
→ 真实的人开始连接
```

The page is not an autonomous-agent demo. It explains an assisted social decision layer that reduces searching and communication cost while leaving invitations, commitments and meetings under user control.

## 2. Visual target gate

The latest displayed design-review order is authoritative:

1. `design-references/agent-concepts/agent-direction-1.png`
2. `design-references/agent-concepts/agent-direction-2.png`
3. `design-references/agent-concepts/agent-direction-3.png`

Direction 2 is the selected production target. Shared data, accessibility, motion and truthfulness rules in this file continue to apply.

## 3. Spatial sequence

| Range | Chapter | Required product meaning |
| --- | --- | --- |
| `0–140svh` | Intent opening | One natural-language demand in a real city, not a full App screen |
| `140–320svh` | Semantic extraction | TIME, PLACE, PEOPLE, INTEREST, BUDGET and BOUNDARY separate from the sentence |
| `320–500svh` | Plan assembly | The six conditions become one adjustable, confirmable Social Plan |
| `500–640svh` | Scenario tracks | Sport, travel and city photography update demand, nodes, background and plan together |
| `640–760svh` | Assisted, not replaced | The plan recedes and the real people return; the three product boundaries are stated |
| `760–880svh` | From Social to Life | Future personal collaboration appears only as low-contrast `NEXT` coordinates |
| `880–980svh` | App handoff | Logo, store capsules and `APP · 即将上线`; no fabricated store URL |

## 4. Internal data contract

```ts
type AgentScenarioId = "sport" | "travel" | "create"

type SemanticNodeId =
  | "time"
  | "place"
  | "people"
  | "interest"
  | "budget"
  | "boundary"

type SemanticNode = {
  id: SemanticNodeId
  label: string
  value: string
  sourceText: string
  status: "understood" | "needs-confirmation"
}

type AgentScenario = {
  id: AgentScenarioId
  intent: string
  signal: string
  planTitle: string
  backgroundAsset: string
  focalPoint: string
  nodes: SemanticNode[]
  details: string[]
  matchReason: string
}

type AgentPlanStatus = "idle" | "extracting" | "ready" | "confirmed"
```

All visible text, motion labels and product UI must be derived from the same scenario object. Copy, route nodes and plan results may not drift into separate hard-coded sources.

## 5. Approved scenario content

### Sport

```text
下班后想打羽毛球。

今晚球局正在组队
2 位水平相近球友
19:30 城市运动中心
AA 场地 · 90 分钟
匹配理由：时间、水平与活动节奏相近
```

### Travel

```text
周末想找旅行搭子。

城市出逃计划已生成
3 位同城青年
周六 08:30 集合
轻徒步 · 当日往返
匹配理由：出发地、时间与路线偏好一致
```

### Create

```text
想找人拍一组城市照片。

城市摄影搭子正在出现
1 位人像摄影爱好者
周日下午 16:00
街头光影 · 互拍共创
匹配理由：时间与互拍方式一致
```

Numeric match percentages are prohibited until a real scoring model, definition and production evidence exist. Qualitative reasons explain what conditions aligned without inventing precision.

## 6. Interaction contract

- The opening CTA scrolls into semantic extraction without a page flash.
- Three scenarios are open demand tracks, not cards or tabs advertising features.
- Changing a scenario updates the background, intent, all semantic nodes, plan details and match reason in one transition.
- `Generate plan` changes state from `idle` to `extracting` to `ready` and announces the status through an ARIA live region.
- `Confirm plan` changes state to `confirmed`, becomes disabled and keeps the plan visible.
- The confirmation action remains local demonstration state; it does not claim that an invitation was sent.
- Store controls announce `即将上线` and never navigate to a fabricated destination.

## 7. Motion contract

- Lenis is desktop/fine-pointer enhancement only.
- GSAP owns semantic extraction, path progress, pinned chapter transitions and delayed copy.
- Animate transforms, opacity, filters and clip paths; avoid layout properties during scroll.
- Images stabilise before explanatory copy appears.
- Node order follows the sentence rather than an arbitrary decorative sequence.
- Magnetic motion is limited to the primary CTA, plan confirmation and store capsule.
- Page-to-page transition uses the selected demand sentence or final semantic node as the mask origin.

### Reduced Motion

- Disable Lenis, pinned timelines, parallax, path drawing and autoplay video.
- Render the intent, all six semantic values, the plan, three scenarios, product boundaries and final CTA in ordinary document flow.
- Interactive state changes remain available without movement-dependent meaning.

## 8. Photography and product UI

- One dominant real city/public-space scene per stage.
- People act naturally and do not look at the camera as a posed group.
- Reuse approved sport, travel and city photography for the first implementation pass; replace only with equal-or-better licensed production assets.
- App UI appears only after semantic extraction has explained why the plan exists.
- The control surface may occupy approximately `34–40%` of the viewport during assembly; it may not become a full dashboard wall.
- FitMeet spectrum is a semantic state signal, not a background decoration.

## 9. Truthfulness boundaries

Never state or imply:

- that Agent sends invitations without confirmation;
- that it autonomously creates friendships or promises relationships;
- numeric match accuracy without a production scoring definition;
- guaranteed safety or successful meetings;
- that future Social Life services are already available.

Future coordinates must show `NEXT` or `逐步建立`.

## 10. Desktop acceptance

- `1440 × 1000`, `1680 × 1050`, `1920 × 1080` have no horizontal overflow or clipped persistent controls.
- The hero contains one dominant intent and one primary CTA.
- By the end of semantic extraction all six nodes are visible and readable.
- Scenario switch, generation and confirmation all change real React state.
- Pointer and keyboard can operate navigation, scenario tracks, generation, confirmation and store controls.
- Reduced Motion preserves complete information and controls.
- Visible critical media loads without blank states; below-fold media has an intentional loading strategy.
- Source target and browser implementation are combined for visual comparison in `design-qa.md` before handoff.
- `pnpm -s typecheck`, `pnpm -s build` and production route verification pass.

## 11. Selected visual target

Selected source: `design-references/agent-concepts/agent-direction-2.png`

The opening composition is locked to a warm-paper spatial canvas with a real city-station scene on the left, a monumental `YOUR SOCIAL AGENT` title, one demand sentence crossing the canvas, a six-node semantic spine, and a partial product surface entering from the right. The concept source is a design reference only; all text, paths, controls and product states must remain code-native.
