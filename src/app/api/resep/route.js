// /api/resep/route.js
// GET /api/resep          → semua resep (tanpa detail child)
// GET /api/resep?page=2   → pagination, 20 per halaman

import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET(request) {
  const { env } = getRequestContext()
  const db = env.DB

  const { searchParams } = new URL(request.url)
  const page  = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = 20
  const offset = (page - 1) * limit

  try {
    const [{ total }] = (await db
      .prepare("SELECT COUNT(*) as total FROM resep")
      .all()).results

    const { results } = await db
      .prepare("SELECT id, nama, deskripsi, created_at FROM resep ORDER BY id LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all()

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
    return Response.json({ error: e.message }, { status: 500 })
  }
}