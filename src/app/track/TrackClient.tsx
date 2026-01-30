"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";

type Latest = {
  latitude: number;
  longitude: number;
  speed?: number;
  provider?: string | null;
  timestamp?: string | null;
  trip_id?: number | null;
};

type ApiResp = {
  vehicle_number: string;
  latest: Latest | null;
};

export default function TrackClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [status, setStatus] = useState<string>("Loading…");

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://46.62.197.103:8080").replace(/\/+$/, "");

  async function fetchLatest() {
    if (!token) throw new Error("Missing token");
    const url = `${API_BASE}/public/track/${encodeURIComponent(token)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }
    return (await res.json()) as ApiResp;
  }

  useEffect(() => {
    let mounted = true;
    let intervalId: any = null;

    async function initMap() {
      try {
        if (!token) {
          setStatus("Missing token in URL. Use /track?token=XXXX");
          return;
        }

        const L = await import("leaflet");
        if (!mounted || !containerRef.current) return;

        // Fix default marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // First point
        const data = await fetchLatest();
        if (!mounted) return;

        const defaultLatLng: [number, number] = [11.0168, 76.9558];
        const startLatLng: [number, number] = data.latest
          ? [data.latest.latitude, data.latest.longitude]
          : defaultLatLng;

        const map = L.map(containerRef.current).setView(startLatLng, data.latest ? 15 : 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;

        if (data.latest) {
          const marker = L.marker(startLatLng).addTo(map);
          marker.bindPopup(`${data.vehicle_number}`).openPopup();
          markerRef.current = marker;
          setStatus("Live");
        } else {
          setStatus("No GPS data yet.");
        }

        intervalId = window.setInterval(async () => {
          try {
            const d = await fetchLatest();
            if (!mounted) return;

            if (!d.latest) {
              setStatus("No GPS data yet.");
              return;
            }

            const latLng: [number, number] = [d.latest.latitude, d.latest.longitude];
            if (markerRef.current) markerRef.current.setLatLng(latLng);
            if (mapRef.current) mapRef.current.panTo(latLng, { animate: true });

            setStatus(`Live • ${d.vehicle_number} • speed ${d.latest.speed ?? 0}`);
          } catch {
            setStatus("Link invalid/expired or server error.");
          }
        }, 5000);
      } catch (e: any) {
        setStatus(e?.message || "Failed to load map");
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (intervalId) window.clearInterval(intervalId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-black">
      <div className="p-3 text-white text-sm flex items-center justify-between">
        <div className="font-semibold">Live Vehicle Tracking</div>
        <div className="opacity-90">{status}</div>
      </div>

      <div ref={containerRef} style={{ height: "calc(100vh - 48px)", width: "100%" }} />
    </div>
  );
}