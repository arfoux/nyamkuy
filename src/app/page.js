"use client"

import SwipeCards from "@/components/SwipeCards"
import { useState } from "react"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
      
      {/* 🔥 BG BARU (langsung tampil, no delay) */}
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

      {/* 🔥 BG LAMA (fade out) */}
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

      {/* content */}
      <div className="relative z-10">
        <SwipeCards setBg={setBg} setOldBg={setOldBg} />
      </div>
    </main>
  )
}