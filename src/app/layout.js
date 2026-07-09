import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteUrl = "https://nyamkuy.app";
const siteName = "NyamKuy";

const recipeKeywords = [
  "NyamKuy",
  "Nyam Kuy",
  "ide masakan",
  "ide masak",
  "ide makanan",
  "inspirasi masakan",
  "inspirasi makanan",
  "rekomendasi masakan",
  "rekomendasi makanan",
  "bingung mau masak apa",
  "mau masak apa",
  "masak apa hari ini",
  "makan apa hari ini",
  "menu hari ini",
  "menu masakan hari ini",
  "menu rumahan",
  "menu harian",
  "menu makan siang",
  "menu makan malam",
  "menu sarapan",
  "resep masakan",
  "resep makanan",
  "resep rumahan",
  "resep sederhana",
  "resep masakan sederhana",
  "resep masakan rumahan",
  "resep masakan Indonesia",
  "masakan Indonesia",
  "masakan nusantara",
  "masakan rumahan",
  "masakan sederhana",
  "masakan hemat",
  "masakan anak kos",
  "masakan keluarga",
  "ide bekal",
  "ide lauk",
  "ide lauk harian",
  "ide lauk sederhana",

  "resep ayam",
  "resep ayam bakar",
  "resep ayam geprek",
  "resep ayam goreng",
  "resep ayam penyet",
  "resep ayam pop",
  "resep ayam rica rica",
  "resep ayam rica-rica",
  "resep ayam taliwang",
  "resep ayam ungkep",
  "resep ayam woku",
  "resep opor ayam",
  "resep sop ayam",
  "resep soto ayam",
  "resep bubur ayam",
  "resep sate ayam",

  "ayam bakar",
  "ayam geprek",
  "ayam goreng",
  "ayam penyet",
  "ayam pop",
  "ayam rica rica",
  "ayam rica-rica",
  "ayam taliwang",
  "ayam ungkep",
  "ayam woku",
  "opor ayam",
  "sop ayam",
  "soto ayam",
  "bubur ayam",
  "sate ayam",

  "resep seblak",
  "seblak",
  "cara membuat seblak",
  "resep seblak sederhana",
  "resep seblak pedas",
  "resep seblak kuah",

  "resep nasi goreng",
  "nasi goreng",
  "nasi goreng jawa",
  "nasi goreng kampung",
  "nasi goreng sederhana",
  "nasi goreng spesial",
  "resep nasi goreng jawa",
  "resep nasi goreng kampung",
  "resep nasi goreng sederhana",
  "resep nasi goreng spesial",

  "resep nasi gudeg",
  "resep nasi kuning",
  "resep nasi liwet",
  "resep nasi pecel",
  "resep nasi uduk",
  "nasi gudeg",
  "nasi kuning",
  "nasi liwet",
  "nasi pecel",
  "nasi uduk",

  "resep rendang",
  "rendang",
  "resep rawon",
  "rawon",
  "resep dendeng balado",
  "dendeng balado",
  "resep semur daging",
  "semur daging",
  "resep empal gentong",
  "empal gentong",
  "resep empal gepuk sapi",
  "empal gepuk sapi",
  "resep tongseng sapi",
  "tongseng sapi",
  "resep sop iga",
  "sop iga",
  "resep gule kambing",
  "gule kambing",
  "resep sate kambing",
  "sate kambing",

  "resep ikan",
  "resep gurame bakar",
  "resep gurame goreng",
  "resep gurami asam manis",
  "gurame bakar",
  "gurame goreng",
  "gurami asam manis",

  "resep seafood",
  "resep cumi",
  "resep cumi saus padang",
  "cumi saus padang",
  "resep udang",
  "resep udang mentega",
  "resep udang saus padang",
  "udang mentega",
  "udang saus padang",

  "resep mie ayam",
  "mie ayam",
  "resep mie goreng",
  "mie goreng",
  "resep kwetiau goreng",
  "kwetiau goreng",

  "resep soto",
  "soto ayam",
  "soto betawi",
  "soto lamongan",
  "resep soto ayam",
  "resep soto betawi",
  "resep soto lamongan",

  "resep sate",
  "sate ayam",
  "sate kambing",
  "sate lilit",
  "sate padang",
  "sate taichan",
  "resep sate ayam",
  "resep sate kambing",
  "resep sate lilit",
  "resep sate padang",
  "resep sate taichan",

  "resep batagor",
  "batagor",
  "resep ketoprak",
  "ketoprak",
  "resep martabak manis",
  "martabak manis",
  "resep martabak telur",
  "martabak telur",
  "resep cah kangkung",
  "cah kangkung",
  "masakan padang",
  "resep masakan padang",
  "padang",
];

