# Third-party notices

## Vercel Chatbot

The responsive application-shell direction in FitMeet Web Agent is adapted from
the interaction patterns of [Vercel Chatbot](https://github.com/vercel/chatbot),
including its collapsible desktop navigation, conversation history structure,
mobile navigation sheet, and chat workspace composition.

Vercel Chatbot is distributed under the Apache License 2.0. Copyright remains
with its respective contributors. FitMeet-specific UI, product flows, API
contracts, demand cards, candidates, invitations, and messaging behavior are
implemented in this repository and retain their existing ownership and terms.

Apache License 2.0: <https://www.apache.org/licenses/LICENSE-2.0>

## Interaction design references

FitMeet's social pages use original code and FitMeet API contracts. The following
open-source products were reviewed as interaction references; their source code,
branding, assets, and sample data were not copied into this repository.

- [Bluesky Social App](https://github.com/bluesky-social/social-app) — profile,
  relationship-state, notification, reporting, and blocking clarity. MIT License.
- [Chatwoot](https://github.com/chatwoot/chatwoot) — inbox hierarchy, unread
  state, delivery feedback, retry behavior, and contact context. The community
  code outside Chatwoot's `enterprise/` directory is MIT licensed; no enterprise
  source is used by FitMeet.
- [Zulip](https://github.com/zulip/zulip) — unread positioning, message navigation,
  composer/scroll coordination, and keyboard-oriented interaction. Apache-2.0.
- [Mastodon](https://github.com/mastodon/mastodon) — friend/follow request and
  moderation consequence language only. Mastodon is AGPLv3; FitMeet does not copy,
  link, or derive implementation code from Mastodon.
