import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET() {
  const { env } = getRequestContext()
  const db = env.DB

  const { results } = await db.prepare("SELECT * FROM tabel_kamu").all()
  return Response.json({ data: results })
}