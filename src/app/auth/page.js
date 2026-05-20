"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* =========================
   COMPONENT LUAR
========================= */

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
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
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

const PwField = ({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}) => (
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

/* =========================
   MAIN PAGE
========================= */

export default function AuthPage() {
  const router = useRouter();

  const [tab, setTab] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [regForm, setRegForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginMsg, setLoginMsg] = useState(null);
  const [regMsg, setRegMsg] = useState(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegCpw, setShowRegCpw] = useState(false);

  const [regDone, setRegDone] = useState(false);

  const getStrength = (pw) => {
    let s = 0;

    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;

    return s;
  };

  const strengthColors = ["", "#E24B4A", "#EF9F27", "#639922", "#1D9E75"];
  const strengthLabels = ["", "Lemah", "Cukup", "Kuat", "Sangat kuat"];
  const strength = getStrength(regForm.password);

  const handleLogin = async () => {
    setLoginMsg(null);

    const { email, password } = loginForm;

    if (!email || !password) {
      setLoginMsg({
        text: "Email dan password wajib diisi.",
        type: "error",
      });
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginMsg({
          text: data.error || "Terjadi kesalahan.",
          type: "error",
        });
      } else {
        setLoginMsg({
          text: "Berhasil masuk! Mengalihkan...",
          type: "success",
        });

        setTimeout(() => router.push("/"), 800);
      }
    } catch {
      setLoginMsg({
        text: "Tidak dapat terhubung ke server.",
        type: "error",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegMsg(null);

    const { email, password, confirmPassword } = regForm;

    if (!email || !password || !confirmPassword) {
      setRegMsg({
        text: "Semua field wajib diisi.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      setRegMsg({
        text: "Password minimal 8 karakter.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setRegMsg({
        text: "Konfirmasi password tidak cocok.",
        type: "error",
      });
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegMsg({
          text: data.error || "Terjadi kesalahan.",
          type: "error",
        });
      } else {
        setRegMsg({
          text: "Akun dibuat! Cek email kamu untuk verifikasi.",
          type: "success",
        });

        setRegDone(true);
      }
    } catch {
      setRegMsg({
        text: "Tidak dapat terhubung ke server.",
        type: "error",
      });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[400px] bg-background border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/android-chrome-512x512.png"
                alt="Logo NyamKuy"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-sm font-semibold tracking-tight">
              NyamKuy
            </span>
          </div>

          <h1 className="text-lg font-semibold text-foreground leading-snug">
            {tab === "login" ? "Selamat datang kembali" : "Buat akun baru"}
          </h1>

          <p className="text-xs text-muted-foreground mt-1">
            {tab === "login"
              ? "Masuk untuk melanjutkan ke dapur kamu"
              : "Gratis, tanpa kartu kredit"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          {["login", "register"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setLoginMsg(null);
                setRegMsg(null);
              }}
              className={`flex-1 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {t === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {tab === "login" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loginLoading) handleLogin();
            }}
            className="px-7 py-6 space-y-4"
          >
            <Msg msg={loginMsg} />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>

              <input
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                placeholder="kamu@email.com"
                autoComplete="email"
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg
                           outline-none focus:border-foreground/40 focus:bg-background transition-colors"
              />
            </div>

            <PwField
              label="Password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                })
              }
              show={showLoginPw}
              onToggle={() => setShowLoginPw(!showLoginPw)}
              autoComplete="current-password"
            />

            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => router.push("/auth/forgot")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Lupa kata sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 text-sm font-medium bg-foreground text-background
                         rounded-lg flex items-center justify-center gap-2
                         hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-50"
            >
              {loginLoading ? "Memproses..." : "Masuk"}

              {!loginLoading && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>
        )}

        {/* REGISTER */}
        {tab === "register" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!regLoading && !regDone) handleRegister();
            }}
            className="px-7 py-6 space-y-4"
          >
            <Msg msg={regMsg} />

            {!regDone && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>

                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="kamu@email.com"
                    autoComplete="email"
                    className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg
                               outline-none focus:border-foreground/40 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showRegPw ? "text" : "password"}
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="min. 8 karakter"
                      autoComplete="new-password"
                      className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg
                                 outline-none focus:border-foreground/40 focus:bg-background transition-colors pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowRegPw(!showRegPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      <EyeIcon show={showRegPw} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {regForm.password.length > 0 && (
                    <div>
                      <div className="flex gap-1 mt-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-colors"
                            style={{
                              background:
                                i <= strength
                                  ? strengthColors[strength]
                                  : "var(--border)",
                            }}
                          />
                        ))}
                      </div>

                      <p
                        className="text-xs mt-1"
                        style={{
                          color: strengthColors[strength],
                        }}
                      >
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <PwField
                  label="Konfirmasi password"
                  placeholder="ulangi password"
                  value={regForm.confirmPassword}
                  onChange={(e) =>
                    setRegForm({
                      ...regForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  show={showRegCpw}
                  onToggle={() => setShowRegCpw(!showRegCpw)}
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 text-sm font-medium bg-foreground text-background
                             rounded-lg flex items-center justify-center gap-2
                             hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-50"
                >
                  {regLoading ? "Memproses..." : "Buat akun"}

                  {!regLoading && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}