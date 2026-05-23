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
  Pencil,
  Save,
  Sparkles,
  Star,
  Trophy,
  User,
  X,
} from "lucide-react"

function getFoodImage(nama) {
  return `/api/image/cropped?nama=${encodeURIComponent(nama || "")}`
}

function formatDate(value) {
  if (!value) return "Belum ada"

  const date = new Date(Number(value))
  if (Number.isNaN(date.getTime())) return "Belum ada"

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getInitial(name) {
  return (name || "P").trim().charAt(0).toUpperCase()
}

function StatCard({ icon: Icon, label, value, tone = "dark" }) {
  const tones = {
    dark: {
      bg: "#111827",
      fg: "#ffffff",
      soft: "rgba(255,255,255,0.12)",
    },
    green: {
      bg: "#0f766e",
      fg: "#ffffff",
      soft: "rgba(255,255,255,0.14)",
    },
    amber: {
      bg: "#b45309",
      fg: "#ffffff",
      soft: "rgba(255,255,255,0.14)",
    },
    blue: {
      bg: "#1d4ed8",
      fg: "#ffffff",
      soft: "rgba(255,255,255,0.14)",
    },
  }

  const color = tones[tone]

  return (
    <div
      className="rounded-xl p-4 shadow-sm"
      style={{ background: color.bg, color: color.fg }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: color.soft }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="text-3xl font-black leading-none">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-75">
        {label}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-white/70 px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
        <Icon size={22} />
      </div>
      <div className="text-base font-bold text-black">{title}</div>
      <div className="mt-1 max-w-sm text-sm leading-relaxed text-black/55">
        {text}
      </div>
    </div>
  )
}

function MetaChips({ recipe }) {
  const chips = [
    recipe.category,
    recipe.region,
    recipe.difficulty,
    recipe.duration_minutes ? `${recipe.duration_minutes} menit` : null,
    recipe.servings ? `${recipe.servings} porsi` : null,
  ].filter(Boolean)

  if (chips.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.slice(0, 4).map((chip) => (
        <span
          key={chip}
          className="rounded-full bg-black/6 px-2 py-1 text-[11px] font-bold text-black/55"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

function RecipeCard({ recipe, action, onOpen }) {
  const points = Number(recipe.cook_points ?? recipe.points_awarded ?? 10)

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onOpen(recipe)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
          <img
            src={getFoodImage(recipe.nama)}
            alt={recipe.nama}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            <Star size={12} fill="#facc15" color="#facc15" />
            +{Number.isFinite(points) ? points : 10}
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-extrabold text-black">
            {recipe.nama}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-black/58">
            {recipe.deskripsi || "Resep tersimpan di dapur kamu."}
          </p>
          <MetaChips recipe={recipe} />
        </div>
      </button>

      {action && (
        <div className="border-t border-black/8 px-4 py-3">{action}</div>
      )}
    </article>
  )
}

function CookHistoryItem({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen({ id: item.resep_id, nama: item.nama })}
      className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={getFoodImage(item.nama)}
        alt={item.nama}
        className="h-14 w-14 shrink-0 rounded-lg object-cover bg-black/5"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold text-black">
          {item.nama}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-black/55">
          <Clock3 size={13} />
          {formatDate(item.cooked_at)}
          {item.category ? ` / ${item.category}` : ""}
        </div>
      </div>

      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
        +{item.points_awarded}
      </div>
    </button>
  )
}

function BadgeItem({ badge }) {
  const percent = badge.target
    ? Math.min(100, Math.round((Number(badge.progress || 0) / badge.target) * 100))
    : 0

  return (
    <div
      className={`rounded-xl border p-4 ${
        badge.unlocked
          ? "border-emerald-200 bg-emerald-50"
          : "border-black/8 bg-[#f6f7fb]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            badge.unlocked ? "bg-emerald-600 text-white" : "bg-black/8 text-black/45"
          }`}
        >
          <Medal size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-black">{badge.title}</div>
          <div className="mt-1 text-xs font-semibold leading-relaxed text-black/52">
            {badge.text}
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8">
        <div
          className={badge.unlocked ? "h-full bg-emerald-600" : "h-full bg-black/30"}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState("saved")
  const [editingName, setEditingName] = useState(false)
  const [displayNameDraft, setDisplayNameDraft] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [unsavingId, setUnsavingId] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setMessage(null)

      const res = await fetch("/api/profile", {
        credentials: "include",
      })

      if (res.status === 401) {
        router.replace("/auth?next=/profile")
        return
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat profile")
      }

      setProfile(data)
      setDisplayNameDraft(data.user.display_name || "")
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat profile",
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const stats = profile?.stats || {}
  const user = profile?.user || {}
  const savedRecipes = profile?.saved_recipes || []
  const cookedRecipes = profile?.cooked_recipes || []
  const badges = profile?.badges || []
  const categoryCounts = profile?.category_counts || []

  const todayPercent = useMemo(() => {
    const dailyLimit = Number(stats.daily_limit || 3)
    const cookedToday = Number(stats.cooked_today || 0)

    if (!dailyLimit) return 0
    return Math.min(100, Math.round((cookedToday / dailyLimit) * 100))
  }, [stats.cooked_today, stats.daily_limit])

  function openRecipe(recipe) {
    const params = new URLSearchParams({
      id: recipe.id || recipe.resep_id,
      nama: recipe.nama || "",
      deskripsi: recipe.deskripsi || "",
    })

    router.push(`/receipt?${params.toString()}`)
  }

  async function handleSaveName() {
    if (savingName) return

    setSavingName(true)
    setMessage(null)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayNameDraft,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan nama")
      }

      setProfile((current) => ({
        ...current,
        user: {
          ...current.user,
          display_name: data.display_name,
        },
      }))

      setEditingName(false)
      setMessage({
        type: "success",
        text: "Nama dapur disimpan.",
      })
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan nama",
      })
    } finally {
      setSavingName(false)
    }
  }

  async function handleUnsave(recipeId) {
    if (unsavingId) return

    setUnsavingId(recipeId)
    setMessage(null)

    try {
      const res = await fetch(`/api/resep/${recipeId}/simpan`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus simpanan")
      }

      setProfile((current) => ({
        ...current,
        stats: {
          ...current.stats,
          saved_count: Math.max(0, Number(current.stats.saved_count || 0) - 1),
        },
        saved_recipes: current.saved_recipes.filter(
          (recipe) => recipe.id !== recipeId
        ),
      }))
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menghapus simpanan",
      })
    } finally {
      setUnsavingId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] px-5 py-8 text-black">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-black/45">
            Memuat Dapur Saya...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowLeft size={16} />
            Beranda
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/leaderboard")}
              className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Trophy size={16} />
              Ranking
            </button>

            <div className="rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm">
              Dapur Saya
            </div>
          </div>
        </div>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black text-3xl font-black text-white shadow-sm">
                  {getInitial(user.display_name)}
                </div>

                <div className="min-w-0">
                  {editingName ? (
                    <div className="flex max-w-md items-center gap-2">
                      <input
                        value={displayNameDraft}
                        onChange={(event) =>
                          setDisplayNameDraft(event.target.value)
                        }
                        className="h-11 min-w-0 rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-lg font-extrabold outline-none ring-black/10 focus:ring-4"
                        maxLength={32}
                      />

                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white transition hover:scale-105 disabled:opacity-60"
                        aria-label="Simpan nama"
                      >
                        <Save size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingName(false)
                          setDisplayNameDraft(user.display_name || "")
                        }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black transition hover:bg-black/10"
                        aria-label="Batal edit"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-2xl font-black tracking-tight md:text-3xl">
                        {user.display_name || "Pengguna"}
                      </h1>

                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-black transition hover:bg-black/10"
                        aria-label="Edit nama"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  )}

                  <div className="mt-1 truncate text-sm font-medium text-black/55">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[260px]">
                <div className="rounded-xl bg-[#f6f7fb] p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">
                    Bergabung
                  </div>
                  <div className="mt-1 font-extrabold">
                    {formatDate(user.created_at)}
                  </div>
                </div>

                <div className="rounded-xl bg-[#f6f7fb] p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">
                    Role
                  </div>
                  <div className="mt-1 font-extrabold capitalize">
                    {user.role || "user"}
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-black">
                  Kuota masak hari ini
                </div>
                <div className="mt-1 text-xs font-semibold text-black/50">
                  {stats.cook_date || "Hari ini"}
                </div>
              </div>

              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                {stats.cooked_today || 0}/{stats.daily_limit || 3}
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-black/8">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${todayPercent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-black/58">
              <ChefHat size={16} />
              {Number(stats.cooked_today || 0) >= Number(stats.daily_limit || 3)
                ? "Jatah hari ini sudah penuh."
                : "Masih bisa catat masakan hari ini."}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Sparkles}
            label="Total Poin"
            value={stats.total_points || 0}
            tone="dark"
          />
          <StatCard
            icon={CalendarDays}
            label="Streak"
            value={`${stats.current_streak || 0} hari`}
            tone="blue"
          />
          <StatCard
            icon={ChefHat}
            label="Pernah Masak"
            value={stats.cooked_count || 0}
            tone="green"
          />
          <StatCard
            icon={Bookmark}
            label="Disimpan"
            value={stats.saved_count || 0}
            tone="amber"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex rounded-xl bg-white p-1 shadow-sm">
                {[
                  ["saved", "Disimpan"],
                  ["cooked", "Riwayat Masak"],
                  ["badges", "Badge"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-extrabold transition ${
                      activeTab === key
                        ? "bg-black text-white"
                        : "text-black/55 hover:text-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={loadProfile}
                className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Refresh
              </button>
            </div>

            {activeTab === "saved" && (
              <>
                {savedRecipes.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {savedRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onOpen={openRecipe}
                        action={
                          <button
                            type="button"
                            onClick={() => handleUnsave(recipe.id)}
                            disabled={unsavingId === recipe.id}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm font-extrabold text-black transition hover:bg-black/10 disabled:opacity-60"
                          >
                            <X size={15} />
                            Hapus simpanan
                          </button>
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Bookmark}
                    title="Belum ada resep tersimpan"
                    text="Resep yang kamu simpan dari kartu swipe atau halaman resep akan muncul di sini."
                  />
                )}
              </>
            )}

            {activeTab === "cooked" && (
              <>
                {cookedRecipes.length > 0 ? (
                  <div className="grid gap-3">
                    {cookedRecipes.map((item) => (
                      <CookHistoryItem
                        key={item.id}
                        item={item}
                        onOpen={openRecipe}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ChefHat}
                    title="Belum ada masakan tercatat"
                    text="Setelah klik Masak di resep, riwayat dan poinnya akan tersimpan di sini."
                  />
                )}
              </>
            )}

            {activeTab === "badges" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <BadgeItem key={badge.id} badge={badge} />
                  ))
                ) : (
                  <EmptyState
                    icon={Medal}
                    title="Badge belum tersedia"
                    text="Badge akan muncul setelah aktivitas masak dan simpan mulai tercatat."
                  />
                )}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-black">
                    Poin Mingguan
                  </div>
                  <div className="mt-1 text-xs font-semibold text-black/50">
                    Rolling 7 hari terakhir
                  </div>
                </div>

                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {stats.weekly_points || 0}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/leaderboard")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Trophy size={16} />
                Lihat Leaderboard
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black/55">
                <Flame size={16} />
                Aktivitas Terbaru
              </div>

              {cookedRecipes.length > 0 ? (
                <div className="space-y-3">
                  {cookedRecipes.slice(0, 5).map((item) => (
                    <CookHistoryItem
                      key={`side-${item.id}`}
                      item={item}
                      onOpen={openRecipe}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold leading-relaxed text-black/55">
                  Aktivitas masak terbaru akan muncul setelah kamu mulai mencatat masakan.
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black/55">
                <Star size={16} />
                Kategori Favorit
              </div>

              {categoryCounts.length > 0 ? (
                <div className="space-y-3">
                  {categoryCounts.map((item) => (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm font-extrabold">
                        <span>{item.category}</span>
                        <span className="text-black/45">{item.total}x</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/8">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(12, Number(item.total || 0) * 20)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold leading-relaxed text-black/55">
                  Kategori favorit akan terbaca setelah kamu mulai memasak beberapa resep.
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-black p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/65">
                <User size={16} />
                Profil Publik
              </div>
              <div className="mt-4 text-2xl font-black">
                {user.display_name || "Pengguna"}
              </div>
              <div className="mt-2 text-sm leading-relaxed text-white/62">
                Nama ini tampil di leaderboard global saat kamu mulai mencatat
                masakan.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
