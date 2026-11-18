import { createHmac, randomUUID } from "node:crypto";
import { env } from "cloudflare:workers";
import { lt } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { rateLimitBucket, registrationContext } from "@/lib/schema";

const requestSchema = z.object({ name: z.string().trim().min(1).max(80) });
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;

function trustedRequest(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

function rateLimitKey(request: Request) {
  const address = request.headers.get("cf-connecting-ip") ?? "unknown";
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(`registration:${address}`).digest("hex");
}

async function consumeRateLimit(key: string) {
  const now = Date.now();
  const resetBefore = now - WINDOW_MS;
  const result = await env.DB.prepare(`
    INSERT INTO rate_limit_bucket (key, window_started_at, count)
    VALUES (?1, ?2, 1)
    ON CONFLICT(key) DO UPDATE SET
      window_started_at = CASE WHEN window_started_at < ?3 THEN ?2 ELSE window_started_at END,
      count = CASE WHEN window_started_at < ?3 THEN 1 ELSE count + 1 END
    RETURNING count
  `).bind(key, now, resetBefore).first<{ count: number }>();
  return (result?.count ?? MAX_ATTEMPTS + 1) <= MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (!trustedRequest(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "invalid content type" }, { status: 415 });
  }
  if (!await consumeRateLimit(rateLimitKey(request))) {
    return Response.json({ error: "too many attempts" }, { status: 429, headers: { "Retry-After": "600" } });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid request" }, { status: 400 });

  const now = new Date();
  const context = randomUUID();
  await getDb().insert(registrationContext).values({
    id: context,
    userId: uuidv7(),
    name: parsed.data.name,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 5 * 60_000),
  });
  await getDb().delete(registrationContext).where(lt(registrationContext.expiresAt, new Date(now.getTime() - 86400000)));
  await getDb().delete(rateLimitBucket).where(lt(rateLimitBucket.windowStartedAt, new Date(now.getTime() - 86400000)));

  return Response.json({ context }, { headers: { "Cache-Control": "no-store" } });
}
