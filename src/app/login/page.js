"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tambahkan logika autentikasi/API call Anda di sini
    console.log("Coba login dengan:", { username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
        
        {/* Header Form */}
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          <p className="text-sm text-gray-500">
            Masukkan username dan password untuk masuk
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Username */}
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="text-sm font-medium leading-none text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ketik username Anda"
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="text-sm font-medium leading-none text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ketik password Anda"
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>

          {/* Tombol Login */}
          <Button type="submit" className="w-full mt-2">
            Masuk
          </Button>
          
        </form>
      </div>
    </div>
  );
}