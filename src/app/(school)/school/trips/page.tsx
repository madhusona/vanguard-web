"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Trip = {
  id?: number | string;
  vehicle_id?: number | string;
  vehicle_number?: string;
  trip_type?: string;
  status?: string;
  start_time?: string;
  end_time?: string | null;
  driver_id?: number | string | null;
};

type TripsApiResponse = {
  data: Trip[];
  next_cursor: string | null;
  has_more: boolean;
};

export default function TripsPage() {
  // Filters
  const [status, setStatus] = useState<"Running" | "Ended" | "All">("Running");
  const [vehicleNumber, setVehicleNumber] = useState("");

  // Data + pagination
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", status);
    p.set("limit", "20");
    if (vehicleNumber.trim()) p.set("vehicle_number", vehicleNumber.trim());
    return p;
  }, [status, vehicleNumber]);

  async function fetchTrips(opts?: { reset?: boolean }) {
    const reset = opts?.reset ?? false;

    // For reset: start fresh (no cursor)
    // For load more: use stored cursor
    const p = new URLSearchParams(baseParams);
    if (!reset && cursor) p.set("cursor", cursor);

    // Two loading states so "Load more" button can show separately
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get<TripsApiResponse>(`/api/trips?${p.toString()}`);
      const payload = res.data;

      const newTrips = payload?.data ?? [];
      setTrips((prev) => (reset ? newTrips : [...prev, ...newTrips]));

      setCursor(payload?.next_cursor ?? null);
      setHasMore(Boolean(payload?.has_more));
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to fetch trips");
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  }

  // Initial load: running trips by default
  useEffect(() => {
    fetchTrips({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters change, reset list
  useEffect(() => {
    setTrips([]);
    setCursor(null);
    setHasMore(false);
    fetchTrips({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, vehicleNumber]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Trips</h1>
        <p className="text-sm text-gray-600">
          Default shows running trips. Filter by status or vehicle number.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end max-w-3xl">
        <div className="min-w-[180px]">
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="Running">Running</option>
            <option value="Ended">Ended</option>
            <option value="All">All</option>
          </select>
        </div>

        <div className="min-w-[280px] flex-1">
          <label className="block text-xs text-gray-600 mb-1">Vehicle Number (optional)</label>
          <input
            className="w-full border rounded p-2 text-sm"
            placeholder="TN09AB1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            Leave empty to see all vehicles (based on your role).
          </div>
        </div>

        <button
          onClick={() => fetchTrips({ reset: true })}
          disabled={loading}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Trip ID</th>
              <th className="text-left p-2">Vehicle</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">End</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t, idx) => (
              <tr key={`${t.id ?? "x"}-${idx}`} className="border-t">
                <td className="p-2">{t.id ?? "-"}</td>
                <td className="p-2">{t.vehicle_number ?? "-"}</td>
                <td className="p-2">{t.trip_type ?? "-"}</td>
                <td className="p-2">{t.start_time ?? "-"}</td>
                <td className="p-2">{t.end_time ?? "-"}</td>
                <td className="p-2">{t.status ?? "-"}</td>
              </tr>
            ))}

            {!loading && trips.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={6}>
                  No trips found.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={6}>
                  Loading trips...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => fetchTrips({ reset: false })}
          disabled={loadingMore || loading || !hasMore}
          className="rounded border px-4 py-2 text-sm disabled:opacity-60"
        >
          {loadingMore ? "Loading..." : hasMore ? "Load more" : "No more"}
        </button>

        <div className="text-xs text-gray-500">
          Showing {trips.length} trip{trips.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
