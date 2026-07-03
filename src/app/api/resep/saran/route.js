import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"
import { uploadSuggestionImage, GithubImageError } from "@/lib/githubRecipeImages"
import {
  createSuggestion,
  listUserSuggestions,
  normalizeSuggestionInput,
  validateSuggestion,
} from "@/lib/recipeSuggestions"

export const runtime = "edge"

async function requireSession() {
  const session = await getSession()

  if (!session?.userId) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  return { session }
}

function getImageFile(formData) {
  const file = formData.get("image")

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return null
  }

  return file
}

export async function GET() {
  const { response, session } = await requireSession()
  if (response) return response

  const { env } = getRequestContext()
  const suggestions = await listUserSuggestions(env.DB, session.userId)

  return NextResponse.json({ data: suggestions })
}

export async function POST(request) {
  const { response, session } = await requireSession()
  if (response) return response

  let formData

  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Form saran resep tidak valid." },
      { status: 400 }
    )
  }

  const input = normalizeSuggestionInput(formData)
  const error = validateSuggestion(input)

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const imageFile = getImageFile(formData)

  if (!imageFile) {
    return NextResponse.json(
      { error: "Gambar resep wajib diunggah." },
      { status: 400 }
    )
  }

  const { env } = getRequestContext()
  const id = crypto.randomUUID()
  let image

  try {
    image = await uploadSuggestionImage(env, imageFile, id)
  } catch (err) {
    if (err instanceof GithubImageError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "Upload gambar belum berhasil." },
      { status: 500 }
    )
  }

  const now = Date.now()

  await createSuggestion(env.DB, {
    id,
    user_id: session.userId,
    user_email: session.email,
    status: "pending",
    ...input,
    image_path: image.path,
    image_url: image.url,
    image_sha: image.sha,
    image_content_type: image.contentType,
    created_at: now,
    updated_at: now,
  })

  const suggestion = await env.DB
    .prepare(
      `SELECT *
       FROM recipe_suggestions
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first()

  return NextResponse.json(
    {
      ok: true,
      data: suggestion,
    },
    { status: 201 }
  )
}
