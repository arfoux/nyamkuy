import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { UserQuery } from "@/lib/db";

export const runtime = "edge";

export async function GET(req) {  // ← tambah req
  const token = req.nextUrl.searchParams.get("token");

  if (!token)
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });

  const { env } = getRequestContext();
  const db = env.DB;

  const user = await UserQuery.byVerifyToken(db, token);

  if (!user)
    return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 404 });

  if (Date.now() > (user.verify_exp ?? 0))
    return NextResponse.json({ error: "Token sudah expired, silakan daftar ulang" }, { status: 410 });

  await UserQuery.markVerified(db, user.id);

  return NextResponse.redirect(new URL("/auth?verified=1", req.url));
}