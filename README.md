# NyamKuy

NyamKuy is a full-stack Indonesian recipe web app built with Next.js and the Cloudflare ecosystem. It helps users discover recipes, swipe through food cards, search dishes, save recipes, mark recipes as cooked, collect cooking points, view leaderboards, and submit new recipe suggestions for admin review.

The app is designed to run on Cloudflare Pages with Cloudflare D1 as the main database and Pages Functions / Next.js API routes as the backend.

## Highlights

- Swipeable recipe discovery cards on the home page
- Recipe search with pagination
- Recipe detail page with ingredients, seasonings, sambal, steps, tips, and images
- User registration, login, logout, email verification, forgot password, and reset password
- Cookie-based encrypted session authentication
- Saved recipes per user
- Cook tracking per user with daily limit logic
- Cook points per recipe
- Profile dashboard with saved recipes, cooking history, points, streak, and badges
- Global leaderboard for top users, most cooked recipes, and most saved recipes
- Recipe suggestion flow with image upload
- Admin review page for approving suggested recipes
- Cloudflare D1 integration through the `DB` binding
- Cloudflare Pages deployment support through `@cloudflare/next-on-pages`

## Tech Stack

### Application

- Next.js `15.5.2`
- React `19.2.4`
- Tailwind CSS `4`
- Shadcn-style UI components
- Lucide React icons

### Backend and Infrastructure

- Next.js App Router API routes
- Cloudflare Pages
- Cloudflare Pages Functions runtime
- Cloudflare D1 SQLite database
- GitHub Contents API for recipe suggestion images
- Resend API for email verification and password reset emails

## Project Structure

```text
src/
  app/
    api/
      admin/resep-saran/
      auth/
      image/
      leaderboard/
      profile/
      resep/
    admin/resep-saran/
    auth/
    docs/
    leaderboard/
    profile/
    receipt/
    suggest-recipe/
    layout.js
    page.js
  components/
    ui/
    SwipeCards.jsx
  lib/
    db.js
    foodSlug.js
    githubRecipeImages.js
    password.js
    recipeSuggestions.js
    session.js
    sessionCrypto.js
    utils.js

docs/
  recipe-suggestions.md

public/
  images/
    cropped/
    receipt/
    suggestions/
```

## Main Pages

| Route | Description |
| --- | --- |
| `/` | Main swipe card recipe discovery page |
| `/receipt?id=1` | Recipe detail page |
| `/profile` | User dashboard, saved recipes, history, points, streak, badges |
| `/leaderboard` | Global leaderboard |
| `/suggest-recipe` | User recipe suggestion form |
| `/admin/resep-saran` | Admin review page for suggested recipes |
| `/auth` | Login and registration |
| `/auth/forgot` | Forgot password |
| `/auth/reset?token=...` | Reset password |
| `/docs` | Public API documentation page |

## API Routes

### Recipes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/resep?page=1` | List recipes with pagination |
| `GET` | `/api/resep/search?q=ayam&page=1` | Search recipes by name |
| `GET` | `/api/resep/[id]` | Get full recipe detail |
| `GET` | `/api/image/base?nama=Nasi Goreng` | Get full recipe image |
| `GET` | `/api/image/cropped?nama=Nasi Goreng` | Get cropped recipe image |

### User Actions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/resep/[id]/simpan` | Check saved status |
| `POST` | `/api/resep/[id]/simpan` | Save recipe |
| `DELETE` | `/api/resep/[id]/simpan` | Unsave recipe |
| `POST` | `/api/resep/[id]/masak` | Mark recipe as cooked and award points |
| `GET` | `/api/profile` | Get user profile dashboard data |
| `PATCH` | `/api/profile` | Update display name |
| `GET` | `/api/leaderboard?period=week` | Get leaderboard data |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user and send verification email |
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/logout` | Logout user |
| `GET` | `/api/auth/me` | Get current session user |
| `GET` | `/api/auth/verify?token=...` | Verify email |
| `POST` | `/api/auth/forgot` | Request password reset email |
| `POST` | `/api/auth/reset` | Reset password |

### Recipe Suggestions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/resep/saran` | List current user's recipe suggestions |
| `POST` | `/api/resep/saran` | Submit recipe suggestion with image |
| `GET` | `/api/admin/resep-saran?status=pending` | Admin list suggestions |
| `PATCH` | `/api/admin/resep-saran/[id]` | Admin update suggestion draft |
| `POST` | `/api/admin/resep-saran/[id]/approve` | Admin approve suggestion into main recipes |

## Local Setup

Clone the repository:

```bash
git clone https://github.com/arfoux/smtdua-frontend.git
cd smtdua-frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local` for local development:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-secret

RESEND_API_KEY=replace-with-resend-api-key
RESEND_FROM_EMAIL=NyamKuy <noreply@your-domain.com>
APP_ADDRESS=Your company address

GITHUB_TOKEN=replace-with-github-token
GITHUB_IMAGE_OWNER=arfoux
GITHUB_IMAGE_REPO=nyamkuy
GITHUB_IMAGE_BRANCH=main
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## NPM Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the Next.js app |
| `npm run start` | Start the Next.js production server locally |
| `npm run lint` | Run ESLint |
| `npm run pages:build` | Build for Cloudflare Pages with `@cloudflare/next-on-pages` |
| `npm run preview` | Build and preview with Wrangler Pages dev |
| `npm run deploy` | Build and deploy to Cloudflare Pages |

## Cloudflare Configuration

The project expects a Cloudflare D1 binding named `DB`.

