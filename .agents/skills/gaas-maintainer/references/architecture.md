# Architecture and product rules

## Product behavior

月割 is a management-accounting allocation tool, not a Japanese tax depreciation calculator. A project is a shared ledger. Each item records its name, category, optional manufacturer/model, integer-yen price, start month, useful life in months, and optional note.

`src/lib/amortization.ts` is the source of truth for monthly allocation. It uses exact integer distribution: the base amount is `floor(price / months)`, with the remainder distributed one yen at a time from the first month. Keep boundary behavior covered in `src/lib/amortization.test.ts`.

The project dashboard shows:

- a compact selected-month control;
- a 12-month bar chart for the selected year, whose bars link to each month's breakdown;
- the selected month's total and active-item count;
- item-level period, price, selected-month amount, and schedule progress.

## Runtime and important files

- Next.js App Router and TypeScript, compiled by vinext for Cloudflare Workers.
- D1 through Drizzle: `src/lib/schema.ts`, `src/lib/db.ts`, `migrations/`.
- Better Auth and `@better-auth/passkey`: `src/lib/auth.ts`, `src/lib/session.ts`, `src/lib/auth-client.ts`.
- Project and ledger mutations: `src/app/actions.ts`.
- Membership-aware reads: `src/lib/queries.ts`.
- Cloudflare bindings: `cloudflare.config.ts`.
- Security headers: `next.config.ts`.
- Production browser verification: `scripts/production-smoke.mjs`.

## Authentication model

Password authentication is disabled. New-account registration is deliberately two-stage:

1. `POST /api/registration-context` validates same-origin JSON, enforces a HMAC-keyed IP rate limit, generates the UUIDv7 user ID on the server, and stores a random opaque context in `registration_context` for five minutes.
2. Better Auth's Passkey registration resolves only that pending context. After successful WebAuthn verification it atomically marks the context consumed, rejects any existing target user, creates the user, stores the Passkey, and creates a session.

This structure fixes a prior account-takeover risk in which a client-chosen UUID could target an existing user. Any refactor must retain server-owned identity, expiry, atomic single use, and existing-user rejection.

Sessions and Passkeys use Better Auth's D1 tables. The configured Better Auth URL is also the WebAuthn origin, and its hostname is the RP ID. Production cookies are forced secure. Better Auth's origin and CSRF protections remain enabled.

## Authorization and collaboration

`project_member` is the access boundary. Both owners and members currently edit items; only owners invite members. Invitations target an existing user's UUID and expire after seven days. Accepting an invitation verifies the authenticated user matches the invitee.

Keep object queries scoped by both project and object ID. A valid item ID alone is never sufficient authorization.

## Security and recovery posture

- Registration starts are limited to eight per IP-derived HMAC key per ten-minute window.
- CSP, HSTS, frame denial, MIME sniffing prevention, Referrer Policy, and Permissions Policy are set globally.
- `audit_log` records sessions, Passkey changes, invitations, and major ledger mutations.
- Users should register a second device or hardware security key. There is intentionally no administrator bypass or weak recovery path.

If recovery is added, design and review it as a new authentication factor. Do not add email-only reset to synthetic `@passkey.gaas.invalid` addresses.

## Visual language

The interface is a quiet working ledger:

- paper `#f7f7f4`, ink `#20221f`, rule `#d9dbd3`, muted `#6f746b`, ledger green `#286246`;
- BIZ UDPGothic/Yu Gothic-style sans serif;
- information-bearing rules and allocation lines rather than decorative cards;
- no gradients, glow, emoji labels, glass effects, or generic metric-card grids;
- the green allocation line and annual bar chart are the signature visual devices.

Use the smallest useful visualization. Ensure numeric columns use tabular figures, controls remain keyboard-visible, and the dashboard collapses cleanly below 900px.
