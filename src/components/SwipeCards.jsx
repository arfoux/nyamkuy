"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react"

function slugifyFoodName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
}

function getFoodImage(nama) {
  return `/api/image/base?nama=${encodeURIComponent(nama)}`
}

function mapRecipeToCard(recipe) {
  const imageUrl = getFoodImage(recipe.nama)

  const preload = new Image()
  preload.src = imageUrl

  return {
    id: `${recipe.id}-${Math.random()}`,
    title: recipe.nama,
    description: recipe.deskripsi,
    image: imageUrl,
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

      if (Math.abs(cx) > 80) {
        const dir = cx > 0 ? 1 : -1
        el.style.transition = "transform 0.35s ease-out, opacity 0.35s ease-out"
        el.style.transform = `translateX(${dir * 600}px) rotate(${dir * 25}deg)`
        el.style.opacity = "0"
        setTimeout(() => { onSwipe(dir > 0 ? "right" : "left") }, 200)
      } else {
        el.style.transition = "transform 0.4s cubic-bezier(.34,1.56,.64,1)"
        el.style.transform = "translateX(0) translateY(0) rotate(0)"
      }
    }

    function onMouseDown(e) { e.preventDefault(); start(e.clientX, e.clientY) }
    function onMouseMove(e) { move(e.clientX, e.clientY) }
    function onMouseUp() { end() }
    function onTouchStart(e) { const t = e.touches[0]; start(t.clientX, t.clientY) }
    function onTouchMove(e) { const t = e.touches[0]; move(t.clientX, t.clientY) }
    function onTouchEnd() { end() }

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
        background: "#111",
      }}
    >
      <img
        src={card.image}
        alt={card.title}
        loading="eager"
        decoding="async"
        fetchPriority="high"
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
          background:
            "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.52) 78%, rgba(0,0,0,0.18) 92%, transparent 100%)",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            marginBottom: 8,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {card.title}
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            opacity: 0.95,
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.description}
        </div>
      </div>
    </div>
  )
}

export default function SwipeCards({ setBg, setOldBg }) {
  const totalPages = useRef(1)
  const usedPages = useRef([])
  const cardsRef = useRef([])

  const [cards, setCards] = useState([])
  const [mounted, setMounted] = useState(false)

  // sync ref setiap cards berubah
  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5)
  }

function getRandomPage() {
  const total = totalPages.current // baca sekali

  if (usedPages.current.length >= total) {
    usedPages.current = []
  }

  const available = Array.from({ length: total }, (_, i) => i + 1)
    .filter(i => !usedPages.current.includes(i))

  const random = available[Math.floor(Math.random() * available.length)]
  usedPages.current.push(random)

  return random
}

const fetchRandomRecipes = useCallback(async () => {
  const page = getRandomPage()
  const safePage = Math.min(page, totalPages.current) // <-- clamp
  const res = await fetch(`/api/resep?page=${safePage}`)
  const json = await res.json()

  console.log("[fetch] page:", safePage, "total_pages:", json.meta.total_pages, "data:", json.data.length)

  totalPages.current = json.meta.total_pages

  const mapped = shuffleArray(json.data).map(mapRecipeToCard)
  if (mapped.length === 0) {
    console.warn("[fetch] empty data! safePage:", safePage, "totalPages:", totalPages.current)
  }

  return mapped
}, [])

  useEffect(() => {
    async function loadRecipes() {
      try {
        const recipes = await fetchRandomRecipes()
        setCards(recipes)
        if (recipes.length > 0) {
          setBg(recipes[recipes.length - 1].image)
        }
        setMounted(true)
      } catch (err) {
        console.error(err)
      }
    }
    loadRecipes()
  }, [setBg])

const isFetching = useRef(false)

const handleSwipe = useCallback(
  (dir, id) => {
    const prev = cardsRef.current
    const currentTop = prev[prev.length - 1]
    const nextCard = prev[prev.length - 2]

    if (currentTop) setOldBg(currentTop.image)
    if (nextCard) setBg(nextCard.image)

    const filtered = prev.filter((c) => c.id !== id)
    setCards(filtered)

    if (filtered.length <= 3 && !isFetching.current) {
      isFetching.current = true
      fetchRandomRecipes()
        .then((newRecipes) => {
          setCards((current) => [...newRecipes, ...current])
        })
        .catch(console.error)
        .finally(() => {
          isFetching.current = false
        })
    }

    setTimeout(() => {
      setOldBg(null)
    }, 400)
  },
  [setBg, setOldBg, fetchRandomRecipes]
)

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div style={{ position: "relative", width: 300, height: 500 }}>
        {cards.slice(-5).map((card, i, arr) => {
          const depth = arr.length - 1 - i
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