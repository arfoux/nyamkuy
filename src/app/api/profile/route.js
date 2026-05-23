import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createSession, getSession } from "@/lib/session";

export const runtime = "edge";

const DAILY_COOK_LIMIT = 3;
const COOK_TIME_ZONE = "Asia/Jakarta";

function getCookDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COOK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function fallbackDisplayName(session) {
  return session.displayName || session.email?.split("@")[0] || "Pengguna";
}

function normalizeDisplayName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 32);
}

async function requireSession() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { session };
}

async function readUser(db, session) {
  try {
    const user = await db
      .prepare(
        `SELECT id, email, role, display_name, created_at, last_login_at
         FROM users
         WHERE id = ?
         LIMIT 1`
      )
      .bind(session.userId)
      .first();

    if (user) return user;
  } catch {
    try {
      const user = await db
        .prepare(
          `SELECT id, email, role, created_at, last_login_at
           FROM users
           WHERE id = ?
           LIMIT 1`
        )
        .bind(session.userId)
        .first();

      if (user) {
        return {
          ...user,
          display_name: fallbackDisplayName(session),
        };
      }
    } catch {
      // fall through to session fallback
    }
  }

  return {
    id: session.userId,
    email: session.email,
    role: session.role,
    display_name: fallbackDisplayName(session),
    created_at: null,
    last_login_at: null,
  };
}

async function firstNumber(db, query, params, key) {
  try {
    const row = await db
      .prepare(query)
      .bind(...params)
      .first();

    return Number(row?.[key] ?? 0);
  } catch {
    return 0;
  }
}

async function readSavedRecipes(db, userId) {
  try {
    const { results } = await db
      .prepare(
        `SELECT
          r.id,
          r.nama,
          r.deskripsi,
          r.cook_points,
          sr.created_at AS saved_at
         FROM saved_recipes sr
         JOIN resep r ON r.id = sr.resep_id
         WHERE sr.user_id = ?
         ORDER BY sr.created_at DESC
         LIMIT 12`
      )
      .bind(userId)
      .all();

    return results;
  } catch {
    try {
      const { results } = await db
        .prepare(
          `SELECT
            r.id,
            r.nama,
            r.deskripsi,
            sr.created_at AS saved_at
           FROM saved_recipes sr
           JOIN resep r ON r.id = sr.resep_id
           WHERE sr.user_id = ?
           ORDER BY sr.created_at DESC
           LIMIT 12`
        )
        .bind(userId)
        .all();

      return results.map((recipe) => ({
        ...recipe,
        cook_points: 10,
      }));
    } catch {
      return [];
    }
  }
}

async function readCookedRecipes(db, userId) {
  try {
    const { results } = await db
      .prepare(
        `SELECT
          cr.id,
          cr.resep_id,
          cr.points_awarded,
          cr.cook_date,
          cr.cooked_at,
          r.nama,
          r.deskripsi
         FROM cooked_recipes cr
         JOIN resep r ON r.id = cr.resep_id
         WHERE cr.user_id = ?
         ORDER BY cr.cooked_at DESC
         LIMIT 12`
      )
      .bind(userId)
      .all();

    return results;
  } catch {
    return [];
  }
}

export async function GET() {
  const { response, session } = await requireSession();
  if (response) return response;

  const { env } = getRequestContext();
  const db = env.DB;
  const cookDate = getCookDate();

  const [
    user,
    savedCount,
    cookedCount,
    totalPoints,
    cookedToday,
    savedRecipes,
    cookedRecipes,
  ] = await Promise.all([
    readUser(db, session),
    firstNumber(
      db,
      "SELECT COUNT(*) AS total FROM saved_recipes WHERE user_id = ?",
      [session.userId],
      "total"
    ),
    firstNumber(
      db,
      "SELECT COUNT(*) AS total FROM cooked_recipes WHERE user_id = ?",
      [session.userId],
      "total"
    ),
    firstNumber(
      db,
      `SELECT COALESCE(SUM(points_awarded), 0) AS total
       FROM cooked_recipes
       WHERE user_id = ?`,
      [session.userId],
      "total"
    ),
    firstNumber(
      db,
      `SELECT COUNT(*) AS total
       FROM cooked_recipes
       WHERE user_id = ?
         AND cook_date = ?`,
      [session.userId, cookDate],
      "total"
    ),
    readSavedRecipes(db, session.userId),
    readCookedRecipes(db, session.userId),
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name || fallbackDisplayName(session),
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    stats: {
      saved_count: savedCount,
      cooked_count: cookedCount,
      total_points: totalPoints,
      cooked_today: cookedToday,
      daily_limit: DAILY_COOK_LIMIT,
      cook_date: cookDate,
    },
    saved_recipes: savedRecipes,
    cooked_recipes: cookedRecipes,
  });
}

export async function PATCH(request) {
  const { response, session } = await requireSession();
  if (response) return response;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const displayName = normalizeDisplayName(body?.display_name);

  if (displayName.length < 2) {
    return NextResponse.json(
      { error: "Nama minimal 2 karakter" },
      { status: 400 }
    );
  }

  const { env } = getRequestContext();
  const db = env.DB;

  try {
    await db
      .prepare("UPDATE users SET display_name = ? WHERE id = ?")
      .bind(displayName, session.userId)
      .run();
  } catch {
    return NextResponse.json(
      {
        error:
          "Kolom display_name belum tersedia. Jalankan query D1 untuk profile.",
      },
      { status: 500 }
    );
  }

  await createSession({
    userId: session.userId,
    email: session.email,
    role: session.role,
    displayName,
  });

  return NextResponse.json({
    ok: true,
    display_name: displayName,
  });
}
