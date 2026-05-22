// /api/resep/[id]/route.js
// GET /api/resep/1 → detail resep + bahan, bumbu, sambal, komponen, lalapan, langkah, tips

import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"

export const runtime = "edge"

export async function GET(_request, { params }) {
  void _request

  const { env } = getRequestContext()
  const db = env.DB
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)
  const session = await getSession()

  if (isNaN(id)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 })
  }

  try {
    // Ambil semua data sekaligus pakai batch — lebih efisien dari query satu-satu
    const [
      resepResult,
      bahanResult,
      bumbuResult,
      sambalResult,
      komponenResult,
      lalapanResult,
      langkahResult,
      tipsResult,
    ] = await db.batch([
      db.prepare("SELECT * FROM resep WHERE id = ?").bind(id),
      db.prepare("SELECT nama, kategori FROM bahan WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama, jenis FROM bumbu WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama, jenis FROM sambal WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama, jenis FROM komponen WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama FROM lalapan WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT no, instruksi FROM langkah WHERE resep_id = ? ORDER BY no").bind(id),
      db.prepare("SELECT isi FROM tips WHERE resep_id = ? ORDER BY urutan").bind(id),
    ])

    const resep = resepResult.results[0]
    if (!resep) {
      return Response.json({ error: "Resep tidak ditemukan" }, { status: 404 })
    }

    let isSaved = false

    if (session?.userId) {
      try {
        const saved = await db
          .prepare(
            "SELECT 1 FROM saved_recipes WHERE user_id = ? AND resep_id = ? LIMIT 1"
          )
          .bind(session.userId, id)
          .first()

        isSaved = Boolean(saved)
      } catch {
        isSaved = false
      }
    }

    return Response.json({
      data: {
        ...resep,
        is_saved: isSaved,
        bahan:    bahanResult.results,
        bumbu:    bumbuResult.results,
        sambal:   sambalResult.results,
        komponen: komponenResult.results,
        lalapan:  lalapanResult.results.map(r => r.nama),
        langkah:  langkahResult.results,
        tips:     tipsResult.results.map(r => r.isi),
      },
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
