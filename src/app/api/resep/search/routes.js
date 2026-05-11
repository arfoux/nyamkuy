// /api/resep/search/route.js
// GET /api/resep/search?q=ayam        → cari resep by nama
// GET /api/resep/search?q=ayam&page=2 → dengan pagination

export const runtime = "edge"

export async function GET(request, { env }) {
  const db = env.DB

  const { searchParams } = new URL(request.url)
  const q     = searchParams.get("q")?.trim() || ""
  const page  = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = 20
  const offset = (page - 1) * limit

  if (!q) {
    return Response.json({ error: "Query ?q= tidak boleh kosong" }, { status: 400 })
  }

  const pattern = `%${q}%`

  try {
    const [{ total }] = (await db
      .prepare("SELECT COUNT(*) as total FROM resep WHERE nama LIKE ?")
      .bind(pattern)
      .all()).results

    const { results } = await db
      .prepare(`
        SELECT id, nama, deskripsi
        FROM resep
        WHERE nama LIKE ?
        ORDER BY nama
        LIMIT ? OFFSET ?
      `)
      .bind(pattern, limit, offset)
      .all()

    return Response.json({
      data: results,
      meta: { q, total, page, limit, total_pages: Math.ceil(total / limit) },
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
