"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useCallback, Suspense } from "react"
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react"

const FALLBACK = {
  nama: "Nasi Pecel",
  deskripsi:
    "Makanan tradisional Jawa berupa rebusan berbagai macam sayuran yang disiram dengan sambal kacang kental.",
}

function ReceiptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const id = searchParams.get("id")
  const namaParam = searchParams.get("nama") || FALLBACK.nama
  const deskripsiParam = searchParams.get("deskripsi") || FALLBACK.deskripsi

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [cooking, setCooking] = useState(false)
  const [cookNotice, setCookNotice] = useState(null)

  useEffect(() => {
    async function loadRecipe() {
      setSaveError("")
      setCookNotice(null)
      setSaved(false)

      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setImgLoaded(false)
        setImgError(false)

        const res = await fetch(`/api/resep/${id}`)
        if (!res.ok) throw new Error("Gagal mengambil detail resep")
        const json = await res.json()
        setRecipe(json.data)
        setSaved(Boolean(json.data?.is_saved))
      } catch (err) {
        console.error(err)
        setRecipe(null)
      } finally {
        setLoading(false)
      }
    }
    loadRecipe()
  }, [id])

  const navigateTo = useCallback(
    (direction) => {
      if (!id) return
      const currentId = parseInt(id, 10)
      if (isNaN(currentId)) return
      const nextId = direction === "next" ? currentId + 1 : currentId - 1
      if (nextId < 1) return
      router.push(`?id=${nextId}`)
    },
    [id, router]
  )

  const handleToggleSave = useCallback(async () => {
    if (!id || saving) return

    setSaving(true)
    setSaveError("")

    try {
      const res = await fetch(`/api/resep/${id}/simpan`, {
        method: saved ? "DELETE" : "POST",
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        router.push(`/auth?next=${encodeURIComponent(`/receipt?id=${id}`)}`)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui simpan")
      }

      setSaved(Boolean(data.saved))
    } catch (err) {
      setSaveError(err.message || "Gagal memperbarui simpan")
    } finally {
      setSaving(false)
    }
  }, [id, router, saved, saving])

  const handleCook = useCallback(async () => {
    if (!id || cooking) return

    setCooking(true)
    setCookNotice(null)

    try {
      const res = await fetch(`/api/resep/${id}/masak`, {
        method: "POST",
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        router.push(`/auth?next=${encodeURIComponent(`/receipt?id=${id}`)}`)
        return
      }

      if (res.status === 429) {
        setCookNotice({
          type: "limit",
          title: "Jatah masak hari ini penuh",
          text: `${data.cooked_today || 3}/${data.daily_limit || 3} masakan sudah tercatat hari ini.`,
        })
        return
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal mencatat masakan")
      }

      setCookNotice({
        type: "success",
        title: `+${data.points_awarded} poin`,
        text: `${data.cooked_today}/${data.daily_limit} masakan hari ini tercatat.`,
      })
    } catch (err) {
      setCookNotice({
        type: "error",
        title: "Belum bisa dicatat",
        text: err.message || "Gagal mencatat masakan",
      })
    } finally {
      setCooking(false)
    }
  }, [cooking, id, router])

  useEffect(() => {
    if (!cookNotice) return

    const timer = setTimeout(() => {
      setCookNotice(null)
    }, 3200)

    return () => clearTimeout(timer)
  }, [cookNotice])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") navigateTo("next")
      if (e.key === "ArrowLeft") navigateTo("prev")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigateTo])

  const nama = recipe?.nama || namaParam
  const deskripsi = recipe?.deskripsi || deskripsiParam

  const bgUrl = `/api/image/base?nama=${encodeURIComponent(nama)}`
  const croppedUrl = `/api/image/cropped?nama=${encodeURIComponent(nama)}`

  const bahanUtama = useMemo(() => {
    const bahan = recipe?.bahan || []
    const bumbu = recipe?.bumbu || []
    const komponen = recipe?.komponen || []
    const lalapan = recipe?.lalapan || []
    return [
      ...bahan.map((item) => item.nama),
      ...bumbu.map((item) => item.nama),
      ...komponen.map((item) => item.nama),
      ...lalapan,
    ].filter(Boolean)
  }, [recipe])

  const sambal = useMemo(() => {
    return (recipe?.sambal || []).map((item) => item.nama).filter(Boolean)
  }, [recipe])

  const langkah = useMemo(() => {
    return (recipe?.langkah || []).map((item) => item.instruksi).filter(Boolean)
  }, [recipe])

  const tips = recipe?.tips || []

  const currentId = id ? parseInt(id, 10) : null
  const canGoPrev = currentId !== null && !isNaN(currentId) && currentId > 1
  const canGoNext = currentId !== null && !isNaN(currentId)
  const rawCookPoints = Number(recipe?.cook_points ?? recipe?.poin ?? 10)
  const cookPoints = Number.isFinite(rawCookPoints) ? rawCookPoints : 10

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden font-sans">
      <style>{`
        @keyframes cookToastIn {
          0% {
            opacity: 0;
            transform: translate(-50%, 16px) scale(0.94);
          }

          16% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.02);
          }

          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes cookButtonGlow {
          0%,
          100% {
            box-shadow: 0 14px 34px rgba(22, 163, 74, 0.22);
          }

          50% {
            box-shadow: 0 18px 44px rgba(22, 163, 74, 0.36);
          }
        }

        .cook-toast {
          animation: cookToastIn 0.42s ease both;
        }

        .cook-ready {
          animation: cookButtonGlow 1.8s ease-in-out infinite;
        }
      `}</style>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="absolute inset-0 z-0 backdrop-blur-3xl bg-[#6b4a36]/50" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(220,185,155,0.25)_0%,rgba(30,15,8,0.72)_100%)]" />

      <button
        onClick={() => router.back()}
        className="absolute top-5 left-5 z-30 flex items-center gap-2 px-4 py-2 rounded-full
          bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20
          text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <ArrowLeft size={15} />
        Kembali
      </button>

      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        <div
          className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-lg backdrop-blur-sm"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <Star size={16} fill="#facc15" color="#facc15" />
          <span>+{cookPoints} poin</span>
        </div>

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={!id || saving}
          aria-label={saved ? "Batal simpan resep" : "Simpan resep"}
          title={saved ? "Batal simpan" : "Simpan"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: saved
              ? "rgba(250,204,21,0.24)"
              : "rgba(255,255,255,0.12)",
            border: saved
              ? "1px solid rgba(250,204,21,0.55)"
              : "1px solid rgba(255,255,255,0.22)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            color: saved ? "#facc15" : "#ffffff",
          }}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {saveError && (
        <div className="absolute top-[74px] right-5 z-30 max-w-[260px] rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white shadow-lg">
          {saveError}
        </div>
      )}

      {cookNotice && (
        <div
          className="cook-toast fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl backdrop-blur-md"
          style={{
            background:
              cookNotice.type === "success"
                ? "linear-gradient(135deg, rgba(22,163,74,0.94), rgba(5,150,105,0.92))"
                : cookNotice.type === "limit"
                  ? "linear-gradient(135deg, rgba(217,119,6,0.94), rgba(180,83,9,0.92))"
                  : "linear-gradient(135deg, rgba(220,38,38,0.94), rgba(185,28,28,0.92))",
            border: "1px solid rgba(255,255,255,0.24)",
          }}
        >
          {cookNotice.type === "success" ? (
            <Sparkles size={22} />
          ) : (
            <ChefHat size={22} />
          )}

          <div>
            <div className="text-sm font-extrabold leading-tight">
              {cookNotice.title}
            </div>
            <div className="text-xs font-medium text-white/85">
              {cookNotice.text}
            </div>
          </div>
        </div>
      )}

      <h1
        className="relative z-10 mt-20 text-center font-black tracking-widest uppercase mb-8 drop-shadow-lg md:mt-0
          text-4xl md:text-6xl lg:text-7xl"
        style={{
          color: "#ffffff",
          textShadow: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12)",
          letterSpacing: "0.18em",
        }}
      >
        {nama}
      </h1>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Tombol Kiri */}
        <button
          onClick={() => navigateTo("prev")}
          disabled={!canGoPrev}
          aria-label="Resep sebelumnya"
          className="absolute -left-14 top-1/2 -translate-y-1/2 z-20 hidden md:flex
            w-11 h-11 rounded-full items-center justify-center
            transition-all duration-200 hover:scale-110 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(8px)",
            color: canGoPrev ? "#ffffff" : "rgba(255,255,255,0.3)",
            opacity: 1,
            pointerEvents: "auto",
            cursor: canGoPrev ? "pointer" : "not-allowed",
            transform: "translateY(-50%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Tombol Kanan */}
        <button
          onClick={() => navigateTo("next")}
          disabled={!canGoNext}
          aria-label="Resep berikutnya"
          className="absolute -right-14 top-1/2 -translate-y-1/2 z-20 hidden md:flex
            w-11 h-11 rounded-full items-center justify-center
            transition-all duration-200 hover:scale-110 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(8px)",
            color: canGoNext ? "#ffffff" : "rgba(255,255,255,0.3)",
            opacity: 1,
            pointerEvents: "auto",
            cursor: canGoNext ? "pointer" : "not-allowed",
            transform: "translateY(-50%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <ChevronRight size={22} />
        </button>

        {/* Kartu Resep */}
        <div
          className="w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(28px) saturate(1.4)",
            WebkitBackdropFilter: "blur(28px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Panel Kiri (Keterangan dengan warna asli) */}
          <div
            className="w-full md:w-[38%] flex flex-col items-center justify-start py-10 px-6 md:px-8 gap-6 relative"
            style={{
              background: "rgba(40,20,10,0.45)",
              backdropFilter: "blur(10px)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{ width: "100%", maxWidth: 260 }}
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ background: "radial-gradient(circle, #d4956a 0%, transparent 70%)" }}
              />
              <img
                src={croppedUrl}
                alt={nama}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className="relative z-10 w-full object-contain"
                style={{
                  maxHeight: 280,
                  filter: imgLoaded
                    ? "drop-shadow(0 12px 32px rgba(0,0,0,0.55)) drop-shadow(0 0 8px rgba(220,160,100,0.35))"
                    : "none",
                  opacity: imgLoaded ? 1 : 0,
                  transition: "opacity 0.5s ease",
                }}
              />
              {!imgLoaded && !imgError && (
                <div
                  className="absolute inset-0 rounded-2xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              )}
            </div>

            <p
              className="text-center text-sm md:text-[14.5px] leading-relaxed"
              style={{ color: "rgba(245,225,200,0.88)", maxWidth: 240 }}
            >
              <span className="font-semibold" style={{ color: "#f5e6d5" }}>
                {nama}
              </span>
              {" — "}
              {deskripsi}
            </p>

            <div
              className="px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(245,200,160,0.8)",
                letterSpacing: "0.15em",
              }}
            >
              Resep Tradisional
            </div>

            <button
              type="button"
              onClick={handleCook}
              disabled={!id || loading || cooking}
              className="cook-ready relative flex h-12 w-full max-w-[245px] items-center justify-between gap-3 rounded-full px-4 text-sm font-extrabold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background:
                  cookNotice?.type === "success"
                    ? "linear-gradient(135deg, rgba(22,163,74,0.96), rgba(5,150,105,0.92))"
                    : "linear-gradient(135deg, rgba(250,204,21,0.96), rgba(234,88,12,0.92))",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow:
                  "0 16px 42px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                {cookNotice?.type === "success" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <ChefHat size={19} />
                )}
                <span className="truncate">
                  {cooking
                    ? "Mencatat..."
                    : cookNotice?.type === "success"
                      ? "Masakan tercatat"
                      : "Masak sekarang"}
                </span>
              </span>

              <span className="shrink-0 rounded-full bg-black/18 px-2.5 py-1 text-xs">
                +{cookPoints}
              </span>
            </button>
          </div>

          {/* Panel Kanan (Menu resep dengan warna putih terang) */}
          <div className="w-full md:w-[62%] p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div>
              <SectionTitle>Bahan Utama</SectionTitle>
              {loading ? (
                <LoadingText />
              ) : (
                <IngredientList items={bahanUtama} emptyText="Bahan belum tersedia" />
              )}

              <div className="mt-8">
                <SectionTitle>Sambal / Pelengkap</SectionTitle>
                {loading ? (
                  <LoadingText />
                ) : (
                  <IngredientList items={sambal} emptyText="Sambal belum tersedia" />
                )}
              </div>

              {tips.length > 0 && (
                <div className="mt-8">
                  <SectionTitle>Tips</SectionTitle>
                  <IngredientList items={tips} />
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Cara Membuat</SectionTitle>
              {loading ? (
                <LoadingText />
              ) : langkah.length > 0 ? (
                <ol className="space-y-5 mt-1">
                  {langkah.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.4)",
                          color: "#ffffff",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#ffffff" }}
                      >
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Langkah membuat belum tersedia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2
      className="text-sm font-bold uppercase tracking-[0.2em] mb-3 pb-2"
      style={{ color: "#ffffff", borderBottom: "1px solid rgba(255,255,255,0.3)" }}
    >
      {children}
    </h2>
  )
}

function IngredientList({ items, emptyText = "Belum tersedia" }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
        {emptyText}
      </p>
    )
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm"
          style={{ color: "#ffffff" }}
        >
          <span
            className="mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.8)" }}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

function LoadingText() {
  return (
    <p className="text-sm animate-pulse" style={{ color: "rgba(255,255,255,0.7)" }}>
      Memuat...
    </p>
  )
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#2e1a0e]">
          <div className="text-white text-lg tracking-widest animate-pulse">
            Memuat resep…
          </div>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  )
}
