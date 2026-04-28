"use client"

import { useState, useRef, useEffect, useCallback } from "react"

const INITIAL_COUNT = 3

function generateCard(id) {
  const seed = 100 + Math.floor(Math.random() * 800)
  const image = `https://picsum.photos/seed/${seed}/400/600`

  // 🔥 preload langsung (biar gak kejar-kejaran)
  const img = new Image()
  img.src = image

  return {
    id,
    title: `Card ${id}`,
    image,
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
    }

function end() {
  if (!drag.current.on) return
  drag.current.on = false

  const { cx } = drag.current

  // 🔥 kalau lolos swipe
  if (Math.abs(cx) > 80) {
    const dir = cx > 0 ? 1 : -1

    // 🚀 animasi keluar LANGSUNG (tanpa React)
    el.style.transition = "transform 0.35s ease-out, opacity 0.35s ease-out"
    el.style.transform = `translateX(${dir * 600}px) rotate(${dir * 25}deg)`
    el.style.opacity = "0"

    // 🔥 setelah animasi selesai → baru update state
    setTimeout(() => {
      onSwipe(dir > 0 ? "right" : "left")
    }, 200)

  } else {
    el.style.transition = "transform 0.4s cubic-bezier(.34,1.56,.64,1)"
    el.style.transform = "translateX(0) translateY(0) rotate(0)"
  }
}

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
      const t = e.touches[0]
      move(t.clientX, t.clientY)
    }

    function onTouchEnd() {
      end()
    }

    el.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    el.addEventListener("touchstart", onTouchStart)
    el.addEventListener("touchmove", onTouchMove)
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
      }}
    >
      <img
        src={card.image}
        alt={card.title}
        loading="eager"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem",
          background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        {card.title}
      </div>
    </div>
  )
}

export default function SwipeCards({ setBg, setOldBg }) {
  const nextId = useRef(INITIAL_COUNT + 1)
  const isBusy = useRef(false)

  const [cards, setCards] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = Array.from({ length: INITIAL_COUNT }, (_, i) =>
      generateCard(i + 1)
    )
    setCards(initial)
    setMounted(true)

    // set initial bg
    if (initial.length > 0) {
      setBg(initial[initial.length - 1].image)
    }
  }, [setBg])

const handleSwipe = useCallback((dir, id) => {
  if (isBusy.current) return
  isBusy.current = true

  const currentTop = cards[cards.length - 1]
  const nextCard = cards[cards.length - 2]

  // 🔥 set old bg dulu
  if (currentTop) {
    setOldBg(currentTop.image)
  }

  // 🔥 bg baru langsung (NO WAIT)
  if (nextCard) {
    setBg(nextCard.image)
  }

  // 🔥 hapus oldBg setelah fade selesai
  setTimeout(() => {
    setOldBg(null)
  }, 400)

  // 🔥 update cards TANPA delay panjang
  const newId = nextId.current++

  setCards((prev) => {
    const filtered = prev.filter((c) => c.id !== id)
    return [generateCard(newId), ...filtered]
  })

  setTimeout(() => {
    isBusy.current = false
  }, 100)

}, [cards, setBg, setOldBg])

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div style={{ position: "relative", width: 300, height: 440 }}>
        {cards.map((card, i) => {
          const depth = cards.length - 1 - i
          const isTop = depth === 0

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