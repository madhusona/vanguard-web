"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Tenant = {
  id?: string | number;
  name: string;
  slug?: string;
  valid_till?: string | null;
};

function tenantSlug(t: Tenant): string {
  return String(t.slug ?? t.id ?? t.name);
}

export default function TenantsPage() {
  const [items, setItems] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/api/super_admin/list_tenants");
      const tenants = (res.data?.tenants ?? res.data ?? []) as Tenant[];
      setItems(Array.isArray(tenants) ? tenants : []);
    } catch (e: any) {
      setErr(e?.response?.data?.description || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadTenantZip(slug: string) {
    setBusySlug(slug);
    try {
      const res = await api.get(`/api/super_admin/tenants/${encodeURIComponent(slug)}/export`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const cd = res.headers["content-disposition"] as string | undefined;
      const match = cd?.match(/filename="([^"]+)"/);
      a.download = match?.[1] || `${slug}_export.zip`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to download ZIP");
    } finally {
      setBusySlug(null);
    }
  }

  async function deleteTenant(slug: string) {
    const ok = confirm(
      `Delete tenant "${slug}"?\n\nThis will delete:\n- Drivers\n- School admins\n- Vehicles\n- Trips\n- GPS\n- Tracking links\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusySlug(slug);
    try {
      await api.delete(`/api/super_admin/tenants/${encodeURIComponent(slug)}`);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to delete tenant");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <p className="mt-1 text-sm text-zinc-600">All onboarded schools.</p>
        </div>

        <Link
          href="/super-admin/tenants/new"
          className="rounded bg-black text-white px-3 py-2 text-sm"
        >
          + Create Tenant
        </Link>
      </div>

      {err && (
        <div className="border rounded p-3 text-sm text-red-700 bg-red-50">{err}</div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Valid Till</th>
              <th className="text-left p-2">Open</th>
              <th className="text-left p-2">Export</th>
              <th className="text-left p-2">Delete</th>
            </tr>
          </thead>

          <tbody>
            {items.map((t) => {
              const slug = tenantSlug(t);
              const busy = busySlug === slug;

              return (
                <tr key={slug} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.slug ?? "-"}</td>
                  <td className="p-2">{t.valid_till ?? "-"}</td>

                  <td className="p-2">
                    <Link
                      href={`/super-admin/schools/${encodeURIComponent(slug)}`}
                      className="text-blue-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => downloadTenantZip(slug)}
                      disabled={busy}
                      className="rounded border px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-60"
                      title="Download Drivers, Vehicles, Trips, GPS, Tracking Links"
                    >
                      {busy ? "Preparing..." : "Download ZIP"}
                    </button>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => deleteTenant(slug)}
                      disabled={busy}
                      className="text-red-700 hover:underline disabled:opacity-60"
                    >
                      {busy ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && items.length === 0 && (
              <tr>
                <td className="p-2 text-zinc-500" colSpan={6}>
                  No tenants found.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td className="p-2 text-zinc-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={load} className="text-sm rounded border px-3 py-2 hover:bg-zinc-50">
        Refresh
      </button>
    </div>
  );
}
