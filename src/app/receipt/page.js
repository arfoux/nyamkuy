"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useCallback, Suspense } from "react"
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChefHat,
  Clock3,
  Gauge,
  Home,
  MapPin,
  Sparkles,
  Tag,
  Users,
  X,
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
  const [confirmCookOpen, setConfirmCookOpen] = useState(false)

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
    setConfirmCookOpen(false)

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

  const rawCookPoints = Number(recipe?.cook_points ?? recipe?.poin ?? 10)
  const cookPoints = Number.isFinite(rawCookPoints) ? rawCookPoints : 10
  const metaItems = [
    recipe?.category ? { icon: Tag, label: recipe.category } : null,
    recipe?.region ? { icon: MapPin, label: recipe.region } : null,
    recipe?.difficulty ? { icon: Gauge, label: recipe.difficulty } : null,
    recipe?.duration_minutes
      ? { icon: Clock3, label: `${recipe.duration_minutes} menit` }
      : null,
    recipe?.servings ? { icon: Users, label: `${recipe.servings} porsi` } : null,
  ].filter(Boolean)

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center overflow-x-hidden p-3 font-sans md:p-5">
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

        @keyframes cookPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .cook-toast {
          animation: cookToastIn 0.42s ease both;
        }
      `}</style>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="absolute inset-0 z-0 bg-[#6b4a36]/50" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(220,185,155,0.25)_0%,rgba(30,15,8,0.72)_100%)]" />

      <div className="absolute left-5 top-5 z-30 flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          aria-label="Beranda"
          title="Beranda"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95"
        >
          <Home size={16} />
        </button>

        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          title="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95 md:w-auto md:px-4 md:gap-2"
        >
          <ArrowLeft size={16} />
          <span className="hidden md:inline text-sm font-medium">Kembali</span>
        </button>
      </div>

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

      {confirmCookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl p-4 text-white shadow-2xl"
            style={{
              background: "rgba(35,18,10,0.94)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                  Konfirmasi Masak
                </div>
                <div className="mt-2 text-xl font-black leading-tight">
                  {nama}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmCookOpen(false)}
                aria-label="Tutup konfirmasi"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-sm font-semibold leading-relaxed text-white/75">
              Catat resep ini sebagai sudah dimasak hari ini. Kuota harian tetap
              maksimal 3 masakan.
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmCookOpen(false)}
                className="h-11 flex-1 rounded-full bg-white/10 px-4 text-sm font-extrabold text-white transition hover:bg-white/20"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleCook}
                disabled={cooking}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold text-[#241306] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(250,204,21,0.98), rgba(234,88,12,0.94))",
                }}
              >
                <ChefHat size={18} />
                {cooking ? "Mencatat..." : `Masak +${cookPoints}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1
        className="relative z-10 mt-14 mb-3 max-w-[calc(100vw-96px)] truncate text-center text-2xl font-black uppercase drop-shadow-lg md:mt-4 md:mb-4 md:max-w-5xl md:text-5xl lg:text-6xl"
        style={{
          color: "#ffffff",
          textShadow: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12)",
          letterSpacing: "0.12em",
        }}
      >
        {nama}
      </h1>

      <div
  className="flex w-full flex-col rounded-3xl shadow-2xl overflow-hidden md:flex-row"
  style={{
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(12px) saturate(1.3)",
    WebkitBackdropFilter: "blur(12px) saturate(1.3)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
  }}
