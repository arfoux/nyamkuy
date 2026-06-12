"use client"

import SwipeCards from "@/components/SwipeCards"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import {
  User,
  LogOut,
  ChevronRight,
  Trophy,
  Star,
} from "lucide-react"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)

  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // auth state
  const [authorized, setAuthorized] =
    useState(false)

  // dropdown profile
  const [openProfile, setOpenProfile] =
    useState(false)

  // hover arrow
  const [hoverLeft, setHoverLeft] =
    useState(false)

  const [hoverRight, setHoverRight] =
    useState(false)

  const profileRef = useRef(null)
  const searchInputRef = useRef(null)

  // swipe ref
  const swipeRef = useRef(null)

  const router = useRouter()

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
          }
        )

        if (res.ok) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (err) {
        setAuthorized(false)
      }
    }

    checkAuth()
  }, [])

  // =========================
  // CLOSE DROPDOWN
  // =========================
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setOpenProfile(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  // =========================
  // LOGOUT
  // =========================
  async function handleLogout() {
    try {
      const res = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      )

      if (res.ok) {
        setAuthorized(false)
        setOpenProfile(false)

        router.push("/auth")
        router.refresh()
      }
    } catch (err) {
      console.error(
        "Logout gagal:",
        err
      )
    }
  }

  // =========================
  // OPEN RECIPE
  // =========================
  function handleCardClick(card) {
    if (!card?.id) return
    router.push(`/receipt?id=${card.id}`)
  }

  function openRecipe(item) {
    if (!item?.id) return
    router.push(`/receipt?id=${item.id}`)
  }

  // =========================
  // SEARCH RESEP
  // =========================
  useEffect(() => {
    const keyword = search.trim()

    if (!keyword) {
      setResults([])
      setLoading(false)
      return
    }

    const delay = setTimeout(
      async () => {
        try {
          setLoading(true)

          const res =
            await fetch(
              `/api/resep/search?q=${encodeURIComponent(
                keyword
              )}`
            )

          const data =
            await res.json()

          const list =
            Array.isArray(data)
              ? data
              : data.data ||
                data.results ||
                data.resep ||
                []

          setResults(list)
        } catch (err) {
          console.error(err)
          setResults([])
        } finally {
          setLoading(false)
        }
      },
      350
    )

    return () =>
      clearTimeout(delay)
  }, [search])

  // =========================
  // SWIPE FUNCTION
  // =========================
  function triggerSwipe(direction) {
    if (direction === "left") {
      swipeRef.current?.swipeLeft()
    } else {
      swipeRef.current?.swipeRight()
    }
  }

  // =========================
  // KEYBOARD NAVIGATION
  // =========================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        triggerSwipe("left")
      }

      if (
        e.key === "ArrowRight"
      ) {
        triggerSwipe("right")
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [])

  return (
    <main className="relative flex h-[100dvh] items-center justify-center overflow-hidden touch-none bg-gradient-to-br from-zinc-900 to-black">
      {/* BG BARU */}
      {bg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition:
              "center",
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
            backgroundPosition:
              "center",
            filter: "blur(40px)",
            transform: "scale(1.2)",
            opacity: 0,
            transition:
              "opacity 0.4s ease",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* overlay */}
      <div className="absolute inset-0 bg-black/30 z-[3]" />

      {/* kiri atas */}
      <div
        className="absolute top-5 left-8 z-20 flex items-center gap-3 cursor-pointer transition-transform hover:scale-105"
        onClick={() =>
          router.push("/")
        }
      >
        <img
          src="/android-chrome-512x512.png"
          alt="NyamKuy Logo"
          className="h-12 w-12 object-contain drop-shadow-lg"
        />

        <span className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">
          NyamKuy
        </span>
      </div>

      {/* kanan atas */}
      <div
        ref={profileRef}
        className="absolute top-5 right-5 z-20"
      >
        {authorized ? (
          <div className="relative">
            {/* tombol profile */}
            <button
              onClick={() =>
                setOpenProfile(
                  !openProfile
                )
              }
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-white/85
                shadow-lg
                backdrop-blur
                transition
                hover:scale-105
              "
            >
              <User className="h-6 w-6 text-black" />
            </button>

            {/* dropdown */}
            {openProfile && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-44
                  overflow-hidden
                  rounded-2xl
                  bg-white/95
                  shadow-2xl
                  backdrop-blur
                "
              >
                <button
                  onClick={() => {
                    setOpenProfile(
                      false
                    )

                    router.push(
                      "/profile"
                    )
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-left
                    text-black
                    hover:bg-black/5
                  "
                >
                  <User className="h-5 w-5" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setOpenProfile(
                      false
                    )

                    router.push(
                      "/leaderboard"
                    )
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-left
                    text-black
                    hover:bg-black/5
                  "
                >
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </button>

                <button
                  onClick={
                    handleLogout
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-left
                    text-red-500
                    hover:bg-red-50
                  "
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            asChild
            variant="secondary"
            className="bg-white/80 text-black hover:bg-white"
          >
            <a href="/auth">
              Log In /
              Register
            </a>
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/leaderboard")}
        className="
          absolute
          bottom-5
          right-5
          z-20
          flex
          h-11
          items-center
          gap-2
          rounded-full
          bg-white/85
          px-4
          text-sm
          font-extrabold
          text-black
          shadow-lg
          backdrop-blur
          transition
          hover:scale-105
          active:scale-95
        "
      >
        <Trophy className="h-4 w-4" />
        Ranking
      </button>

      {/* CONTENT */}
      <div className="relative z-10 flex -translate-y-5 flex-col items-center gap-3 md:translate-y-0 md:gap-4">
        {/* CARD + PANAH */}
        <div className="relative inline-block">
          {/* SWIPE CARD */}
          <SwipeCards
            ref={swipeRef}
            setBg={setBg}
            setOldBg={setOldBg}
            onCardClick={
              handleCardClick
            }
          />

          {/* PANAH KIRI */}
          <button
            onMouseEnter={() =>
              setHoverLeft(true)
            }
            onMouseLeave={() =>
              setHoverLeft(false)
            }
            onClick={() =>
              triggerSwipe(
                "left"
              )
            }
            className="
              absolute
              left-[-60px]
              top-1/2
              z-50
              -translate-y-1/2
              rounded-full
              bg-white/10
              p-2
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-110
              active:scale-95
            "
            style={{
              opacity: hoverLeft
                ? 1
                : 0.4,
            }}
          >
            <ChevronRight
              className="
                h-10
                w-10
                rotate-180
                text-white
                drop-shadow-2xl
              "
            />
          </button>

          {/* PANAH KANAN */}
          <button
            onMouseEnter={() =>
              setHoverRight(true)
            }
            onMouseLeave={() =>
              setHoverRight(false)
            }
            onClick={() =>
              triggerSwipe(
                "right"
              )
            }
            className="
              absolute
              right-[-60px]
              top-1/2
              z-50
              -translate-y-1/2
              rounded-full
              bg-white/10
              p-2
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-110
              active:scale-95
            "
            style={{
              opacity: hoverRight
                ? 1
                : 0.4,
            }}
          >
            <ChevronRight
              className="
                h-10
                w-10
                text-white
                drop-shadow-2xl
              "
            />
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative w-[340px] max-w-[calc(100vw-32px)]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => searchInputRef.current?.focus()}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault()
                searchInputRef.current?.focus()
              }
            }}
            className="flex cursor-text items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-lg backdrop-blur transition hover:bg-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full">
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
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />

                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari resep..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none text-black placeholder:text-black/50"
            />
          </div>

          {/* DROPDOWN */}
          {search.trim() && (
            <div
              className="
                absolute
                left-0
                right-0
                bottom-[58px]
                z-30
                overflow-hidden
                rounded-2xl
                bg-white/95
                shadow-2xl
                backdrop-blur
              "
            >
              {loading && (
                <div className="px-4 py-3 text-sm text-black/60">
                  Mencari...
                </div>
              )}

              {!loading &&
                results.length ===
                  0 && (
                  <div className="px-4 py-3 text-sm text-black/60">
                    Resep tidak
                    ditemukan
                  </div>
                )}

              {!loading &&
                results.map(
                  (
                    item,
                    index
                  ) => {
                    const nama =
                      item.nama ||
                      item.title ||
                      "Tanpa nama"

                    const deskripsi =
                      item.deskripsi ||
                      item.description ||
                      "Tidak ada deskripsi"

                    return (
                      <button
                        key={`${nama}-${index}`}
                        type="button"
                        onClick={() =>
                          openRecipe(
                            item
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          px-3
                          py-3
                          text-left
                          hover:bg-black/5
                          transition
                        "
                      >
                        <img
                          src={`/api/image/cropped?nama=${encodeURIComponent(
                            nama
                          )}`}
                          alt={nama}
                          className="
                            h-14
                            w-14
                            shrink-0
                            rounded-xl
                            object-cover
                            bg-black/10
                          "
                        />

                        <div className="min-w-0">
                          <div className="truncate font-semibold text-black">
                            {
                              nama
                            }
                          </div>

                          <div className="line-clamp-2 text-sm text-black/60">
                            {
                              deskripsi
                            }
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {[
                              item.category,
                              item.region,
                              item.difficulty,
                            ]
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((chip) => (
                                <span
                                  key={chip}
                                  className="rounded-full bg-black/6 px-2 py-0.5 text-[11px] font-bold text-black/55"
                                >
                                  {chip}
                                </span>
                              ))}

                            {item.cook_points && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700">
                                <Star size={11} fill="currentColor" />
                                +{item.cook_points}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  }
                )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
