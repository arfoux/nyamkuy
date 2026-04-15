"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const initialCards = [
  {
    id: 1,
    title: "Card 1",
    image: "https://picsum.photos/400/600?1",
  },
  {
    id: 2,
    title: "Card 2",
    image: "https://picsum.photos/400/600?2",
  },
  {
    id: 3,
    title: "Card 3",
    image: "https://picsum.photos/400/600?3",
  },
]

export default function SwipeCards() {
  const [cards, setCards] = useState(initialCards)
  const resetTimeout = useRef(null)
  const nextId = useRef(4)

const generateCard = () => {
  const id = nextId.current++
  return {
    id,
    title: `Card ${id}`,
    image: `https://picsum.photos/400/600?random=${id}`,
  }
}

const handleSwipe = (dir, id) => {
  setCards((prev) =>
    prev.map((c) =>
      c.id === id ? { ...c, direction: dir === "right" ? 1 : -1 } : c
    )
  )

  setTimeout(() => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id)

      // ✅ tambahin card baru di belakang
      return [...filtered, generateCard()]
    })
  }, 10)
}

  useEffect(() => {
    if (cards.length === 0) {
      if (resetTimeout.current) return

      resetTimeout.current = setTimeout(() => {
        setCards(initialCards)
        resetTimeout.current = null
      }, 300)
    }

    return () => {
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current)
        resetTimeout.current = null
      }
    }
  }, [cards])

  return (
    <div className="relative w-[320px] h-[480px] mx-auto">
      <AnimatePresence>
        {cards.map((card, index) => (
          <motion.div
  key={card.id}
  custom={card.direction || 0}
  className="absolute w-full h-full rounded-2xl overflow-hidden shadow-xl bg-white"
  style={{
  zIndex: cards.length - index,
  scale: 1 - index * 0.05,
  top: index * 5,
}}
  whileDrag={{ rotate: 10 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
onDragEnd={(e, info) => {
  const offset = info.offset.x
  const velocity = info.velocity.x

  const swipe = Math.abs(offset) > 120 || Math.abs(velocity) > 500
  if (!swipe) return

  if (offset > 0 || velocity > 0) {
    handleSwipe("right", card.id)
  } else {
    handleSwipe("left", card.id)
  }
}}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
exit={(dir) => ({
  x: dir === 1 ? 500 : -500,
  rotate: dir === 1 ? 20 : -20,
  opacity: 0,
  transition: { duration: 0.3 },
})}
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 p-4 text-white bg-gradient-to-t from-black/70 to-transparent w-full">
              <h2 className="text-xl font-bold">{card.title}</h2>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}