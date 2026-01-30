"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { api } from "@/lib/api";

export default function ParentTrackPage() {
  const [vehicleNumber, setVehicleNumber] = useState("TN01AB1234");
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function fetchLatest() {
    try {
      setErr(null);
      const res = await api.get(`/api/track/latest?vehicle_number=${encodeURIComponent(vehicleNumber)}`);
      setData(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.description || e?.response?.data?.title || "Failed to fetch tracking");
    }
  }

  useEffect(() => {
    fetchLatest();
    const t = setInterval(fetchLatest, 7000); // poll every 7s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleNumber]);

  return (
    <RequireRole role="parent">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Track Bus</h1>

        <div className="flex gap-3 max-w-xl">
          <input
            className="w-full border rounded p-2 text-sm"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="Vehicle Number"
          />
          <button onClick={fetchLatest} className="rounded bg-black text-white px-4 py-2 text-sm">
            Refresh
          </button>
        </div>

        {err && <div className="border rounded p-3 text-sm text-red-700 bg-red-50">{err}</div>}

        <div className="border rounded p-4 text-sm">
          <div className="font-medium">Vehicle: {data?.vehicle_number ?? "-"}</div>
          <div className="mt-2">
            Latest:{" "}
            {data?.latest
              ? `${data.latest.latitude}, ${data.latest.longitude} @ ${data.latest.recorded_at}`
              : "No GPS points yet"}
          </div>
        </div>

        {/* Map integration can be added next (Leaflet/Google Maps) */}
      </div>
    </RequireRole>
  );
}
