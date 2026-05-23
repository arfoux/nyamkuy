import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

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

function normalizeCookPoints(value) {
  const points = Number(value);
  return Number.isFinite(points) ? points : 10;
}

async function getRecipeId(params) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams?.id, 10);
  return Number.isNaN(id) ? null : id;
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

async function getRecipe(db, resepId) {
  try {
    return db
      .prepare(
        "SELECT id, nama, cook_points FROM resep WHERE id = ? LIMIT 1"
      )
      .bind(resepId)
      .first();
  } catch {
    const recipe = await db
      .prepare("SELECT id, nama FROM resep WHERE id = ? LIMIT 1")
      .bind(resepId)
      .first();

    return recipe ? { ...recipe, cook_points: 10 } : null;
  }
}

async function getTodaySlots(db, userId, cookDate) {
  const { results } = await db
    .prepare(
      `SELECT daily_slot
       FROM cooked_recipes
       WHERE user_id = ?
         AND cook_date = ?
       ORDER BY daily_slot`
    )
    .bind(userId, cookDate)
    .all();

  return results.map((row) => row.daily_slot);
}

function getAvailableSlot(slots) {
  const usedSlots = new Set(slots);

  for (let slot = 1; slot <= DAILY_COOK_LIMIT; slot += 1) {
    if (!usedSlots.has(slot)) return slot;
  }

  return null;
}

async function getTotalPoints(db, userId) {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(points_awarded), 0) AS total_points
       FROM cooked_recipes
       WHERE user_id = ?`
    )
    .bind(userId)
    .first();

  return Number(row?.total_points ?? 0);
}

export async function POST(_request, { params }) {
  void _request;

  const resepId = await getRecipeId(params);

  if (!resepId) {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 }
    );
  }

  const { response, session } = await requireSession();
  if (response) return response;

  const { env } = getRequestContext();
  const db = env.DB;

  const recipe = await getRecipe(db, resepId);
  if (!recipe) {
    return NextResponse.json(
      { error: "Resep tidak ditemukan" },
      { status: 404 }
    );
  }

  const cookDate = getCookDate();
  let slots;

  try {
    slots = await getTodaySlots(db, session.userId, cookDate);
  } catch {
    return NextResponse.json(
      {
        error:
          "Tabel cooked_recipes belum tersedia. Jalankan query D1 untuk fitur masak.",
      },
      { status: 500 }
    );
  }

  const dailySlot = getAvailableSlot(slots);

  if (!dailySlot) {
    return NextResponse.json(
      {
        error: "Jatah masak hari ini sudah penuh",
        cooked_today: DAILY_COOK_LIMIT,
        daily_limit: DAILY_COOK_LIMIT,
        cook_date: cookDate,
      },
      { status: 429 }
    );
  }

  const pointsAwarded = normalizeCookPoints(recipe.cook_points);

  try {
    await db
      .prepare(
        `INSERT INTO cooked_recipes (
          id, user_id, resep_id, points_awarded, cook_date, daily_slot, cooked_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        session.userId,
        resepId,
        pointsAwarded,
        cookDate,
        dailySlot,
        Date.now()
      )
      .run();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Gagal mencatat masakan. Coba sekali lagi.",
        detail: error.message,
      },
      { status: 409 }
    );
  }

  const totalPoints = await getTotalPoints(db, session.userId);

  return NextResponse.json({
    ok: true,
    recipe_id: resepId,
    points_awarded: pointsAwarded,
    cooked_today: slots.length + 1,
    daily_limit: DAILY_COOK_LIMIT,
    cook_date: cookDate,
    total_points: totalPoints,
  });
}
