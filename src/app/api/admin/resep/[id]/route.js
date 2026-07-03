import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"
import { uploadRecipeImageDirect } from "@/lib/githubRecipeImages"
import { slugifyFoodName } from "@/lib/foodSlug"
import { splitRecipeLines } from "@/lib/recipeSuggestions"

export const runtime = "edge"

async function requireAdmin() {
  const session = await getSession()

  if (!session?.userId) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  if (session.role !== "admin") {
    return {
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    }
  }

  return { session }
}

function bindNull(value) {
  return value === undefined || value === "" ? null : value
}

async function getColumnSet(db, tableName) {
  try {
    const { results } = await db.prepare(`PRAGMA table_info(${tableName})`).all()
    return new Set(results.map((row) => row.name))
  } catch {
    return new Set()
  }
}

async function insertIntoExistingColumns(db, tableName, row) {
  const columns = await getColumnSet(db, tableName)
  if (columns.size === 0) return null

  const entries = Object.entries(row).filter(([key]) => columns.has(key))
  if (entries.length === 0) return null

  const names = entries.map(([key]) => key)
  const placeholders = names.map(() => "?").join(", ")
  const values = entries.map(([, value]) => bindNull(value))

  return db
    .prepare(
      `INSERT INTO ${tableName} (${names.join(", ")})
       VALUES (${placeholders})`
    )
    .bind(...values)
    .run()
}

async function insertNamedLines(db, tableName, recipeId, lines, extra = {}) {
  for (const [index, line] of lines.entries()) {
    await insertIntoExistingColumns(db, tableName, {
      resep_id: recipeId,
      nama: line,
      urutan: index + 1,
      ...extra,
    })
  }
}

async function updateRecipeColumns(db, id, row) {
  const columns = await getColumnSet(db, "resep")
  if (columns.size === 0) return

  const entries = Object.entries(row).filter(([key]) => columns.has(key))
  if (entries.length === 0) return

  const setClause = entries.map(([key]) => `${key} = ?`).join(", ")
  const values = entries.map(([, value]) => bindNull(value))

  await db
    .prepare(
      `UPDATE resep
       SET ${setClause}
       WHERE id = ?`
    )
    .bind(...values, id)
    .run()
}

function sourceValue(source, key) {
  if (source?.get) {
    return source.get(key)
  }
  return source?.[key]
}

function getImageFile(source) {
  const file = source?.get ? source.get("image") : null

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return null
  }

  return file
}

async function readBody(request) {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    return request.formData()
  }

  return request.json()
}

