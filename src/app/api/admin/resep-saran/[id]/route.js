import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"
import { uploadSuggestionImage, GithubImageError } from "@/lib/githubRecipeImages"
import {
  getSuggestionById,
  normalizeSuggestionInput,
  updateSuggestion,
  validateSuggestion,
} from "@/lib/recipeSuggestions"

export const runtime = "edge"

const EDITABLE_STATUSES = ["pending", "rejected"]

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

export async function PATCH(request, { params }) {
  const { response, session } = await requireAdmin()
  if (response) return response

  const resolvedParams = await params
  const { env } = getRequestContext()
  const existing = await getSuggestionById(env.DB, resolvedParams.id)

  if (!existing) {
    return NextResponse.json(
      { error: "Saran resep tidak ditemukan." },
      { status: 404 }
    )
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

  const input = normalizeSuggestionInput(body, existing)
  const statusValue = String(sourceValue(body, "status") || existing.status)
  const nextStatus = EDITABLE_STATUSES.includes(statusValue)
    ? statusValue
    : existing.status
  const error = validateSuggestion(input)

  if (error && nextStatus !== "rejected") {
    return NextResponse.json({ error }, { status: 400 })
  }

  const now = Date.now()
  const changes = {
    ...input,
    status: nextStatus,
    updated_at: now,
    reviewed_by: nextStatus === "rejected" ? session.userId : existing.reviewed_by,
  }
  const imageFile = getImageFile(body)

  if (imageFile) {
    try {
      const image = await uploadSuggestionImage(
        env,
        imageFile,
        `${existing.id}-review`
      )

      changes.image_path = image.path
      changes.image_url = image.url
      changes.image_sha = image.sha
      changes.image_content_type = image.contentType
    } catch (err) {
      if (err instanceof GithubImageError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status || 500 }
        )
      }

      return NextResponse.json(
        { error: "Upload gambar admin belum berhasil." },
        { status: 500 }
      )
    }
  }

  await updateSuggestion(env.DB, existing.id, changes)

  const updated = await getSuggestionById(env.DB, existing.id)

  return NextResponse.json({
    ok: true,
    data: updated,
  })
}
