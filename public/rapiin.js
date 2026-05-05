// normalizer.js - Normalisasi Resep JSON ke Struktur Baru
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

function normalizeResep(rawResep) {
  const normalized = {
    nama: rawResep.nama || '',
    deskripsi: Array.isArray(rawResep.desc)
      ? rawResep.desc.join(' ')
      : (rawResep.desc || ''),

    bahan: { utama: [], pelengkap: [], tepung: [], minyak: [] },
    bumbu: { umum: [], halus: [], marinasi: [], oles: [] },
    sambal: {
      pecel: [], taichan: [], ayam_geprek: [], terasi: [],
      kecap: [], balado: [], umum: [], saus: []
    },
    komponen: {
      kulit: [], isian: [], lauk_pendamping: [], topping: [], kuah: []
    },

    lalapan: [],
    cara_membuat: [],
    langkah_langkah: [],
    tips: []
  };

  const rulesRaw = {
    // ─── Bahan ───────────────────────────────────────────────
    bahan:                        'bahan.utama',
    bahan_utama:                  'bahan.utama',
    bahan_pelengkap:              'bahan.pelengkap',
    bahan_tepung_goreng_ayam:     'bahan.tepung',
    pelengkap:                    'bahan.pelengkap',
    tambahan:                     'bahan.pelengkap',
    minyak_ayam:                  'bahan.minyak',

    // ─── Bumbu ───────────────────────────────────────────────
    bumbu:                        'bumbu.umum',
    bumbu_halus:                  'bumbu.halus',
    bumbuhalus:                   'bumbu.halus',
    bahan_halus:                  'bumbu.halus',   // Recipe 16
    bumbu_ulek:                   'bumbu.halus',   // Recipe 20
    bumbu_marinasi:               'bumbu.marinasi',
    bumbu_oles:                   'bumbu.oles',

    // ─── Sambal ──────────────────────────────────────────────
    bahan_sambal_ayam_geprek:     'sambal.ayam_geprek',
    bahan_sambal_terasi:          'sambal.terasi',
    sambal_kacang:                'sambal.pecel',
    bahan_sambal_pecel:           'sambal.pecel',
    bumbu_kacang:                 'sambal.pecel',  // Recipe 22
    sambel_kacang:                'sambal.pecel',  // Recipe 47
    bumbukacang:                  'sambal.pecel',  // Recipe 49
    sambal_taichan:               'sambal.taichan',
    sambal_kecap:                 'sambal.kecap',  // Recipe 35
    sambal:                       'sambal.umum',   // Recipe 33
    bahan_sambal_balado:          'sambal.balado', // Recipe 17
    saus:                         'sambal.saus',   // Recipe 42

    // ─── Komponen ────────────────────────────────────────────
    kulit:                        'komponen.kulit',
    isian:                        'komponen.isian',
    isi:                          'komponen.isian',
    adonan:                       'komponen.isian',
    topping_dan_olesa:            'komponen.topping',
    lauk_pendamping:              'komponen.lauk_pendamping', // Recipe 3
    kuah:                         'komponen.kuah',            // Recipe 50

    // ─── Lalapan ─────────────────────────────────────────────
    lalapan_daun_singkong:        'lalapan',       // Recipe 15

    // ─── Cara Membuat ────────────────────────────────────────
    cara_membuat:                 'cara_membuat',
    cara_memasak:                 'cara_membuat',
    cara_mengolah:                'cara_membuat',  // Recipe 20
    cara_membuat_ayam_geprek:     'cara_membuat',  // Recipe 11
    cara_membuat_sambal_ayam_geprek: 'cara_membuat',
    cara_membuat_lalapan:         'cara_membuat',  // Recipe 15
    cara_membuat_ayam_pop:        'cara_membuat',

    // ─── Langkah & Tips ──────────────────────────────────────
    langkah_langkah:              'langkah_langkah',
    tips:                         'tips',           // Recipe 25
    bumbu_asam_manis:             'sambal.saus',   // Recipe 40 — saus asam manis
  };

  const rules = Object.fromEntries(
    Object.entries(rulesRaw).map(([k, v]) => [normalizeKey(k), v])
  );

  const unknownKeys = {};

  Object.keys(rawResep).forEach(rawKey => {
    const key = normalizeKey(rawKey);
    const value = rawResep[rawKey];
    const rule = rules[key];

    if (rule && value !== undefined) {
      if (rule.includes('.')) {
        const [section, sub] = rule.split('.');
        const target = normalized?.[section]?.[sub];
        if (Array.isArray(target)) {
          Array.isArray(value) ? target.push(...value) : target.push(value);
        }
      } else {
        const target = normalized[rule];
        if (Array.isArray(target)) {
          Array.isArray(value) ? target.push(...value) : target.push(value);
        }
      }
    } else if (!['nama', 'desc'].includes(key) && value !== undefined) {
      unknownKeys[key] = value;
    }
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

// Log sisa unmapped (harusnya kosong)
let adaUnmapped = false;
result.resep.forEach((r, i) => {
  if (r._unmapped) {
    adaUnmapped = true;
    console.log(`\n📌 Recipe ${i + 1} unmapped:`);
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