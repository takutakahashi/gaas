import { v7 as uuidv7 } from "uuid";
import { getDb } from "./db";
import { auditLog } from "./schema";

type AuditEvent = {
  event: string;
  actorUserId?: string;
  targetId?: string;
  projectId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function writeAuditLog(entry: AuditEvent) {
  await getDb().insert(auditLog).values({
    id: uuidv7(),
    actorUserId: entry.actorUserId,
    event: entry.event,
    targetId: entry.targetId,
    projectId: entry.projectId,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    createdAt: new Date(),
  });
}
