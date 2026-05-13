"use client"

import SwipeCards from "@/components/SwipeCards"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)
  const router = useRouter()

  function handleCardClick(card) {
    const params = new URLSearchParams({
      nama: card.title,
      deskripsi: card.description,
    })
    router.push(`/receipt?${params.toString()}`)
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

      {/* tombol tengah atas */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
        <Button
          asChild
          variant="secondary"
          className="bg-white/80 text-black hover:bg-white"
        >
          <a href="/auth">Log In / Register</a>
        </Button>
      </div>

      {/* content */}
      <div className="relative z-10">
        <SwipeCards setBg={setBg} setOldBg={setOldBg} onCardClick={handleCardClick} />
      </div>
    </main>
  )
}