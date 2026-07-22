# FitMeet Visual Targets

本文件记录每个页面的视觉目标、选择状态和实现证据。未选择的视觉方向不得作为代码实现依据。

## World

Status: `selected · implemented · desktop QA passed`

The option order is the order displayed in the design review conversation:

1. `design-references/world-concepts/world-direction-1.png`
2. `design-references/world-concepts/world-direction-2.png`
3. `design-references/world-concepts/world-direction-3.png`

Shared constraints across all three directions:

- Desktop `1440 × 1024` concept frame.
- Same FitMeet Logo, warm paper, fixed capsule navigation and spectrum signal as the accepted homepage.
- Exact navigation: `WORLD / MOMENTS / AGENT / SAFETY / APP · 即将上线`.
- Exact opening copy comes from `FITMEET_COPY_DECK.md`.
- Four current destinations: `01 MOVE / 02 GO / 03 OUTDOOR / 04 CREATE`.
- No card grid, dashboard, avatar wall, metrics, literal map UI or generic AI gradient.
- Must support a fragment/portal-to-full-screen chapter transition.

Selected target: `design-references/world-concepts/world-direction-1.png`

Selection rationale:

- The four photographic territories behave as one continuous Social Atlas rather than a card grid.
- The central negative space gives `SOCIAL WORLD` enough authority while keeping photography dominant.
- `01 MOVE / 02 GO / 03 OUTDOOR / 04 CREATE` are legible as destinations, not feature categories.
- The spectrum route is a precise connective signal and does not turn into a generic AI-gradient background.
- The bottom `01 MOVE` preview establishes the required portal-to-full-screen transition.

Implementation contract:

- Rebuild the target with native text, real image layers, live navigation, animated route and accessible controls; the concept image must never be used as a flattened page screenshot.
- Preserve the target's warm-paper field, four blended territories, central title, route coordinates and single primary CTA.
- On the first scroll, expand the lower-left `01 MOVE` territory into the full viewport while the other territories retreat.
- Continue through the four full-screen destinations, then return to a reorganised atlas and hand off to the Agent.
- Desktop-only validation at `1440 × 1000`, `1680 × 1050` and `1920 × 1080`.

Implementation evidence:

- Route: `/world`
- Final screenshot: `.codex-audit/world-implementation-1440x1000-final.png`
- Normalised comparison: `.codex-audit/world-comparison-final.png`
- Additional viewports: `.codex-audit/world-1680x1050.png`, `.codex-audit/world-1920x1080.png`
- Browser report: `design-qa.md`
- Critical World media: four dedicated desktop JPEG masters, approximately `1.58 MB` total

Implementation status: `complete for the selected desktop target`

## Agent

Status: `direction 2 selected · implemented · desktop QA passed`

The authoritative option order is the order displayed in the latest Agent design review:

1. `design-references/agent-concepts/agent-direction-1.png`
2. `design-references/agent-concepts/agent-direction-2.png`
3. `design-references/agent-concepts/agent-direction-3.png`

Shared constraints:

- Desktop `1440 × 1024`; no mobile or tablet treatment.
- Fixed FitMeet Logo capsule, `WORLD / MOMENTS / AGENT / SAFETY` navigation and `APP · 即将上线` capsule.
- The hero must explain `natural-language intent → semantic extraction → user-confirmed social plan` without becoming a SaaS feature list.
- Real city photography remains the human anchor; the spectrum is restricted to semantic paths, nodes and confirmation states.
- Exact core copy comes from `FITMEET_COPY_DECK.md`.
- No chatbot bubbles, card wall, avatar wall, fabricated metrics, generic AI gradient or full App UI before the visitor understands the intent.
- The selected hero must grow into `SAY IT / UNDERSTAND / CONNECT`, the three interactive scenario tracks, the assisted-social boundary and the App handoff.

Selected target: `design-references/agent-concepts/agent-direction-2.png`

Selection rationale:

- The real station/public-plaza photograph keeps the opening human and place-led instead of presenting a chatbot or dashboard.
- The large `YOUR / SOCIAL / AGENT` title gives the page independent identity while remaining compatible with the shared FitMeet paper-and-capsule system.
- The intent sentence becomes a literal route into `TIME / PLACE / PEOPLE / INTEREST / BUDGET / BOUNDARY`, making Agent understanding spatial and legible.
- The partially clipped product surface enters only after the semantic structure is visible, preserving the product story `intent → understanding → plan`.
- The spectrum is used as a precise state signal on routes and nodes rather than as a decorative AI background.
- The visible `02 / UNDERSTAND` continuation creates a scroll invitation and supports the required no-hard-cut spatial sequence.

Implementation contract:

