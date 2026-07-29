# Social interaction UI mismatch ledger

Compared against `desktop-messages.png`, `desktop-user-relationship.png`, and `mobile-discover-interactions.png` on 2026-07-29.

1. The live desktop relationship page uses three equal status columns instead of the concept's profile plus context rail. Accepted: relationships are a management view; the public-user route keeps the profile plus context-rail composition.
2. Empty account previews contain no sample people, photos, or message text. Intentional: local preview must not imply fabricated friends, candidates, or successful messages.
3. The mobile navigation drawer occupies roughly 70% of the viewport instead of the concept's shorter action sheet. Accepted: it must also expose search and Agent history without competing with page-level actions.
4. The mobile drawer keeps Discover, Messages, and Profile in a fixed footer and omits a separate Agent tab. Matches the product navigation decision.
5. The live notification empty state is substantially quieter than the populated concept. Intentional: no synthetic system notifications are inserted for visual density.
6. The live shell uses the existing FitMeet icon and neutral system typography rather than concept-only portrait assets. Intentional: only approved project assets ship.
7. Conversation routes retain a right-side peer rail at desktop widths, but collapse it completely below 900px. Matches the responsive requirement and prevents a narrow mobile composer.
8. The mobile header displays `预览模式 · 未连接账号` during unauthenticated development preview instead of `账号数据已同步`. Fixed during QA to keep status truthful.
