import { slugifyFoodName } from "./foodSlug"

const TEXT_LIMITS = {
  nama: 90,
  deskripsi: 500,
  category: 40,
  region: 40,
  difficulty: 24,
  bahan_text: 1800,
  bumbu_text: 1400,
  sambal_text: 900,
  komponen_text: 1200,
  lalapan_text: 900,
  langkah_text: 3000,
  tips_text: 1400,
  admin_note: 700,
}

const SUGGESTION_FIELDS = [
  "nama",
  "deskripsi",
  "category",
  "region",
  "difficulty",
  "duration_minutes",
  "servings",
  "cook_points",
  "bahan_text",
  "bumbu_text",
  "sambal_text",
  "komponen_text",
  "lalapan_text",
  "langkah_text",
  "tips_text",
  "admin_note",
  "status",
  "image_path",
  "image_url",
  "image_sha",
  "image_content_type",
  "updated_at",
  "reviewed_by",
  "approved_at",
]

export async function ensureRecipeSuggestionsTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS recipe_suggestions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        nama TEXT NOT NULL,
        deskripsi TEXT NOT NULL,
        category TEXT,
        region TEXT,
        difficulty TEXT,
        duration_minutes INTEGER,
        servings INTEGER,
        cook_points INTEGER,
        bahan_text TEXT,
        bumbu_text TEXT,
        sambal_text TEXT,
        komponen_text TEXT,
        lalapan_text TEXT,
        langkah_text TEXT,
        tips_text TEXT,
        image_path TEXT,
        image_url TEXT,
        image_sha TEXT,
        image_content_type TEXT,
        admin_note TEXT,
        reviewed_by TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        approved_at INTEGER
      )`
    )
    .run()

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_recipe_suggestions_user
       ON recipe_suggestions (user_id, created_at DESC)`
    )
    .run()

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_recipe_suggestions_status
       ON recipe_suggestions (status, created_at DESC)`
    )
    .run()
}

function trimText(value, key) {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()

  return normalized.slice(0, TEXT_LIMITS[key] || 1000)
}

function normalizeNumber(value, min, max, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback

  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number)) return fallback

  return Math.max(min, Math.min(max, number))
}

function sourceValue(source, key, fallback = "") {
  if (source?.get) {
    const value = source.get(key)
    return value === null || value === undefined ? fallback : value
  }

  return source?.[key] === undefined ? fallback : source[key]
}

export function normalizeSuggestionInput(source, fallback = {}) {
  return {
    nama: trimText(sourceValue(source, "nama", fallback.nama), "nama"),
    deskripsi: trimText(
      sourceValue(source, "deskripsi", fallback.deskripsi),
      "deskripsi"
    ),
    category: trimText(
      sourceValue(source, "category", fallback.category),
      "category"
    ),
    region: trimText(sourceValue(source, "region", fallback.region), "region"),
    difficulty: trimText(
      sourceValue(source, "difficulty", fallback.difficulty),
      "difficulty"
    ),
    duration_minutes: normalizeNumber(
      sourceValue(source, "duration_minutes", fallback.duration_minutes),
      1,
      1440,
      null
    ),
    servings: normalizeNumber(
      sourceValue(source, "servings", fallback.servings),
      1,
      99,
      null
    ),
    cook_points: normalizeNumber(
      sourceValue(source, "cook_points", fallback.cook_points ?? 10),
      1,
      9999,
      10
    ),
    bahan_text: trimText(
      sourceValue(source, "bahan_text", fallback.bahan_text),
      "bahan_text"
    ),
    bumbu_text: trimText(
      sourceValue(source, "bumbu_text", fallback.bumbu_text),
      "bumbu_text"
    ),
    sambal_text: trimText(
      sourceValue(source, "sambal_text", fallback.sambal_text),
      "sambal_text"
    ),
    komponen_text: trimText(
      sourceValue(source, "komponen_text", fallback.komponen_text),
      "komponen_text"
    ),
    lalapan_text: trimText(
      sourceValue(source, "lalapan_text", fallback.lalapan_text),
      "lalapan_text"
    ),
    langkah_text: trimText(
      sourceValue(source, "langkah_text", fallback.langkah_text),
      "langkah_text"
    ),
    tips_text: trimText(
      sourceValue(source, "tips_text", fallback.tips_text),
      "tips_text"
    ),
    admin_note: trimText(
      sourceValue(source, "admin_note", fallback.admin_note),
      "admin_note"
    ),
  }
}

export function validateSuggestion(input) {
  if (input.nama.length < 3) {
    return "Judul resep minimal 3 karakter."
  }

  if (input.deskripsi.length < 12) {
    return "Deskripsi resep minimal 12 karakter."
  }

  if (input.bahan_text.length < 3) {
    return "Bahan utama wajib diisi."
  }

  if (input.langkah_text.length < 10) {
    return "Cara membuat wajib diisi."
  }

  return null
}

function bindNull(value) {
  return value === undefined ? null : value
}

export async function createSuggestion(db, row) {
  await ensureRecipeSuggestionsTable(db)

  await db
    .prepare(
      `INSERT INTO recipe_suggestions (
        id,
        user_id,
        user_email,
        status,
        nama,
        deskripsi,
        category,
        region,
        difficulty,
        duration_minutes,
        servings,
        cook_points,
        bahan_text,
        bumbu_text,
        sambal_text,
        komponen_text,
        lalapan_text,
        langkah_text,
        tips_text,
        image_path,
        image_url,
        image_sha,
        image_content_type,
        admin_note,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      row.id,
      row.user_id,
      row.user_email,
      row.status || "pending",
      row.nama,
      row.deskripsi,
      bindNull(row.category),
      bindNull(row.region),
      bindNull(row.difficulty),
      bindNull(row.duration_minutes),
      bindNull(row.servings),
      bindNull(row.cook_points),
      bindNull(row.bahan_text),
      bindNull(row.bumbu_text),
      bindNull(row.sambal_text),
      bindNull(row.komponen_text),
      bindNull(row.lalapan_text),
      bindNull(row.langkah_text),
      bindNull(row.tips_text),
      bindNull(row.image_path),
      bindNull(row.image_url),
      bindNull(row.image_sha),
      bindNull(row.image_content_type),
      bindNull(row.admin_note),
      row.created_at,
      row.updated_at
    )
    .run()
}

