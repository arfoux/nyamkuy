import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function readLimit(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  if (Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, limit));
}

function readPeriod(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") === "all" ? "all" : "week";
  const since = period === "week" ? Date.now() - WEEK_MS : null;

  return { period, since };
}

async function safeAll(db, query, params = []) {
  try {
    const { results } = await db.prepare(query).bind(...params).all();
    return results;
  } catch {
    return [];
  }
}

async function getTopUsers(db, limit, since) {
  const joinFilter = since ? "AND cr.cooked_at >= ?" : "";
  const params = since ? [since, limit] : [limit];

  try {
    const { results } = await db
      .prepare(
        `SELECT
          u.id,
          u.email,
          COALESCE(NULLIF(trim(u.display_name), ''), substr(u.email, 1, instr(u.email, '@') - 1)) AS display_name,
          COALESCE(SUM(cr.points_awarded), 0) AS total_points,
          COUNT(cr.id) AS cooked_count
         FROM users u
         LEFT JOIN cooked_recipes cr ON cr.user_id = u.id ${joinFilter}
         GROUP BY u.id
         HAVING total_points > 0 OR cooked_count > 0
         ORDER BY total_points DESC, cooked_count DESC, display_name ASC
         LIMIT ?`
      )
      .bind(...params)
      .all();

    return results;
  } catch {
    return safeAll(
      db,
      `SELECT
        u.id,
        u.email,
        substr(u.email, 1, instr(u.email, '@') - 1) AS display_name,
        COALESCE(SUM(cr.points_awarded), 0) AS total_points,
        COUNT(cr.id) AS cooked_count
       FROM users u
       LEFT JOIN cooked_recipes cr ON cr.user_id = u.id ${joinFilter}
       GROUP BY u.id
       HAVING total_points > 0 OR cooked_count > 0
       ORDER BY total_points DESC, cooked_count DESC, display_name ASC
       LIMIT ?`,
      params
    );
  }
}

async function getMostSavedRecipes(db, limit, since) {
  const whereClause = since ? "WHERE sr.created_at >= ?" : "";
  const params = since ? [since, limit] : [limit];

  try {
    const { results } = await db
      .prepare(
        `SELECT
        r.id,
        r.nama,
        r.deskripsi,
        r.category,
        r.region,
        r.duration_minutes,
        r.difficulty,
        COUNT(sr.id) AS saved_count
       FROM saved_recipes sr
       JOIN resep r ON r.id = sr.resep_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY saved_count DESC, r.nama ASC
       LIMIT ?`
      )
      .bind(...params)
      .all();

    return results;
  } catch {
    return safeAll(
      db,
      `SELECT
        r.id,
        r.nama,
        r.deskripsi,
        COUNT(sr.id) AS saved_count
       FROM saved_recipes sr
       JOIN resep r ON r.id = sr.resep_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY saved_count DESC, r.nama ASC
       LIMIT ?`,
      params
    );
  }
}

async function getMostCookedRecipes(db, limit, since) {
  const whereClause = since ? "WHERE cr.cooked_at >= ?" : "";
  const params = since ? [since, limit] : [limit];

  try {
    const { results } = await db
      .prepare(
        `SELECT
        r.id,
        r.nama,
        r.deskripsi,
        r.category,
        r.region,
        r.duration_minutes,
        r.difficulty,
        COUNT(cr.id) AS cooked_count,
        COALESCE(SUM(cr.points_awarded), 0) AS total_points
       FROM cooked_recipes cr
       JOIN resep r ON r.id = cr.resep_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY cooked_count DESC, total_points DESC, r.nama ASC
       LIMIT ?`
      )
      .bind(...params)
      .all();

    return results;
  } catch {
    return safeAll(
      db,
      `SELECT
        r.id,
        r.nama,
        r.deskripsi,
        COUNT(cr.id) AS cooked_count,
        COALESCE(SUM(cr.points_awarded), 0) AS total_points
       FROM cooked_recipes cr
       JOIN resep r ON r.id = cr.resep_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY cooked_count DESC, total_points DESC, r.nama ASC
       LIMIT ?`,
      params
    );
  }
}

export async function GET(request) {
  const limit = readLimit(request);
  const { period, since } = readPeriod(request);
  const { env } = getRequestContext();
  const db = env.DB;

  const [users, savedRecipes, cookedRecipes] = await Promise.all([
    getTopUsers(db, limit, since),
    getMostSavedRecipes(db, limit, since),
    getMostCookedRecipes(db, limit, since),
  ]);

  return NextResponse.json({
    data: {
      users,
      saved_recipes: savedRecipes,
      cooked_recipes: cookedRecipes,
    },
    meta: {
      limit,
      period,
      since,
      generated_at: Date.now(),
    },
  });
}