Example `wrangler.toml`:

```toml
name = "smtdua-frontend"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "std"
database_id = "YOUR_DATABASE_ID"
```

The app reads D1 like this:

```js
const { env } = getRequestContext()
const db = env.DB
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL for verification and reset email links |
| `SESSION_SECRET` | Strongly recommended | Secret used to encrypt session cookie |
| `RESEND_API_KEY` | Yes for email | Sends verification and reset emails |
| `RESEND_FROM_EMAIL` | Yes for email | Sender address for Resend |
| `APP_ADDRESS` | Optional | Footer address in verification email |
| `GITHUB_TOKEN` | Yes for recipe suggestions | GitHub Contents API token |
| `GH_TOKEN` | Alternative | Alternative GitHub token variable |
| `GITHUB_PAT` | Alternative | Alternative GitHub token variable |
| `GITHUB_IMAGE_OWNER` | Optional | Defaults to `arfoux` |
| `GITHUB_IMAGE_REPO` | Optional | Defaults to `nyamkuy` |
| `GITHUB_IMAGE_BRANCH` | Optional | Defaults to `main` |

GitHub token permission needed:

```text
Repository permissions:
Contents: Read and write
```

## D1 Database Notes

Core tables used by the app:

- `users`
- `resep`
- `bahan`
- `bumbu`
- `sambal`
- `komponen`
- `lalapan`
- `langkah`
- `tips`
- `saved_recipes`
- `cooked_recipes`
- `recipe_suggestions`

Useful inspection command:

```bash
npx wrangler d1 execute std --remote --command "SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY type, name;"
```

### Saved Recipes

```sql
CREATE TABLE IF NOT EXISTS saved_recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resep_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_saved_recipes_user_resep
  ON saved_recipes (user_id, resep_id);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_created
  ON saved_recipes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_resep
  ON saved_recipes (resep_id);
```

### Cooked Recipes

NyamKuy limits point-awarding cook actions to 3 cooked recipes per user per day, based on `Asia/Jakarta`.

```sql
CREATE TABLE IF NOT EXISTS cooked_recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resep_id INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  cook_date TEXT NOT NULL,
  daily_slot INTEGER NOT NULL CHECK (daily_slot BETWEEN 1 AND 3),
  cooked_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cooked_recipes_user_date_slot
  ON cooked_recipes (user_id, cook_date, daily_slot);

CREATE INDEX IF NOT EXISTS idx_cooked_recipes_user_date
  ON cooked_recipes (user_id, cook_date);

CREATE INDEX IF NOT EXISTS idx_cooked_recipes_user_cooked_at
  ON cooked_recipes (user_id, cooked_at DESC);

CREATE INDEX IF NOT EXISTS idx_cooked_recipes_resep
  ON cooked_recipes (resep_id);
```

### Recipe Suggestions

The route creates this table automatically with `CREATE TABLE IF NOT EXISTS`, but it can also be created manually:

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

## Recipe Suggestion Flow

1. A user opens `/suggest-recipe`.
2. The user fills in recipe text and uploads an image.
3. Text data is stored in D1 table `recipe_suggestions`.
4. The uploaded image is committed to GitHub under `public/images/suggestions`.
5. Admin opens `/admin/resep-saran`.
6. Admin edits or approves the suggestion.
7. On approve, recipe text is inserted into the main recipe tables.
8. The image is copied into `public/images/receipt` and `public/images/cropped`.

## Cloudflare Pages Build Watch Paths

Recipe suggestion image uploads create GitHub commits. To prevent staging image uploads from triggering Cloudflare Pages deployments, configure:

```text
Cloudflare Dashboard
Workers & Pages
Your Pages project
Settings
Build
Build watch paths
```

Recommended:

```text
Include paths:
*

Exclude paths:
public/images/suggestions/*
```

Optional, if approved recipe image commits should also skip deployments:

```text
public/images/receipt/*
public/images/cropped/*
```

## Deployment

Build for Cloudflare Pages:

```bash
npm run pages:build
```

Preview locally with Wrangler:

```bash
npm run preview
```

Deploy:

```bash
npm run deploy
```

Cloudflare Pages production deployment should have:

- D1 binding `DB`
- `SESSION_SECRET`
- Resend environment variables
- GitHub image upload token variables
- Correct build command and output directory from the Pages project settings

## Operational Notes

- The app runs API routes on the Edge runtime.
- The `session` cookie is HTTP-only and encrypted.
- Email verification tokens and reset tokens currently share the `verify_token` and `verify_exp` columns.
- Recipe image API routes read image files from GitHub raw URLs.
- Suggested recipe image upload uses GitHub Contents API, not local filesystem writes.
- Some API queries contain fallbacks for older database schemas, but production should use the latest D1 schema.

## Troubleshooting

### D1 binding not found

Make sure `wrangler.toml` and Cloudflare Pages project bindings include:

```toml
[[d1_databases]]
binding = "DB"
```

### Verification or reset email does not arrive

Check:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- Resend domain verification

### Recipe suggestion image upload fails

Check:

- `GITHUB_TOKEN`
- Repository permission `Contents: Read and write`
- `GITHUB_IMAGE_OWNER`
- `GITHUB_IMAGE_REPO`
- `GITHUB_IMAGE_BRANCH`
- Image file type: JPG, PNG, or WebP
- Image file size: max 4 MB

### Cloudflare Pages deploys after image suggestion upload

Configure Build watch paths and exclude:

```text
public/images/suggestions/*
```

## License

This project is licensed under the MIT License.
