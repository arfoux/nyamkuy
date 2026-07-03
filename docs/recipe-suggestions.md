# Recipe Suggestions Setup

Fitur ini memakai D1 untuk teks resep dan GitHub Contents API untuk file gambar.

## Runtime variables

Tambahkan variable berikut di environment production/development deploy:

```text
GITHUB_IMAGE_OWNER=arfoux
GITHUB_IMAGE_REPO=nyamkuy
GITHUB_IMAGE_BRANCH=main
```

Tambahkan secret berikut:

```text
GITHUB_TOKEN=<fine-grained GitHub token>
```

Token harus punya permission repository `Contents: Read and write` untuk repo
`arfoux/nyamkuy`.

Jika app berjalan di Cloudflare Pages, secret runtime harus dipasang di
Cloudflare Pages dashboard, bukan hanya GitHub Actions secrets. GitHub Actions
secrets hanya tersedia saat workflow berjalan.

## D1 table

Route akan membuat tabel ini otomatis dengan `CREATE TABLE IF NOT EXISTS`, tetapi
query ini bisa dijalankan manual di D1 dashboard:

```sql
CREATE TABLE IF NOT EXISTS recipe_suggestions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  category TEXT,
  region TEXT,
  difficulty TEXT,
  duration_minutes INTEGER,
  servings INTEGER,
  cook_points INTEGER,
  bahan_text TEXT,
  bumbu_text TEXT,
  sambal_text TEXT,
  komponen_text TEXT,
  lalapan_text TEXT,
  langkah_text TEXT,
  tips_text TEXT,
  image_path TEXT,
  image_url TEXT,
  image_sha TEXT,
  image_content_type TEXT,
  admin_note TEXT,
  reviewed_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  approved_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_recipe_suggestions_user
  ON recipe_suggestions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipe_suggestions_status
  ON recipe_suggestions (status, created_at DESC);
```

## Flow

1. User membuka `/suggest-recipe`, mengisi resep, lalu upload gambar.
2. API menyimpan teks di `recipe_suggestions` dan gambar staging ke
   `public/images/suggestions`.
3. Admin membuka `/admin/resep-saran`, mengedit draft, mengganti gambar bila
   perlu, lalu approve.
4. Saat approve, gambar dipublish ke `public/images/receipt` dan
   `public/images/cropped`, lalu teks resep masuk ke tabel resep utama.
