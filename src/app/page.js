"use client"

import SwipeCards from "@/components/SwipeCards"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)
  const [search, setSearch] = useState("")
  const router = useRouter()

  function handleCardClick(card) {
    const params = new URLSearchParams({
      nama: card.title,
      deskripsi: card.description,
    })

    router.push(`/receipt?${params.toString()}`)
  }

  async function handleSearch() {
    if (!search.trim()) return

    try {
      const res = await fetch(
        `/api/resep/search?q=${encodeURIComponent(search)}`
      )

      const data = await res.json()
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
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

        {/* SEARCH BOX DI BAWAH KOTAKAN */}
        <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition"
          >
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
          </button>

          <input
            type="text"
            placeholder="Cari resep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="w-64 bg-transparent outline-none text-black placeholder:text-black/50"
          />
        </div>
      </div>
    </main>
  )
}