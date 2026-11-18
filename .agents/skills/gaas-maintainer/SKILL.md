---
name: gaas-maintainer
description: Maintain and operate the 月割 (GaaS) repository, including its amortization rules, Passkey-first authentication, shared-project authorization, dashboard UI, Cloudflare Workers/D1 deployment, and production WebAuthn verification. Use for implementation, review, debugging, database changes, security changes, UI changes, or deployment in this repository.
---

# GaaS maintainer

Preserve the product as a shared management-accounting ledger: users register purchases, choose an amortization start month and duration, and inspect exact integer-yen allocations by month.

## Route the work

- Read [references/architecture.md](references/architecture.md) before changing domain calculations, authentication, authorization, data models, or UI structure.
- Read [references/operations.md](references/operations.md) before changing Cloudflare bindings, applying migrations, running production E2E, deploying, or cleaning production test data.
- For a narrow copy or style edit, inspect the affected component and the design section of the architecture reference; do not load the operations reference unless deployment is requested.

## Non-negotiable invariants

1. The server owns identity creation. Passkey-first registration uses a random opaque context stored in D1, expires after five minutes, and is consumed atomically once. Never accept a user ID supplied by the browser, and never attach an unauthenticated registration to an existing user.
2. WebAuthn keeps an exact production RP ID and origin, `userVerification: "required"`, and `residentKey: "required"`. Adding another Passkey requires an authenticated session. The last Passkey cannot be deleted.
3. Every project-scoped server action checks membership. Owner-only operations check the role explicitly. Do not rely on hidden UI or route nesting as authorization.
4. Prices and allocations are integer yen. For price `P` and duration `N`, allocate `floor(P/N)` each month and one extra yen to the first `P mod N` months. The schedule total must equal `P`.
5. Authentication and sensitive ledger actions remain auditable. Avoid storing raw IP addresses; registration rate-limit keys are HMAC-derived.
6. Schema evolution is additive through numbered D1 migrations. Apply database migrations before deploying code that depends on them.

## Working shape

Inspect the current implementation instead of assuming framework APIs from memory. This repository uses Next.js through vinext on Cloudflare Workers, which differs from a conventional Node-hosted Next.js app. Read the relevant bundled Next.js guide when changing framework behavior, as required by the root `AGENTS.md`.

Keep changes small enough to validate locally. Before push, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build:vinext
```

When changing the dashboard, preserve the ledger visual language and verify desktop and mobile layouts. When changing authentication, add a negative test for the abuse case, not only a successful login test.
