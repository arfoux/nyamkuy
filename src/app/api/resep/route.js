import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"

export const runtime = "edge"

async function getRecipes(db, limit, offset) {
  try {
    const { results } = await db
      .prepare(`
        SELECT id, nama, deskripsi, created_at, cook_points
        FROM resep
        ORDER BY id
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all()

    return results
  } catch {
    try {
      const { results } = await db
        .prepare(`
          SELECT id, nama, deskripsi, created_at, poin AS cook_points
          FROM resep
          ORDER BY id
          LIMIT ? OFFSET ?
        `)
        .bind(limit, offset)
        .all()

      return results
    } catch {
      const { results } = await db
        .prepare(`
          SELECT id, nama, deskripsi, created_at
          FROM resep
          ORDER BY id
          LIMIT ? OFFSET ?
        `)
        .bind(limit, offset)
        .all()

      return results.map((recipe) => ({
        ...recipe,
        cook_points: 10,
      }))
    }
  }
}

async function withSavedStatus(db, recipes, userId) {
  const baseRecipes = recipes.map((recipe) => ({
    ...recipe,
    cook_points: Number.isFinite(Number(recipe.cook_points))
      ? Number(recipe.cook_points)
      : 10,
    is_saved: false,
  }))

  if (!userId || baseRecipes.length === 0) {
    return baseRecipes
  }

  try {
    const ids = baseRecipes.map((recipe) => recipe.id)
    const placeholders = ids.map(() => "?").join(", ")

    const { results } = await db
      .prepare(`
        SELECT resep_id
        FROM saved_recipes
        WHERE user_id = ?
          AND resep_id IN (${placeholders})
      `)
      .bind(userId, ...ids)
      .all()

    const savedIds = new Set(results.map((row) => row.resep_id))

    return baseRecipes.map((recipe) => ({
      ...recipe,
      is_saved: savedIds.has(recipe.id),
    }))
  } catch {
    return baseRecipes
  }
}

export async function GET(request) {
  try {
    const { env } = getRequestContext()
    const db = env.DB
    const session = await getSession()

    const { searchParams } = new URL(request.url)

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1")
    )

    const limit = 20
    const offset = (page - 1) * limit

    const [{ total }] = (
      await db
        .prepare("SELECT COUNT(*) as total FROM resep")
        .all()
    ).results

    const recipes = await getRecipes(db, limit, offset)
    const results = await withSavedStatus(db, recipes, session?.userId)

    return Response.json({
      data: results,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    })

  } catch (e) {

    // 🔥 fallback production API
    const { searchParams } = new URL(request.url)

    const page = searchParams.get("page") || "1"

    const res = await fetch(
      `https://nyamkuy.app/api/resep?page=${page}`
    )

    const data = await res.json()

    return Response.json(data)
  }
}
