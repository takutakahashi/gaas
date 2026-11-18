# Cloudflare and production operations

## Production resources

- Worker: `gaas`
- URL: `https://gaas.taku-takahashi120.workers.dev`
- D1 database: `gaas-production`
- KV binding: `VINEXT_KV_CACHE`
- D1 and KV identifiers live in `cloudflare.config.ts`; do not duplicate them in application code.
- `BETTER_AUTH_SECRET` is a Cloudflare secret. Never place it in this repository or print it.

The repository was initialized from an empty remote. The working branch `feat/implement-gaas` became GitHub's default branch on first push. Inspect the remote's current default branch before creating PRs or changing branch policy rather than assuming `main` exists.

## Local development

Install and migrate:

```bash
npm ci --legacy-peer-deps
npm run db:migrate:local
npm run dev:vinext
```

WebAuthn requires the browser origin to match Better Auth's configured origin/RP ID. With the production URL in `cloudflare.config.ts`, a localhost Passkey ceremony will fail by design. For local WebAuthn work, use a deliberate localhost configuration; do not weaken origin validation.

The vinext development optimizer can occasionally reload repeatedly after dependency optimization. A production build plus `vite preview` is a more representative fallback, but it still cannot complete WebAuthn unless the configured RP origin matches.

## Database changes

Create a new numbered SQL file under `migrations/`; never rewrite an applied migration. Prefer additive, backward-compatible changes. Validate locally first:

```bash
npm run db:migrate:local
npm run lint
npm run typecheck
npm test
npm run build:vinext
```

For production, apply D1 migrations before deploying dependent Worker code:

```bash
npm run db:migrate:remote
npm run deploy:vinext
```

D1's remote SQL endpoint does not accept `BEGIN`/`COMMIT` in Wrangler commands. Use Worker-side transactional APIs when atomic multi-statement behavior is required. Do not improvise broad cleanup queries against production.

## Production verification

`scripts/production-smoke.mjs` uses Playwright and a CDP virtual WebAuthn authenticator. It verifies:

1. Passkey-first account creation and session establishment;
2. consumed registration-context replay is rejected with 400;
3. a forged legacy JSON/UUID context is rejected with 400;
4. project and item creation;
5. `120,000 / 12 = 10,000` on the dashboard;
6. optional full-page screenshot through `SMOKE_SCREENSHOT`.

Run it only when production mutation is intended:

```bash
SMOKE_BASE_URL=https://gaas.taku-takahashi120.workers.dev \
  node scripts/production-smoke.mjs
```

The script creates data but does not clean it automatically. Cleanup must target only its fixed names (`本番動作確認`, `本番スモークテスト`) and remove dependent items, invitations, memberships, audit rows, project, sessions, Passkeys, accounts, registration contexts, then the user. Verify both remaining user and project counts are zero. Never use an unscoped production delete.

Also verify:

- `/` returns 200;
- `/api/auth/ok` returns `{"ok":true}`;
- forged/consumed registration contexts return 400;
- missing or cross-site Origin on registration-context creation returns 403;
- the six expected security headers are present;
- the GitHub Actions CI run for the pushed commit succeeds.

## Deployment handoff

Record the production URL, commit, CI run, Worker version, migration status, E2E result, and cleanup result in the issue or handoff. Treat a deployment as incomplete if test data remains or CI is still pending.
