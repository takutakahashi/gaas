<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 月割（GaaS）リポジトリガイド

このリポジトリは、支出を指定月数で均等配賦する共同帳簿「月割」です。税務会計上の法定減価償却ではなく、管理会計向けの月割ツールとして扱ってください。

## 作業前に読むもの

機能追加、認証、DB、Cloudflare、UI、テスト、デプロイに関する作業では、最初に [`.agents/skills/gaas-maintainer/SKILL.md`](.agents/skills/gaas-maintainer/SKILL.md) を読み、該当する参照資料へ進んでください。

## 変更時の必須条件

- Passkey登録では、クライアントがユーザーIDを決めてはいけません。サーバー発行の短命・一回限りの登録コンテキストを使い、未認証状態から既存ユーザーへPasskeyを追加できない状態を維持してください。
- プロジェクト配下の読み書きは、必ずサーバー側で `project_member` を確認してください。招待などの管理操作はオーナーだけに制限します。
- 金額は整数円で扱います。各月の配賦額の合計が登録価格と必ず一致するよう、余りは開始月から1円ずつ配賦します。
- D1のスキーマ変更は新しいマイグレーションとして追加します。適用済みファイルを書き換えないでください。
- 本番E2Eはデータを作成します。成功・失敗にかかわらず、テストユーザー、Passkey、セッション、帳簿、物品、関連監査ログを対象を限定して削除してください。
- `BETTER_AUTH_SECRET`、`.dev.vars`、セッションクッキーなどの秘匿情報をコミット、ログ出力、コマンドライン引数への展開で露出させないでください。
- push前に `npm run lint`、`npm run typecheck`、`npm test`、`npm run build:vinext` を実行してください。デプロイを伴う場合は本番疎通と関連E2Eも確認します。

## リポジトリ上の注意

- Cloudflare本番設定は `cloudflare.config.ts`、D1マイグレーションは `migrations/` にあります。
- Next.jsの型生成物とCloudflareのビルド生成物は編集しません。
- UIは紙の帳簿を思わせる静かな配色、罫線、台帳緑、明瞭なゴシック体を基調とします。汎用的なSaaSカード、グラデーション、装飾目的の影を増やさないでください。
- `AGENTS.md` 冒頭のNext.js自動生成ブロックは削除しないでください。
