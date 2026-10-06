import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSessionFromHeaders(requestHeaders: Headers) {
  return auth.api.getSession({
    headers: requestHeaders,
    query: { disableCookieCache: true },
  });
}

export async function getCurrentSession() {
  return getSessionFromHeaders(new Headers(await headers()));
}
