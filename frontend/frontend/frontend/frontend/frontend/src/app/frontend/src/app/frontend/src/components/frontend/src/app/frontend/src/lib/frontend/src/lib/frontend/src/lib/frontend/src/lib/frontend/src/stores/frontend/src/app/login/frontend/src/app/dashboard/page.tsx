"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { me } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => me(token as string),
    enabled: !!token
  });

  if (!token) return null;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-slate-300">Protected route (requires JWT).</p>
          </div>

          <div className="flex gap-2">
            <Link
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm hover:border-slate-500"
              href="/"
            >
              Home
            </Link>
            <button
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm hover:border-slate-500"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-lg font-medium">/me response</h2>

          {profileQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-300">Loading…</p>
          ) : profileQuery.isError ? (
            <div className="mt-3 rounded-md border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-200">
              {(profileQuery.error as Error).message}
            </div>
          ) : (
            <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
{JSON.stringify(profileQuery.data, null, 2)}
            </pre>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-lg font-medium">Next endpoints to wire</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
            <li>GET /systems</li>
            <li>POST /systems</li>
            <li>POST /systems/:id/run</li>
            <li>GET /templates</li>
            <li>GET /usage</li>
            <li>GET /billing</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
