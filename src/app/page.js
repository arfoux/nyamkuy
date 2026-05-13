"use client"

import SwipeCards from "@/components/SwipeCards"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

// handleCardClick
function handleCardClick(card) {
  const params = new URLSearchParams({
    id: card.id,           // ← tambah ini
    nama: card.title,
    deskripsi: card.description,
  })
  router.push(`/receipt?${params.toString()}`)
}

// openRecipe
function openRecipe(item) {
  const params = new URLSearchParams({
    id: item.id,           // ← tambah ini
    nama: item.nama || item.title,
    deskripsi: item.deskripsi || item.description || "",
  })
  router.push(`/receipt?${params.toString()}`)
}

  useEffect(() => {
    const keyword = search.trim()

    if (!keyword) {
      setResults([])
      setLoading(false)
      return
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `/api/resep/search?q=${encodeURIComponent(keyword)}`
        )

        const data = await res.json()

        const list = Array.isArray(data)
          ? data
          : data.data || data.results || data.resep || []

        setResults(list)
      } catch (err) {
        console.error(err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(delay)
  }, [search])

  return (
    <main className="relative flex h-[100dvh] items-center justify-center overflow-hidden touch-none">
      {/* BG BARU */}
      {bg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px)",
            transform: "scale(1.2)",
            zIndex: 1,
          }}
        />
      )}

      {/* BG LAMA */}
      {oldBg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${oldBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px)",
            transform: "scale(1.2)",
            opacity: 0,
            transition: "opacity 0.4s ease",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* overlay */}
      <div className="absolute inset-0 bg-black/30 z-[3]" />
      
      <div 
        className="absolute top-5 left-8 z-20 flex items-center gap-3 cursor-pointer transition-transform hover:scale-105"
        onClick={() => router.push('/')}
      >
        <img 
          src="/logo.png" 
          alt="NyamKuy Logo" 
          className="h-12 w-12 object-contain drop-shadow-lg" 
          onError={(e) => {
            e.currentTarget.style.display = "none" // Menyembunyikan gambar jika file logo.png belum ada
          }}
        />
        <span className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">
          NyamKuy
        </span>
      </div>

      {/* kanan atas */}
      <div className="absolute top-5 right-5 z-20">
        <Button
          asChild
          variant="secondary"
          className="bg-white/80 text-black hover:bg-white"
        >
          <a href="/auth">Log In / Register</a>
        </Button>
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* cards */}
        <SwipeCards
          setBg={setBg}
          setOldBg={setOldBg}
          onCardClick={handleCardClick}
        />

        {/* SEARCH */}
        <div className="relative w-[340px]">
          <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-lg backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Cari resep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-black placeholder:text-black/50"
            />
          </div>

{/* DROPDOWN */}
{search.trim() && (
  <div
    className="
      absolute
      left-0
      right-0
      bottom-[58px]
      z-30
      overflow-hidden
      rounded-2xl
      bg-white/95
      shadow-2xl
      backdrop-blur
      animate-in
      fade-in
      slide-in-from-bottom-2
      duration-200
    "
  >
    {loading && (
      <div className="px-4 py-3 text-sm text-black/60">
        Mencari...
      </div>
    )}

    {!loading && results.length === 0 && (
      <div className="px-4 py-3 text-sm text-black/60">
        Resep tidak ditemukan
      </div>
    )}

    {!loading &&
      results.map((item, index) => {
        const nama = item.nama || item.title || "Tanpa nama"
        const deskripsi =
          item.deskripsi || item.description || "Tidak ada deskripsi"

        return (
          <button
            key={`${nama}-${index}`}
            type="button"
            onClick={() => openRecipe(item)}
            className="
              flex
              w-full
              items-center
              gap-3
              px-3
              py-3
              text-left
              hover:bg-black/5
              transition
            "
          >
            <img
              src={`/api/image/cropped?nama=${encodeURIComponent(nama)}`}
              alt={nama}
              className="
                h-14
                w-14
                shrink-0
                rounded-xl
                object-cover
                bg-black/10
              "
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />

            <div className="min-w-0">
              <div className="truncate font-semibold text-black">
                {nama}
              </div>

              <div className="line-clamp-2 text-sm text-black/60">
                {deskripsi}
              </div>
            </div>
          </button>
        )
      })}
  </div>
)}
        </div>
      </div>
    </main>
  )
}