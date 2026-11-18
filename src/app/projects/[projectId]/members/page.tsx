import { ArrowLeft, Copy, UserPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { inviteMember } from "@/app/actions";
import { getProjectForUser, listInvitations, listMembers } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function MembersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const current = await requireUser(); const { projectId } = await params; const [book, members, invitations] = await Promise.all([getProjectForUser(projectId, current.id), listMembers(projectId), listInvitations(projectId)]); if (!book) notFound();
  return <AppShell userName={current.name}><header className="page-header"><div><Link className="back-link" href={`/projects/${projectId}`}><ArrowLeft size={14} />{book.name}</Link><h1>メンバー</h1><p>この帳簿を参照・編集できるユーザー</p></div></header><section className="member-layout"><div><div className="section-heading"><h2>参加中</h2><span>{members.length} 人</span></div><div className="member-list">{members.map((member) => <div className="member-row" key={member.id}><span className="avatar">{member.name.slice(0,1)}</span><span><strong>{member.name}</strong><small>{member.id}</small></span><em>{member.role === "owner" ? "オーナー" : "メンバー"}</em></div>)}</div></div>{book.role === "owner" && <form action={inviteMember.bind(null, projectId)} className="side-form"><h2><UserPlus size={18} />UUID で招待</h2><label htmlFor="invitedUserId">ユーザー UUID</label><input id="invitedUserId" name="invitedUserId" required placeholder="019a…" /><button className="button button-primary">招待を送る</button><p className="field-note"><Copy size={14} />相手の Passkey 設定画面に表示される UUID を指定</p></form>}</section>{invitations.length > 0 && <section className="invitation-history"><h2>招待履歴</h2>{invitations.map((entry) => <div key={entry.id}><span>{entry.name}<small>{entry.invitedUserId}</small></span><em>{entry.status}</em></div>)}</section>}</AppShell>;
}
