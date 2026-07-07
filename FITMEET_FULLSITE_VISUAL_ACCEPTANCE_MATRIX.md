# FitMeet Full-Site Visual Acceptance Matrix

## Priority

This document defines the human visual signoff standard for the 2026 award-level FitMeet website goal.

Canonical reading order:

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_INFORMATION_ARCHITECTURE.md`
4. `FITMEET_COPY_SYSTEM.md`
5. `FITMEET_MOTION_SYSTEM.md`
6. `FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md`
7. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`
8. `FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md`

This document does not replace automated QA. It defines what a senior design review must inspect after `typecheck`, `build`, `qa:award-preflight`, and `qa:chrome-fullsite`.

## Current Direction

FitMeet is not an AI SaaS website and not an abstract technology poster.

The website is a youth-oriented city lifestyle social platform.

Core idea:

`Social World：一句想法，变成一次真实到场。`

Current visual system:

1. No video.
2. No MP4 or WebM dependency.
3. Real static imagery.
4. SignalPrism, Canvas signal lines, CSS 3D, sharp black/red geometry.
5. Desktop-first award-level browser experience.
6. Mobile must not break, but desktop is the current design target.

## Review Setup

Required desktop viewports:

1. `1366x900`
2. `1440x1000`
3. `1920x1080`

Required commands before visual review:

```bash
npm run typecheck
npm run build
npm run qa:award-preflight
npm run qa:chrome-fullsite
```

If `qa:chrome-fullsite` is blocked because Playwright is unavailable, use the Codex Chrome/browser workflow to manually capture the same pages and viewports.

## Global Pass Criteria

A page passes only if all criteria below are true:

1. The page feels like part of the same Social World system.
2. The top-left `F` logo remains a brand lockup, not the hero concept.
3. The primary memory point is `Social World`,真实计划,边界,到场 or the page-specific product promise.
4. Real images are visible enough to ground the page in actual city life.
5. No section feels like generic SaaS card stacking.
6. No abstract HUD, tiny dots, small labels, or decorative grids block important copy.
7. No dating/swipe/profile-wall language or visual metaphor appears.
8. No fake metrics, fake logos, fake partners, fake awards, or fake certifications appear.
9. No horizontal overflow, text collision, black media box, or obvious clipped primary copy appears.
10. Reduced-motion mode preserves the page's meaning.

## Screenshot Requirements

For each page, capture at least:

1. First viewport at `1440x1000`.
2. One mid-page proof or mechanism section at `1440x1000`.
3. Final CTA or closing section at `1440x1000`.
4. First viewport at `1366x900`.
5. First viewport at `1920x1080`.

Homepage also requires:

1. Activity orbit section at `1440x1000`.
2. Safety shell section at `1440x1000`.
3. Reduced-motion first viewport at `1440x1000`.

## Page Matrix

### Home `/`

Job:

Make users remember `Social World` within 3 seconds.

Must see:

1. `Social World`.
2. A concrete real-life demand.
3. SignalPrism as a living system object.
4. Real city/lifestyle imagery.
5. ActivityOrbit with real activity categories.
6. SafetyShell before final CTA.

Pass:

1. First viewport feels dense, cinematic, and intentional.
2. SignalPrism and image panel are visually balanced.
3. Activity cards feel physical and photographic, not flat carousel cards.
4. The page never needs video to feel alive.

Fail:

1. `F` dominates as the hero concept.
2. Hero feels like a dark SaaS landing page.
3. Activity orbit reads as a normal image row.
4. Copy is too small, clipped, or hidden under decorative layers.

### Product `/product`

Job:

Explain how FitMeet turns a real need into a real plan.

Must see:

1. `真实计划`.
2. Demand understanding.
3. Context judgment.
4. Boundary protocol.
5. Plan receipt or plan-like proof.
6. Same-frequency matching after plan formation.

Pass:

1. The Agent feels like a planning engine, not a chatbot.
2. Mechanism is readable before mood.
3. Product order is visible: need, context, boundary, plan, people.

Fail:

1. Page looks like AI SaaS dashboard.
2. Chatbot UI becomes the main metaphor.
3. Matching/person browsing appears before plan and boundary.

### Scenes `/scenes`

Job:

Make FitMeet concrete through real youth activity scenarios.

Must see:

1. Night run.
2. Court or gym.
3. Board game or low-pressure social scene.
4. Citywalk or short-trip context.
5. Public-place and exit-boundary language.

Pass:

1. Scenes feel specific and usable.
2. Images carry proof, not decoration.
3. The page feels young and active without becoming a game poster.

Fail:

