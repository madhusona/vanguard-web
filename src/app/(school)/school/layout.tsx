"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import { clearSession, getUser } from "@/lib/auth";

const nav = [
  { href: "/school", label: "Dashboard" },
  { href: "/school/vehicles", label: "Vehicles" },
  { href: "/school/drivers", label: "Drivers" },
  { href: "/school/trips", label: "Trips" },
  { href: "/school/tracking-links", label: "Tracking Links" },
];

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <RequireRole role="school">
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">School Portal</div>
              <div className="font-semibold">{user?.username ?? "School"}</div>
            </div>
            <button onClick={logout} className="text-sm rounded border px-3 py-1 bg-white hover:bg-zinc-50">
              Logout
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-white border rounded-lg p-3 h-fit">
            <nav className="space-y-1">
              {nav.map((n) => {
                const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`block rounded px-3 py-2 text-sm ${active ? "bg-black text-white" : "hover:bg-zinc-50"}`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="bg-white border rounded-lg p-5">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
