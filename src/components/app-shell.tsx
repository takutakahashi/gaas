import { BookOpen, Fingerprint, FolderKanban } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { SignOut } from "./sign-out";

export function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/projects" className="brand"><span className="brand-mark">月</span><span>月割</span></Link>
      <nav className="nav-list" aria-label="メインナビゲーション">
        <Link href="/projects"><FolderKanban size={17} />帳簿</Link>
        <Link href="/settings/passkeys"><Fingerprint size={17} />Passkey</Link>
      </nav>
      <div className="sidebar-foot"><BookOpen size={16} /><span className="truncate">{userName}</span><SignOut /></div>
    </aside>
    <main className="app-main">{children}</main>
  </div>;
}
