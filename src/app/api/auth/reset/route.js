import { NextResponse } from "next/server";
import { getDB, UserQuery } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "edge";

export async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token dan password baru wajib diisi" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }

  const db = getDB();
  let user;
  
  try {
    user = await UserQuery.byResetToken(db, token);
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Token tidak valid atau sudah digunakan" }, { status: 400 });
  }

  if (user.reset_exp && Date.now() > user.reset_exp) {
    return NextResponse.json({ error: "Token sudah kedaluwarsa" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  try {
    await UserQuery.updatePasswordAndClearResetToken(db, user.id, passwordHash);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan password baru" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Kata sandi berhasil diubah" });
}
