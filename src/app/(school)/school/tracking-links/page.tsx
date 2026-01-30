"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type TrackingLink = {
  token: string;
  vehicle_number: string;
  expires_at?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

function normalizeList(data: any): TrackingLink[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.links)) return data.links;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.links)) return data.data.links;
  return [];
}

export default function TrackingLinksPage() {
  const [items, setItems] = useState<TrackingLink[]>([]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const examplePublicUrl = useMemo(() => `${API_BASE}/public/track/<token>`, [API_BASE]);

  async function load() {
    setErr(null);
    try {
      // ✅ backend list endpoint
      const res = await api.get("/api/school/tracking_links/list");
      setItems(normalizeList(res.data));
    } catch (e: any) {
      setErr(e?.response?.data?.description || "Failed to load tracking links");
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createLink() {
    if (!vehicleNumber.trim()) return alert("Enter vehicle number");
    setLoading(true);
    setErr(null);
    try {
      // ✅ backend create endpoint
      const res = await api.post("/api/school/tracking_links", {
        vehicle_number: vehicleNumber.trim(),
        expires_in_days: Number(expiresInDays) || 30,
      });

      const token = res.data?.token as string | undefined;
      const publicUrl =
        (res.data?.public_url as string | undefined) || (token ? `${API_BASE}/public/track/${token}` : "");

      if (publicUrl) alert(`Tracking link created:\n${publicUrl}`);

      setVehicleNumber("");
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to create tracking link");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(token: string) {
    if (!confirm("Revoke this tracking link?")) return;
    try {
      // ✅ backend revoke endpoint is POST
      await api.post(`/api/school/tracking_links/revoke/${encodeURIComponent(token)}`);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to revoke tracking link");
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracking Links</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create a public link for parents to track a vehicle without login.
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-3 max-w-xl">
        <div className="text-sm font-medium">Create Tracking Link</div>

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Vehicle Number (e.g., TN09AB1234)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-700">Expires in (days)</label>
          <input
            type="number"
            className="w-28 border rounded p-2 text-sm"
            value={expiresInDays}
            min={1}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
          />
        </div>

        <button
          disabled={loading}
          onClick={createLink}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>

        <div className="text-xs text-zinc-500">Public URL format: {examplePublicUrl}</div>
      </div>

      {err && (
        <div className="border rounded p-3 text-sm text-amber-800 bg-amber-50">{err}</div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-2">Vehicle</th>
              <th className="text-left p-2">Token</th>
              <th className="text-left p-2">Expires At</th>
              <th className="text-left p-2">Link</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((l) => {
              const url = `${API_BASE}/public/track/${l.token}`;
              return (
                <tr key={l.token} className="border-t">
                  <td className="p-2">{l.vehicle_number}</td>
                  <td className="p-2 font-mono text-xs">{l.token}</td>
                  <td className="p-2">{l.expires_at ?? "-"}</td>
                  <td className="p-2">
                    <button onClick={() => copy(url)} className="text-blue-700 hover:underline">
                      Copy
                    </button>
                  </td>
                  <td className="p-2">
                    <button onClick={() => revoke(l.token)} className="text-red-600 hover:underline">
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td className="p-2 text-zinc-500" colSpan={5}>
                  No tracking links found.
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
