"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Latest = {
  latitude: number;
  longitude: number;
  speed?: number | null;
  provider?: string | null;
  timestamp?: string | null;
  trip_id?: number | null;
};

export default function PublicTrackPage() {
  const { token } = useParams<{ token: string }>();
  const [vehicleNumber, setVehicleNumber] = useState<string>("-");
  const [latest, setLatest] = useState<Latest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  async function fetchLatest() {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/public/track/${token}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.description || json?.title || "Failed to fetch tracking");
      }

      setVehicleNumber(json.vehicle_number || "-");
      setLatest(json.latest || null);
    } catch (e: any) {
      setError(e.message || "Failed to fetch");
    }
  }

  useEffect(() => {
    fetchLatest();
    const t = setInterval(fetchLatest, 7000); // poll every 7 sec
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Live Bus Tracking</h1>

      <div className="border rounded p-4 text-sm space-y-2">
        <div><span className="font-medium">Vehicle:</span> {vehicleNumber}</div>
        <div>
          <span className="font-medium">Latest:</span>{" "}
          {latest
            ? `${latest.latitude}, ${latest.longitude} @ ${latest.timestamp ?? "-"}`
            : "No GPS points yet"}
        </div>
        {latest?.speed != null && (
          <div><span className="font-medium">Speed:</span> {latest.speed}</div>
        )}
      </div>

      {error && (
        <div className="border rounded p-3 text-sm text-red-700 bg-red-50">
          {error}
        </div>
      )}

      <button
        onClick={fetchLatest}
        className="rounded bg-black text-white px-4 py-2 text-sm"
      >
        Refresh
      </button>

      {/* Next step: add map (Leaflet) */}
    </div>
  );
}
