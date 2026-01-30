"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { api } from "@/lib/api";

export default function TenantsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/api/super_admin/list_tenants");
      setItems(res.data?.tenants ?? res.data ?? []);
    })();
  }, []);

  return (
    <RequireRole role="super_admin">
      <div className="p-6">
        <h1 className="text-xl font-semibold">Tenants</h1>

        <div className="mt-4 overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Slug</th>
                <th className="text-left p-2">Valid Till</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.slug}</td>
                  <td className="p-2">{t.valid_till ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}
