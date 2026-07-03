import { slugifyFoodName } from "./foodSlug"

const DEFAULT_OWNER = "arfoux"
const DEFAULT_REPO = "nyamkuy"
const DEFAULT_BRANCH = "main"
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const GITHUB_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export class GithubImageError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
  }
}

function getConfig(env) {
  const token =
    env?.GITHUB_TOKEN ||
    env?.GH_TOKEN ||
    env?.GITHUB_PAT

  if (!token) {
    throw new GithubImageError(
      "Secret GITHUB_TOKEN belum tersedia.",
      500
    )
  }

  return {
    token,
    owner: env?.GITHUB_IMAGE_OWNER || DEFAULT_OWNER,
    repo: env?.GITHUB_IMAGE_REPO || DEFAULT_REPO,
    branch: env?.GITHUB_IMAGE_BRANCH || DEFAULT_BRANCH,
  }
}

function githubApiUrl(config, path) {
  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")

  return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`
}

function rawGithubUrl(config, path) {
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${path}`
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ""

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    let part = ""

    for (let j = 0; j < chunk.length; j += 1) {
      part += String.fromCharCode(chunk[j])
    }

    binary += part
  }

  return btoa(binary)
}

function normalizeContentType(file) {
  const type = file?.type?.toLowerCase()

  if (IMAGE_TYPES[type]) {
    return type
  }

  const name = file?.name?.toLowerCase() || ""

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg"
  }

  if (name.endsWith(".png")) {
    return "image/png"
  }

  if (name.endsWith(".webp")) {
    return "image/webp"
  }

  throw new GithubImageError(
    "Format gambar harus JPG, PNG, atau WebP.",
    400
  )
}

async function getExistingSha(config, path) {
  const res = await fetch(
    `${githubApiUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  )

  if (res.status === 404) return null

  if (!res.ok) {
    throw new GithubImageError(
      "Gagal memeriksa file gambar di GitHub.",
      res.status
    )
  }

  const data = await res.json()
  return data?.sha || null
}

async function readBase64FromGithub(config, path) {
  const res = await fetch(
    `${githubApiUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  )

  if (!res.ok) {
    throw new GithubImageError(
      "Gambar sumber belum bisa dibaca dari GitHub.",
      res.status
    )
  }

  const data = await res.json()

  if (!data?.content) {
    throw new GithubImageError("Isi gambar GitHub kosong.", 500)
  }

  return {
    content: String(data.content).replace(/\s/g, ""),
    sha: data.sha,
  }
}

async function putBase64ToGithub(
  config,
  path,
  content,
  message,
  { overwrite = true } = {}
) {
  const sha = await getExistingSha(config, path)

  if (sha && !overwrite) {
    throw new GithubImageError(
      `File gambar ${path} sudah ada. Ubah judul resep dulu.`,
      409
    )
  }

  const body = {
    message,
    content,
    branch: config.branch,
  }

  if (sha) {
    body.sha = sha
  }

  const res = await fetch(githubApiUrl(config, path), {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new GithubImageError(
      data?.message || "Upload gambar ke GitHub gagal.",
      res.status
    )
  }

  return {
    path,
    sha: data?.content?.sha || sha || null,
    url: rawGithubUrl(config, path),
  }
}

export async function uploadSuggestionImage(env, file, suggestionId) {
  if (!file || file.size === 0) return null

  if (file.size > MAX_IMAGE_BYTES) {
    throw new GithubImageError(
      "Ukuran gambar maksimal 4 MB.",
      400
    )
  }

  const config = getConfig(env)
  const contentType = normalizeContentType(file)
  const ext = IMAGE_TYPES[contentType]
  const safeId = slugifyFoodName(suggestionId)
  const path = `public/images/suggestions/${safeId}.${ext}`
  const buffer = await file.arrayBuffer()
  const content = arrayBufferToBase64(buffer)

  return {
    ...(await putBase64ToGithub(
      config,
      path,
      content,
      `Upload recipe suggestion image ${safeId}`
    )),
    contentType,
  }
}

export async function publishRecipeImage(env, suggestion, recipeName) {
  if (!suggestion?.image_path) return null

  const config = getConfig(env)
  const ext =
    IMAGE_TYPES[suggestion.image_content_type] ||
    suggestion.image_path.split(".").pop() ||
    "jpg"
  const slug = slugifyFoodName(recipeName)
  const source = await readBase64FromGithub(config, suggestion.image_path)
  const receiptPath = `public/images/receipt/${slug}.${ext}`
  const croppedPath = `public/images/cropped/${slug}.${ext}`
  const message = `Publish recipe image ${slug}`
  const pathsToCheck = GITHUB_IMAGE_EXTENSIONS.flatMap((item) => [
    `public/images/receipt/${slug}.${item}`,
    `public/images/cropped/${slug}.${item}`,
  ])
  const existingImages = await Promise.all(
    pathsToCheck.map((path) => getExistingSha(config, path))
  )

  if (existingImages.some(Boolean)) {
    throw new GithubImageError(
      "Gambar resep dengan judul ini sudah ada. Ubah judul dulu.",
      409
    )
  }

  const [receipt, cropped] = await Promise.all([
    putBase64ToGithub(config, receiptPath, source.content, message, {
      overwrite: false,
    }),
    putBase64ToGithub(config, croppedPath, source.content, message, {
      overwrite: false,
    }),
  ])

  return {
    receipt,
    cropped,
    sourceSha: source.sha,
  }
}
