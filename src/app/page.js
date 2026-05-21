"use client"

import SwipeCards from "@/components/SwipeCards"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  User,
  LogOut,
  ChevronRight,
} from "lucide-react"

export default function Page() {
  const [bg, setBg] = useState(null)
  const [oldBg, setOldBg] = useState(null)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // auth state
  const [authorized, setAuthorized] = useState(false)

  // dropdown profile
  const [openProfile, setOpenProfile] = useState(false)

  const profileRef = useRef(null)

  const router = useRouter()

  // cek login dari server
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        })

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

  // tutup dropdown ketika klik luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setOpenProfile(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // logout
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        setAuthorized(false)
        setOpenProfile(false)

        router.push("/auth")
        router.refresh()
      }
    } catch (err) {
      console.error("Logout gagal:", err)
    }
  }

  // handleCardClick
  function handleCardClick(card) {
    const params = new URLSearchParams({
      id: card.id,
      nama: card.title,
      deskripsi: card.description,
    })

    router.push(`/receipt?${params.toString()}`)
  }

  // openRecipe
  function openRecipe(item) {
    const params = new URLSearchParams({
      id: item.id,
      nama: item.nama || item.title,
      deskripsi: item.deskripsi || item.description || "",
    })

    router.push(`/receipt?${params.toString()}`)
  }

  // search resep
  useEffect(() => {
    const keyword = search.trim()

    if (!keyword) {
      setResults([])
      setLoading(false)
      return
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `/api/resep/search?q=${encodeURIComponent(keyword)}`
        )

        const data = await res.json()

        const list = Array.isArray(data)
          ? data
          : data.data || data.results || data.resep || []

        setResults(list)
      } catch (err) {
        console.error(err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(delay)
  }, [search])

  return (
    <main className="relative flex h-[100dvh] items-center justify-center overflow-hidden touch-none">
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

      {/* kiri atas */}
      <div
        className="absolute top-5 left-8 z-20 flex items-center gap-3 cursor-pointer transition-transform hover:scale-105"
        onClick={() => router.push("/")}
      >
        <img
          src="/logo.png"
          alt="NyamKuy Logo"
          className="h-12 w-12 object-contain drop-shadow-lg"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
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
              onClick={() => setOpenProfile(!openProfile)}
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
                  animate-in
                  fade-in
                  slide-in-from-top-2
                  duration-200
                "
              >
                <button
                  onClick={() => {
                    setOpenProfile(false)
                    router.push("/profile")
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
                    transition
                  "
                >
                  <User className="h-5 w-5" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
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
                    transition
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
            <a href="/auth">Log In / Register</a>
          </Button>
        )}
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* CARD + PANAH */}
        <div className="group relative inline-block">
          <SwipeCards
            setBg={setBg}
            setOldBg={setOldBg}
            onCardClick={handleCardClick}
          />

          {/* PANAH KIRI */}
          <div
            className="
              pointer-events-none
              absolute
              left-[-45px]
              top-1/2
              -translate-y-1/2
              z-50
              text-white/30
              transition-all
              duration-300
              group-hover:text-white
              group-hover:scale-110
            "
          >
            <ChevronRight className="h-10 w-10 rotate-180 drop-shadow-2xl" />
          </div>

          {/* PANAH KANAN */}
          <div
            className="
              pointer-events-none
              absolute
              right-[-45px]
              top-1/2
              -translate-y-1/2
              z-50
              text-white/30
              transition-all
              duration-300
              group-hover:text-white
              group-hover:scale-110
            "
          >
            <ChevronRight className="h-10 w-10 drop-shadow-2xl" />
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-[340px]">
          <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-lg backdrop-blur">
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Cari resep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                animate-in
                fade-in
                slide-in-from-bottom-2
                duration-200
              "
            >
              {loading && (
                <div className="px-4 py-3 text-sm text-black/60">
                  Mencari...
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-black/60">
                  Resep tidak ditemukan
                </div>
              )}

              {!loading &&
                results.map((item, index) => {
                  const nama = item.nama || item.title || "Tanpa nama"

                  const deskripsi =
                    item.deskripsi ||
                    item.description ||
                    "Tidak ada deskripsi"

                  return (
                    <button
                      key={`${nama}-${index}`}
                      type="button"
                      onClick={() => openRecipe(item)}
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />

                      <div className="min-w-0">
                        <div className="truncate font-semibold text-black">
                          {nama}
                        </div>

                        <div className="line-clamp-2 text-sm text-black/60">
                          {deskripsi}
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}