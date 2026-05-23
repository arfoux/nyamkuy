"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react"
import { useRouter } from "next/navigation"
import { Bookmark, ChefHat, Sparkles, Star } from "lucide-react"

function getFoodImage(nama) {
  return `/api/image/base?nama=${encodeURIComponent(
    nama
  )}`
}

function getCookPoints(recipe) {
  const points = Number(
    recipe.cook_points ??
      recipe.poin ??
      10
  )

  return Number.isFinite(points)
    ? points
    : 10
}

function mapRecipeToCard(recipe) {
  const imageUrl = getFoodImage(
    recipe.nama
  )

  const preload = new Image()
  preload.src = imageUrl

  return {
    id: recipe.id,
    title: recipe.nama,
    description:
      recipe.deskripsi,
    image: imageUrl,
    cookPoints:
      getCookPoints(recipe),
    saved: Boolean(
      recipe.is_saved
    ),
  }
}

function SwipeCard({
  card,
  isTop,
  onSwipe,
  onCardClick,
  onToggleSave,
  onCook,
  saving,
  cooking,
  cookFeedback,
}) {
  const cardRef = useRef(null)

  const drag = useRef({
    on: false,
    ox: 0,
    oy: 0,
    cx: 0,
    moved: false,
  })

  const hasAnimated =
    useRef(false)

  // =========================
  // INTRO ANIMATION
  // =========================
  useEffect(() => {
    if (!isTop) return
    if (hasAnimated.current)
      return

    const el = cardRef.current
    if (!el) return

    hasAnimated.current = true

    async function intro() {
      await new Promise((r) =>
        setTimeout(r, 500)
      )

      el.style.transition =
        "transform 0.35s ease"

      el.style.transform =
        "translateX(42px) rotate(5deg)"

      await new Promise((r) =>
        setTimeout(r, 350)
      )

      el.style.transform =
        "translateX(-36px) rotate(-5deg)"

      await new Promise((r) =>
        setTimeout(r, 350)
      )

      el.style.transform =
        "translateX(0px) rotate(0deg)"
    }

    intro()
  }, [isTop])

  // =========================
  // DRAG
  // =========================
  useEffect(() => {
    if (!isTop) return

    const el = cardRef.current
    if (!el) return

    function start(px, py) {
      drag.current = {
        on: true,
        ox: px,
        oy: py,
        cx: 0,
        moved: false,
      }

      el.style.transition =
        "none"

      el.style.animation = "none"
    }

    function isCardControl(target) {
      return target.closest(
        "[data-card-control='true']"
      )
    }

    function move(px, py) {
      if (!drag.current.on)
        return

      const cx =
        px - drag.current.ox

      const cy =
        (py -
          drag.current.oy) *
        0.25

      const rot = cx * 0.1

      drag.current.cx = cx

      if (
        Math.abs(cx) > 5 ||
        Math.abs(
          py -
            drag.current.oy
        ) > 5
      ) {
        drag.current.moved = true
      }

      el.style.transform =
        `translateX(${cx}px) translateY(${cy}px) rotate(${rot}deg)`
    }

    function end() {
      if (!drag.current.on)
        return

      drag.current.on = false

      const { cx, moved } =
        drag.current

      // TAP
      if (!moved) {
        el.style.transition =
          "transform 0.12s ease"

        el.style.transform =
          "scale(0.985)"

        setTimeout(() => {
          onCardClick &&
            onCardClick(card)
        }, 120)

        return
      }

      // SWIPE
      if (Math.abs(cx) > 80) {
        const dir =
          cx > 0 ? 1 : -1

        el.style.transition =
          "transform 0.35s ease-out, opacity 0.35s ease-out"

        el.style.transform =
          `translateX(${dir * 600}px) rotate(${dir * 25}deg)`

        el.style.opacity = "0"

        setTimeout(() => {
          onSwipe(
            dir > 0
              ? "right"
              : "left"
          )
        }, 200)
      }

      // RESET
      else {
        el.style.transition =
          "transform 0.4s cubic-bezier(.34,1.56,.64,1)"

        el.style.transform =
          "translateX(0) translateY(0) rotate(0)"

        el.style.animation =
          "cardIdleSwipe 3.2s ease-in-out infinite"
      }
    }

    function onMouseDown(e) {
      if (isCardControl(e.target))
        return

      e.preventDefault()

      start(
        e.clientX,
        e.clientY
      )
    }

    function onMouseMove(e) {
      move(
        e.clientX,
        e.clientY
      )
    }

    function onMouseUp() {
      end()
    }

    function onTouchStart(e) {
      if (isCardControl(e.target))
        return

      const t = e.touches[0]

      start(
        t.clientX,
        t.clientY
      )
    }

    function onTouchMove(e) {
      const t = e.touches[0]

      move(
        t.clientX,
        t.clientY
      )
    }

    function onTouchEnd() {
      end()
    }

    el.addEventListener(
      "mousedown",
      onMouseDown
    )

    window.addEventListener(
      "mousemove",
      onMouseMove
    )

    window.addEventListener(
      "mouseup",
      onMouseUp
    )

    el.addEventListener(
      "touchstart",
      onTouchStart
    )

    el.addEventListener(
      "touchmove",
      onTouchMove
    )

    el.addEventListener(
      "touchend",
      onTouchEnd
    )

    return () => {
      el.removeEventListener(
        "mousedown",
        onMouseDown
      )

      window.removeEventListener(
        "mousemove",
        onMouseMove
      )

      window.removeEventListener(
        "mouseup",
        onMouseUp
      )

      el.removeEventListener(
        "touchstart",
        onTouchStart
      )

      el.removeEventListener(
        "touchmove",
        onTouchMove
      )

      el.removeEventListener(
        "touchend",
        onTouchEnd
      )
    }
  }, [
    isTop,
    onSwipe,
    onCardClick,
    card,
  ])

  return (
    <>
      <style jsx>{`
        @keyframes cardIdleSwipe {
          0% {
            transform: translateX(
                0px
              )
              rotate(0deg);
          }

          20% {
            transform: translateX(
                18px
              )
              rotate(2deg);
          }

          40% {
            transform: translateX(
                0px
              )
              rotate(0deg);
          }

          60% {
            transform: translateX(
                -18px
              )
              rotate(-2deg);
          }

          80% {
            transform: translateX(
                0px
              )
              rotate(0deg);
          }

          100% {
            transform: translateX(
                0px
              )
              rotate(0deg);
          }
        }

        .card-idle {
          animation: cardIdleSwipe
            3.2s ease-in-out
            infinite;
        }

        @keyframes cookFeedbackIn {
          0% {
            opacity: 0;
            transform: translateY(-8px)
              scale(0.96);
          }

          100% {
            opacity: 1;
            transform: translateY(0)
              scale(1);
          }
        }

        .cook-feedback {
          animation: cookFeedbackIn
            0.28s ease both;
        }
      `}</style>

      <div
        ref={cardRef}
        className={
          isTop
            ? "card-idle"
            : ""
        }
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          overflow: "hidden",
          cursor: isTop
            ? "grab"
            : "default",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.18)",
          userSelect: "none",
          background: "#111",
          touchAction: "none",
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

        {isTop && (
          <div
            data-card-control="true"
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: 8,
              pointerEvents:
                "auto",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems:
                  "center",
                gap: 5,
                minHeight: 34,
                padding:
                  "0 10px",
                borderRadius:
                  999,
                background:
                  "rgba(0,0,0,0.34)",
                border:
                  "1px solid rgba(255,255,255,0.22)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                boxShadow:
                  "0 8px 18px rgba(0,0,0,0.22)",
                backdropFilter:
                  "blur(10px)",
              }}
            >
              <Star
                size={13}
                fill="#facc15"
                color="#facc15"
              />
              <span>
                +{card.cookPoints} poin
              </span>
            </div>

            <div
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCook?.(card)
                }}
                disabled={cooking}
                aria-label="Masak resep"
                title="Masak"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 5,
                  minWidth: 76,
                  height: 36,
                  padding:
                    "0 11px",
                  borderRadius:
                    999,
                  background:
                    cookFeedback?.type ===
                    "success"
                      ? "rgba(22,163,74,0.82)"
                      : "rgba(250,204,21,0.9)",
                  border:
                    "1px solid rgba(255,255,255,0.28)",
                  color:
                    cookFeedback?.type ===
                    "success"
                      ? "#fff"
                      : "#241306",
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow:
                    "0 8px 18px rgba(0,0,0,0.22)",
                  backdropFilter:
                    "blur(10px)",
                  cursor: cooking
                    ? "not-allowed"
                    : "pointer",
                  opacity: cooking
                    ? 0.72
                    : 1,
                }}
              >
                <ChefHat size={15} />
                <span>
                  {cooking
                    ? "..."
                    : "Masak"}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleSave?.(card)
                }}
                disabled={saving}
                aria-label={
                  card.saved
                    ? "Batal simpan resep"
                    : "Simpan resep"
                }
                title={
                  card.saved
                    ? "Batal simpan"
                    : "Simpan"
                }
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  width: 36,
                  height: 36,
                  borderRadius:
                    999,
                  background:
                    card.saved
                      ? "rgba(250,204,21,0.24)"
                      : "rgba(0,0,0,0.34)",
                  border:
                    card.saved
                      ? "1px solid rgba(250,204,21,0.55)"
                      : "1px solid rgba(255,255,255,0.22)",
                  color:
                    card.saved
                      ? "#facc15"
                      : "#fff",
                  boxShadow:
                    "0 8px 18px rgba(0,0,0,0.22)",
                  backdropFilter:
                    "blur(10px)",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  opacity: saving
                    ? 0.65
                    : 1,
                }}
              >
                <Bookmark
                  size={18}
                  fill={
                    card.saved
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>
          </div>
        )}

        {isTop && cookFeedback && (
          <div
            data-card-control="true"
            className="cook-feedback"
            style={{
              position: "absolute",
              top: 58,
              left: 12,
              right: 12,
              display: "flex",
              alignItems:
                "center",
              gap: 8,
              minHeight: 38,
              padding:
                "8px 11px",
              borderRadius: 14,
              background:
                cookFeedback.type ===
                "success"
                  ? "rgba(22,163,74,0.86)"
                  : cookFeedback.type ===
                    "limit"
                    ? "rgba(217,119,6,0.88)"
                    : "rgba(220,38,38,0.86)",
              border:
                "1px solid rgba(255,255,255,0.24)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              boxShadow:
                "0 10px 24px rgba(0,0,0,0.24)",
              backdropFilter:
                "blur(10px)",
              pointerEvents:
                "auto",
            }}
          >
            {cookFeedback.type ===
            "success" ? (
              <Sparkles
                size={16}
                style={{
                  flexShrink: 0,
                }}
              />
            ) : (
              <ChefHat
                size={16}
                style={{
                  flexShrink: 0,
                }}
              />
            )}
            <span>
              {cookFeedback.text}
            </span>
          </div>
        )}

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
              fontSize:
                "1.2rem",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {card.title}
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              display:
                "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient:
                "vertical",
              overflow: "hidden",
            }}
          >
            {card.description}
          </div>
        </div>
      </div>
    </>
  )
}

