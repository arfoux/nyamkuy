"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock3,
  ImagePlus,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Tag,
  Users,
  XCircle,
} from "lucide-react"

const EMPTY_FORM = {
  nama: "",
  deskripsi: "",
  category: "",
  region: "",
  difficulty: "Mudah",
  duration_minutes: "",
  servings: "",
  cook_points: "10",
  bahan_text: "",
  bumbu_text: "",
  sambal_text: "",
  komponen_text: "",
  lalapan_text: "",
  langkah_text: "",
  tips_text: "",
  admin_note: "",
}

const FILTERS = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "Semua"],
]

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
}

function formatDate(value) {
  if (!value) return ""

  const date = new Date(Number(value))
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function toForm(item) {
  if (!item) return EMPTY_FORM

  return {
    nama: item.nama || "",
    deskripsi: item.deskripsi || "",
    category: item.category || "",
    region: item.region || "",
    difficulty: item.difficulty || "Mudah",
    duration_minutes: item.duration_minutes ? String(item.duration_minutes) : "",
    servings: item.servings ? String(item.servings) : "",
    cook_points: item.cook_points ? String(item.cook_points) : "10",
    bahan_text: item.bahan_text || "",
    bumbu_text: item.bumbu_text || "",
    sambal_text: item.sambal_text || "",
    komponen_text: item.komponen_text || "",
    lalapan_text: item.lalapan_text || "",
    langkah_text: item.langkah_text || "",
    tips_text: item.tips_text || "",
    admin_note: item.admin_note || "",
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-black capitalize whitespace-nowrap ${
        STATUS_STYLE[status] || STATUS_STYLE.pending
      }`}
    >
      {status || "pending"}
    </span>
  )
}

function Field({ label, children, icon: Icon }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
        {Icon && <Icon size={14} />}
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
                          className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black outline-none ring-black/10 transition focus:ring-4 md:h-11"
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-20 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold leading-relaxed text-black outline-none ring-black/10 transition focus:ring-4 md:min-h-28 md:py-3"
    />
  )
}

function SuggestionButton({ item, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-black bg-black text-white shadow-md"
          : "border-black/10 bg-white text-black hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={item.image_url || "/android-chrome-192x192.png"}
          alt={item.nama}
          className="h-12 w-12 shrink-0 rounded-lg object-cover bg-black/5 md:h-16 md:w-16"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black">{item.nama}</div>
          <div
            className={`mt-1 line-clamp-2 text-xs font-semibold leading-relaxed ${
              selected ? "text-white/60" : "text-black/52"
            }`}
          >
            {item.deskripsi}
          </div>
          <div
            className={`mt-2 text-[11px] font-bold ${
              selected ? "text-white/45" : "text-black/38"
            }`}
          >
            {formatDate(item.created_at)}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function AdminRecipeSuggestionPage() {
  const router = useRouter()
  const [filter, setFilter] = useState("pending")
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!image) {
      setImagePreview(selected?.image_url || "")
      return
    }

    const url = URL.createObjectURL(image)
    setImagePreview(url)

    return () => URL.revokeObjectURL(url)
  }, [image, selected])

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setMessage(null)

      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
      })
      const me = await meRes.json().catch(() => ({}))

      if (meRes.status === 401) {
        router.replace("/auth?next=/admin/resep-saran")
        return
      }

      if (!meRes.ok || me.role !== "admin") {
        router.replace("/")
        return
      }

      const res = await fetch(`/api/admin/resep-saran?status=${filter}`, {
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat antrean resep")
      }

      const list = data.data || []
      setItems(list)

      setSelected((current) => {
        const stillThere = list.find((item) => item.id === current?.id)
        return stillThere || list[0] || null
      })
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat antrean resep",
      })
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    setForm(toForm(selected))
    setImage(null)
    setImagePreview(selected?.image_url || "")
  }, [selected])

  const canSave = useMemo(() => {
    return selected && !saving && !approving
  }, [approving, saving, selected])

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function selectItem(item) {
    setSelected(item)
    setMessage(null)
  }

  function syncUpdatedItem(updated) {
    setItems((current) => {
      const exists = current.some((item) => item.id === updated.id)

      if (!exists) return [updated, ...current]

      return current.map((item) => (item.id === updated.id ? updated : item))
    })
    setSelected(updated)
  }

  async function saveDraft(status = "pending", quiet = false) {
    if (!selected) return null

    setSaving(true)
    if (!quiet) setMessage(null)

    try {
      const body = new FormData()

      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value)
      })

      body.append("status", status)

      if (image) {
        body.append("image", image)
      }

      const res = await fetch(`/api/admin/resep-saran/${selected.id}`, {
        method: "PATCH",
        credentials: "include",
        body,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Draft gagal disimpan")
      }

      syncUpdatedItem(data.data)
      setImage(null)

      if (!quiet) {
        setMessage({
          type: "success",
          text:
            status === "rejected"
              ? "Saran resep ditolak."
              : "Draft saran resep disimpan.",
        })
      }

      return data.data
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Draft gagal disimpan",
      })
      return null
    } finally {
      setSaving(false)
    }
  }

  async function approveSelected() {
    if (!selected || approving) return

    setApproving(true)
    setMessage(null)

    try {
      const saved = await saveDraft("pending", true)
      if (!saved) return

      const res = await fetch(`/api/admin/resep-saran/${saved.id}/approve`, {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Approve resep gagal")
      }

      const approved = {
        ...saved,
        status: "approved",
        approved_at: Date.now(),
      }

      syncUpdatedItem(approved)
      setMessage({
        type: "success",
        text: `Resep disetujui dan masuk database dengan ID ${data.recipe_id}.`,
      })
      loadItems()
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Approve resep gagal",
      })
    } finally {
      setApproving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
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
            onClick={loadItems}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                <ShieldCheck size={17} />
                Admin Review
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">
                Kelola saran resep user
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-black/55">
                Edit gambar, judul, detail resep, lalu approve supaya resep
                masuk ke database utama.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`h-10 rounded-full px-4 text-sm font-extrabold transition ${
                    filter === key
                      ? "bg-black text-white"
                      : "bg-[#f6f7fb] text-black/55 hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold md:mt-5 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-3 shadow-sm md:p-4">
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-black/50">
                Antrean
              </div>
              <div className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                {items.length}
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold text-black/50">
                Memuat...
              </div>
            ) : items.length > 0 ? (
              <div className="max-h-[calc(100vh-260px)] space-y-2 overflow-y-auto pr-1 md:space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                {items.map((item) => (
                  <SuggestionButton
                    key={item.id}
                    item={item}
                    selected={selected?.id === item.id}
                    onClick={() => selectItem(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold leading-relaxed text-black/55">
                Tidak ada saran resep pada filter ini.
              </div>
            )}
          </aside>

          <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            {!selected ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                  <ChefHat size={24} />
                </div>
                <div className="text-lg font-black text-black">
                  Pilih saran resep
                </div>
                <div className="mt-1 text-sm font-semibold text-black/52">
                  Draft dari user akan muncul di sini.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={selected.status} />
                      <span className="truncate text-xs font-bold text-black/40">
                        {selected.user_email || selected.user_id}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-black/42">
                      Dikirim {formatDate(selected.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
                    <button
                      type="button"
                      onClick={() => saveDraft("pending")}
                      disabled={!canSave}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-black/5 px-4 text-sm font-extrabold text-black transition hover:bg-black/10 disabled:opacity-50 md:w-auto"
                    >
                      <Save size={16} />
                      Simpan
                    </button>

                    <button
                      type="button"
                      onClick={() => saveDraft("rejected")}
                      disabled={!canSave}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50 md:w-auto"
                    >
                      <XCircle size={16} />
                      Tolak
                    </button>

                    <button
                      type="button"
                      onClick={approveSelected}
                      disabled={!canSave || selected.status === "approved"}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 md:w-auto"
                    >
                      <Send size={16} />
                      {approving ? "Approve..." : "Approve"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div>
                    <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f6f7fb]">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt={form.nama || "Preview resep"}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-black/35">
                          <ImagePlus size={36} />
                        </div>
                      )}
                    </div>

                    <label className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md md:w-auto">
                      <ImagePlus size={16} />
                      Ganti gambar
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          setImage(event.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </label>

                    <div className="mt-3 rounded-xl bg-[#f6f7fb] p-3 md:mt-4 md:p-4">
                      <Field label="Catatan admin">
                        <TextArea
                          value={form.admin_note}
                          onChange={(event) =>
                            updateField("admin_note", event.target.value)
                          }
                          placeholder="Catatan untuk user atau alasan penolakan."
                        />
                      </Field>
                    </div>
                  </div>

                  <div>
                    <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                      <Field label="Judul resep" icon={ChefHat}>
                        <TextInput
                          value={form.nama}
                          onChange={(event) =>
                            updateField("nama", event.target.value)
                          }
                          maxLength={90}
                        />
                      </Field>

                      <Field label="Kategori" icon={Tag}>
                        <TextInput
                          value={form.category}
                          onChange={(event) =>
                            updateField("category", event.target.value)
                          }
                          maxLength={40}
                        />
                      </Field>

                      <Field label="Daerah">
                        <TextInput
                          value={form.region}
                          onChange={(event) =>
                            updateField("region", event.target.value)
                          }
                          maxLength={40}
                        />
                      </Field>

                      <Field label="Kesulitan">
                        <select
                          value={form.difficulty}
                          onChange={(event) =>
                            updateField("difficulty", event.target.value)
                          }
      className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black outline-none ring-black/10 transition focus:ring-4 md:h-11"
                        >
                          <option>Mudah</option>
                          <option>Sedang</option>
                          <option>Sulit</option>
                        </select>
                      </Field>

                      <Field label="Durasi menit" icon={Clock3}>
                        <TextInput
                          type="number"
                          min="1"
                          max="1440"
                          value={form.duration_minutes}
                          onChange={(event) =>
                            updateField("duration_minutes", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Porsi" icon={Users}>
                        <TextInput
                          type="number"
                          min="1"
                          max="99"
                          value={form.servings}
                          onChange={(event) =>
                            updateField("servings", event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-3 grid gap-3 md:mt-4 md:gap-4 md:grid-cols-[1fr_160px]">
                      <Field label="Deskripsi">
                        <TextArea
                          value={form.deskripsi}
                          onChange={(event) =>
                            updateField("deskripsi", event.target.value)
                          }
                          maxLength={500}
                        />
                      </Field>

                      <Field label="Poin masak">
                        <TextInput
                          type="number"
                          min="1"
                          max="9999"
                          value={form.cook_points}
                          onChange={(event) =>
                            updateField("cook_points", event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-3 grid gap-3 md:mt-4 md:gap-4 md:grid-cols-2">
                      <Field label="Bahan utama">
                        <TextArea
                          value={form.bahan_text}
                          onChange={(event) =>
                            updateField("bahan_text", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Cara membuat">
                        <TextArea
                          value={form.langkah_text}
                          onChange={(event) =>
                            updateField("langkah_text", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Bumbu">
                        <TextArea
                          value={form.bumbu_text}
                          onChange={(event) =>
                            updateField("bumbu_text", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Pelengkap">
                        <TextArea
                          value={form.komponen_text}
                          onChange={(event) =>
                            updateField("komponen_text", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Sambal">
                        <TextArea
                          value={form.sambal_text}
                          onChange={(event) =>
                            updateField("sambal_text", event.target.value)
                          }
                        />
                      </Field>

                      <Field label="Lalapan">
                        <TextArea
                          value={form.lalapan_text}
                          onChange={(event) =>
                            updateField("lalapan_text", event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-3 md:mt-4">
                      <Field label="Tips">
                        <TextArea
                          value={form.tips_text}
                          onChange={(event) =>
                            updateField("tips_text", event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 text-sm font-semibold text-black/45 md:mt-5">
                      {saving && "Menyimpan draft..."}
                      {approving && "Memproses approve..."}
                      {!saving && !approving && (
                        <>
                          <CheckCircle2 size={16} />
                          Siap direview.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
