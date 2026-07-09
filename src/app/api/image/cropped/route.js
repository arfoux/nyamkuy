import { legacyFoodSlug, slugifyFoodName } from "@/lib/foodSlug"

export const runtime = "edge"

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"]

async function fetchFirstAvailable(slug, folder) {
  for (const ext of EXTENSIONS) {
    const url = `https://cdn.jsdelivr.net/gh/arfoux/nyamkuy@main/public/images/${folder}/${slug}.${ext}`

    try {
      const res = await fetch(url)
      if (res.ok) return res
    } catch {
      // try next extension
    }
  }

  return null
}

async function fetchFoodImage(name, folder) {
  const slugs = Array.from(
    new Set([slugifyFoodName(name), legacyFoodSlug(name)].filter(Boolean))
  )

  for (const slug of slugs) {
    const res = await fetchFirstAvailable(slug, folder)
    if (res) return res
  }

  return null
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nama = searchParams.get("nama")

  if (!nama) {
    return new Response("Missing 'nama' param", { status: 400 })
  }

  const res = await fetchFoodImage(nama, "cropped")

  if (!res) {
    return new Response("Image not found", { status: 404 })
  }

  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream"
  const blob = await res.arrayBuffer()

  return new Response(blob, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  })
}
