"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  ChefHat,
  Clock3,
  Flame,
  Medal,
  RefreshCcw,
  Sparkles,
  Trophy,
} from "lucide-react"

function getFoodImage(nama) {
  return `/api/image/cropped?nama=${encodeURIComponent(nama || "")}`
}

function rankTone(index) {
  if (index === 0) return "bg-amber-500 text-white"
  if (index === 1) return "bg-zinc-400 text-white"
  if (index === 2) return "bg-orange-700 text-white"
  return "bg-black/6 text-black/65"
}

function EmptyState({ title, text }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-white px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
        <Trophy size={22} />
      </div>
      <div className="text-base font-black text-black">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/55">
        {text}
      </p>
    </div>
  )
}

function UserRow({ item, index }) {
  const name = item.display_name || item.email?.split("@")[0] || "Pengguna"
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/8 bg-white p-3 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${rankTone(index)}`}
      >
        {index + 1}
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-black text-white">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-black">{name}</div>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-black/50">
          <ChefHat size={13} />
          {item.cooked_count || 0} masakan tercatat
        </div>
      </div>

      <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
        {item.total_points || 0} poin
      </div>
    </div>
  )
}

function RecipeRow({ item, index, type, onOpen }) {
  const count =
    type === "saved"
      ? item.saved_count || 0
      : item.cooked_count || 0

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex w-full items-center gap-3 rounded-xl border border-black/8 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${rankTone(index)}`}
      >
        {index + 1}
      </div>

      <img
        src={getFoodImage(item.nama)}
        alt={item.nama}
        className="h-14 w-14 shrink-0 rounded-xl bg-black/5 object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-black">{item.nama}</div>
        <div className="mt-1 line-clamp-1 text-xs font-semibold text-black/50">
          {[item.category, item.region, item.difficulty]
            .filter(Boolean)
            .join(" / ") || item.deskripsi || "Resep NyamKuy"}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
        {type === "saved" ? <Bookmark size={13} /> : <ChefHat size={13} />}
        {count}
      </div>
    </button>
  )
}

function Spotlight({ data, onOpen }) {
  const topUser = data.users?.[0]
  const topCooked = data.cooked_recipes?.[0]
  const topSaved = data.saved_recipes?.[0]

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl bg-black p-5 text-white shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-black uppercase tracking-wider text-white/60">
            Top Koki
          </div>
          <Medal size={22} />
        </div>
        <div className="text-3xl font-black leading-none">
          {topUser?.display_name || "Belum ada"}
        </div>
        <div className="mt-3 text-sm font-semibold text-white/65">
          {topUser ? `${topUser.total_points} poin` : "Mulai masak untuk masuk ranking."}
        </div>
      </div>

      <button
        type="button"
        onClick={() => topCooked && onOpen(topCooked)}
        className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-black uppercase tracking-wider text-black/50">
            Paling Dimasak
          </div>
          <Flame size={22} />
        </div>
        <div className="text-2xl font-black text-black">
          {topCooked?.nama || "Belum ada"}
        </div>
        <div className="mt-3 text-sm font-semibold text-black/55">
          {topCooked
            ? `${topCooked.cooked_count} kali dimasak`
            : "Data akan muncul setelah user mulai memasak."}
        </div>
      </button>

      <button
        type="button"
        onClick={() => topSaved && onOpen(topSaved)}
        className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-black uppercase tracking-wider text-black/50">
            Paling Disimpan
          </div>
          <Bookmark size={22} />
        </div>
        <div className="text-2xl font-black text-black">
          {topSaved?.nama || "Belum ada"}
        </div>
        <div className="mt-3 text-sm font-semibold text-black/55">
          {topSaved
            ? `${topSaved.saved_count} simpanan`
            : "Data akan muncul setelah user menyimpan resep."}
        </div>
      </button>
    </section>
  )
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")
  const [period, setPeriod] = useState("week")
  const [data, setData] = useState({
    users: [],
    saved_recipes: [],
    cooked_recipes: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatedAt, setGeneratedAt] = useState(null)

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(`/api/leaderboard?limit=30&period=${period}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Gagal memuat leaderboard")
      }

      setData(json.data)
      setGeneratedAt(json.meta.generated_at)
    } catch (err) {
      setError(err.message || "Gagal memuat leaderboard")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  const currentItems = useMemo(() => {
    if (activeTab === "users") return data.users || []
    if (activeTab === "cooked") return data.cooked_recipes || []
    return data.saved_recipes || []
  }, [activeTab, data])

  function openRecipe(recipe) {
    if (!recipe?.id) return
    router.push(`/receipt?id=${recipe.id}`)
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowLeft size={16} />
            Beranda
          </button>

          <button
            type="button"
            onClick={loadLeaderboard}
            className="flex h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCcw size={15} />
            Refresh
          </button>
        </div>

        <section className="mb-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-black/45">
            <Trophy size={18} />
            Leaderboard Global
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Papan ranking dapur NyamKuy.
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-black/55 md:text-base">
            Lihat koki paling aktif, resep yang paling sering dimasak, dan
            resep yang paling banyak disimpan. Mode mingguan memberi ruang
            untuk user baru ikut naik.
          </p>
        </section>

        <div className="mb-8 flex w-full justify-center">
          <div className="flex w-full rounded-2xl bg-white p-1 shadow-sm md:w-fit">
            {[
              ["week", "Mingguan", CalendarDays],
              ["all", "Sepanjang Masa", Trophy],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition md:flex-none ${
                  period === key
                    ? "bg-black text-white"
                    : "text-black/55 hover:text-black"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Spotlight data={data} onOpen={openRecipe} />
        </div>

        <section className="rounded-2xl bg-white/70 p-3 shadow-sm md:p-4">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
              {[
                ["users", "Top Koki", Sparkles],
                ["cooked", "Paling Dimasak", ChefHat],
                ["saved", "Paling Disimpan", Bookmark],
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold transition ${
                    activeTab === key
                      ? "bg-black text-white"
                      : "text-black/55 hover:text-black"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-black/45">
              <Clock3 size={14} />
              {generatedAt
                ? `${period === "week" ? "Mingguan" : "Semua waktu"} / ${new Date(generatedAt).toLocaleTimeString("id-ID")}`
                : "Menunggu data"}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm font-black uppercase tracking-[0.24em] text-black/40">
              Memuat leaderboard...
            </div>
          ) : currentItems.length === 0 ? (
            <EmptyState
              title="Ranking masih kosong"
              text="Data akan muncul setelah user mulai menyimpan resep atau mencatat masakan."
            />
          ) : (
            <div className="grid gap-3">
              {activeTab === "users" &&
                currentItems.map((item, index) => (
                  <UserRow key={item.id} item={item} index={index} />
                ))}

              {activeTab === "cooked" &&
                currentItems.map((item, index) => (
                  <RecipeRow
                    key={item.id}
                    item={item}
                    index={index}
                    type="cooked"
                    onOpen={openRecipe}
                  />
                ))}

              {activeTab === "saved" &&
                currentItems.map((item, index) => (
                  <RecipeRow
                    key={item.id}
                    item={item}
                    index={index}
                    type="saved"
                    onOpen={openRecipe}
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
