"use client";

import { Fingerprint, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { authClient } from "@/lib/auth-client";

export function AuthPanel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"signup" | "signin" | null>(null);
  const [error, setError] = useState("");

  async function signUp(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("表示名を入力してください");
    setBusy("signup"); setError("");
    const result = await authClient.passkey.addPasskey({
      name: "メイン Passkey",
      context: JSON.stringify({ id: uuidv7(), name: trimmed }),
      createSession: true,
    });
    setBusy(null);
    if (result.error) return setError(result.error.message ?? "Passkey を登録できませんでした");
    router.push("/projects"); router.refresh();
  }

  async function signIn() {
    setBusy("signin"); setError("");
    const result = await authClient.signIn.passkey();
    setBusy(null);
    if (result.error) return setError(result.error.message ?? "Passkey でログインできませんでした");
    router.push("/projects"); router.refresh();
  }

  return (
    <div className="auth-panel">
      <button className="button button-primary auth-action" onClick={signIn} disabled={busy !== null}>
        {busy === "signin" ? <LoaderCircle className="spin" size={18} /> : <Fingerprint size={18} />}
        Passkey でログイン
      </button>
      <div className="auth-divider"><span>初めて使う方</span></div>
      <form onSubmit={signUp} className="signup-form">
        <label htmlFor="name">表示名</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="山田 太郎" autoComplete="name" />
        <button className="button button-secondary auth-action" disabled={busy !== null}>
          {busy === "signup" ? <LoaderCircle className="spin" size={18} /> : <Fingerprint size={18} />}
          Passkey を登録して始める
        </button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="auth-note">パスワードは使用しません。端末の生体認証またはセキュリティキーを使います</p>
    </div>
  );
}
