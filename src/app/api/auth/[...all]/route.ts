import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

const handler = toNextJsHandler(createAuth());
export const { GET, POST } = handler;
