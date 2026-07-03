"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

const EyeIcon = ({ show }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const PwField = ({ label, placeholder, value, onChange, show, onToggle, autoComplete }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg
                   outline-none focus:border-foreground/40 focus:bg-background transition-colors pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle password visibility"
      >
        <EyeIcon show={show} />
      </button>
    </div>
  </div>
);

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg({ text: "Tautan reset tidak valid atau tidak ditemukan.", type: "error" });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!password || !confirmPassword) {
      setMsg({ text: "Semua field wajib diisi.", type: "error" });
      return;
    }

    if (password.length < 8) {
      setMsg({ text: "Password minimal 8 karakter.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMsg({ text: "Konfirmasi password tidak cocok.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ text: data.error || "Terjadi kesalahan.", type: "error" });
      } else {
        setMsg({
          text: "Kata sandi berhasil diubah! Kamu bisa masuk sekarang.",
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
    <>
      <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
        <Msg msg={msg} />

        {!done && token && (
          <>
            <PwField
              label="Password Baru"
              placeholder="min. 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              show={showPw}
              onToggle={() => setShowPw(!showPw)}
              autoComplete="new-password"
            />

            <PwField
              label="Konfirmasi Password"
              placeholder="ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showCpw}
              onToggle={() => setShowCpw(!showCpw)}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium bg-foreground text-background
                         rounded-lg flex items-center justify-center gap-2
                         hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Ubah Kata Sandi"}
            </button>
          </>
        )}

        {(done || !token) && (
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="w-full py-2.5 text-sm font-medium border border-border text-foreground
                       rounded-lg flex items-center justify-center gap-2
                       hover:bg-muted/50 active:opacity-75 transition-colors"
          >
            Pergi ke Halaman Login
          </button>
        )}
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

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
            Buat Kata Sandi Baru
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Silakan masukkan kata sandi baru untuk akunmu.
          </p>
        </div>

        <Suspense fallback={<div className="p-7 text-sm text-center">Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
