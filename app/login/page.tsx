"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ece0] flex flex-col">
      <header className="px-6 py-3 bg-[#410e2b]">
        <span className="text-xs uppercase tracking-[0.2em] font-light text-white/70">PRiMAX</span>
        <h1 className="text-sm font-semibold tracking-wide text-white leading-tight">Floor Plan Studio</h1>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-800">Sign in</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">Access is restricted to authorised users.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#410e2b] focus:ring-1 focus:ring-[#410e2b]/20 transition-colors"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#410e2b] focus:ring-1 focus:ring-[#410e2b]/20 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#410e2b] hover:bg-[#5a1340] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
