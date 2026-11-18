import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "./auth";

export async function getSession() {
  return createAuth().api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/");
  return session.user;
}
