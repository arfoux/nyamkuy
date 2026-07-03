export function slugifyFoodName(name) {
  const slug = String(name || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")

  return slug || "resep"
}

export function legacyFoodSlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
}
