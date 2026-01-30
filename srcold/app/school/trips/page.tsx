"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function TripsPage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTrips() {
    if (!vehicleNumber.trim()) return alert("Enter vehicle number");
    setLoading(true);
    try {
      const res = await api.get(`/api/trips?vehicle_number=${encodeURIComponent(vehicleNumber.trim())}`);
      setTrips(res.data ?? []);
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Trips</h1>
        <p className="text-sm text-gray-600">View trip history by vehicle number.</p>
      </div>

      <div className="flex gap-3 items-center max-w-xl">
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Vehicle Number (e.g., TN09AB1234)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />
        <button
          onClick={fetchTrips}
          disabled={loading}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Trip ID</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">End</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{t.id ?? "-"}</td>
                <td className="p-2">{t.trip_type ?? "-"}</td>
                <td className="p-2">{t.start_time ?? "-"}</td>
                <td className="p-2">{t.end_time ?? "-"}</td>
                <td className="p-2">{t.status ?? "-"}</td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={5}>
                  No trips loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
