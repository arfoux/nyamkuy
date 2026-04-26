"use client"

import SwipeCards from "@/components/SwipeCards"
import { useState } from "react"

export default function Page() {
  const [bg, setBg] = useState(null)

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
      
      {/* Background Blur (Fade) */}
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
            transition: "opacity 0.6s ease",
          }}
        />
      )}

      {/* Overlay biar lebih enak dilihat */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10">
        <SwipeCards setBg={setBg} />
      </div>
    </main>
  )
}