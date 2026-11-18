import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { acceptInvitation, createProject } from "@/app/actions";
import { listPendingInvitations, listProjects } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function ProjectsPage() {
  const current = await requireUser();
  const [projects, invitations] = await Promise.all([listProjects(current.id), listPendingInvitations(current.id)]);
  return <AppShell userName={current.name}><header className="page-header"><div><p className="context-label">共同帳簿</p><h1>帳簿</h1><p>支出を管理する単位を選びます</p></div></header>{invitations.length > 0 && <section className="notice-section"><h2>届いている招待</h2>{invitations.map((invitation) => <div className="invitation-row" key={invitation.id}><span>{invitation.projectName}</span><form action={acceptInvitation.bind(null, invitation.id)}><button className="button button-small">参加する</button></form></div>)}</section>}<section className="project-layout"><div className="project-list">{projects.length === 0 ? <div className="empty-state"><h2>最初の帳簿を作成</h2><p>チームや用途ごとに支出をまとめられます</p></div> : projects.map((entry) => <Link className="project-row" href={`/projects/${entry.id}`} key={entry.id}><span><strong>{entry.name}</strong><small>{entry.role === "owner" ? "オーナー" : "メンバー"}</small></span><ArrowRight size={18} /></Link>)}</div><form action={createProject} className="side-form"><h2><Plus size={18} />新しい帳簿</h2><label htmlFor="project-name">帳簿名</label><input id="project-name" name="name" maxLength={80} required placeholder="開発チーム" /><button className="button button-primary">帳簿を作成</button></form></section></AppShell>;
}
