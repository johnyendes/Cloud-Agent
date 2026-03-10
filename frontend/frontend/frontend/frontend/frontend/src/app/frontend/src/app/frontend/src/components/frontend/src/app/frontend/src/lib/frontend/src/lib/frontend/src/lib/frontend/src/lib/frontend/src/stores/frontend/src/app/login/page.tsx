"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: (data) => {
      setToken(data.access_token);
      router.push("/dashboard");
    }
  });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-sm text-slate-300">
            Uses JWT access token returned by <code className="text-slate-100">POST /auth/login</code>.
          </p>
        </header>

        <form
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Email</span>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Password</span>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {mutation.isError ? (
            <div className="rounded-md border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-200">
              {(mutation.error as Error).message}
            </div>
          ) : null}

          <button
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