1. It becomes an image gallery.
2. Scene cards look interchangeable.
3. Safety and public-place logic disappears.

### Community `/community`

Job:

Show FitMeet as a city life network, not a feature list.

Must see:

1. City nodes.
2. Public plans.
3. Return loops.
4. Low-pressure social model.
5. Social World as city-layer idea.

Pass:

1. Community feels like real city infrastructure.
2. Personal location exposure is not implied.
3. Network visuals support public scenes, not fake data.

Fail:

1. It feels like a data dashboard.
2. It uses fake user dots or fake scale.
3. It feels disconnected from Home.

### Safety `/safety`

Job:

Prove that real-world social connection happens after boundaries.

Must see:

1. Public-place first.
2. Confirmation before invitation.
3. Exit mechanism.
4. Report/block.
5. Privacy protection.
6. Minors boundary.
7. Safety receipt.

Pass:

1. Safety feels operational and concrete.
2. Page remains visually strong without becoming threatening.
3. Trust appears as product order, not legal footer text.

Fail:

1. Page feels like a soft SaaS trust page.
2. Safety copy is buried in decorative cards.
3. It reads as legal disclaimer rather than product protocol.

### About `/about`

Job:

Make FitMeet credible as the company building Social World.

Must see:

1. Industry pain.
2. Current product path.
3. Product belief.
4. 3-5 year vision.
5. Final ambition.

Pass:

1. About feels like a company manifesto.
2. Big ambition is tied to concrete product behavior.
3. No fake traction is implied.

Fail:

1. Generic mission/team page.
2. Empty world-changing claims without product proof.
3. Visual tone weaker than the homepage.

### Journal `/journal`

Job:

Provide SEO and long-term brand explanation.

Must see:

1. Product progress.
2. City observation.
3. Technical experiment.
4. Cooperation update.
5. Editorial rules.
6. Long-tail SEO topics.

Pass:

1. Journal feels like an editorial control room.
2. It is readable and sharp, not a generic blog wall.
3. It refuses fake research and PR fluff.

Fail:

1. Looks like a default blog index.
2. Article rows feel like placeholder content.
3. It uses AI trend essay language without real-life friction.

### Contact `/contact`

Job:

Route personal experience, enterprise cooperation, and safety contact.

Must see:

1. Early experience path.
2. Enterprise cooperation path.
3. Safety boundary path.
4. `15253005312@163.com`.
5. Business value: more precise users, less time, more efficient conversion.

Pass:

1. Contact feels like signal intake, not a generic form.
2. Enterprise value is direct and credible.
3. CTA decisions are obvious.

Fail:

1. Looks like ordinary SaaS contact form.
2. Enterprise email is hidden or missing.
3. Fake partner logos or fake metrics appear.

## System Page Matrix

### Privacy `/privacy`

Must prove:

Privacy is a boundary system, not a buried policy.

Pass:

1. Data usage stays connected to real plans.
2. Enterprise cooperation boundary is clear.
3. User control is visible.

### Terms `/terms`

Must prove:

Real social plans need real rules.

Pass:

1. User responsibility is concrete.
2. Platform limits are clear.
3. Activity risk is visible but not fear-based.

### Cookies `/cookies`

Must prove:

Tracking remains explainable.

Pass:

1. Necessary and analytic Cookie categories are understandable.
2. No dark tracking is implied.
3. User control is visible.

### Not Found `/not-found`

Must prove:

Even the 404 belongs to Social World.

Pass:

1. `这条路线暂时没有计划。` is visible.
2. User can return to a useful canonical path.
3. Page is not visually lower quality than the system pages.

### Thank You `/thank-you`

Must prove:

A submitted signal has entered the plan queue.

Pass:

1. Confirmation is clear.
2. Next steps are concrete.
3. Enterprise cooperation path remains boundary-aware.

## Final Signoff States

Use these labels in review notes:

1. `Pass`: page is award-level enough for the current no-video direction.
2. `Pass with polish`: page is aligned but has spacing, copy, or crop refinements.
3. `Needs redesign`: page fails the Social World thesis or feels generic.
4. `Blocked`: evidence is missing, route fails, assets do not load, or browser QA cannot run.

## Required Final Evidence

Before claiming the website goal complete, collect:

1. `npm run typecheck` result.
2. `npm run build` result.
3. `npm run qa:award-preflight` result.
4. `npm run qa:chrome-fullsite` result or equivalent Codex Chrome evidence.
5. Screenshot folder for all core pages and system pages.
6. Human visual review notes using this matrix.
7. `npm run qa:goal-audit:report` result.
