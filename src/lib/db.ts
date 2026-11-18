import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export function getDb() {
  return drizzle(env.DB, { schema });
}