export async function listUserSuggestions(db, userId) {
  await ensureRecipeSuggestionsTable(db)

  const { results } = await db
    .prepare(
      `SELECT *
       FROM recipe_suggestions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`
    )
    .bind(userId)
    .all()

  return results
}

export async function listAdminSuggestions(db, status = "pending") {
  await ensureRecipeSuggestionsTable(db)

  if (status === "all") {
    const { results } = await db
      .prepare(
        `SELECT *
         FROM recipe_suggestions
         ORDER BY created_at DESC
         LIMIT 80`
      )
      .all()

    return results
  }

  const { results } = await db
    .prepare(
      `SELECT *
       FROM recipe_suggestions
       WHERE status = ?
       ORDER BY created_at DESC
       LIMIT 80`
    )
    .bind(status)
    .all()

  return results
}

export async function getSuggestionById(db, id) {
  await ensureRecipeSuggestionsTable(db)

  return db
    .prepare(
      `SELECT *
       FROM recipe_suggestions
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first()
}

export async function updateSuggestion(db, id, changes) {
  await ensureRecipeSuggestionsTable(db)

  const entries = Object.entries(changes).filter(
    ([key, value]) => SUGGESTION_FIELDS.includes(key) && value !== undefined
  )

  if (entries.length === 0) return

  const setClause = entries.map(([key]) => `${key} = ?`).join(", ")
  const values = entries.map(([, value]) => bindNull(value))

  await db
    .prepare(
      `UPDATE recipe_suggestions
       SET ${setClause}
       WHERE id = ?`
    )
    .bind(...values, id)
    .run()
}

export function splitRecipeLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim().replace(/^\d+[\).:-]\s*/, ""))
    .filter(Boolean)
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

async function readLastInsertedRecipeId(db, recipeName) {
  try {
    const row = await db
      .prepare(
        `SELECT id
         FROM resep
         WHERE nama = ?
         ORDER BY id DESC
         LIMIT 1`
      )
      .bind(recipeName)
      .first()

    return row?.id || null
  } catch {
    return null
  }
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

export async function approveSuggestionToRecipe(db, suggestion, adminId) {
  const now = Date.now()
  const points = normalizeNumber(suggestion.cook_points, 1, 9999, 10)
  const insertResult = await insertIntoExistingColumns(db, "resep", {
    nama: suggestion.nama,
    deskripsi: suggestion.deskripsi,
    created_at: now,
    cook_points: points,
    poin: points,
    slug: slugifyFoodName(suggestion.nama),
    difficulty: suggestion.difficulty,
    duration_minutes: suggestion.duration_minutes,
    servings: suggestion.servings,
    region: suggestion.region,
    category: suggestion.category,
  })

  const recipeId =
    insertResult?.meta?.last_row_id ||
    insertResult?.meta?.lastRowId ||
    (await readLastInsertedRecipeId(db, suggestion.nama))

  if (!recipeId) {
    throw new Error("Resep berhasil dibuat, tapi ID resep tidak terbaca.")
  }

  const bahan = splitRecipeLines(suggestion.bahan_text)
  const bumbu = splitRecipeLines(suggestion.bumbu_text)
  const sambal = splitRecipeLines(suggestion.sambal_text)
  const komponen = splitRecipeLines(suggestion.komponen_text)
  const lalapan = splitRecipeLines(suggestion.lalapan_text)
  const langkah = splitRecipeLines(suggestion.langkah_text)
  const tips = splitRecipeLines(suggestion.tips_text)

  await insertNamedLines(db, "bahan", recipeId, bahan, { kategori: "utama" })
  await insertNamedLines(db, "bumbu", recipeId, bumbu, { jenis: "bumbu" })
  await insertNamedLines(db, "sambal", recipeId, sambal, {
    jenis: "pelengkap",
  })
  await insertNamedLines(db, "komponen", recipeId, komponen, {
    jenis: "komponen",
  })
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

  await updateSuggestion(db, suggestion.id, {
    status: "approved",
    reviewed_by: adminId,
    approved_at: now,
    updated_at: now,
  })

  return recipeId
}
