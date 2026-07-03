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
  ShieldCheck,
  Tag,
  Users,
  XCircle,
  Trash2,
  Plus,
  Search,
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
}

function formatDate(value) {
  if (!value) return ""
  const date = new Date(Number(value))
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function Field({ label, children, icon: Icon }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
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
      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black outline-none ring-black/10 transition focus:ring-4"
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold leading-relaxed text-black outline-none ring-black/10 transition focus:ring-4"
    />
  )
}

function RecipeRowButton({ item, selected, onClick }) {
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
          src={`/api/image/base?nama=${encodeURIComponent(item.nama)}`}
          onError={(e) => {
            e.target.src = "/android-chrome-192x192.png"
          }}
          alt={item.nama}
          className="h-16 w-16 shrink-0 rounded-lg object-cover bg-black/5"
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
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider rounded px-1.5 py-0.5 ${
                selected ? "bg-white/20 text-white" : "bg-black/5 text-black/60"
              }`}
            >
              {item.category || "Resep"}
            </span>
            <span
              className={`text-[10px] ${
                selected ? "text-white/45" : "text-black/38"
              }`}
            >
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function AdminRecipeCrudPage() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null) // null, 'new', or actual ID
  const [form, setForm] = useState(EMPTY_FORM)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Handle image preview
  useEffect(() => {
    if (!image) {
      if (selectedId && selectedId !== "new") {
        const selectedItem = items.find((item) => item.id === selectedId)
        setImagePreview(
          selectedItem
            ? `/api/image/base?nama=${encodeURIComponent(selectedItem.nama)}`
            : ""
        )
      } else {
        setImagePreview("")
      }
      return
    }

    const url = URL.createObjectURL(image)
    setImagePreview(url)

    return () => URL.revokeObjectURL(url)
  }, [image, selectedId, items])

  // Load recipe list
  const loadList = useCallback(
    async (pageNum = 1) => {
      try {
        setLoadingList(true)
        setMessage(null)

        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
        })
        const me = await meRes.json().catch(() => ({}))

        if (meRes.status === 401) {
          router.replace("/auth?next=/admin/resep")
          return
        }

        if (!meRes.ok || me.role !== "admin") {
          router.replace("/")
          return
        }

        const res = await fetch(
          `/api/admin/resep?q=${encodeURIComponent(q)}&page=${pageNum}`,
          {
            credentials: "include",
          }
        )
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat resep")
        }

        setItems(data.data || [])
        setTotalPages(data.meta?.total_pages || 1)
        setPage(data.meta?.page || 1)
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || "Gagal memuat resep",
        })
      } finally {
        setLoadingList(false)
      }
    },
    [q, router]
  )

  useEffect(() => {
    loadList(1)
  }, [q])

  // Fetch detail for editing
  const loadDetail = useCallback(async (id) => {
    if (id === "new") {
      setForm(EMPTY_FORM)
      setImage(null)
      setImagePreview("")
      return
    }

    try {
      setLoadingDetail(true)
      setMessage(null)

      const res = await fetch(`/api/admin/resep/${id}`, {
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat detail resep")
      }

      const item = data.data
      setForm({
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
      })
      setImage(null)
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat detail resep",
      })
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId)
    } else {
      setForm(EMPTY_FORM)
      setImage(null)
      setImagePreview("")
    }
  }, [selectedId, loadDetail])

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSave() {
    if (saving) return

    setSaving(true)
    setMessage(null)

    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value)
      })

      if (image) {
        body.append("image", image)
      }

      const isNew = selectedId === "new"
      const url = isNew ? "/api/admin/resep" : `/api/admin/resep/${selectedId}`
      const method = isNew ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        credentials: "include",
        body,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan resep")
      }

      setMessage({
        type: "success",
        text: isNew ? "Resep baru berhasil dibuat." : "Resep berhasil diperbarui.",
      })

      setImage(null)
      loadList(page)

      if (isNew && data.id) {
        setSelectedId(data.id)
      } else if (!isNew) {
        loadDetail(selectedId)
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan resep",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedId || selectedId === "new" || deleting) return

    setDeleting(true)
    setMessage(null)
    setConfirmDeleteOpen(false)

    try {
      const res = await fetch(`/api/admin/resep/${selectedId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus resep")
      }

      setMessage({
        type: "success",
        text: "Resep berhasil dihapus.",
      })

      setSelectedId(null)
      setForm(EMPTY_FORM)
      setImage(null)
      setImagePreview("")
      loadList(1)
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menghapus resep",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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
            onClick={() => loadList(page)}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* Title Bar */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                <ShieldCheck size={17} />
                Admin Dashboard
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Kelola Semua Resep
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-black/55">
                Tambahkan, edit detail, unggah gambar, atau hapus resep langsung di database utama NyamKuy.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/resep-saran")}
                className="h-10 rounded-full bg-[#f6f7fb] px-4 text-sm font-extrabold text-black/55 hover:text-black transition"
              >
                Review Saran
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedId("new")
                  setMessage(null)
                }}
                className="flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Plus size={16} />
                Tambah Resep
              </button>
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
        </section>

        {/* Workspace layout */}
        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Left panel - List of recipes */}
          <aside className="rounded-2xl bg-white p-4 shadow-sm h-fit lg:sticky lg:top-6">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-black/10 bg-[#f6f7fb] px-3">
              <Search size={16} className="text-black/40" />
              <input
                type="text"
                placeholder="Cari resep..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-black/40"
              />
            </div>

            {loadingList ? (
              <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold text-black/50">
                Memuat daftar...
              </div>
            ) : items.length > 0 ? (
              <div className="flex flex-col">
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {items.map((item) => (
                    <RecipeRowButton
                      key={item.id}
                      item={item}
                      selected={selectedId === item.id}
                      onClick={() => {
                        setSelectedId(item.id)
                        setMessage(null)
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                    <button
                      disabled={page <= 1}
                      onClick={() => loadList(page - 1)}
                      className="h-8 rounded-lg bg-[#f6f7fb] px-3 text-xs font-bold text-black disabled:opacity-40 transition hover:bg-black/5"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-xs font-semibold text-black/50">
                      Hal {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => loadList(page + 1)}
                      className="h-8 rounded-lg bg-[#f6f7fb] px-3 text-xs font-bold text-black disabled:opacity-40 transition hover:bg-black/5"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm font-semibold leading-relaxed text-black/55">
                Tidak ada resep ditemukan.
              </div>
            )}
          </aside>

          {/* Right panel - Editor */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6 min-h-[480px]">
            {!selectedId ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                  <ChefHat size={24} />
                </div>
                <div className="text-lg font-black text-black">
                  Pilih resep untuk diedit
                </div>
                <div className="mt-1 text-sm font-semibold text-black/52">
                  Atau klik "Tambah Resep" di atas untuk membuat resep baru dari awal.
                </div>
              </div>
            ) : loadingDetail ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <RefreshCcw size={24} className="animate-spin text-black/50" />
                <div className="mt-2 text-sm font-semibold text-black/52">
                  Memuat detail resep...
                </div>
              </div>
            ) : (
              <>
                {/* Save/Delete action headers */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-5">
                  <div>
                    <h2 className="text-lg font-black">
                      {selectedId === "new" ? "Buat Resep Baru" : "Edit Resep"}
                    </h2>
                    <p className="text-xs font-semibold text-black/45">
                      {selectedId === "new"
                        ? "Isi seluruh detail resep utama berikut."
                        : `Melihat data resep ID: ${selectedId}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedId !== "new" && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteOpen(true)}
                        disabled={saving || deleting}
                        className="flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || deleting}
                      className="flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Menyimpan..." : "Simpan Resep"}
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                  {/* Left sub-column: Image upload, notes */}
                  <div>
                    <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f6f7fb]">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          onError={(e) => {
                            e.target.src = "/android-chrome-192x192.png"
                          }}
                          alt={form.nama || "Preview resep"}
                          className="aspect-[4/3] w-full object-cover bg-black/5"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-black/35">
                          <ImagePlus size={36} />
                        </div>
                      )}
                    </div>

                    <label className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-md">
                      <ImagePlus size={16} />
                      Pilih/Ganti gambar
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          setImage(event.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </label>

                    <div className="mt-4 rounded-xl bg-[#f6f7fb] p-4 text-xs font-semibold leading-relaxed text-black/60">
                      <span className="font-extrabold uppercase block mb-1 text-black/80">Informasi Gambar</span>
                      Gambar resep akan diunggah ke repositori GitHub dan dicocokkan otomatis dengan judul resep. Format yang didukung: JPG, PNG, WebP. Maks 4MB.
                    </div>
                  </div>

                  {/* Right sub-column: Input forms */}
                  <div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Judul resep" icon={ChefHat}>
                        <TextInput
                          value={form.nama}
                          onChange={(event) =>
                            updateField("nama", event.target.value)
                          }
                          maxLength={90}
                          placeholder="Contoh: Ayam Goreng Penyet"
                        />
                      </Field>

                      <Field label="Kategori" icon={Tag}>
                        <TextInput
                          value={form.category}
                          onChange={(event) =>
                            updateField("category", event.target.value)
                          }
                          maxLength={40}
                          placeholder="Contoh: Ayam, Mie, Seafood, Lauk"
                        />
                      </Field>

                      <Field label="Daerah">
                        <TextInput
                          value={form.region}
                          onChange={(event) =>
                            updateField("region", event.target.value)
                          }
                          maxLength={40}
                          placeholder="Contoh: Jawa Tengah, Minang, Bali"
                        />
                      </Field>

                      <Field label="Kesulitan">
                        <select
                          value={form.difficulty}
                          onChange={(event) =>
                            updateField("difficulty", event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black outline-none ring-black/10 transition focus:ring-4"
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
                          placeholder="60"
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

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px]">
                      <Field label="Deskripsi singkat">
                        <TextArea
                          value={form.deskripsi}
                          onChange={(event) =>
                            updateField("deskripsi", event.target.value)
                          }
                          maxLength={500}
                          placeholder="Tulis ringkasan singkat mengenai resep ini..."
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

                    {/* Sub-tables texts */}
                    <div className="mt-6 grid gap-4 border-t border-black/5 pt-5 md:grid-cols-2">
                      <Field label="Bahan utama (Baris Baru)">
                        <TextArea
                          value={form.bahan_text}
                          onChange={(event) =>
                            updateField("bahan_text", event.target.value)
                          }
                          placeholder="500g Ayam potong&#10;2 batang Sereh&#10;3 lembar Daun salam"
                        />
                      </Field>

                      <Field label="Cara membuat (Baris Baru)">
                        <TextArea
                          value={form.langkah_text}
                          onChange={(event) =>
                            updateField("langkah_text", event.target.value)
                          }
                          placeholder="Cuci bersih ayam&#10;Haluskan bumbu halus&#10;Ungkep ayam dengan sereh dan bumbu"
                        />
                      </Field>

                      <Field label="Bumbu (Baris Baru)">
                        <TextArea
                          value={form.bumbu_text}
                          onChange={(event) =>
                            updateField("bumbu_text", event.target.value)
                          }
                          placeholder="5 siung Bawang merah&#10;3 siung Bawang putih&#10;1 sdt Ketumbar"
                        />
                      </Field>

                      <Field label="Pelengkap (Baris Baru)">
                        <TextArea
                          value={form.komponen_text}
                          onChange={(event) =>
                            updateField("komponen_text", event.target.value)
                          }
                          placeholder="Bawang goreng secukupnya&#10;Kerupuk udang"
                        />
                      </Field>

                      <Field label="Sambal (Baris Baru)">
                        <TextArea
                          value={form.sambal_text}
                          onChange={(event) =>
                            updateField("sambal_text", event.target.value)
                          }
                          placeholder="10 buah Cabai rawit&#10;1 sdt Terasi bakar"
                        />
                      </Field>

                      <Field label="Lalapan (Baris Baru)">
                        <TextArea
                          value={form.lalapan_text}
                          onChange={(event) =>
                            updateField("lalapan_text", event.target.value)
                          }
                          placeholder="Mentimun iris&#10;Daun kemangi"
                        />
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field label="Tips Memaksimalkan (Baris Baru)">
                        <TextArea
                          value={form.tips_text}
                          onChange={(event) =>
                            updateField("tips_text", event.target.value)
                          }
                          placeholder="Goreng ayam dengan minyak kelapa agar lebih harum&#10;Sajikan selagi hangat"
                        />
                      </Field>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 text-sm font-semibold text-black/45">
                      {saving && "Menyimpan resep..."}
                      {deleting && "Menghapus resep..."}
                      {!saving && !deleting && (
                        <>
                          <CheckCircle2 size={16} />
                          Formulir siap disimpan.
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

      {/* Confirmation Delete Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-black">Hapus Resep?</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-black/55">
              Apakah Anda yakin ingin menghapus resep ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="h-10 rounded-full bg-black/5 px-4 text-sm font-extrabold text-black hover:bg-black/10 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 rounded-full bg-red-600 px-4 text-sm font-extrabold text-white hover:bg-red-700 transition"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
