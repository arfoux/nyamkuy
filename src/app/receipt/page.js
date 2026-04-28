import React from 'react';

export default function RecipePage() {
  return (
    <div className="min-h-screen bg-white flex justify-center p-8 font-sans">
      
      {/* Kontena Utama */}
      <div className="relative flex flex-col md:flex-row items-start md:items-start w-full max-w-5xl mt-10">

        {/* Gambar Makanan (Bulat) */}
        {/* z-10 memastikan bulatan gambar berada di atas elemen lain */}
        <div className="w-48 h-48 md:w-72 md:h-72 bg-[#d9d9d9] rounded-full flex items-center justify-center shrink-0 z-10 shadow-lg mx-auto md:mx-0 overflow-hidden border-4 border-white mt-4 md:mt-0">
           {/* Anda boleh menggantikan <span> di bawah dengan tag <img src="..." alt="Rendang" className="object-cover w-full h-full" /> */}
          <span className="text-gray-600 text-lg md:text-2xl font-medium">Foto Rendang</span>
        </div>

        {/* Bahagian Kandungan Resipi */}
        {/* -ml-0 md:-ml-16 menarik blok ini ke kiri untuk menghasilkan kesan bertindih dengan bulatan */}
        <div className="flex-1 md:-ml-16 flex flex-col gap-6 w-full mt-6 md:mt-4">

          {/* Sepanduk Tajuk (Banner) */}
          {/* Padding kiri (md:pl-24) ditambah agar teks tidak tertutup oleh gambar bulat */}
          <div className="bg-[#c4c4c4] w-full py-4 px-6 md:pl-24 md:pr-8 rounded-r-sm shadow-sm text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-wide uppercase">
              Rendang Daging Asli
            </h1>
          </div>

          {/* Kandungan Resipi (Bahan & Langkah) */}
          <div className="flex flex-col gap-8 md:pl-24 px-6 md:pr-8 text-gray-800">
            
            {/* Bahagian Bahan-bahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold mb-2 border-b-2 border-[#d9d9d9] pb-1">Bahan-bahan</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base leading-relaxed">
                    <li>1 kg daging lembu (potong kiub)</li>
                    <li>1 liter santan pekat (3-4 biji kelapa)</li>
                    <li>500 ml santan cair</li>
                    <li>2 batang serai (dititik)</li>
                    <li>5 helai daun limau purut</li>
                    <li>2 helai daun kunyit (disimpul)</li>
                    <li>2 keping asam kandis</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-lg font-bold mb-2 border-b-2 border-[#d9d9d9] pb-1">Bahan Kisar Halus</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base leading-relaxed">
                    <li>100 gram cili merah keriting</li>
                    <li>15 ulas bawang merah</li>
                    <li>7 ulas bawang putih</li>
                    <li>3 cm halia</li>
                    <li>3 cm lengkuas</li>
                    <li>2 cm kunyit hidup</li>
                    <li>1 sudu kecil ketumbar (disangrai)</li>
                    <li>Garam secukup rasa</li>
                  </ul>
                </div>
            </div>

            {/* Bahagian Cara Memasak */}
            <div>
              <h2 className="text-lg font-bold mb-2 border-b-2 border-[#d9d9d9] pb-1">Cara Memasak</h2>
              <ol className="list-decimal list-inside space-y-3 text-sm md:text-base text-justify leading-relaxed">
                <li>Masukkan santan cair, bahan kisar halus, serai, daun limau purut, daun kunyit, dan asam kandis ke dalam kuali atau periuk besar.</li>
                <li>Kacau campuran perlahan-lahan di atas api sederhana sehingga santan mendidih. Pastikan anda sentiasa mengacau supaya santan tidak pecah.</li>
                <li>Setelah mendidih dan naik bau wangi, masukkan potongan daging lembu ke dalam kuali. Gaulkan sehingga daging bersalut rata dengan bumbu.</li>
                <li>Apabila kuah mula menyusut sedikit, tuangkan santan pekat. Kurangkan api ke tahap minimum (api sangat perlahan).</li>
                <li>Teruskan memasak dan kacau sesekali dari dasar kuali supaya bahagian bawah tidak hangus. Proses mereneh ini mengambil masa kira-kira <strong>3 hingga 4 jam</strong>.</li>
                <li>Masak sehingga kuah mengering, dedak bumbu bertukar menjadi minyak, dan warna daging menjadi coklat kehitaman yang cantik. Angkat dan sedia untuk dihidangkan.</li>
              </ol>
            </div>

          </div>

        </div>
        
      </div>
      
    </div>
  );
}