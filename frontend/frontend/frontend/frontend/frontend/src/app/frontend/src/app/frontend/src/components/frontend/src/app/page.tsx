import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">AgentCloudBuilder</h1>
          <p className="text-sm text-slate-300">
            Dashboard shell (JWT-first). Next steps: auth, sidebar layout, systems, templates, builder,
            monitoring, usage meter.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-lg font-medium">Quick Links</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
            <li>
              <Link className="text-indigo-300 hover:underline" href="/login">
                Login
              </Link>
            </li>
            <li>
              <Link className="text-indigo-300 hover:underline" href="/dashboard">
                Dashboard (protected)
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
