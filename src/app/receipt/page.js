import React from 'react';

export default function RecipePage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12 font-sans overflow-hidden">
      
      {/* ========================================= */}
      {/* BACKGROUND GAMBAR PICSUM DENGAN EFEK BLUR */}
      {/* ========================================= */}
      {/* Latar Belakang Asli dari Picsum */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/1920/1080?random=background')" }}
      ></div>
      
      {/* Efek Frosted Glass & Vignette (Glow Cokelat/Krem) */}
      <div className="absolute inset-0 z-0 backdrop-blur-3xl bg-[#7c5b46]/40"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(44,26,17,0.7)_100%)]"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#dcc1b0_10%,#4a2d1d_100%)]"></div>

      {/* ========================================= */}
      {/* KONTEN UTAMA                              */}
      {/* ========================================= */}
      
      {/* Judul Utama */}
  <h1 className="text-6xl md:text-[6rem] font-black text-[#2e1d15] mb-12 z-10 tracking-widest drop-shadow-sm">
    Nasi Pecel
  </h1>

      {/* Kontainer Utama Card */}
      <div className="relative w-full max-w-6xl bg-[#5e4134] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row z-10">

        {/* KOLOM KIRI (Gelap, Foto & Deskripsi) - DIPERBAIKI: FOTO LEBIH BESAR & LEBIH KE KANAN (MD) */}
        <div className="w-full md:w-[35%] bg-[#3b251d] rounded-[2.5rem] p-8 min-h-[520px] md:min-h-[600px] flex flex-col items-center justify-end relative shadow-[15px_0_30px_rgba(0,0,0,0.35)] z-20">
          
          {/* Foto Piring - Ukuran diperbesar (w-64/w-[21rem]) dan digeser ke kanan (md:-left-4) */}
          <div className="absolute top-8 md:top-12 left-1/2 md:-left-4 transform -translate-x-1/2 md:translate-x-0 w-64 h-64 md:w-[21rem] md:h-[21rem] bg-white rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center z-30 overflow-hidden">
            <img 
              src="https://picsum.photos/400/400?random=food" 
              alt="Nasi Pecel" 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Teks Deskripsi Kiri - Otomatis terdorong ke dasar kotak karena mt-auto */}
          <p className="text-white text-center text-sm md:text-[14px] leading-relaxed font-light mt-auto pt-4 relative z-40">
            <span className="font-bold">Nasi Pecel</span> makanan tradisional Jawa berupa rebusan berbagai macam sayuran bayam, tauge, kacang panjang, kol, kenikir yang disiram dengan sambal kacang kental
          </p>
        </div>

        {/* KOLOM KANAN (Daftar Resep 2 Kolom) */}
        <div className="w-full md:w-[68%] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-white z-10">
          
          {/* Kolom Bahan-bahan */}
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 tracking-wide text-white">Bahan-bahan:</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-[15px] text-gray-200 leading-relaxed marker:text-gray-300">
              <li>4 porsi nasi putih.</li>
              <li>100 gram taoge, siangi.</li>
              <li>100 gram bayam, siangi.</li>
              <li>200 gram kangkung, siangi.</li>
              <li>200 gram kacang panjang, potong 2 cm.</li>
              <li>100 gram taoge pendek, seduh air panas, tiriskan.</li>
              <li>2 buah mentimun, cincang.</li>
              <li>70 gram daun kemangi.</li>
              <li>4 buah jeruk purut, belah 2 bagian.</li>
              <li>2 liter air, untuk merebus.</li>
            </ul>

            <h2 className="text-lg md:text-xl font-bold mt-8 mb-4 tracking-wide text-white">Bahan-bahan sambal pecel:</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-[15px] text-gray-200 leading-relaxed marker:text-gray-300">
              <li>250 ml air panas.</li>
              <li>250 gram sambal pecel khas Madiun siap santap.</li>
              <li>1 sdm kecap manis.</li>
            </ul>
          </div>

          {/* Kolom Cara Membuat */}
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 tracking-wide text-white">Cara membuat</h2>
            <ul className="list-disc pl-5 space-y-6 text-sm md:text-[15px] text-gray-200 leading-relaxed marker:text-gray-300">
              <li>
                Untuk sambel pecel, lumatkan sambel pecel siap makan dengan air panas. Tambahkan dengan kecap manis, aduk, lalu sisihkan.
              </li>
              <li>
                Didihkan air, rebus sayuran secara terpisah, yang dimulai dari taoge, bayam, kangkung, dan kacang panjang. Jika sudah, tiriskan lalu sisihkan.
              </li>
              <li>
                Siapkan nasi di atas piring saji, jika perlu alaskan dengan daun pisang terlebih dulu (sesuai selera).
              </li>
              <li>
                Tuangkan sambal pecel di atasnya dan beri perasan jeruk purut sedikit (sesuai selera). Sajikan bersama pelengkap.
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}