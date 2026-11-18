import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { env } from "cloudflare:workers";
import { validate as validateUuid, v7 as uuidv7 } from "uuid";
import { getDb } from "./db";
import { schema } from "./schema";

type RegistrationContext = { id: string; name: string };

function parseRegistrationContext(value?: string | null): RegistrationContext {
  if (!value) throw new Error("登録情報がありません");
  const parsed = JSON.parse(value) as Partial<RegistrationContext>;
  const name = parsed.name?.trim();
  if (!parsed.id || !validateUuid(parsed.id) || !name || name.length > 80) throw new Error("登録情報が不正です");
  return { id: parsed.id, name };
}

export function createAuth() {
  return betterAuth({
    appName: "月割",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "sqlite", schema }),
    emailAndPassword: { enabled: false },
    advanced: { database: { generateId: () => uuidv7() } },
    plugins: [
      passkey({
        rpName: "月割",
        rpID: new URL(env.BETTER_AUTH_URL).hostname,
        origin: env.BETTER_AUTH_URL,
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        registration: {
          requireSession: false,
          resolveUser: async ({ context }) => {
            const registration = parseRegistrationContext(context);
            return { id: registration.id, name: registration.name, displayName: registration.name };
          },
          afterVerification: async ({ ctx, user: pendingUser }) => {
            const existing = await ctx.context.internalAdapter.findUserById(pendingUser.id);
            if (!existing) {
              await ctx.context.internalAdapter.createUser({
                id: pendingUser.id,
                name: pendingUser.name,
                email: `${pendingUser.id}@passkey.gaas.invalid`,
                emailVerified: false,
              }, { method: "passkey" });
            }
            return { userId: pendingUser.id, name: "メイン Passkey" };
          },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
