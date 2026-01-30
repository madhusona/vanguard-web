"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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

export default function PublicTrackMapPage() {
  const { token } = useParams<{ token: string }>();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [status, setStatus] = useState<string>("Loading…");

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://46.62.197.103:8080").replace(/\/+$/, "");

  async function fetchLatest() {
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

    async function initMap() {
      try {
        const L = await import("leaflet");
        if (!mounted || !containerRef.current) return;

        // Fix default marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // Get first GPS point
        const data = await fetchLatest();
        if (!mounted) return;

        if (!data.latest) {
          setStatus("No GPS data yet.");
          // create map with a default location
          const map = L.map(containerRef.current).setView([11.0168, 76.9558], 13);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);
          mapRef.current = map;
          return;
        }

        const { latitude, longitude } = data.latest;

        const map = L.map(containerRef.current).setView([latitude, longitude], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`${data.vehicle_number}`).openPopup();

        mapRef.current = map;
        markerRef.current = marker;

        setStatus("Live");

        // Poll GPS every 5 seconds
        const t = window.setInterval(async () => {
          try {
            const d = await fetchLatest();
            if (!mounted) return;

            if (!d.latest) {
              setStatus("No GPS data yet.");
              return;
            }

            const lat = d.latest.latitude;
            const lng = d.latest.longitude;

            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
            if (mapRef.current) mapRef.current.panTo([lat, lng], { animate: true });

            setStatus(`Live • ${d.vehicle_number} • speed ${d.latest.speed ?? 0}`);
          } catch {
            setStatus("Link invalid/expired or server error.");
          }
        }, 5000);

        return () => window.clearInterval(t);
      } catch (e: any) {
        setStatus(e?.message || "Failed to load map");
      }
    }

    const cleanupPromise = initMap();

    return () => {
      mounted = false;
      // remove map cleanly
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      // in case initMap returned a cleanup function via interval
      // (safe to ignore if not)
      // @ts-ignore
      if (typeof cleanupPromise === "function") cleanupPromise();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
