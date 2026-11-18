# 月割（減価償却 as a Service）

支出をユーザー指定の月数で均等に按分し、プロジェクト単位の月額負担を共有管理する Web アプリです。税務会計上の固定資産台帳ではなく、管理会計のための配賦ツールです。

## 技術構成

- Next.js App Router / TypeScript / vinext
- Cloudflare Workers / D1 / KV
- Drizzle ORM
- Better Auth + Passkey（パスワードなし）
- Vitest / Playwright

## ローカル開発

```bash
npm install --legacy-peer-deps
npx cf d1 migrations apply 48b09f17-fa3f-42b2-9d34-a268d63a186f --local --dir migrations
npm run dev:vinext
```

ローカルで Passkey を試す場合は、`cloudflare.config.ts` の `BETTER_AUTH_URL` と RP ID に使われる URL を localhost 向けに切り替えてください。本番 origin のままでは WebAuthn の origin 検証に失敗します。

## 検証

```bash
npm run lint
npm run typecheck
npm test
npm run build:vinext
```

本番スモークテストは仮想 WebAuthn 認証器を使い、検証用データを作成します。

```bash
SMOKE_BASE_URL=https://example.workers.dev node scripts/production-smoke.mjs
```

## デプロイ

```bash
npx cf d1 migrations apply 48b09f17-fa3f-42b2-9d34-a268d63a186f --dir migrations
npm run deploy:vinext
```

初回デプロイでは `BETTER_AUTH_SECRET` が未作成のため、Cloudflare の secrets file を指定して `cf deploy` します。値は32バイト以上のランダム値を使用し、リポジトリへ保存しないでください。

## 償却計算

月額は `floor(価格 / 耐用月数)` を基準とし、余りの円を償却開始月から1円ずつ加算します。全期間の合計は必ず登録価格と一致します。

## 認証セキュリティ

- 新規登録コンテキストはサーバーで発行し、5分で失効・一回の検証で消費されます。
- 未認証状態から既存ユーザーへPasskeyを追加することはできません。
- 新規登録の開始はIP単位で10分あたり8回に制限します。IPはHMAC化して保存します。
- Passkeyの登録・削除、セッション作成、招待、主要な帳簿操作を監査ログへ記録します。
- 最後のPasskeyは削除できません。紛失に備えて複数端末への登録を推奨します。本人確認を迂回する管理者リセットは実装していません。
