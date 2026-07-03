import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSession } from "@/lib/session"
import { listAdminSuggestions } from "@/lib/recipeSuggestions"

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

export async function GET(request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"
  const allowed = ["pending", "approved", "rejected", "all"]
  const safeStatus = allowed.includes(status) ? status : "pending"
  const { env } = getRequestContext()
  const suggestions = await listAdminSuggestions(env.DB, safeStatus)

  return NextResponse.json({ data: suggestions })
}
