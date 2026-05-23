import { NextResponse } from "next/server";
import { getDB, UserQuery } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export const runtime = "edge";

function getDisplayName(user) {
  return user.display_name || user.email.split("@")[0];
}

export async function POST(req) {
  let email, password;

  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib" },
      { status: 400 }
    );
  }

  const db = getDB();

  const user = await UserQuery.byEmail(
    db,
    email.toLowerCase().trim()
  );

  if (
    !user ||
    !(await verifyPassword(password, user.password_hash))
  ) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  if (!user.email_verified) {
    return NextResponse.json(
      { error: "Email belum diverifikasi" },
      { status: 403 }
    );
  }

  await UserQuery.updateLastLogin(db, user.id);

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    displayName: getDisplayName(user),
  });

  return NextResponse.json({
    ok: true,
    role: user.role,
    displayName: getDisplayName(user),
  });
}
