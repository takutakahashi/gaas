import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { item, project, projectInvitation, projectMember, user } from "./schema";

export async function listProjects(userId: string) {
  return getDb().select({ id: project.id, name: project.name, role: projectMember.role })
    .from(projectMember).innerJoin(project, eq(project.id, projectMember.projectId))
    .where(eq(projectMember.userId, userId)).orderBy(asc(project.name));
}

export async function getProjectForUser(projectId: string, userId: string) {
  const [row] = await getDb().select({ id: project.id, name: project.name, role: projectMember.role })
    .from(projectMember).innerJoin(project, eq(project.id, projectMember.projectId))
    .where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, userId))).limit(1);
  return row;
}

export async function listItems(projectId: string) {
  return getDb().select().from(item).where(eq(item.projectId, projectId)).orderBy(desc(item.createdAt));
}

export async function listMembers(projectId: string) {
  return getDb().select({ id: user.id, name: user.name, role: projectMember.role, joinedAt: projectMember.joinedAt })
    .from(projectMember).innerJoin(user, eq(user.id, projectMember.userId))
    .where(eq(projectMember.projectId, projectId)).orderBy(asc(user.name));
}

export async function listInvitations(projectId: string) {
  return getDb().select({ id: projectInvitation.id, invitedUserId: projectInvitation.invitedUserId, name: user.name, status: projectInvitation.status, createdAt: projectInvitation.createdAt })
    .from(projectInvitation).innerJoin(user, eq(user.id, projectInvitation.invitedUserId))
    .where(eq(projectInvitation.projectId, projectId)).orderBy(desc(projectInvitation.createdAt));
}

export async function listPendingInvitations(userId: string) {
  return getDb().select({ id: projectInvitation.id, projectId: project.id, projectName: project.name })
    .from(projectInvitation).innerJoin(project, eq(project.id, projectInvitation.projectId))
    .where(and(eq(projectInvitation.invitedUserId, userId), eq(projectInvitation.status, "pending")));
}
