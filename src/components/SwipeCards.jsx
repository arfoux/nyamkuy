"use client"

import { useState, useRef, useEffect, useCallback } from "react"

const INITIAL_COUNT = 3

function generateCard(id) {
  const seed = 100 + Math.floor(Math.random() * 800)
  return {
    id,
    title: `Card ${id}`,
    image: `https://picsum.photos/seed/${seed}/400/600`,
  }
}

function SwipeCard({ card, isTop, onSwipe }) {
  const cardRef = useRef(null)
  const drag = useRef({ on: false, ox: 0, oy: 0, cx: 0 })

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
        el.style.transform = "translateX(0px) translateY(0px) rotate(0deg)"
      }
    }

    // Mouse
    function onMouseDown(e) {
      e.preventDefault()
      start(e.clientX, e.clientY)
    }
    function onMouseMove(e) { move(e.clientX, e.clientY) }
    function onMouseUp() { end() }

    // Touch
    function onTouchStart(e) {
      const t = e.touches[0]
      start(t.clientX, t.clientY)
    }
    function onTouchMove(e) {
      e.preventDefault()
      const t = e.touches[0]
      move(t.clientX, t.clientY)
    }
    function onTouchEnd() { end() }

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
        willChange: "transform",
      }}
    >
      <img
        src={card.image}
        alt={card.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
        draggable={false}
      />

      {/* Card label */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem 1.25rem 1.25rem",
          background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {card.title}
      </div>

      {/* LIKE stamp */}
      <div
        data-like
        style={{
          position: "absolute",
          top: 20,
          left: 16,
          padding: "4px 14px",
          borderRadius: 6,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          border: "3px solid #22c55e",
          color: "#22c55e",
          opacity: 0,
          transform: "rotate(-12deg)",
          pointerEvents: "none",
          transition: "opacity 0.05s",
        }}
      >
        LIKE
      </div>

      {/* NOPE stamp */}
      <div
        data-nope
        style={{
          position: "absolute",
          top: 20,
          right: 16,
          padding: "4px 14px",
          borderRadius: 6,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          border: "3px solid #ef4444",
          color: "#ef4444",
          opacity: 0,
          transform: "rotate(12deg)",
          pointerEvents: "none",
          transition: "opacity 0.05s",
        }}
      >
        NOPE
      </div>
    </div>
  )
}

export default function SwipeCards() {
  const nextId = useRef(INITIAL_COUNT + 1)
  const isBusy = useRef(false)

  // Inisialisasi kosong dulu (SSR), baru generate di client via useEffect
  const [cards, setCards] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCards(Array.from({ length: INITIAL_COUNT }, (_, i) => generateCard(i + 1)))
    setMounted(true)
  }, [])

  // flying: { id, dir } — card currently animating out
  const [flying, setFlying] = useState(null)

  const handleSwipe = useCallback((dir, id) => {
    if (isBusy.current) return
    isBusy.current = true
    setFlying({ id, dir })

    setTimeout(() => {
      const newId = nextId.current++
      setCards((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        return [generateCard(newId), ...filtered]
      })
      setFlying(null)
      setTimeout(() => { isBusy.current = false }, 50)
    }, 340)
  }, [])

  const swipeTop = useCallback((dir) => {
    if (isBusy.current) return
    const top = cards[cards.length - 1]
    if (top) handleSwipe(dir, top.id)
  }, [cards, handleSwipe])

  if (!mounted) return null

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "1.5rem 0" }}>

      {/* Stack */}
      <div style={{ position: "relative", width: 300, height: 440 }}>
        {cards.map((card, i) => {
          const depth = cards.length - 1 - i // 0 = top
          const isTop = depth === 0
          const isFlyingOut = flying && flying.id === card.id

          // Base stack transform
          const scale = 1 - depth * 0.05
          const ty = depth * 9

          // Fly-out transform override
          const flyX = flying?.dir === "right" ? 550 : -550
          const flyRot = flying?.dir === "right" ? 25 : -25

          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10 - depth,
                transform: isFlyingOut
                  ? `translateX(${flyX}px) rotate(${flyRot}deg)`
                  : `scale(${scale}) translateY(${ty}px)`,
                opacity: isFlyingOut ? 0 : 1,
                transition: isFlyingOut
                  ? "transform 0.32s ease, opacity 0.32s ease"
                  : isTop
                  ? "none"
                  : "transform 0.3s ease",
                pointerEvents: isTop && !isFlyingOut ? "auto" : "none",
              }}
            >
              <SwipeCard
                card={card}
                isTop={isTop && !isFlyingOut}
                onSwipe={(dir) => handleSwipe(dir, card.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={() => swipeTop("left")}
          style={{
            padding: "10px 28px",
            borderRadius: 999,
            border: "2px solid #ef4444",
            background: "transparent",
            color: "#ef4444",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ✕ Nope
        </button>
        <button
          onClick={() => swipeTop("right")}
          style={{
            padding: "10px 28px",
            borderRadius: 999,
            border: "2px solid #22c55e",
            background: "transparent",
            color: "#22c55e",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ♥ Like
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
        Drag kiri/kanan atau pakai tombol
      </p>
    </div>
  )
}
