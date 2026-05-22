import { cookies } from "next/headers";
import { sealSession, unsealSession } from "./sessionCrypto.js";

const COOKIE_NAME = "session";
const SEVEN_DAYS_MS  = 7 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60;

export async function createSession(data) {
  const payload = {
    v: 1,
    ...data,
    exp: Date.now() + SEVEN_DAYS_MS,
  };

  const token = await sealSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SEC,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return unsealSession(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
