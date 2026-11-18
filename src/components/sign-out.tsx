"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOut() {
  const router = useRouter();
  return <button className="nav-action" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}><LogOut size={16} />ログアウト</button>;
}
