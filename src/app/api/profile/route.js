import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createSession, getSession } from "@/lib/session";

export const runtime = "edge";

const DAILY_COOK_LIMIT = 3;
const COOK_TIME_ZONE = "Asia/Jakarta";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

function shiftCookDate(cookDate, offset) {
  const [year, month, day] = cookDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function calculateCurrentStreak(cookDates, today) {
  const dates = new Set(cookDates);
  let cursor = today;
  let streak = 0;

  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftCookDate(cursor, -1);
  }

  return streak;
}

function buildBadges({
  cookedCount,
  savedCount,
  totalPoints,
  currentStreak,
  bestDailyCount,
  categoryCounts,
}) {
  const topCategory = categoryCounts?.[0];

  const badges = [
    {
      id: "first-cook",
      title: "Masakan Pertama",
      text: "Catat satu resep yang sudah kamu masak.",
      progress: Math.min(cookedCount, 1),
      target: 1,
      unlocked: cookedCount >= 1,
    },
    {
      id: "daily-three",
      title: "Tiga Piring Sehari",
      text: "Capai kuota 3 masakan dalam satu hari.",
      progress: Math.min(bestDailyCount, DAILY_COOK_LIMIT),
      target: DAILY_COOK_LIMIT,
      unlocked: bestDailyCount >= DAILY_COOK_LIMIT,
    },
    {
      id: "collector",
      title: "Kolektor Resep",
      text: "Simpan 5 resep ke Dapur Saya.",
      progress: Math.min(savedCount, 5),
      target: 5,
      unlocked: savedCount >= 5,
    },
    {
      id: "streak-three",
      title: "Rajin 3 Hari",
      text: "Masak selama 3 hari berturut-turut.",
      progress: Math.min(currentStreak, 3),
      target: 3,
      unlocked: currentStreak >= 3,
    },
    {
      id: "point-hunter",
      title: "Pemburu Poin",
      text: "Kumpulkan 3.000 poin dari aktivitas masak.",
      progress: Math.min(totalPoints, 3000),
      target: 3000,
      unlocked: totalPoints >= 3000,
    },
  ];

  if (topCategory) {
    badges.push({
      id: "category-master",
      title: `Pecinta ${topCategory.category}`,
      text: `Masak kategori ${topCategory.category} sebanyak 3 kali.`,
      progress: Math.min(Number(topCategory.total || 0), 3),
      target: 3,
      unlocked: Number(topCategory.total || 0) >= 3,
    });
  }

  return badges;
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
          r.category,
          r.region,
          r.duration_minutes,
          r.difficulty,
          r.servings,
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
          r.deskripsi,
          r.category,
          r.region,
          r.duration_minutes,
          r.difficulty,
          r.servings
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

async function readCookDates(db, userId) {
  try {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT cook_date
         FROM cooked_recipes
         WHERE user_id = ?
         ORDER BY cook_date DESC
         LIMIT 60`
      )
      .bind(userId)
      .all();

    return results.map((row) => row.cook_date).filter(Boolean);
  } catch {
    return [];
  }
}

async function readCategoryCounts(db, userId) {
  try {
    const { results } = await db
      .prepare(
        `SELECT
          COALESCE(NULLIF(trim(r.category), ''), 'Lainnya') AS category,
          COUNT(cr.id) AS total,
          COALESCE(SUM(cr.points_awarded), 0) AS points
         FROM cooked_recipes cr
         JOIN resep r ON r.id = cr.resep_id
         WHERE cr.user_id = ?
         GROUP BY category
         ORDER BY total DESC, points DESC, category ASC
         LIMIT 6`
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
  const weekSince = Date.now() - WEEK_MS;

  const [
    user,
    savedCount,
    cookedCount,
    totalPoints,
    weeklyPoints,
    cookedToday,
    bestDailyCount,
    savedRecipes,
    cookedRecipes,
    cookDates,
    categoryCounts,
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
      `SELECT COALESCE(SUM(points_awarded), 0) AS total
       FROM cooked_recipes
       WHERE user_id = ?
         AND cooked_at >= ?`,
      [session.userId, weekSince],
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
    firstNumber(
      db,
      `SELECT COALESCE(MAX(total), 0) AS total
       FROM (
         SELECT COUNT(*) AS total
         FROM cooked_recipes
         WHERE user_id = ?
         GROUP BY cook_date
       )`,
      [session.userId],
      "total"
    ),
    readSavedRecipes(db, session.userId),
    readCookedRecipes(db, session.userId),
    readCookDates(db, session.userId),
    readCategoryCounts(db, session.userId),
  ]);

  const currentStreak = calculateCurrentStreak(cookDates, cookDate);
  const badges = buildBadges({
    cookedCount,
    savedCount,
    totalPoints,
    currentStreak,
    bestDailyCount,
    categoryCounts,
  });

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
      weekly_points: weeklyPoints,
      cooked_today: cookedToday,
      best_daily_count: bestDailyCount,
      daily_limit: DAILY_COOK_LIMIT,
      cook_date: cookDate,
      current_streak: currentStreak,
    },
    badges,
    category_counts: categoryCounts,
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
