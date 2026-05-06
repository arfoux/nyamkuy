// normalizer.js - Normalisasi Resep JSON ke Struktur Baru (Flat)
// Copy-paste JSON data Anda ke variabel 'rawData'

const rawData = {
  // PASTE SELURUH JSON RESEP ANDA DISINI
};

function normalizeKey(key) {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');
}

// Helper: push items ke array flat dengan field tambahan
function pushFlat(targetArray, value, extraFields = {}) {
  const items = Array.isArray(value) ? value : [value];
  items.forEach(item => {
    if (item) targetArray.push({ nama: item, ...extraFields });
  });
}

function normalizeResep(rawResep) {
  const normalized = {
    nama: rawResep.nama || '',

    // Fix bug: JSON pakai 'deskripsi', bukan 'desc'
    deskripsi: Array.isArray(rawResep.deskripsi)
      ? rawResep.deskripsi.join(' ')
      : (rawResep.deskripsi || rawResep.desc || ''),

    // Format flat — tidak ada sub-key kosong
    bahan:     [],   // { nama, jumlah, kategori }  ← jumlah dipisah nanti jika perlu
    bumbu:     [],   // { nama, jenis }
    sambal:    [],   // { nama, jenis }
    komponen:  [],   // { nama, jenis }
    lalapan:   [],
    langkah:   [],   // { no, instruksi }  ← gabungan cara_membuat + langkah_langkah
    tips:      [],
  };

  // ─── Rules: key JSON → { section, sub/jenis }
  const rulesRaw = {
    // ── Bahan ──────────────────────────────────────────
    bahan:                           { s: 'bahan',    j: 'utama' },
    bahan_utama:                     { s: 'bahan',    j: 'utama' },
    bahan_pelengkap:                 { s: 'bahan',    j: 'pelengkap' },
    bahan_tepung_goreng_ayam:        { s: 'bahan',    j: 'tepung' },
    pelengkap:                       { s: 'bahan',    j: 'pelengkap' },
    tambahan:                        { s: 'bahan',    j: 'pelengkap' },
    minyak_ayam:                     { s: 'bahan',    j: 'minyak' },

    // ── Bumbu ──────────────────────────────────────────
    bumbu:                           { s: 'bumbu',    j: 'umum' },
    bumbu_halus:                     { s: 'bumbu',    j: 'halus' },
    bumbuhalus:                      { s: 'bumbu',    j: 'halus' },
    bahan_halus:                     { s: 'bumbu',    j: 'halus' },
    bumbu_ulek:                      { s: 'bumbu',    j: 'halus' },
    bumbu_marinasi:                  { s: 'bumbu',    j: 'marinasi' },
    bumbu_oles:                      { s: 'bumbu',    j: 'oles' },

    // ── Sambal ─────────────────────────────────────────
    bahan_sambal_ayam_geprek:        { s: 'sambal',   j: 'ayam_geprek' },
    bahan_sambal_terasi:             { s: 'sambal',   j: 'terasi' },
    sambal_kacang:                   { s: 'sambal',   j: 'pecel' },
    bahan_sambal_pecel:              { s: 'sambal',   j: 'pecel' },
    bumbu_kacang:                    { s: 'sambal',   j: 'pecel' },
    sambel_kacang:                   { s: 'sambal',   j: 'pecel' },
    bumbukacang:                     { s: 'sambal',   j: 'pecel' },
    sambal_taichan:                  { s: 'sambal',   j: 'taichan' },
    sambal_kecap:                    { s: 'sambal',   j: 'kecap' },
    sambal:                          { s: 'sambal',   j: 'umum' },
    bahan_sambal_balado:             { s: 'sambal',   j: 'balado' },
    saus:                            { s: 'sambal',   j: 'saus' },
    bumbu_asam_manis:                { s: 'sambal',   j: 'saus' },

    // ── Komponen ───────────────────────────────────────
    kulit:                           { s: 'komponen', j: 'kulit' },
    isian:                           { s: 'komponen', j: 'isian' },
    isi:                             { s: 'komponen', j: 'isian' },
    adonan:                          { s: 'komponen', j: 'isian' },
    topping_dan_olesa:               { s: 'komponen', j: 'topping' },
    lauk_pendamping:                 { s: 'komponen', j: 'lauk_pendamping' },
    kuah:                            { s: 'komponen', j: 'kuah' },

    // ── Lalapan ────────────────────────────────────────
    lalapan:                         { s: 'lalapan' },
    lalapan_daun_singkong:           { s: 'lalapan' },

    // ── Langkah (gabungan cara_membuat + langkah_langkah) ──
    cara_membuat:                    { s: 'langkah' },
    cara_memasak:                    { s: 'langkah' },
    cara_mengolah:                   { s: 'langkah' },
    cara_membuat_ayam_geprek:        { s: 'langkah' },
    cara_membuat_sambal_ayam_geprek: { s: 'langkah' },
    cara_membuat_lalapan:            { s: 'langkah' },
    cara_membuat_ayam_pop:           { s: 'langkah' },
    langkah_langkah:                 { s: 'langkah' },

    // ── Tips ───────────────────────────────────────────
    tips:                            { s: 'tips' },
  };

  const rules = Object.fromEntries(
    Object.entries(rulesRaw).map(([k, v]) => [normalizeKey(k), v])
  );

  const unknownKeys = {};

  Object.keys(rawResep).forEach(rawKey => {
    const key = normalizeKey(rawKey);
    const value = rawResep[rawKey];
    const rule = rules[key];

    if (!rule) {
      if (!['nama', 'deskripsi', 'desc'].includes(key) && value !== undefined) {
        unknownKeys[key] = value;
      }
      return;
    }

    const { s: section, j: jenis } = rule;

    if (section === 'bahan') {
      pushFlat(normalized.bahan, value, { kategori: jenis });

    } else if (section === 'bumbu') {
      pushFlat(normalized.bumbu, value, { jenis });

    } else if (section === 'sambal') {
      pushFlat(normalized.sambal, value, { jenis });

    } else if (section === 'komponen') {
      pushFlat(normalized.komponen, value, { jenis });

    } else if (section === 'lalapan') {
      const items = Array.isArray(value) ? value : [value];
      items.forEach(i => { if (i) normalized.lalapan.push(i); });

    } else if (section === 'langkah') {
      // Gabungkan semua cara_membuat & langkah_langkah, beri nomor urut
      const items = Array.isArray(value) ? value : [value];
      items.forEach(instruksi => {
        if (instruksi) {
          normalized.langkah.push({
            no: normalized.langkah.length + 1,
            instruksi,
          });
        }
      });

    } else if (section === 'tips') {
      const items = Array.isArray(value) ? value : [value];
      items.forEach(t => { if (t) normalized.tips.push(t); });
    }
  });

  // Hapus array kosong agar JSON lebih bersih
  ['bahan', 'bumbu', 'sambal', 'komponen', 'lalapan', 'tips'].forEach(k => {
    if (normalized[k].length === 0) delete normalized[k];
  });

  if (Object.keys(unknownKeys).length > 0) {
    normalized._unmapped = unknownKeys;
  }

  return normalized;
}


// ─── NORMALIZE ────────────────────────────────────────────────────────────────

console.log('🔄 Normalizing resep...');

const result = {
  resep: rawData.resep
    .map(normalizeResep)
    .filter(r => r.nama)
};

console.log(`✅ Selesai! ${result.resep.length} resep`);

let adaUnmapped = false;
result.resep.forEach((r, i) => {
  if (r._unmapped) {
    adaUnmapped = true;
    console.log(`\n📌 Recipe ${i + 1} (${r.nama}) — unmapped keys:`);
    console.log(JSON.stringify(r._unmapped, null, 2));
  }
});

if (!adaUnmapped) {
  console.log('🎉 Tidak ada unmapped keys!');
}

const fs = require('fs');
fs.writeFileSync(
  'resep_normalized.json',
  JSON.stringify(result, null, 2),
  'utf8'
);

console.log('\n💾 Disimpan ke: resep_normalized.json');
