# FitMeet Safety — Trust Radius Implementation Contract

Version: `1.0`  
Status: direction 1 selected · implementation in progress  
Applies to: `/safety`, desktop only

## 1. Selected visual target

Source: `design-references/safety-concepts/safety-direction-1.png`

The selected opening is a warm-paper civic observatory: a real public plaza occupies the lower and right field; `TRUST, BEFORE MEETING` anchors the left; five thin trust radii cross the space and terminate at `IDENTITY / CONSENT / PUBLIC FIRST / REAL EXPERIENCE / RESPONSE`; `01 / IDENTITY` remains visible at the bottom as the next chapter.

The source is a design reference only. Photography, typography, navigation, radii, nodes, copy, links and interaction states must remain independent production layers. The concept screenshot must never be used as a flattened webpage.

## 2. User outcome

Within the opening and first radius, visitors must understand:

```text
陌生社交可以自然发生
→ 身份、意愿和地点需要先说清楚
→ 每一步由用户确认
→ 机制逐步建立，不承诺绝对安全
```

The page should reduce anxiety without creating a surveillance atmosphere or overstating product maturity.

## 3. Truth states

Every visible mechanism uses one of two states:

```ts
type TrustMechanismState = "principle" | "building"
```

- `principle`: a product/community design rule currently governing the experience.
- `building`: a mechanism planned or being developed, not a production guarantee.

Prohibited language:

- 绝对安全、零风险、完全可信；
- 已完成所有身份验证、评价、举报或异常响应能力；
- 公开真实姓名或敏感身份信息；
- 未经用户确认替用户作出关键决定；
- 任何成功率、举报处理时效或风险降低百分比。

## 4. Spatial sequence

| Range | Chapter | Visual meaning |
| --- | --- | --- |
| `0–140svh` | Trust before meeting | public-plaza Hero, five faint radii, one primary CTA, `01 / IDENTITY` preview |
| `140–270svh` | 01 Identity | outer radius approaches; public truth vs private data |
| `270–400svh` | 02 Consent | second radius and confirmable decision path |
| `400–530svh` | 03 Public First | public meeting point becomes the full scene |
| `530–660svh` | 04 Real Experience | action evidence appears after participation, not before |
| `660–790svh` | 05 Response | feedback path becomes visible; no guaranteed resolution claim |
| `790–900svh` | Data with a purpose | five rings collapse into a minimal data core |
| `900–1000svh` | Guidelines handoff | warm paper continues into Community Guidelines and App handoff |

## 5. Internal data contract

```ts
type TrustLayerId =
  | "identity"
  | "consent"
  | "public-first"
  | "real-experience"
  | "response"

type TrustLayer = {
  id: TrustLayerId
  index: string
  label: string
  title: [string, string]
  body: [string, string]
  state: "principle" | "building"
  asset: string
  focalPoint: string
  radius: number
  nodeAngle: number
}
```

Hero labels, chapter copy, progress state, photography and handoff links must derive from this single source.

## 6. Locked copy

### Hero

```text
TRUST, BEFORE MEETING

见面之前，
边界已经开始。

社交可以自然发生，
但身份、意愿、地点和行为规则必须足够清晰。

看见信任如何建立
```

### Five layers

Use the exact Identity, Consent, Public First, Real Experience and Response copy from `FITMEET_COPY_DECK.md`. Each screen contains only one primary statement, one supporting paragraph and one state label.

### Data

```text
YOUR DATA, WITH A PURPOSE

产品设计遵循：
最少必要、用途明确、用户可控。

具体的数据收集、保存和删除规则，
以正式隐私政策为准。
```

### Final handoff

```text
安全不是阻止关系开始，
而是让每个人都能更安心地作出选择。

阅读社区准则
```

## 7. Interaction contract

- Opening CTA scrolls into Identity without a route flash.
- Hero radius labels can be activated with pointer or keyboard and move to the corresponding layer.
- One radius is active at a time; active label and current chapter remain synchronised.
- `PRINCIPLE / BUILDING` is text, not colour-only meaning.
- Privacy and Community Guidelines are real internal links. A missing final legal page is not replaced with an inert control.
- App control keeps the global `即将上线` announcement and never uses a fabricated store URL.

## 8. Photography contract

- Safety owns a dedicated public-plaza Hero Master; it cannot reuse Agent's station-concourse Hero or World's four full-screen masters.
- People appear naturally in open, legible public places. No posed smiling testimonial group.
- No phone close-up showing personal identity data.
- Supporting scenes must be unique to Safety or appear only as small transition fragments elsewhere.
- Full-screen photography must ship as optimised JPEG/AVIF in `public/images/safety-radius/`.
- Target critical first-viewport raster total: `≤ 700 KB`.

## 9. Motion contract

- Hero remains fixed for approximately `140svh`.
- Radii draw from outside to inside with long low-amplitude motion.
- Images stabilise before copy reveals.
- Current radius gains one narrow spectrum segment; inactive radii remain graphite/cyan hairlines.
- Chapter change uses radius expansion or photographic mask, never white/black page cuts.
- Magnetic movement is limited to opening CTA and final handoff controls.
- Animate transform, opacity, filters and clip paths; do not animate layout dimensions on scroll.

### Reduced Motion

- Disable Lenis, pinned timelines, radius drawing and image parallax.
- Render Hero, all five layers, states, data principles and links in ordinary document flow.
- Keep the same page order and complete copy.

## 10. Desktop acceptance

- `1440 × 1000`, `1680 × 1050`, `1920 × 1080` have no horizontal overflow or clipped persistent controls.
- The initial viewport matches the selected composition and contains only approved copy.
- All five layer labels and `01 / IDENTITY` preview are visible in the initial experience.
- At least 70% of every trust chapter is real photography or uninterrupted spatial field; no card wall.
- Radius navigation, CTA, Privacy and Guidelines links are keyboard-operable.
- Selected radius, chapter copy and state label remain synchronised after forward and backward scrolling.
- Reduced Motion preserves complete information.
- No full-screen media is shared with Home, World or Agent.
- Source target and latest browser implementation are placed into one comparison image.
- `pnpm -s typecheck`, `pnpm -s build`, production `/safety` and browser interaction verification pass.
