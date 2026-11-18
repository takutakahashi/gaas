import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, betterAuth } from "better-auth";
import { env } from "cloudflare:workers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { writeAuditLog } from "./audit";
import { getDb } from "./db";
import { registrationContext, schema } from "./schema";

type RegistrationContext = { id: string; name: string };

async function parseRegistrationContext(value?: string | null): Promise<RegistrationContext> {
  if (!value) throw new APIError("BAD_REQUEST", { message: "登録情報がありません" });
  const [pending] = await getDb().select().from(registrationContext).where(and(
    eq(registrationContext.id, value),
    isNull(registrationContext.consumedAt),
    gt(registrationContext.expiresAt, new Date()),
  )).limit(1);
  if (!pending) throw new APIError("BAD_REQUEST", { message: "登録情報が無効または期限切れです" });
  return { id: pending.userId, name: pending.name };
}

export function createAuth() {
  return betterAuth({
    appName: "月割",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "sqlite", schema }),
    emailAndPassword: { enabled: false },
    trustedOrigins: [env.BETTER_AUTH_URL],
    advanced: { database: { generateId: () => uuidv7() }, useSecureCookies: true },
    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            await writeAuditLog({ event: "auth.session.created", actorUserId: session.userId, targetId: session.id });
          },
        },
      },
    },
    plugins: [
      passkey({
        rpName: "月割",
        rpID: new URL(env.BETTER_AUTH_URL).hostname,
        origin: env.BETTER_AUTH_URL,
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        registration: {
          requireSession: false,
          resolveUser: async ({ context }) => {
            const registration = await parseRegistrationContext(context);
            return { id: registration.id, name: registration.name, displayName: registration.name };
          },
          afterVerification: async ({ ctx, user: pendingUser, context }) => {
            const consumed = await getDb().update(registrationContext).set({ consumedAt: new Date() }).where(and(
              eq(registrationContext.id, context ?? ""),
              eq(registrationContext.userId, pendingUser.id),
              isNull(registrationContext.consumedAt),
              gt(registrationContext.expiresAt, new Date()),
            )).returning({ id: registrationContext.id });
            if (consumed.length !== 1) throw new APIError("BAD_REQUEST", { message: "登録情報は使用済みまたは期限切れです" });
            const existing = await ctx.context.internalAdapter.findUserById(pendingUser.id);
            if (existing) throw new APIError("FORBIDDEN", { message: "このユーザーには未認証状態でPasskeyを追加できません" });
            await ctx.context.internalAdapter.createUser({
              id: pendingUser.id,
              name: pendingUser.name,
              email: `${pendingUser.id}@passkey.gaas.invalid`,
              emailVerified: false,
            }, { method: "passkey" });
            await writeAuditLog({ event: "auth.passkey.registered", actorUserId: pendingUser.id, targetId: pendingUser.id });
            return { userId: pendingUser.id, name: "メイン Passkey" };
          },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
