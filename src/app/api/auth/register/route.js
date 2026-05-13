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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const link = `${appUrl}/api/auth/verify?token=${token}`;

  const companyName = process.env.APP_NAME || "Aplikasi Kamu";
  const companyAddress = process.env.APP_ADDRESS || "";
  const firstName = to.split("@")[0];

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
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html dir="ltr" lang="id">
          <head>
            <meta content="width=device-width" name="viewport" />
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
            <meta content="IE=edge" http-equiv="X-UA-Compatible" />
            <meta
              content="telephone=no,address=no,email=no,date=no,url=no"
              name="format-detection" />
          </head>

          <body style="background-color:#f4f4f5">
            <div
              style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
              data-skip-in-text="true">
              Verifikasi email kamu untuk mengaktifkan akun.
            </div>

            <table
              border="0"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              align="center">
              <tbody>
                <tr>
                  <td
                    style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:14px;min-height:100%;line-height:155%;background-color:#f4f4f5">

                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="max-width:600px;background-color:#ffffff;width:100%;padding-top:40px;padding-right:40px;padding-bottom:40px;padding-left:40px">
                      <tbody>
                        <tr style="width:100%">
                          <td>
                            <h1
                              style="margin:0;padding:0;font-size:24px;line-height:1.44em;padding-top:0.389em;font-weight:700;color:#111827;margin-bottom:16px;text-align:left">
                              Verifikasi email kamu
                            </h1>

                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;color:#374151;line-height:155%;text-align:left">
                              Hi ${firstName},
                            </p>

                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;color:#374151;line-height:155%;text-align:left">
                              Klik tombol di bawah ini untuk memverifikasi akun
                              ${companyName}. Link ini berlaku selama 24 jam.
                            </p>

                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation">
                              <tbody style="width:100%">
                                <tr style="width:100%">
                                  <td align="center">
                                    <a
                                      href="${link}"
                                      style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;margin:0;padding-top:12px;padding-right:28px;padding-bottom:12px;padding-left:28px;background-color:#000000;color:#ffffff;border-radius:6px;font-weight:500;font-size:0.875em;text-align:center;margin-top:24px;margin-bottom:24px"
                                      target="_blank">
                                      <span
                                        style="max-width:100%;display:inline-block;line-height:120%">
                                        Verifikasi Email
                                      </span>
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <p
                              style="margin:0;padding:0;font-size:13px;padding-top:0.5em;padding-bottom:0.5em;color:#6b7280;line-height:155%;text-align:left">
                              Atau salin dan tempel URL ini ke browser kamu:
                            </p>

                            <p
                              style="margin:0;padding:0;font-size:13px;padding-top:0.5em;padding-bottom:0.5em;color:#374151;line-height:155%;word-break:break-all;text-align:left">
                              <a
                                href="${link}"
                                rel="noopener noreferrer nofollow"
                                style="color:#0670DB;text-decoration-line:none;text-decoration:underline"
                                target="_blank">
                                ${link}
                              </a>
                            </p>

                            <hr
                              style="width:100%;border:none;border-color:#e5e7eb;border-top:1px solid #eaeaea;padding-bottom:1em;border-style:solid;border-width:0;border-top-width:2px;margin-top:32px;margin-bottom:24px" />

                            <p
                              style="margin:0;padding:0;font-size:13px;padding-top:0.5em;padding-bottom:0.5em;color:#6b7280;line-height:155%;text-align:left">
                              Kalau kamu tidak merasa membuat akun atau meminta email ini,
                              abaikan saja email ini.
                            </p>

                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="font-size:0.8em;padding-top:32px">
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="margin:0;padding:0;font-size:12px;padding-top:0.5em;padding-bottom:0.5em;color:#9ca3af;line-height:155%;text-align:left">
                                      ${companyName}<br />${companyAddress}
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `,
    }),
  });
}