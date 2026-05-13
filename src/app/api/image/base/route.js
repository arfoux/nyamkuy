import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

function slugifyFoodName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
}

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"]

async function fetchFirstAvailable(slug) {
  for (const ext of EXTENSIONS) {
    const primaryUrl = `https://cdn.jsdelivr.net/gh/arfoux/smtdua-frontend@main/public/images/receipt/${slug}.${ext}`

    try {
      const res = await fetch(primaryUrl)
      if (res.ok) return res
    } catch {
      // try next extension
    }
  }

  // Fallback ke raw GitHub jika semua CDN gagal
  for (const ext of EXTENSIONS) {
    const fallbackUrl = `https://raw.githubusercontent.com/arfoux/smtdua-frontend/main/public/images/receipt/${slug}.${ext}`

    try {
      const res = await fetch(fallbackUrl)
      if (res.ok) return res
    } catch {
      // try next extension
    }
  }

  return null
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nama = searchParams.get("nama")

  if (!nama) {
    return new Response("Missing 'nama' param", { status: 400 })
  }

  const slug = slugifyFoodName(nama)
  const res = await fetchFirstAvailable(slug)

  if (!res) {
    return new Response("Image not found", { status: 404 })
  }

  // Deteksi Content-Type dari response asli, fallback ke octet-stream
  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream"
  const blob = await res.arrayBuffer()

  return new Response(blob, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  })
}