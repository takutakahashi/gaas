"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { v7 as uuidv7 } from "uuid";
import { writeAuditLog } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { getProjectForUser } from "@/lib/queries";
import { item, passkey, project, projectInvitation, projectMember, user } from "@/lib/schema";
import { requireUser } from "@/lib/session";
import { invitationSchema, itemSchema, projectSchema } from "@/lib/validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createProject(formData: FormData) {
  const current = await requireUser();
  const input = projectSchema.parse({ name: formValue(formData, "name") });
  const id = uuidv7();
  const now = new Date();
  await getDb().batch([
    getDb().insert(project).values({ id, name: input.name, createdBy: current.id, createdAt: now, updatedAt: now }),
    getDb().insert(projectMember).values({ projectId: id, userId: current.id, role: "owner", joinedAt: now }),
  ]);
  await writeAuditLog({ event: "project.created", actorUserId: current.id, targetId: id, projectId: id });
  redirect(`/projects/${id}`);
}

export async function createItem(projectId: string, formData: FormData) {
  const current = await requireUser();
  if (!await getProjectForUser(projectId, current.id)) throw new Error("この帳簿を編集する権限がありません");
  const input = itemSchema.parse(Object.fromEntries(formData));
  const now = new Date();
  await getDb().insert(item).values({ id: uuidv7(), projectId, createdBy: current.id, createdAt: now, updatedAt: now, ...input });
  await writeAuditLog({ event: "item.created", actorUserId: current.id, projectId });
  redirect(`/projects/${projectId}`);
}

export async function deleteItem(projectId: string, itemId: string) {
  const current = await requireUser();
  if (!await getProjectForUser(projectId, current.id)) throw new Error("この帳簿を編集する権限がありません");
  await getDb().delete(item).where(and(eq(item.id, itemId), eq(item.projectId, projectId)));
  await writeAuditLog({ event: "item.deleted", actorUserId: current.id, targetId: itemId, projectId });
  redirect(`/projects/${projectId}`);
}

export async function inviteMember(projectId: string, formData: FormData) {
  const current = await requireUser();
  const membership = await getProjectForUser(projectId, current.id);
  if (membership?.role !== "owner") throw new Error("オーナーのみ招待できます");
  const { invitedUserId } = invitationSchema.parse({ invitedUserId: formValue(formData, "invitedUserId") });
  if (invitedUserId === current.id) throw new Error("自分自身は招待できません");
  const [target] = await getDb().select({ id: user.id }).from(user).where(eq(user.id, invitedUserId)).limit(1);
  if (!target) throw new Error("指定したユーザーが見つかりません");
  const [existing] = await getDb().select().from(projectMember).where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, invitedUserId))).limit(1);
  if (existing) throw new Error("すでに参加しているユーザーです");
  const now = new Date();
  await getDb().insert(projectInvitation).values({ id: uuidv7(), projectId, invitedUserId, invitedBy: current.id, role: "member", status: "pending", createdAt: now, expiresAt: new Date(now.getTime() + 7 * 86400000) });
  await writeAuditLog({ event: "project.member.invited", actorUserId: current.id, targetId: invitedUserId, projectId });
  redirect(`/projects/${projectId}/members`);
}

export async function acceptInvitation(invitationId: string) {
  const current = await requireUser();
  const [invitation] = await getDb().select().from(projectInvitation).where(and(eq(projectInvitation.id, invitationId), eq(projectInvitation.invitedUserId, current.id), eq(projectInvitation.status, "pending"))).limit(1);
  if (!invitation || invitation.expiresAt < new Date()) throw new Error("招待が無効または期限切れです");
  await getDb().batch([
    getDb().insert(projectMember).values({ projectId: invitation.projectId, userId: current.id, role: "member", joinedAt: new Date() }),
    getDb().update(projectInvitation).set({ status: "accepted" }).where(eq(projectInvitation.id, invitation.id)),
  ]);
  await writeAuditLog({ event: "project.invitation.accepted", actorUserId: current.id, targetId: invitation.id, projectId: invitation.projectId });
  redirect(`/projects/${invitation.projectId}`);
}

export async function deletePasskey(passkeyId: string) {
  const current = await requireUser();
  const keys = await getDb().select({ id: passkey.id }).from(passkey).where(eq(passkey.userId, current.id));
  if (keys.length <= 1) throw new Error("最後の Passkey は削除できません");
  await getDb().delete(passkey).where(and(eq(passkey.id, passkeyId), eq(passkey.userId, current.id)));
  await writeAuditLog({ event: "auth.passkey.deleted", actorUserId: current.id, targetId: passkeyId });
  redirect("/settings/passkeys");
}
