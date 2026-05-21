"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, Suspense } from "react"
import { ArrowLeft } from "lucide-react"

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

  useEffect(() => {
    async function loadRecipe() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const res = await fetch(`/api/resep/${id}`)

        if (!res.ok) {
          throw new Error("Gagal mengambil detail resep")
        }

        const json = await res.json()
        setRecipe(json.data)
      } catch (err) {
        console.error(err)
        setRecipe(null)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [id])

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
    return (recipe?.sambal || [])
      .map((item) => item.nama)
      .filter(Boolean)
  }, [recipe])

  const langkah = useMemo(() => {
    return (recipe?.langkah || [])
      .map((item) => item.instruksi)
      .filter(Boolean)
  }, [recipe])

  const tips = recipe?.tips || []

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden font-sans">
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

      <h1
        className="relative z-10 text-center font-black tracking-widest uppercase mb-8 drop-shadow-lg
          text-4xl md:text-6xl lg:text-7xl"
        style={{
          color: "#f5e6d5",
          textShadow:
            "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12)",
          letterSpacing: "0.18em",
        }}
      >
        {nama}
      </h1>

      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl
          flex flex-col md:flex-row"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
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
              style={{
                background:
                  "radial-gradient(circle, #d4956a 0%, transparent 70%)",
              }}
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
            style={{
              color: "rgba(245,225,200,0.88)",
              maxWidth: 240,
            }}
          >
            <span
              className="font-semibold"
              style={{ color: "#f5e6d5" }}
            >
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
        </div>

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
                        background: "rgba(220,160,100,0.22)",
                        border: "1px solid rgba(220,160,100,0.4)",
                        color: "#e8b882",
                      }}
                    >
                      {i + 1}
                    </span>

                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "rgba(240,220,195,0.85)",
                      }}
                    >
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(240,220,195,0.7)" }}
              >
                Langkah membuat belum tersedia.
              </p>
            )}
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
      style={{
        color: "#e8b882",
        borderBottom: "1px solid rgba(220,160,100,0.25)",
      }}
    >
      {children}
    </h2>
  )
}

function IngredientList({ items, emptyText = "Belum tersedia" }) {
  if (!items || items.length === 0) {
    return (
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(240,220,195,0.7)" }}
      >
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
          style={{ color: "rgba(240,220,195,0.82)" }}
        >
          <span
            className="mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(220,160,100,0.6)" }}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

function LoadingText() {
  return (
    <p
      className="text-sm animate-pulse"
      style={{ color: "rgba(240,220,195,0.65)" }}
    >
      Memuat...
    </p>
  )
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#2e1a0e]">
          <div className="text-[#e8b882] text-lg tracking-widest animate-pulse">
            Memuat resep…
          </div>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  )
}