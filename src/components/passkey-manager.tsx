"use client";

import { Fingerprint, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PasskeyManager() {
  const router = useRouter(); const [error, setError] = useState("");
  return <div><button className="button button-primary" onClick={async () => { setError(""); const result = await authClient.passkey.addPasskey({ name: "追加 Passkey" }); if (result.error) setError(result.error.message ?? "追加できませんでした"); else router.refresh(); }}><Plus size={17} /><Fingerprint size={17} />Passkey を追加</button>{error && <p className="form-error">{error}</p>}<p className="auth-note">端末紛失に備え、別の端末またはセキュリティキーにもPasskeyを追加してください。本人確認を迂回する復旧手段はありません。</p></div>;
}
