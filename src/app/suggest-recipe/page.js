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
  Send,
  Tag,
  Users,
  XCircle,
} from "lucide-react"

const INITIAL_FORM = {
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
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const IMAGE_INPUT_ID = "recipe-suggestion-image"

const STATUS_STYLE = {
  pending: {
    label: "Menunggu review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Disetujui",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

function isAcceptedImage(file) {
  const type = file?.type?.toLowerCase()

  if (ACCEPTED_IMAGE_TYPES.has(type)) {
    return true
  }

  const name = file?.name?.toLowerCase() || ""
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  )
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

function StatusBadge({ status }) {
  const item = STATUS_STYLE[status] || STATUS_STYLE.pending

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-black ${item.className}`}
    >
      {item.label}
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

function getFormIssues(form, image) {
  const issues = []

  if (form.nama.trim().length < 3) {
    issues.push("Judul resep minimal 3 karakter.")
  }

  if (form.deskripsi.trim().length < 12) {
    issues.push("Deskripsi minimal 12 karakter.")
  }

  if (form.bahan_text.trim().length < 3) {
    issues.push("Bahan utama wajib diisi.")
  }

  if (form.langkah_text.trim().length < 10) {
    issues.push("Cara membuat minimal 10 karakter.")
  }

  if (!image) {
    issues.push("Gambar resep wajib dipilih.")
  } else if (!isAcceptedImage(image)) {
    issues.push("Format gambar harus JPG, PNG, atau WebP.")
  } else if (image.size > MAX_IMAGE_SIZE) {
    issues.push("Ukuran gambar maksimal 4 MB.")
  }

  return issues
}

function SuggestionRow({ item }) {
  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.nama}
          className="aspect-[16/6] w-full object-cover md:aspect-[16/10]"
        />
      )}

      <div className="p-3 md:p-4">
        <div className="mb-2 flex items-start justify-between gap-3 md:mb-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-black md:text-base">
              {item.nama}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-black/55 md:mt-1 md:line-clamp-2 md:text-sm">
              {item.deskripsi}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex flex-wrap gap-1">
          {[item.category, item.region, item.difficulty]
            .filter(Boolean)
            .map((label) => (
              <span
                key={label}
                className="rounded-full bg-black/6 px-2 py-0.5 text-[10px] font-bold text-black/55 md:px-2 md:py-1 md:text-[11px]"
              >
                {label}
              </span>
            ))}
        </div>

        <div className="mt-2 text-[11px] font-semibold text-black/42 md:mt-4 md:text-xs">
          {formatDate(item.created_at)}
        </div>

        {item.admin_note && (
          <div className="mt-2 rounded-lg bg-black/5 px-2.5 py-1.5 text-[11px] font-semibold leading-relaxed text-black/60 md:mt-3 md:px-3 md:py-2 md:text-xs">
            {item.admin_note}
          </div>
        )}
      </div>
    </article>
  )
}

export default function SuggestRecipePage() {
  const router = useRouter()
  const [form, setForm] = useState(INITIAL_FORM)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!image) {
      setPreview("")
      return
    }

    const url = URL.createObjectURL(image)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [image])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setMessage(null)

      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (meRes.status === 401) {
        router.replace("/auth?next=/suggest-recipe")
        return
      }

      const res = await fetch("/api/resep/saran", {
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat saran resep")
      }

      setSuggestions(data.data || [])
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat saran resep",
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formIssues = useMemo(() => getFormIssues(form, image), [form, image])
  const canSubmit = formIssues.length === 0
  const formStatusText = canSubmit
    ? "Draft siap dikirim."
    : formIssues.length > 1
      ? `${formIssues[0]} +${formIssues.length - 1} lagi.`
      : formIssues[0]

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null
    setImage(file)
    event.target.value = ""

    if (file) {
      setMessage(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const issues = getFormIssues(form, image)

    if (issues.length > 0) {
      setMessage({
        type: "error",
        text: `Belum bisa dikirim: ${issues.join(" ")}`,
      })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const body = new FormData()

      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value)
      })

      body.append("image", image)

      const res = await fetch("/api/resep/saran", {
        method: "POST",
        credentials: "include",
        body,
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        router.push("/auth?next=/suggest-recipe")
        return
      }

      if (!res.ok) {
        throw new Error(data.error || "Saran resep gagal dikirim")
      }

      setForm(INITIAL_FORM)
      setImage(null)
      setSuggestions((current) => [data.data, ...current].filter(Boolean))
      setMessage({
        type: "success",
        text: "Saran resep terkirim dan menunggu approve admin.",
      })
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Saran resep gagal dikirim",
      })
    } finally {
      setSubmitting(false)
    }
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
            onClick={loadData}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                  <ChefHat size={17} />
                  Saran Resep
                </div>
                <h1 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">
                  Punya resep yang ingin kamu post?
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-black/55">
                  Kirim draft resep dan gambar. Admin bisa merapikan isinya
                  dulu sebelum muncul di NyamKuy.
                </p>
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

          <div className="flex flex-row items-center gap-3 rounded-2xl bg-black p-3 text-white shadow-sm md:flex-col md:gap-4 md:p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 md:h-11 md:w-11">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xl font-black md:mt-5 md:text-2xl">
                {suggestions.filter((item) => item.status === "approved").length}
              </div>
              <div className="text-xs font-semibold text-white/62 md:mt-1 md:text-sm">
                saran kamu sudah disetujui.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-4 shadow-sm md:p-6"
          >
            <div className="grid gap-3 md:gap-4 md:grid-cols-2">
              <Field label="Judul resep" icon={ChefHat}>
                <TextInput
                  value={form.nama}
                  onChange={(event) => updateField("nama", event.target.value)}
                  placeholder="Contoh: Ayam Bakar Madu"
                  maxLength={90}
                />
              </Field>

              <Field label="Kategori" icon={Tag}>
                <TextInput
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Ayam, seafood, sayur"
                  maxLength={40}
                />
              </Field>

              <Field label="Daerah">
                <TextInput
                  value={form.region}
                  onChange={(event) =>
                    updateField("region", event.target.value)
                  }
                  placeholder="Jawa, Bali, Sumatera"
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
                  placeholder="45"
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
                  placeholder="4"
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
                  placeholder="Ceritakan singkat rasa dan ciri resep ini."
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
                  placeholder={"Ayam 500 gram\nKecap manis 4 sdm"}
                />
              </Field>

              <Field label="Cara membuat">
                <TextArea
                  value={form.langkah_text}
                  onChange={(event) =>
                    updateField("langkah_text", event.target.value)
                  }
                  placeholder={"Lumuri ayam dengan bumbu.\nBakar sampai matang."}
                />
              </Field>

              <Field label="Bumbu">
                <TextArea
                  value={form.bumbu_text}
                  onChange={(event) =>
                    updateField("bumbu_text", event.target.value)
                  }
                  placeholder={"Bawang putih\nKetumbar\nGaram"}
                />
              </Field>

              <Field label="Pelengkap">
                <TextArea
                  value={form.komponen_text}
                  onChange={(event) =>
                    updateField("komponen_text", event.target.value)
                  }
                  placeholder={"Nasi hangat\nAcar"}
                />
              </Field>

              <Field label="Sambal">
                <TextArea
                  value={form.sambal_text}
                  onChange={(event) =>
                    updateField("sambal_text", event.target.value)
                  }
                  placeholder={"Sambal tomat\nSambal bawang"}
                />
              </Field>

              <Field label="Lalapan">
                <TextArea
                  value={form.lalapan_text}
                  onChange={(event) =>
                    updateField("lalapan_text", event.target.value)
                  }
                  placeholder={"Timun\nKemangi\nKol"}
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
                  placeholder="Tambahkan tips supaya hasilnya lebih mantap."
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-dashed border-black/15 bg-[#f6f7fb] p-3 md:mt-5 md:flex-row md:items-center md:justify-between md:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-sm md:h-12 md:w-12">
                  <ImagePlus size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-black">
                    Gambar resep
                  </div>
                  <div className="truncate text-xs font-semibold text-black/50">
                    {image ? image.name : "JPG, PNG, atau WebP maksimal 4 MB."}
                  </div>
                </div>
              </div>

              <label
                htmlFor={IMAGE_INPUT_ID}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-black px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md md:w-auto"
              >
                {image ? "Ganti gambar" : "Pilih gambar"}
                <input
                  id={IMAGE_INPUT_ID}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>

            {preview && (
              <img
                src={preview}
                alt="Preview gambar resep"
                className="mt-3 aspect-[16/9] w-full rounded-xl object-cover md:mt-4"
              />
            )}

            <div className="mt-4 flex flex-col-reverse gap-3 md:mt-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-black/45">
                {!canSubmit && <XCircle size={16} />}
                {formStatusText}
              </div>

              <button
                type="submit"
                aria-disabled={!canSubmit}
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                <Send size={16} />
                {submitting ? "Mengirim..." : "Kirim saran"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-black/50">
                Status saran
              </div>

              {loading ? (
                <div className="mt-5 text-sm font-semibold text-black/50">
                  Memuat...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {suggestions.slice(0, 6).map((item) => (
                    <SuggestionRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold leading-relaxed text-black/55">
                  Belum ada saran resep dari akun ini.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