const SwipeCards = forwardRef(
  (
    {
      setBg,
      setOldBg,
      onCardClick,
    },
    ref
  ) => {
    const router = useRouter()

    const totalPages =
      useRef(1)

    const usedPages =
      useRef([])

    const cardsRef = useRef([])

    const [cards, setCards] =
      useState([])

    const [mounted, setMounted] =
      useState(false)

    const [savingIds, setSavingIds] =
      useState([])

    const [cookingIds, setCookingIds] =
      useState([])

    const [cookFeedbacks, setCookFeedbacks] =
      useState({})

    useEffect(() => {
      cardsRef.current = cards
    }, [cards])

    function shuffleArray(arr) {
      return [...arr].sort(
        () =>
          Math.random() - 0.5
      )
    }

    function getRandomPage() {
      const total =
        totalPages.current

      if (
        usedPages.current
          .length >= total
      ) {
        usedPages.current = []
      }

      const available =
        Array.from(
          { length: total },
          (_, i) => i + 1
        ).filter(
          (i) =>
            !usedPages.current.includes(
              i
            )
        )

      const random =
        available[
          Math.floor(
            Math.random() *
              available.length
          )
        ]

      usedPages.current.push(
        random
      )

      return random
    }

    const fetchRandomRecipes =
      useCallback(async () => {
        const page =
          getRandomPage()

        const safePage =
          Math.min(
            page,
            totalPages.current
          )

        const res =
          await fetch(
            `/api/resep?page=${safePage}`
          )

        const json =
          await res.json()

        totalPages.current =
          json.meta.total_pages

        const mapped =
          shuffleArray(
            json.data
          ).map(
            mapRecipeToCard
          )

        return mapped
      }, [])

    useEffect(() => {
      async function loadRecipes() {
        try {
          const recipes =
            await fetchRandomRecipes()

          setCards(recipes)

          if (
            recipes.length > 0
          ) {
            setBg(
              recipes[
                recipes.length -
                  1
              ].image
            )
          }

          setMounted(true)
        } catch (err) {
          console.error(err)
        }
      }

      loadRecipes()
    }, [setBg])

    const isFetching =
      useRef(false)

    const updateCardSaved =
      useCallback(
        (id, saved) => {
          setCards((current) =>
            current.map((card) =>
              card.id === id
                ? {
                    ...card,
                    saved,
                  }
                : card
            )
          )
        },
        []
      )

    const handleToggleSave =
      useCallback(
        async (card) => {
          if (
            !card?.id ||
            savingIds.includes(card.id)
          ) {
            return
          }

          setSavingIds((current) => [
            ...current,
            card.id,
          ])

          try {
            const res = await fetch(
              `/api/resep/${card.id}/simpan`,
              {
                method: card.saved
                  ? "DELETE"
                  : "POST",
                credentials:
                  "include",
              }
            )

            const data =
              await res
                .json()
                .catch(() => ({}))

            if (res.status === 401) {
              router.push(
                `/auth?next=${encodeURIComponent(
                  "/"
                )}`
              )
              return
            }

            if (!res.ok) {
              throw new Error(
                data.error ||
                  "Gagal memperbarui simpan"
              )
            }

            updateCardSaved(
              card.id,
              Boolean(data.saved)
            )
          } catch (err) {
            console.error(err)
          } finally {
            setSavingIds((current) =>
              current.filter(
                (id) =>
                  id !== card.id
              )
            )
          }
        },
        [
          router,
          savingIds,
          updateCardSaved,
        ]
      )

    const showCookFeedback =
      useCallback((cardId, feedback) => {
        setCookFeedbacks((current) => ({
          ...current,
          [cardId]: feedback,
        }))

        setTimeout(() => {
          setCookFeedbacks(
            (current) => {
              const next = {
                ...current,
              }

              delete next[cardId]
              return next
            }
          )
        }, 2200)
      }, [])

    const handleCook =
      useCallback(
        async (card) => {
          if (
            !card?.id ||
            cookingIds.includes(card.id)
          ) {
            return
          }

          setCookingIds((current) => [
            ...current,
            card.id,
          ])

          try {
            const res = await fetch(
              `/api/resep/${card.id}/masak`,
              {
                method: "POST",
                credentials:
                  "include",
              }
            )

            const data =
              await res
                .json()
                .catch(() => ({}))

            if (res.status === 401) {
              router.push(
                `/auth?next=${encodeURIComponent(
                  "/"
                )}`
              )
              return
            }

            if (res.status === 429) {
              showCookFeedback(
                card.id,
                {
                  type: "limit",
                  text: "Jatah masak hari ini penuh",
                }
              )
              return
            }

            if (!res.ok) {
              throw new Error(
                data.error ||
                  "Gagal mencatat masakan"
              )
            }

            showCookFeedback(
              card.id,
              {
                type: "success",
                text: `Matang! +${data.points_awarded} poin`,
              }
            )
          } catch (err) {
            console.error(err)
            showCookFeedback(
              card.id,
              {
                type: "error",
                text: "Belum bisa dicatat",
              }
            )
          } finally {
            setCookingIds((current) =>
              current.filter(
                (id) =>
                  id !== card.id
              )
            )
          }
        },
        [
          cookingIds,
          router,
          showCookFeedback,
        ]
      )

    const handleSwipe =
      useCallback(
        (dir, id) => {
          const prev =
            cardsRef.current

          const currentTop =
            prev[
              prev.length - 1
            ]

          const nextCard =
            prev[
              prev.length - 2
            ]

          if (currentTop)
            setOldBg(
              currentTop.image
            )

          if (nextCard)
            setBg(
              nextCard.image
            )

          const filtered =
            prev.filter(
              (c) =>
                c.id !== id
            )

          setCards(filtered)

          if (
            filtered.length <=
              3 &&
            !isFetching.current
          ) {
            isFetching.current = true

            fetchRandomRecipes()
              .then(
                (
                  newRecipes
                ) => {
                  setCards(
                    (
                      current
                    ) => [
                      ...newRecipes,
                      ...current,
                    ]
                  )
                }
              )
              .finally(() => {
                isFetching.current = false
              })
          }

          setTimeout(() => {
            setOldBg(null)
          }, 400)
        },
        [
          setBg,
          setOldBg,
          fetchRandomRecipes,
        ]
      )

    // =========================
    // PROGRAMMATIC SWIPE
    // =========================
    const swipeTopCard =
      useCallback(
        (direction) => {
          const topCard =
            document.querySelector(
              "[data-top-card='true']"
            )

          if (!topCard)
            return

          topCard.style.transition =
            "transform 0.35s ease-out, opacity 0.35s ease-out"

          const dir =
            direction ===
            "right"
              ? 1
              : -1

          topCard.style.transform =
            `translateX(${dir * 600}px) rotate(${dir * 25}deg)`

          topCard.style.opacity =
            "0"

          const topData =
            cardsRef.current[
              cardsRef.current
                .length - 1
            ]

          setTimeout(() => {
            if (topData) {
              handleSwipe(
                direction,
                topData.id
              )
            }
          }, 200)
        },
        [handleSwipe]
      )

    // =========================
    // EXPOSE REF
    // =========================
    useImperativeHandle(
      ref,
      () => ({
        swipeLeft() {
          swipeTopCard("left")
        },

        swipeRight() {
          swipeTopCard("right")
        },
      })
    )

    // =========================
    // TOUCHPAD SWIPE
    // =========================
    useEffect(() => {
      let locked = false

      function handleWheel(
        e
      ) {
        if (locked) return

        if (
          Math.abs(
            e.deltaX
          ) > 40
        ) {
          locked = true

          if (
            e.deltaX > 0
          ) {
            swipeTopCard(
              "right"
            )
          } else {
            swipeTopCard(
              "left"
            )
          }

          setTimeout(() => {
            locked = false
          }, 450)
        }
      }

      window.addEventListener(
        "wheel",
        handleWheel,
        {
          passive: true,
        }
      )

      return () => {
        window.removeEventListener(
          "wheel",
          handleWheel
        )
      }
    }, [swipeTopCard])

    if (!mounted) return null

    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div
          style={{
            position:
              "relative",
            width: 300,
            height: 500,
          }}
        >
          {cards
            .slice(-5)
            .map(
              (
                card,
                i,
                arr
              ) => {
                const depth =
                  arr.length -
                  1 -
                  i

                const isTop =
                  depth === 0

                return (
                  <div
                    key={card.id}
                    data-top-card={
                      isTop
                    }
                    style={{
                      position:
                        "absolute",
                      inset: 0,
                      zIndex:
                        10 -
                        depth,
                      transform: `scale(${
                        1 -
                        depth *
                          0.05
                      }) translateY(${
                        depth * 10
                      }px)`,
                      pointerEvents:
                        isTop
                          ? "auto"
                          : "none",
                    }}
                  >
                    <SwipeCard
                      card={card}
                      isTop={
                        isTop
                      }
                      saving={savingIds.includes(
                        card.id
                      )}
                      onToggleSave={
                        handleToggleSave
                      }
                      cooking={cookingIds.includes(
                        card.id
                      )}
                      cookFeedback={
                        cookFeedbacks[
                          card.id
                        ]
                      }
                      onCook={
                        handleCook
                      }
                      onSwipe={(
                        dir
                      ) =>
                        handleSwipe(
                          dir,
                          card.id
                        )
                      }
                      onCardClick={
                        onCardClick
                      }
                    />
                  </div>
                )
              }
            )}
        </div>
      </div>
    )
  }
)

SwipeCards.displayName =
  "SwipeCards"

export default SwipeCards