- Rebuild the target using native typography, live route nodes, real photography and an interactive React plan surface. The concept image must never be used as a flattened page background.
- Preserve the warm paper field, left-aligned monumental title, station photograph blended into the page, centre intent sentence, six-node semantic spine and right-edge partial product surface.
- Above-the-fold copy is locked to the selected source: `YOUR SOCIAL AGENT`, `你负责想去，`, `Agent 负责把条件整理清楚。`, `看看 Agent 如何工作`, `周末想找旅行搭子。`, six semantic labels and `02 / UNDERSTAND`.
- The product surface remains partially outside the first viewport and grows into a usable plan only after the visitor reaches the understanding chapter.
- Three scenario rails update the background, demand, semantic values and generated plan from one shared data model.
- Desktop-only validation at `1440 × 1000`, `1680 × 1050` and `1920 × 1080`.

Implementation evidence:

- Route: `/agent`
- Dedicated Hero Master: `public/images/agent-semantic/agent-intent-concourse-hero-desktop.jpg`
- Final production screenshot: `.codex-audit/agent-production-1440x1000.png`
- Normalised comparison: `.codex-audit/agent-comparison-final.png`
- Additional viewports: `.codex-audit/agent-1680x1050.png`, `.codex-audit/agent-1920x1080.png`
- Interaction states: scenario selection, `idle → extracting → ready → confirmed`
- Browser report: `design-qa.md`

Implementation status: `complete for the selected desktop target`

## Safety

Status: `direction 1 selected · implemented · production build passed · visual QA pending`

The authoritative option order is the order displayed in the latest Safety design review:

1. `design-references/safety-concepts/safety-direction-1.png`
2. `design-references/safety-concepts/safety-direction-2.png`
3. `design-references/safety-concepts/safety-direction-3.png`

Shared constraints:

- Desktop `1440 × 1024`; no mobile or tablet treatment.
- Fixed FitMeet Logo capsule, shared navigation and `APP · 即将上线` capsule.
- Exact opening message: `TRUST, BEFORE MEETING / 见面之前，边界已经开始。`
- Five trust layers: `IDENTITY / CONSENT / PUBLIC FIRST / REAL EXPERIENCE / RESPONSE`.
- Real public-space photography, visible context and comfortable human distance; no surveillance mood.
- FitMeet spectrum is restricted to confirmed boundaries, nodes and transition edges.
- No shield-icon wall, compliance card grid, avatar/review wall, safety guarantee, fake verification badge or generic AI gradient.
- Selected Hero must grow into five trust chapters, data purpose, community-guidelines handoff and App transition without reusing Agent or World full-screen masters.

Selected target: `design-references/safety-concepts/safety-direction-1.png`

Selection rationale:

- The five radii turn abstract trust principles into one continuous spatial system instead of a compliance checklist.
- Warm paper and public-plaza photography keep Safety human and visually compatible with Home, World and Agent while retaining its own camera language.
- Each label already has a clear relationship to one radius, enabling a full five-chapter scroll narrative and keyboard-accessible chapter navigation.
- The visible `01 / IDENTITY` preview makes the first scroll a movement into the outer boundary rather than a conventional section change.
- Spectrum is restricted to radius nodes and active states, preserving FitMeet's precise social-signal identity.

Implementation contract: `FITMEET_SAFETY_IMPLEMENTATION_SPEC.md`

Implementation evidence:

- Route: `/safety`
- Dedicated media: five optimised desktop photographs in `public/images/safety-radius/`, approximately `1 MB` total
- Trust states: `PRINCIPLE` and `BUILDING` are sourced from one typed five-layer model
- Interactions: five radius jumps, scroll-driven circular scene reveals, active trust progress, data-purpose convergence and App notice
- Supporting routes: `/community-guidelines`, `/privacy`, `/terms`
- Static checks: `pnpm typecheck` and `pnpm build` passed on 2026-07-10

Implementation status: `code complete; browser visual comparison remains pending because the in-app preview panel did not attach`

## App

Status: `not generated`

## About

Status: `not generated`

## Moments

Status: `direction 1 auto-selected · implementation in progress · real-story publication still requires authorisation`

The three generated directions are:

1. `design-references/moments-concepts/moments-direction-1.png`
2. `design-references/moments-concepts/moments-direction-2.png`
3. `design-references/moments-concepts/moments-direction-3.png`

Selected target: `design-references/moments-concepts/moments-direction-1.png`

Selection rationale:

- The horizontal film rail gives Moments a unique spatial metaphor without repeating Home's star map, World's atlas, Agent's semantic spine or Safety's radii.
- The warm-paper field and capsule navigation preserve whole-site continuity.
- A photograph can grow from the archive into a full-screen chapter using Floema's spatial grammar while the content remains FitMeet-specific.
- The honest publication label is visible in the first viewport and prevents concept photography from being mistaken for testimonials.
- Direction 2 resembles fashion collage too strongly; direction 3 repeats Safety's circular language.

Implementation contract: `FITMEET_MOMENTS_IMPLEMENTATION_SPEC.md`

## Legal / Guidelines

Status: `design system specified; no image concept required unless the editorial layout changes materially`