const popularRecipes = [
  "Ayam Bakar",
  "Ayam Geprek",
  "Ayam Goreng",
  "Ayam Penyet",
  "Ayam Pop",
  "Ayam Rica-Rica",
  "Ayam Taliwang",
  "Ayam Ungkep",
  "Ayam Woku",
  "Batagor",
  "Bubur Ayam",
  "Cah Kangkung",
  "Cumi Saus Padang",
  "Dendeng Balado",
  "Empal Gentong",
  "Empal Gepuk Sapi",
  "Gule Kambing",
  "Gurame Bakar",
  "Gurame Goreng",
  "Gurami Asam Manis",
  "Ketoprak",
  "Kwetiau Goreng",
  "Martabak Manis",
  "Martabak Telur",
  "Mie Ayam",
  "Mie Goreng",
  "Nasi Goreng Jawa",
  "Nasi Goreng Kampung",
  "Nasi Goreng Sederhana",
  "Nasi Goreng Spesial",
  "Nasi Gudeg",
  "Nasi Kuning",
  "Nasi Liwet",
  "Nasi Pecel",
  "Nasi Uduk",
  "Opor Ayam",
  "Masakan Padang",
  "Rawon",
  "Rendang",
  "Sate Ayam",
  "Sate Kambing",
  "Sate Lilit",
  "Sate Padang",
  "Sate Taichan",
  "Seblak",
  "Semur Daging",
  "Sop Ayam",
  "Sop Iga",
  "Soto Ayam",
  "Soto Betawi",
  "Soto Lamongan",
  "Tongseng Sapi",
  "Udang Mentega",
  "Udang Saus Padang",
];

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "NyamKuy - Cari Ide Masakan Saat Bingung Mau Masak Apa",
    template: "%s | NyamKuy",
  },

  description:
    "Bingung mau masak apa hari ini? NyamKuy bantu kamu menemukan ide masakan, resep ayam, seblak, nasi goreng, soto, sate, seafood, menu rumahan, dan inspirasi makanan harian dengan mudah.",

  applicationName: siteName,

  keywords: recipeKeywords,

  authors: [{ name: "NyamKuy" }],
  creator: "NyamKuy",
  publisher: "NyamKuy",

  generator: "Next.js",

  category: "Food & Cooking",

  classification:
    "Food, Cooking, Recipes, Indonesian Food, Ide Masakan, Resep Masakan",

  referrer: "origin-when-cross-origin",

  alternates: {
    canonical: siteUrl,
    languages: {
      "id-ID": siteUrl,
    },
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName,
    title: "NyamKuy - Cari Ide Masakan Saat Bingung Mau Masak Apa",
    description:
      "Temukan ide masakan harian seperti resep ayam, seblak, nasi goreng, soto, sate, rendang, seafood, dan menu rumahan saat kamu bingung mau masak apa.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NyamKuy - Cari Ide Masakan Saat Bingung Mau Masak Apa",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NyamKuy - Cari Ide Masakan Saat Bingung Mau Masak Apa",
    description:
      "Cari inspirasi masakan harian, resep ayam, seblak, nasi goreng, soto, sate, seafood, dan menu rumahan di NyamKuy.",
    images: ["/og-image.png"],
  },

icons: {
  icon: [
    {
      url: "/favicon.ico",
      sizes: "any",
    },
    {
      url: "/favicon-32x32.png",
      type: "image/png",
      sizes: "32x32",
    },
    {
      url: "/favicon-16x16.png",
      type: "image/png",
      sizes: "16x16",
    },
  ],
  apple: [
    {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
  shortcut: ["/favicon.ico"],
},

  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    title: "NyamKuy",
    statusBarStyle: "default",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  other: {
    "theme-color": "#ff7a1a",
    "color-scheme": "light",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "NyamKuy",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#ff7a1a",
    "msapplication-TileImage": "/android-chrome-192x192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ff7a1a",
};

export default function RootLayout({ children }) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NyamKuy",
    alternateName: ["Nyam Kuy", "NyamKuy App"],
    url: siteUrl,
    description:
      "NyamKuy adalah tempat mencari ide masakan saat bingung mau masak apa.",
    inLanguage: "id-ID",
    keywords: recipeKeywords.join(", "),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NyamKuy",
    url: siteUrl,
    logo: `${siteUrl}/android-chrome-512x512.png`,
    description:
      "NyamKuy membantu pengguna menemukan inspirasi masakan harian dan resep rumahan.",
    sameAs: [],
  };

  const foodSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ide Masakan Populer di NyamKuy",
    description:
      "Daftar ide masakan populer seperti ayam bakar, seblak, nasi goreng, rendang, soto, sate, dan menu rumahan lainnya.",
    itemListElement: popularRecipes.map((recipe, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: recipe,
      url: `${siteUrl}/search?q=${encodeURIComponent(recipe.toLowerCase())}`,
    })),
  };

  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(foodSiteJsonLd),
          }}
        />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}