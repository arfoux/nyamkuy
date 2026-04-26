"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"

const INITIAL_COUNT = 3

const FOOD_DATA = [
  { title: "Rendang",     slug: "rendang",     subtitle: "Masakan Padang • 4–5 jam" },
  { title: "Soto Ayam",   slug: "soto-ayam",   subtitle: "Sup Nusantara • 1–2 jam" },
  { title: "Nasi Goreng", slug: "nasi-goreng", subtitle: "Masakan Rumahan • 15 menit" },
  { title: "Gado-Gado",   slug: "gado-gado",   subtitle: "Salad Betawi • 30 menit" },
  { title: "Bakso",       slug: "bakso",       subtitle: "Jajanan Kaki Lima • 45 menit" },
]

function generateCard(id) {
  const seed = 100 + Math.floor(Math.random() * 800)
  const food = FOOD_DATA[(id - 1) % FOOD_DATA.length]
  return {
    id,
    title: food.title,
    slug: food.slug,
    subtitle: food.subtitle,
    image: `https://picsum.photos/seed/${seed}/400/600`,
  }
}

const POPUP_CSS = `
  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0.9) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes skeletonPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  .sk {
    background: rgba(255,255,255,0.2);
    border-radius: 5px;
    animation: skeletonPulse 1.4s ease-in-out infinite;
  }
`

function RecipePopup({ onMouseEnter, onMouseLeave }) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        right: 0,
        width: 176,
        background: "rgba(15,15,15,0.88)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
        zIndex: 30,
        animation: "fadeScaleIn 0.18s ease forwards",
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1.2px" }}>
        Preview resep
      </p>
      {[88, 72, 80].map((w, i) => (
        <div key={i} className="sk" style={{ height: 10, width: `${w}%`, marginBottom: 7 }} />
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <div className="sk" style={{ height: 22, width: 58, borderRadius: 20 }} />
        <div className="sk" style={{ height: 22, width: 46, borderRadius: 20 }} />
      </div>
    </div>
  )
}

function SwipeCard({ card, isTop, onSwipe }) {
  const cardRef = useRef(null)
  const drag = useRef({ on: false, ox: 0, oy: 0, cx: 0 })
  const [showPopup, setShowPopup] = useState(false)
  const hideTimer = useRef(null)

  const openPopup = () => { clearTimeout(hideTimer.current); setShowPopup(true) }
  const closePopup = () => { hideTimer.current = setTimeout(() => setShowPopup(false), 120) }

  useEffect(() => {
    if (!isTop) return
    const el = cardRef.current
    if (!el) return

    function start(px, py) {
      drag.current = { on: true, ox: px, oy: py, cx: 0 }
      el.style.transition = "none"
    }

    function move(px, py) {
      if (!drag.current.on) return
      const cx = px - drag.current.ox
      const cy = (py - drag.current.oy) * 0.25
      const rot = cx * 0.1
      drag.current.cx = cx

      el.style.transform = `translateX(${cx}px) translateY(${cy}px) rotate(${rot}deg)`

      const likeEl = el.querySelector("[data-like]")
      const nopeEl = el.querySelector("[data-nope]")
      const ratio = Math.min(Math.abs(cx) / 70, 1)

      if (likeEl) likeEl.style.opacity = cx > 8 ? ratio : 0
      if (nopeEl) nopeEl.style.opacity = cx < -8 ? ratio : 0
    }

    function end() {
      if (!drag.current.on) return
      drag.current.on = false

      const likeEl = el.querySelector("[data-like]")
      const nopeEl = el.querySelector("[data-nope]")
      if (likeEl) likeEl.style.opacity = 0
      if (nopeEl) nopeEl.style.opacity = 0

      const { cx } = drag.current
      if (Math.abs(cx) > 80) {
        onSwipe(cx > 0 ? "right" : "left")
      } else {
        el.style.transition = "transform 0.4s cubic-bezier(.34,1.56,.64,1)"
        el.style.transform = "translateX(0) translateY(0) rotate(0)"
      }
    }

<<<<<<< HEAD
    function onMouseDown(e) {
      e.preventDefault()
      start(e.clientX, e.clientY)
    }

    function onMouseMove(e) {
      move(e.clientX, e.clientY)
    }

    function onMouseUp() {
      end()
    }

    function onTouchStart(e) {
      const t = e.touches[0]
      start(t.clientX, t.clientY)
    }

    function onTouchMove(e) {
      e.preventDefault()
      const t = e.touches[0]
      move(t.clientX, t.clientY)
    }

    function onTouchEnd() {
      end()
    }
=======
    function onMouseDown(e) { e.preventDefault(); start(e.clientX, e.clientY) }
    function onMouseMove(e) { move(e.clientX, e.clientY) }
    function onMouseUp() { end() }
    function onTouchStart(e) { const t = e.touches[0]; start(t.clientX, t.clientY) }
    function onTouchMove(e) { e.preventDefault(); const t = e.touches[0]; move(t.clientX, t.clientY) }
    function onTouchEnd() { end() }
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e

    el.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)

    return () => {
      el.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [isTop, onSwipe])

  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 18,
        overflow: "hidden",
        cursor: isTop ? "grab" : "default",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <style>{POPUP_CSS}</style>

      <img
        src={card.image}
        alt={card.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

<<<<<<< HEAD
=======
      {/* Overlay gradient + judul */}
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
<<<<<<< HEAD
          padding: "1rem",
          background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
          color: "#fff",
          fontWeight: 600,
=======
          padding: "3rem 1.25rem 1.25rem",
          background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
          pointerEvents: "none",
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e
        }}
      >
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>
          {card.title}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
          {card.subtitle}
        </p>
      </div>

      {/* Icon koki */}
      <div
        onMouseEnter={openPopup}
        onMouseLeave={closePopup}
        style={{ position: "absolute", bottom: 18, right: 16, zIndex: 10 }}
      >
        {showPopup && <RecipePopup onMouseEnter={openPopup} onMouseLeave={closePopup} />}

        <Link href={`/resep/${card.slug}`} style={{ textDecoration: "none" }}>
          <button
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)" }}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              padding: 0,
            }}
          >
            👨‍🍳
          </button>
        </Link>
      </div>
