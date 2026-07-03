import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"
import { publishRecipeImage, GithubImageError } from "@/lib/githubRecipeImages"
import {
  approveSuggestionToRecipe,
  getSuggestionById,
  validateSuggestion,
} from "@/lib/recipeSuggestions"

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

export async function POST(_request, { params }) {
  void _request

  const { response, session } = await requireAdmin()
  if (response) return response

  const resolvedParams = await params
  const { env } = getRequestContext()
  const suggestion = await getSuggestionById(env.DB, resolvedParams.id)

  if (!suggestion) {
    return NextResponse.json(
      { error: "Saran resep tidak ditemukan." },
      { status: 404 }
    )
  }

  if (suggestion.status === "approved") {
    return NextResponse.json(
      { error: "Saran resep ini sudah di-approve." },
      { status: 409 }
    )
  }

  const error = validateSuggestion(suggestion)

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  if (!suggestion.image_path) {
    return NextResponse.json(
      { error: "Saran resep belum punya gambar." },
      { status: 400 }
    )
  }

  try {
    await publishRecipeImage(env, suggestion, suggestion.nama)
  } catch (err) {
    if (err instanceof GithubImageError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "Publish gambar ke GitHub belum berhasil." },
      { status: 500 }
    )
  }

  const recipeId = await approveSuggestionToRecipe(
    env.DB,
    suggestion,
    session.userId
  )

  return NextResponse.json({
    ok: true,
    recipe_id: recipeId,
  })
}
