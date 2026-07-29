# FitMeet Web social-interaction acceptance

## Automated locally

- `npm run typecheck`
- `npm run test:agent` — Agent and social-state unit tests
- `npm run build` — all static and dynamic App Router routes
- Desktop and 390 x 844 browser inspection, including the mobile navigation drawer
- No browser console errors during the inspected flow

## Real two-account API test

Run only with two disposable authenticated tester accounts:

```bash
FITMEET_E2E_CONFIRM_WRITES=YES \
FITMEET_E2E_TOKEN_A=... FITMEET_E2E_USER_A=... \
FITMEET_E2E_TOKEN_B=... FITMEET_E2E_USER_B=... \
npm run test:social:e2e
```

The script writes a friend request and a message, then proves mutual friendship, a formal `conversationId`, stable `clientMessageId`, delivery, read, and recall through fresh server reads. Use disposable accounts because the relationship is intentionally retained for cross-client inspection.

Before the accepted-friend run, use reset disposable accounts to prove that cancellation and rejection do not create friendship or a conversation:

```bash
FITMEET_E2E_CONFIRM_WRITES=YES FITMEET_E2E_NEGATIVE_MODE=cancel \
FITMEET_E2E_TOKEN_A=... FITMEET_E2E_USER_A=... \
FITMEET_E2E_TOKEN_B=... FITMEET_E2E_USER_B=... \
npm run test:social:e2e:negative

FITMEET_E2E_CONFIRM_WRITES=YES FITMEET_E2E_NEGATIVE_MODE=reject \
FITMEET_E2E_TOKEN_A=... FITMEET_E2E_USER_A=... \
FITMEET_E2E_TOKEN_B=... FITMEET_E2E_USER_B=... \
npm run test:social:e2e:negative
```

Each negative run proves the request first reached B, then disappeared from both pending lists, remained absent from both friend lists, and caused `/messages/start` to return an authorization or business-rule denial. Reset the pair between scenarios if the service enforces a relationship-request cooldown.

## Cross-client manual gate

After the script succeeds, open those same accounts in Web, iOS, and WeChat and verify the identical friend, conversation, recalled-message, demand, and invitation IDs. This repository cannot truthfully claim that gate from local Web fixtures.

## External service contracts still required

- Server-owned block-list endpoint and cross-device list semantics
- Cursor-based conversation message pagination
- One attachment metadata/upload contract shared by Web, iOS, and WeChat
- An explicit server rule for which accepted friendship, demand application, or activity invitation creates a conversation

The Web UI does not expose archive or Web-only attachments while these contracts are out of scope.