export async function GET(_request, { params }) {
  const { response } = await requireAdmin()
  if (response) return response

  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
  }

  const { env } = getRequestContext()
  const db = env.DB

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
      db.prepare("SELECT nama FROM bahan WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama FROM bumbu WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama FROM sambal WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama FROM komponen WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT nama FROM lalapan WHERE resep_id = ? ORDER BY urutan").bind(id),
      db.prepare("SELECT instruksi FROM langkah WHERE resep_id = ? ORDER BY no").bind(id),
      db.prepare("SELECT isi FROM tips WHERE resep_id = ? ORDER BY urutan").bind(id),
    ])

    const resep = resepResult.results[0]
    if (!resep) {
      return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 })
    }

    const data = {
      ...resep,
      cook_points: resep.cook_points ?? resep.poin ?? 10,
      bahan_text: bahanResult.results.map((r) => r.nama).join("\n"),
      bumbu_text: bumbuResult.results.map((r) => r.nama).join("\n"),
      sambal_text: sambalResult.results.map((r) => r.nama).join("\n"),
      komponen_text: komponenResult.results.map((r) => r.nama).join("\n"),
      lalapan_text: lalapanResult.results.map((r) => r.nama).join("\n"),
      langkah_text: langkahResult.results.map((r) => r.instruksi).join("\n"),
      tips_text: tipsResult.results.map((r) => r.isi).join("\n"),
    }

    return Response.json({ data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const { response } = await requireAdmin()
  if (response) return response

  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
  }

  const { env } = getRequestContext()
  const db = env.DB

  const existing = await db.prepare("SELECT * FROM resep WHERE id = ?").bind(id).first()
  if (!existing) {
    return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 })
  }

  let body
  try {
    body = await readBody(request)
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    )
  }

  const nama = String(sourceValue(body, "nama") || existing.nama).trim()
  const deskripsi = String(sourceValue(body, "deskripsi") || existing.deskripsi).trim()
  const category = String(sourceValue(body, "category") || existing.category || "").trim()
  const region = String(sourceValue(body, "region") || existing.region || "").trim()
  const difficulty = String(sourceValue(body, "difficulty") || existing.difficulty || "Mudah").trim()
  const duration_minutes = sourceValue(body, "duration_minutes") !== undefined
    ? parseInt(sourceValue(body, "duration_minutes"), 10) || null
    : existing.duration_minutes
  const servings = sourceValue(body, "servings") !== undefined
    ? parseInt(sourceValue(body, "servings"), 10) || null
    : existing.servings
  const cook_points = sourceValue(body, "cook_points") !== undefined
    ? parseInt(sourceValue(body, "cook_points"), 10) || 10
    : (existing.cook_points ?? existing.poin ?? 10)

  if (nama.length < 3) {
    return NextResponse.json(
      { error: "Judul resep minimal 3 karakter." },
      { status: 400 }
    )
  }

  if (deskripsi.length < 12) {
    return NextResponse.json(
      { error: "Deskripsi resep minimal 12 karakter." },
      { status: 400 }
    )
  }

  const imageFile = getImageFile(body)
  if (imageFile) {
    try {
      await uploadRecipeImageDirect(env, imageFile, nama)
    } catch (err) {
      return NextResponse.json(
        { error: err.message || "Gagal mengunggah gambar ke GitHub." },
        { status: 500 }
      )
    }
  }

  // Update resep table
  await updateRecipeColumns(db, id, {
    nama,
    deskripsi,
    cook_points: cook_points,
    poin: cook_points,
    slug: slugifyFoodName(nama),
    difficulty,
    duration_minutes,
    servings,
    region,
    category,
  })

  // Delete all existing lines from sub-tables
  await db.batch([
    db.prepare("DELETE FROM bahan WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM bumbu WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM sambal WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM komponen WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM lalapan WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM langkah WHERE resep_id = ?").bind(id),
    db.prepare("DELETE FROM tips WHERE resep_id = ?").bind(id),
  ])

  // Insert sub-tables
  const bahan = splitRecipeLines(sourceValue(body, "bahan_text"))
  const bumbu = splitRecipeLines(sourceValue(body, "bumbu_text"))
  const sambal = splitRecipeLines(sourceValue(body, "sambal_text"))
  const komponen = splitRecipeLines(sourceValue(body, "komponen_text"))
  const lalapan = splitRecipeLines(sourceValue(body, "lalapan_text"))
  const langkah = splitRecipeLines(sourceValue(body, "langkah_text"))
  const tips = splitRecipeLines(sourceValue(body, "tips_text"))

  await insertNamedLines(db, "bahan", id, bahan, { kategori: "utama" })
  await insertNamedLines(db, "bumbu", id, bumbu, { jenis: "bumbu" })
  await insertNamedLines(db, "sambal", id, sambal, { jenis: "pelengkap" })
  await insertNamedLines(db, "komponen", id, komponen, { jenis: "komponen" })
  await insertNamedLines(db, "lalapan", id, lalapan)

  for (const [index, line] of langkah.entries()) {
    await insertIntoExistingColumns(db, "langkah", {
      resep_id: id,
      no: index + 1,
      instruksi: line,
    })
  }

  for (const [index, line] of tips.entries()) {
    await insertIntoExistingColumns(db, "tips", {
      resep_id: id,
      isi: line,
      urutan: index + 1,
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request, { params }) {
  const { response } = await requireAdmin()
  if (response) return response

  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
  }

  const { env } = getRequestContext()
  const db = env.DB

  const existing = await db.prepare("SELECT * FROM resep WHERE id = ?").bind(id).first()
  if (!existing) {
    return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 })
  }

  try {
    await db.batch([
      db.prepare("DELETE FROM resep WHERE id = ?").bind(id),
      db.prepare("DELETE FROM bahan WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM bumbu WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM sambal WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM komponen WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM lalapan WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM langkah WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM tips WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM saved_recipes WHERE resep_id = ?").bind(id),
      db.prepare("DELETE FROM cooked_recipes WHERE resep_id = ?").bind(id),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
