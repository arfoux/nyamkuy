import React from 'react';

export default function RecipePage() {
  return (
    <div className="min-h-screen bg-[#fcfbfa] flex justify-center p-8 font-sans">
      
      {/* Kontainer Utama Terbagi 2 Kolom */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-12 lg:gap-16 mt-16">

        {/* ========================================= */}
        {/* BAGIAN KIRI: Kartu Menu (Hanya Rendang) */}
        {/* ========================================= */}
        <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start pt-12">
          
          <div className="relative bg-[#f4e8d8] rounded-[2rem] p-5 pt-16 shadow-sm flex flex-col w-56 cursor-pointer hover:shadow-md transition-shadow">
            
            {/* Gambar Menu (Overlap ke atas batas kartu) */}
            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-[#d9d9d9] rounded-full shadow-md overflow-hidden border-4 border-[#fcfbfa] flex items-center justify-center">
               {/* Gunakan tag <img src="..." /> di sini untuk foto piring rendang */}
               <span className="text-xs text-gray-500 font-medium text-center leading-tight px-2">Foto<br/>Rendang</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-[#d48c48] font-bold text-sm">9.8</span>
            </div>

            {/* Detail Teks */}
            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">Rendang Daging</h3>
            <p className="text-gray-600 text-xs mb-4 leading-relaxed">
              Daging sapi bumbu rempah Minang asli
            </p>

            {/* Harga & Tombol Tambah */}
            <div className="flex justify-between items-center mt-auto pt-2">
              <span className="font-bold text-gray-900 text-lg">Rp 45k</span>
              <button className="w-7 h-7 bg-[#b56a2b] text-white rounded-full flex items-center justify-center text-lg shadow hover:bg-[#9a5822] transition-colors">
                +
              </button>
            </div>
          </div>

        </div>


        {/* ========================================= */}
        {/* BAGIAN KANAN: Detail Resep Utama */}
        {/* ========================================= */}
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row items-start lg:mt-8">

          {/* Gambar Makanan Besar (Desain Pertama) */}
          <div className="w-48 h-48 md:w-64 md:h-64 bg-[#d9d9d9] rounded-full flex items-center justify-center shrink-0 z-10 shadow-md mx-auto lg:mx-0 overflow-hidden border-4 border-white">
            <span className="text-gray-600 text-lg md:text-xl font-medium">Foto Rendang</span>
          </div>

          <div className="flex-1 lg:-ml-12 flex flex-col gap-6 w-full mt-6 lg:mt-8">

            {/* Banner Judul */}
            <div className="bg-[#c4c4c4] w-full py-4 px-6 lg:pl-20 lg:pr-8 rounded-r-md shadow-sm text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-wide uppercase">
                Rendang Daging Asli
              </h1>
            </div>

            {/* Konten Resep */}
            <div className="flex flex-col gap-8 lg:pl-20 px-6 lg:pr-8 text-gray-800">
              
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
      
    </div>
  );
}