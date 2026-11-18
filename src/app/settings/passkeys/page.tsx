import { eq } from "drizzle-orm";
import { Copy, Fingerprint } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PasskeyManager } from "@/components/passkey-manager";
import { deletePasskey } from "@/app/actions";
import { getDb } from "@/lib/db";
import { passkey } from "@/lib/schema";
import { requireUser } from "@/lib/session";

export default async function PasskeysPage() {
  const current = await requireUser(); const keys = await getDb().select().from(passkey).where(eq(passkey.userId, current.id));
  return <AppShell userName={current.name}><header className="page-header"><div><p className="context-label">アカウント</p><h1>Passkey</h1><p>ログインに使う端末とセキュリティキー</p></div><PasskeyManager /></header><section className="identity-card"><span>あなたのユーザー UUID</span><strong>{current.id}</strong><small><Copy size={14} />帳簿へ招待してもらうときに共有します</small></section><section className="passkey-list"><div className="section-heading"><h2>登録済み</h2><span>{keys.length} 件</span></div>{keys.map((key) => <div className="passkey-row" key={key.id}><Fingerprint size={21} /><span><strong>{key.name || "Passkey"}</strong><small>{key.deviceType === "multiDevice" ? "同期済み Passkey" : "この端末の Passkey"} / {key.createdAt.toLocaleDateString("ja-JP")}</small></span><form action={deletePasskey.bind(null, key.id)}><button className="text-button" disabled={keys.length <= 1}>削除</button></form></div>)}</section></AppShell>;
}