>

          {/* Panel Kiri (Keterangan dengan warna asli) */}
          <div
            className="relative flex w-full shrink-0 flex-col md:w-[32%] "
            style={{
              background: "rgba(40,20,10,0.55)",
            }}
          >
            {/* Mobile compact bar */}
            <div className="flex md:hidden flex-row items-center gap-2.5 px-2.5 py-2 w-full"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <img
                src={croppedUrl}
                alt={nama}
                className="w-10 h-10 rounded-full object-cover shrink-0"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.45)" }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "#f5e6d5" }}>
                  {nama}
                </div>
                {metaItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {metaItems.slice(0, 3).map(({ label }) => (
                      <span
                        key={label}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "rgba(245,230,215,0.85)",
                        }}
                      >
                        {label.replace(" menit", "m").replace(" porsi", "p")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmCookOpen(true)}
                  disabled={!id || loading || cooking}
                  className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{
                    background:
                      cookNotice?.type === "success"
                        ? "linear-gradient(135deg, rgba(22,163,74,0.96), rgba(5,150,105,0.92))"
                        : "linear-gradient(135deg, rgba(250,204,21,0.96), rgba(234,88,12,0.92))",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <ChefHat size={14} />
                  <span>+{cookPoints}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={!id || saving}
                  aria-label={saved ? "Batal simpan resep" : "Simpan resep"}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{
                    background: saved
                      ? "rgba(250,204,21,0.24)"
                      : "rgba(255,255,255,0.12)",
                    border: saved
                      ? "1px solid rgba(250,204,21,0.55)"
                      : "1px solid rgba(255,255,255,0.2)",
                    color: saved ? "#facc15" : "#ffffff",
                  }}
                >
                  <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Desktop full panel */}
            <div className="hidden md:flex md:h-full md:flex-col md:items-center md:gap-3 md:p-5 w-full"
              style={{
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {saveError && (
                <div className="w-full rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                  {saveError}
                </div>
              )}

              <div
                className="relative flex items-center justify-center"
                style={{ width: "100%", maxWidth: 280 }}
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
                    maxHeight: 250,
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

              <div
                className="flex flex-col w-full max-w-[270px] rounded-2xl p-4"
                style={{
                  maxWidth: "320px"
                }}
              >

              <p
                className="text-center text-xs leading-relaxed md:text-sm"
                style={{ color: "rgba(245,225,200,0.88)",}}
              >
                <span className="font-semibold" style={{ color: "#f5e6d5" }}>
                  {nama}
                </span>
                {" - "}
                {deskripsi}
              </p>

              {metaItems.length > 0 && (
                <div className=" mt-4 grid w-full grid-cols-2 gap-2">
                  {metaItems.slice(0, 4).map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-extrabold md:min-h-9 md:text-xs"
                      style={{
                        background: "rgba(255,255,255,0.09)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(245,230,215,0.92)",
                      }}
                    >
                      <Icon size={14} />
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className=" mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCookOpen(true)}
                  disabled={!id || loading || cooking}
                  className="relative flex h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-full px-4 text-sm font-extrabold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
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

                  <span className="shrink-0 rounded-full bg-black/20 px-2.5 py-1 text-xs">
                    +{cookPoints}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={!id || saving}
                  aria-label={saved ? "Batal simpan resep" : "Simpan resep"}
                  title={saved ? "Batal simpan" : "Simpan"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: saved
                      ? "rgba(250,204,21,0.24)"
                      : "rgba(255,255,255,0.12)",
                    border: saved
                      ? "1px solid rgba(250,204,21,0.55)"
                      : "1px solid rgba(255,255,255,0.2)",
                    color: saved ? "#facc15" : "#ffffff",
                  }}
                >
                  <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Panel Kanan (Menu resep dengan warna putih terang) */}
          <div className="w-full flex-1 min-h-0 p-4 md:w-[68%] md:p-6 md:overflow-y-auto">
            <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-7">
              <div className="flex flex-col gap-5">
                <div className="rounded-2xl p-4"
                  style={{
                    background: "rgba(30,15,8,0.55)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <SectionTitle>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fbbf24" }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      Bahan Utama
                    </span>
                  </SectionTitle>
                  {loading ? (
                    <LoadingText />
                  ) : (
                    <IngredientList items={bahanUtama} emptyText="Bahan belum tersedia" />
                  )}
                </div>

                {(loading || sambal.length > 0) && (
                  <div className="rounded-2xl p-4"
                    style={{
                      background: "rgba(30,15,8,0.55)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <SectionTitle>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fbbf24" }}><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/></svg>
                        Sambal / Pelengkap
                      </span>
                    </SectionTitle>
                    {loading ? (
                      <LoadingText />
                    ) : (
                      <IngredientList items={sambal} />
                    )}
                  </div>
                )}

                {tips.length > 0 && (
                  <div className="rounded-2xl p-4"
                    style={{
                      background: "rgba(30,15,8,0.55)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <SectionTitle>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fbbf24" }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        Tips
                      </span>
                    </SectionTitle>
                    <IngredientList items={tips} />
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4"
                style={{
                  background: "rgba(30,15,8,0.55)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <SectionTitle>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fbbf24" }}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                    Cara Membuat
                  </span>
                </SectionTitle>
                {loading ? (
                  <LoadingText />
                ) : langkah.length > 0 ? (
                  <div className="relative mt-2">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5"
                      style={{ background: "linear-gradient(to bottom, rgba(251,191,36,0.5), rgba(251,191,36,0.1))" }}
                    />
                    <ol className="space-y-5">
                      {langkah.map((step, i) => (
                        <li key={i} className="relative flex gap-4 pl-1">
                          <span
                            className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black mt-0.5 shadow-lg"
                            style={{
                              background: "linear-gradient(135deg, rgba(251,191,36,0.9), rgba(234,88,12,0.85))",
                              border: "1px solid rgba(255,255,255,0.3)",
                              color: "#241306",
                            }}
                          >
                            {i + 1}
                          </span>
                          <p
                            className="text-sm leading-relaxed pt-[3px]"
                            style={{ color: "rgba(255,255,255,0.92)" }}
                          >
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed mt-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Langkah membuat belum tersedia.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

function SectionTitle({ children }) {
  return (
    <h2
      className="text-xs font-black uppercase tracking-[0.22em] pb-2.5 mb-3"
      style={{
        color: "rgba(255,255,255,0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {children}
    </h2>
  )
}

function IngredientList({ items, emptyText = "Belum tersedia" }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
        {emptyText}
      </p>
    )
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm group"
          style={{ color: "rgba(255,255,255,0.88)" }}
        >
          <span
            className="mt-[7px] w-[5px] h-[5px] rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-150"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.8), rgba(234,88,12,0.7))",
              boxShadow: "0 0 6px rgba(251,191,36,0.25)",
            }}
          />
          <span className="transition-all duration-200 group-hover:translate-x-0.5">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LoadingText() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="h-3.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", width: "85%" }} />
      <div className="h-3.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", width: "65%" }} />
      <div className="h-3.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", width: "75%" }} />
    </div>
  )
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#2e1a0e]">
          <div className="text-white text-lg tracking-widest animate-pulse">
            Memuat resep...
          </div>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  )
}
