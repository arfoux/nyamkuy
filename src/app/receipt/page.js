import React from 'react';

export default function RecipePage() {
  return (
    <div className="min-h-screen bg-[#fcfbfa] flex justify-center p-8 font-sans">
      
      {/* Kontainer Utama */}
      <div className="flex flex-col lg:flex-row items-start w-full max-w-5xl mt-16">

        {/* ========================================= */}
        {/* BAGIAN KIRI: Lingkaran Foto + Info Menu   */}
        {/* ========================================= */}
        <div className="relative shrink-0 z-10 mx-auto lg:mx-0">
          
          {/* Lingkaran Utama Foto Makanan */}
          <div className="w-56 h-56 md:w-72 md:h-72 bg-[#d9d9d9] rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden relative">
            {/* Gunakan tag <img src="..." className="object-cover w-full h-full" /> jika sudah ada foto */}
            <span className="text-gray-600 text-lg md:text-xl font-medium">Foto Rendang</span>
          </div>

          {/* Floating Badge: Rating (Kanan Atas) */}
          <div className="absolute top-4 right-2 md:top-6 md:right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 border border-gray-100">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-[#d48c48] font-bold text-sm">9.8</span>
          </div>

          {/* Floating Badge: Harga (Kiri Bawah) */}
          <div className="absolute bottom-6 left-0 md:bottom-8 md:left-0 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100">
            <span className="font-bold text-gray-900 text-sm md:text-base">Rp 45.000</span>
          </div>

          {/* Floating Button: Tambah (Kanan Bawah) */}
          <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-11 h-11 md:w-14 md:h-14 bg-[#b56a2b] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#9a5822] hover:scale-105 transition-all border-2 border-white">
            +
          </button>
          
        </div>

        {/* ========================================= */}
        {/* BAGIAN KANAN: Detail Resep Utama          */}
        {/* ========================================= */}
        {/* -ml-16 membuat kotak ini ditarik ke kiri agar tertumpuk di bawah lingkaran foto */}
        <div className="flex-1 lg:-ml-16 flex flex-col gap-6 w-full mt-8 lg:mt-12">

          {/* Banner Judul */}
          <div className="bg-[#c4c4c4] w-full py-4 px-6 lg:pl-24 lg:pr-8 rounded-r-md shadow-sm text-center lg:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-wide uppercase">
              Rendang Daging Asli
            </h1>
          </div>

          {/* Konten Resep */}
          <div className="flex flex-col gap-8 lg:pl-24 px-6 lg:pr-8 text-gray-800">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-200 pb-1 text-gray-900">Bahan-bahan Utama</h2>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
                    <li>1 kg daging sapi (potong kotak)</li>
                    <li>1 liter santan kental</li>
                    <li>500 ml santan encer</li>
                    <li>2 batang serai (memarkan)</li>
                    <li>5 lembar daun jeruk purut</li>
                    <li>2 lembar daun kunyit</li>
                    <li>2 butir asam kandis</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-200 pb-1 text-gray-900">Bumbu Halus</h2>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
                    <li>100 gr cabai merah keriting</li>
                    <li>15 siung bawang merah</li>
                    <li>7 siung bawang putih</li>
                    <li>3 cm jahe & 3 cm lengkuas</li>
                    <li>2 cm kunyit bakar</li>
                    <li>1 sdt ketumbar sangrai</li>
                    <li>Garam secukupnya</li>
                  </ul>
                </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-200 pb-1 text-gray-900">Langkah Memasak</h2>
              <ol className="list-decimal list-inside space-y-3 text-sm md:text-base text-justify leading-relaxed text-gray-700">
                <li>Masukkan santan encer, bumbu halus, serai, daun jeruk, daun kunyit, dan asam kandis ke dalam wajan.</li>
                <li>Aduk campuran perlahan di atas api sedang hingga mendidih agar santan tidak pecah.</li>
                <li>Setelah mendidih dan harum, masukkan potongan daging sapi. Aduk rata.</li>
                <li>Ketika kuah menyusut, tuang santan kental dan kecilkan api ke tingkat terendah.</li>
                <li>Masak sambil sesekali diaduk dari dasar wajan (proses ini memakan waktu <strong>3-4 jam</strong>).</li>
                <li>Masak hingga bumbu mengeluarkan minyak dan daging berwarna cokelat kehitaman pekat. Sajikan.</li>
              </ol>
            </div>

          </div>
        </div>
        
      </div>
      
    </div>
  );
}