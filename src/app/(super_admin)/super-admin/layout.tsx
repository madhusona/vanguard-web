"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import { clearSession, getUser } from "@/lib/auth";

const nav = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/tenants", label: "Tenants" },
  { href: "/super-admin/tenants/new", label: "Create Tenant" },
];

type User = {
  username?: string;
  role?: string;
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Avoid hydration mismatch: don't read localStorage during initial render
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      setUser(getUser());
    } catch {
      setUser(null);
    }
  }, []);

  const displayName = useMemo(() => {
    if (!mounted) return "Admin"; // server + first client render match
    return user?.username ?? "Admin";
  }, [mounted, user]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <RequireRole role="super_admin">
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Super Admin</div>
              <div className="font-semibold">{displayName}</div>
            </div>
            <button
              onClick={logout}
              className="text-sm rounded border px-3 py-1 bg-white hover:bg-zinc-50"
            >
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
                    className={`block rounded px-3 py-2 text-sm ${
                      active ? "bg-black text-white" : "hover:bg-zinc-50"
                    }`}
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
