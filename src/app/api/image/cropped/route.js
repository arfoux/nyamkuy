import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

function slugifyFoodName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nama = searchParams.get("nama")

  if (!nama) {
    return new Response("Missing 'nama' param", { status: 400 })
  }

  const slug = slugifyFoodName(nama)

  const primaryUrl =
    `https://cdn.jsdelivr.net/gh/arfoux/smtdua-frontend@main/public/images/cropped/${slug}.png`

  const fallbackUrl =
    `https://raw.githubusercontent.com/arfoux/smtdua-frontend/main/public/images/cropped/${slug}.png`

  try {
    const res = await fetch(primaryUrl)

    if (res.ok) {
      const blob = await res.arrayBuffer()
      return new Response(blob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    throw new Error("Primary failed")

  } catch {
    const fallbackRes = await fetch(fallbackUrl)

    if (fallbackRes.ok) {
      const blob = await fallbackRes.arrayBuffer()
      return new Response(blob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    return new Response("Image not found", { status: 404 })
  }
}