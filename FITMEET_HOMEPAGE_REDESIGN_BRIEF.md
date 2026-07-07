# FitMeet Homepage Redesign Brief

## Document Priority

This document is the homepage implementation brief for the current no-video SignalPrism homepage. It sits below `DESIGN.md` and above old homepage iteration notes.

Canonical order:

1. `README.MD`
2. `DESIGN.md`
3. `FITMEET_HOMEPAGE_REDESIGN_BRIEF.md`
4. `FITMEET_INFORMATION_ARCHITECTURE.md`
5. `FITMEET_COPY_SYSTEM.md`
6. `FITMEET_MOTION_SYSTEM.md`
7. `FITMEET_PAGE_ACCEPTANCE_AGENT.md`

Old homepage files are historical references only. If they mention video, MP4, WebM, Runway, Pika, or a giant `F` hero, ignore that direction for the website homepage.

## Current Direction

Homepage concept:

`Interactive Social Signal System / 交互式同频信号系统`

Core memory:

`Social World`

Core sentence:

`一句想法，变成一次真实到场。`

The homepage should feel like a city signal system waking up around one real plan. It must not look like a generic dark SaaS landing page, an AI dashboard, a dating app, a game poster, or a video showcase.

## Hard Constraints

1. No `<video>`.
2. No MP4 or WebM request.
3. No Runway/Pika/ffmpeg dependency for website completion.
4. Desktop web is the primary acceptance target.
5. The top-left `F` icon is the FitMeet logo. It must not become the hero concept.
6. The hero concept must be `Social World`, not `F`.
7. Every motion target must belong to its visual section.
8. Real images from `public/images/enterprise` are the source of visual proof.

## Section Design Gate

Subject:

FitMeet homepage first viewport and activity orbit.

Audience:

Young urban users, venue partners, brand partners, and early testers who need to understand FitMeet as a real-world activity social platform.

Section job:

The first viewport must make users remember `Social World` within 3 seconds. The activity orbit must prove that FitMeet covers real scenes such as night running, gyms, camping, board games, pets, Cos, gaming, and travel photography.

Thesis:

Do not start by swiping people. Start from a real thing you want to do. FitMeet Agent Xiaofu turns that need into a safe, public, confirmable plan.

Reference source:

Cipher for enterprise rhythm. digitalists for youth energy. units for real-life community atmosphere. Codrops/GSAP for scroll-linked image motion. Current implementation uses no video.

Visual token choices:

Black graphite base, red arrival signal, warm white copy, sharp cut geometry, photographic image strips, low-noise signal lines, no purple AI SaaS gradient.

Layout concept:

The first screen uses a 58/42 desktop balance:

- Left: `Social World`, one compact paragraph, two CTA buttons, three proof receipts.
- Right: breathing SignalPrism plus a real city night-running image panel.
- Bottom: signal ticker that implies the next section without becoming a HUD.

Signature interaction:

Mouse movement bends the hero image field, prism, and activity orbit slightly. Scroll moves the orbit laterally and lets the city signal system feel alive without video.

Motion reason:

Motion expresses demand becoming plan, not decoration. It should feel like the brand system is responding to the user's intention.

Anti-generic correction:

No flat card stack. No dashboard charts. No avatar wall. No excessive tiny labels. No video placeholder. No abstract SVG illustration as final asset.

## First Viewport Proportion Standard

The hero must be visually weighted like this:

1. `Social World` owns the left side.
2. The SignalPrism owns the center/right seam.
3. The real image panel proves the use case but does not become an image exhibition.
4. CTA buttons stay visible without pushing proof cards too low.
5. The bottom ticker is secondary and must not compete with the headline.

Desktop target:

- 1366x900: headline, lead, CTAs, proof receipts, prism, and scene panel all visible.
- 1440x1000: first screen feels dense but not cramped.
- 1920x1080: hero should not become empty; prism and image panel must scale up enough to hold the right side.

## Activity Orbit Standard

The activity orbit is not a carousel and not a card grid. It is a city activity field.

It must show:

1. Three lanes: sport, low-pressure social, interest.
2. Real image cards with sharp geometry.
3. Different depth per lane.
4. Mouse-based 3D tilt.
5. Hover lift that feels physical, not playful.
6. Copy overlays as receipts, not marketing cards.

It must avoid:

1. Equal-height boring card rows.
2. Full glassmorphism.
3. Small unreadable HUD labels.
4. Fake metrics.
5. Dating language.
6. Decorative orbit lines without product meaning.

## Acceptance Notes

The homepage passes this brief only if:

1. The first viewport immediately communicates `Social World`.
2. The image and SignalPrism are balanced instead of competing.
3. The activity orbit feels photographic and physical.
4. No video is used.
5. Reduced motion keeps all information understandable.
6. The page remains a company website, not a visual experiment detached from product meaning.

## V5.114 Visual Audit Adjustment

Chrome desktop evidence:

- Audit folder: `output/qa/v5.113-homepage-visual-audit`.
- Viewport: `1440x1000`.
- Result before repair: first viewport metrics passed, but the activity orbit screenshot showed the left edge clipping copy too aggressively.

Design decision:

The activity orbit may use partial off-screen cards to imply movement, but primary activity names and receipts must not look accidentally cut off. Depth should come from perspective, image scale, sharp geometry, lane spacing, and hover lift, not from hiding important text outside the viewport.

Updated rule:

1. Scroll-driven lateral movement must stay moderate.
2. The first visible card in each lane needs enough left breathing room.
3. Card height should preserve photographic weight while allowing more than one lane to be understood in a desktop viewport.
4. Clipped image edges are acceptable; clipped activity copy is not.
