import { NextResponse } from "next/server";
import { getDB, UserQuery } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "edge";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ error: "Email dan password wajib" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });

  const db = getDB();

  const existing = await UserQuery.byEmail(db, email.toLowerCase().trim());
  if (existing)
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const id            = crypto.randomUUID();
  const verify_token  = crypto.randomUUID();
  const verify_exp    = Date.now() + 24 * 60 * 60 * 1000;
  const password_hash = await hashPassword(password);

  await UserQuery.create(db, {
    id,
    email: email.toLowerCase().trim(),
    password_hash,
    role: "user",
    verify_token,
    verify_exp,
  });

  await sendVerificationEmail(email, verify_token);

  return NextResponse.json({ ok: true, message: "Cek inbox untuk verifikasi email" });
}

async function sendVerificationEmail(to, token) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: "Verifikasi Email Kamu",
      html: `
        <p>Klik tombol berikut untuk verifikasi akun kamu:</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#16a34a;
                  color:white;border-radius:8px;text-decoration:none;font-weight:bold">
          Verifikasi Email
        </a>
        <p style="color:#6b7280;font-size:13px">Link berlaku 24 jam.</p>
      `,
    }),
  });
}