<<<<<<< HEAD
=======

      {/* LIKE stamp */}
      <div
        data-like
        style={{
          position: "absolute", top: 20, left: 16,
          padding: "4px 14px", borderRadius: 6,
          fontSize: 22, fontWeight: 700, letterSpacing: 2,
          border: "3px solid #22c55e", color: "#22c55e",
          opacity: 0, transform: "rotate(-12deg)",
          pointerEvents: "none", transition: "opacity 0.05s",
        }}
      >
        LIKE
      </div>

      {/* NOPE stamp */}
      <div
        data-nope
        style={{
          position: "absolute", top: 20, right: 16,
          padding: "4px 14px", borderRadius: 6,
          fontSize: 22, fontWeight: 700, letterSpacing: 2,
          border: "3px solid #ef4444", color: "#ef4444",
          opacity: 0, transform: "rotate(12deg)",
          pointerEvents: "none", transition: "opacity 0.05s",
        }}
      >
        NOPE
      </div>
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e
    </div>
  )
}

export default function SwipeCards({ setBg }) {
  const nextId = useRef(INITIAL_COUNT + 1)
  const isBusy = useRef(false)

  const [cards, setCards] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCards(Array.from({ length: INITIAL_COUNT }, (_, i) => generateCard(i + 1)))
    setMounted(true)
  }, [])

<<<<<<< HEAD
  // ✅ INI YANG KAMU TANYA (background sync)
  useEffect(() => {
    if (cards.length > 0) {
      const topCard = cards[cards.length - 1]
      setBg(topCard.image)
    }
  }, [cards, setBg])
=======
  const [flying, setFlying] = useState(null)
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e

  const handleSwipe = useCallback((dir, id) => {
    if (isBusy.current) return
    isBusy.current = true

    setTimeout(() => {
      const newId = nextId.current++
      setCards((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        return [generateCard(newId), ...filtered]
      })
      setTimeout(() => (isBusy.current = false), 50)
    }, 300)
  }, [])

  if (!mounted) return null

  return (
<<<<<<< HEAD
    <div className="flex flex-col items-center gap-4 py-6">
=======
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "1.5rem 0" }}>
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e
      <div style={{ position: "relative", width: 300, height: 440 }}>
        {cards.map((card, i) => {
          const depth = cards.length - 1 - i
          const isTop = depth === 0
<<<<<<< HEAD
=======
          const isFlyingOut = flying && flying.id === card.id

          const scale = 1 - depth * 0.05
          const ty = depth * 9

          const flyX = flying?.dir === "right" ? 550 : -550
          const flyRot = flying?.dir === "right" ? 25 : -25
>>>>>>> c8c811af39d697c720078bd323ab4cacc32ece2e

          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10 - depth,
                transform: `scale(${1 - depth * 0.05}) translateY(${depth * 10}px)`,
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              <SwipeCard
                card={card}
                isTop={isTop}
                onSwipe={(dir) => handleSwipe(dir, card.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}