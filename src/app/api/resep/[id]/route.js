// /api/resep/[id]/route.js

import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET(request, { params }) {
  const { env } = getRequestContext()
  const db = env.DB

  const id = parseInt(params.id)

  if (isNaN(id)) {
    return Response.json(
      { error: "ID tidak valid" },
      { status: 400 }
    )
  }

  try {
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

      db.prepare(`
        SELECT nama, kategori
        FROM bahan
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),

      db.prepare(`
        SELECT nama, jenis
        FROM bumbu
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),

      db.prepare(`
        SELECT nama, jenis
        FROM sambal
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),

      db.prepare(`
        SELECT nama, jenis
        FROM komponen
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),

      db.prepare(`
        SELECT nama
        FROM lalapan
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),

      db.prepare(`
        SELECT no, instruksi
        FROM langkah
        WHERE resep_id = ?
        ORDER BY no
      `).bind(id),

      db.prepare(`
        SELECT isi
        FROM tips
        WHERE resep_id = ?
        ORDER BY urutan
      `).bind(id),
    ])

    const resep = resepResult.results[0]

    if (!resep) {
      return Response.json(
        { error: "Resep tidak ditemukan" },
        { status: 404 }
      )
    }

    return Response.json({
      data: {
        ...resep,
        bahan: bahanResult.results,
        bumbu: bumbuResult.results,
        sambal: sambalResult.results,
        komponen: komponenResult.results,
        lalapan: lalapanResult.results.map((r) => r.nama),
        langkah: langkahResult.results,
        tips: tipsResult.results.map((r) => r.isi),
      },
    })
  } catch (e) {
    return Response.json(
      { error: e.message },
      { status: 500 }
    )
  }
}