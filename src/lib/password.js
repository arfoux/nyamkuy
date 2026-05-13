const te = new TextEncoder();

function toBase64(buf) {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(s) {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(plain) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key  = await crypto.subtle.importKey("raw", te.encode(plain), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    key, 256
  );
  return `pbkdf2:v1:${toBase64(salt.buffer)}:${toBase64(hash)}`;
}

export async function verifyPassword(plain, stored) {
  try {
    const [, , saltB64, hashB64] = stored.split(":");
    if (!saltB64 || !hashB64) return false;
    const salt = fromBase64(saltB64);
    const key  = await crypto.subtle.importKey("raw", te.encode(plain), "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      key, 256
    );
    return timingSafeEqual(toBase64(hash), hashB64);
  } catch {
    return false;
  }
}