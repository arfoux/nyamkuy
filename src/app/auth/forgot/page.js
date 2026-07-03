"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Msg = ({ msg }) => {
  if (!msg) return null;
  const isError = msg.type === "error";
  return (
    <div
      className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg mb-4 ${
        isError
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      <span className="mt-0.5">{isError ? "⚠" : "✓"}</span>
      <span>{msg.text}</span>
    </div>
  );
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!email) {
      setMsg({ text: "Email wajib diisi.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ text: data.error || "Terjadi kesalahan.", type: "error" });
      } else {
        setMsg({
          text: "Tautan reset telah dikirim. Silakan cek email kamu.",
          type: "success",
        });
        setDone(true);
      }
    } catch {
      setMsg({ text: "Tidak dapat terhubung ke server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      {/* Tombol Kembali ke Login */}
      <button
        type="button"
        onClick={() => router.push("/auth")}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                   bg-background border border-border/60 rounded-lg shadow-sm
                   text-muted-foreground hover:text-foreground hover:border-border
                   transition-all hover:shadow-md active:scale-95"
      >
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali ke Login
      </button>

      <div className="w-full max-w-[400px] bg-background border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-7 pt-6 pb-5 border-b border-border/50">
          <h1 className="text-lg font-semibold text-foreground leading-snug">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Masukkan email kamu untuk mendapatkan tautan reset kata sandi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          <Msg msg={msg} />

          {!done && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  autoComplete="email"
                  className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg
                             outline-none focus:border-foreground/40 focus:bg-background transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium bg-foreground text-background
                           rounded-lg flex items-center justify-center gap-2
                           hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Kirim Tautan Reset"}
              </button>
            </>
          )}

          {done && (
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="w-full py-2.5 text-sm font-medium border border-border text-foreground
                         rounded-lg flex items-center justify-center gap-2
                         hover:bg-muted/50 active:opacity-75 transition-colors"
            >
              Kembali ke Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
