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

export async function GET(request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { env } = getRequestContext()
  const db = env.DB

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = 20
  const offset = (page - 1) * limit

  let totalQuery = "SELECT COUNT(*) as total FROM resep"
  let selectQuery = "SELECT id, nama, deskripsi, created_at, difficulty, duration_minutes, servings, region, category FROM resep"
  let params = []

  if (q) {
    totalQuery += " WHERE nama LIKE ?"
    selectQuery += " WHERE nama LIKE ?"
    params.push(`%${q}%`)
  }

  selectQuery += " ORDER BY id DESC LIMIT ? OFFSET ?"
  const selectParams = [...params, limit, offset]

  const totalRes = await db.prepare(totalQuery).bind(...params).first()
  const total = totalRes?.total || 0

  const { results } = await db.prepare(selectQuery).bind(...selectParams).all()

  return Response.json({
    data: results,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    }
  })
}

export async function POST(request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { env } = getRequestContext()
  const db = env.DB

  let body
  try {
    body = await readBody(request)
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    )
  }

  const nama = String(sourceValue(body, "nama") || "").trim()
  const deskripsi = String(sourceValue(body, "deskripsi") || "").trim()
  const category = String(sourceValue(body, "category") || "").trim()
  const region = String(sourceValue(body, "region") || "").trim()
  const difficulty = String(sourceValue(body, "difficulty") || "Mudah").trim()
  const duration_minutes = parseInt(sourceValue(body, "duration_minutes"), 10) || null
  const servings = parseInt(sourceValue(body, "servings"), 10) || null
  const cook_points = parseInt(sourceValue(body, "cook_points"), 10) || 10

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

  const now = Date.now()
  const insertResult = await insertIntoExistingColumns(db, "resep", {
    nama,
    deskripsi,
    created_at: now,
    cook_points: cook_points,
    poin: cook_points,
    slug: slugifyFoodName(nama),
    difficulty,
    duration_minutes,
    servings,
    region,
    category,
  })

  const recipeId =
    insertResult?.meta?.last_row_id ||
    insertResult?.meta?.lastRowId ||
    (await db.prepare("SELECT id FROM resep WHERE nama = ? ORDER BY id DESC LIMIT 1").bind(nama).first())?.id

  if (!recipeId) {
    return NextResponse.json(
      { error: "Resep berhasil dibuat, tapi ID tidak terbaca." },
      { status: 500 }
    )
  }

  const bahan = splitRecipeLines(sourceValue(body, "bahan_text"))
  const bumbu = splitRecipeLines(sourceValue(body, "bumbu_text"))
  const sambal = splitRecipeLines(sourceValue(body, "sambal_text"))
  const komponen = splitRecipeLines(sourceValue(body, "komponen_text"))
  const lalapan = splitRecipeLines(sourceValue(body, "lalapan_text"))
  const langkah = splitRecipeLines(sourceValue(body, "langkah_text"))
  const tips = splitRecipeLines(sourceValue(body, "tips_text"))

  await insertNamedLines(db, "bahan", recipeId, bahan, { kategori: "utama" })
  await insertNamedLines(db, "bumbu", recipeId, bumbu, { jenis: "bumbu" })
  await insertNamedLines(db, "sambal", recipeId, sambal, { jenis: "pelengkap" })
  await insertNamedLines(db, "komponen", recipeId, komponen, { jenis: "komponen" })
  await insertNamedLines(db, "lalapan", recipeId, lalapan)

  for (const [index, line] of langkah.entries()) {
    await insertIntoExistingColumns(db, "langkah", {
      resep_id: recipeId,
      no: index + 1,
      instruksi: line,
    })
  }

  for (const [index, line] of tips.entries()) {
    await insertIntoExistingColumns(db, "tips", {
      resep_id: recipeId,
      isi: line,
      urutan: index + 1,
    })
  }

  return NextResponse.json({ ok: true, id: recipeId })
}
