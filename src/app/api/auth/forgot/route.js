import { NextResponse } from "next/server";
import { getDB, UserQuery } from "@/lib/db";

export const runtime = "edge";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
  }

  const db = getDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = await UserQuery.byEmail(db, normalizedEmail);

  // Selalu return success meskipun email tidak ada untuk alasan keamanan (mencegah enumerasi email)
  if (!user) {
    return NextResponse.json({ ok: true, message: "Jika email terdaftar, tautan reset telah dikirim." });
  }

  const reset_token = crypto.randomUUID();
  const reset_exp = Date.now() + 1 * 60 * 60 * 1000; // 1 jam dari sekarang

  try {
    await UserQuery.updateResetToken(db, user.id, reset_token, reset_exp);
  } catch (error) {
    // Jika kolom tidak ada, ignore untuk fallback atau kembalikan error.
    return NextResponse.json({ error: "Gagal membuat token, hubungi admin." }, { status: 500 });
  }

  await sendResetEmail(email, reset_token);

  return NextResponse.json({ ok: true, message: "Jika email terdaftar, tautan reset telah dikirim." });
}

async function sendResetEmail(to, token) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const link = `${appUrl}/auth/reset?token=${token}`;

  const companyName = "NyamKuy";
  const firstName = to.split("@")[0];

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: "Reset Kata Sandi Anda",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Kata Sandi</h2>
          <p>Hi ${firstName},</p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun ${companyName} Anda. Klik tombol di bawah ini untuk membuat kata sandi baru. Tautan ini berlaku selama 1 jam.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Kata Sandi</a>
          </div>
          <p>Atau salin tautan berikut ke browser Anda:</p>
          <p><a href="${link}">${link}</a></p>
          <p style="color: #666; font-size: 14px; margin-top: 40px;">Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
        </div>
      `,
    }),
  });
}
