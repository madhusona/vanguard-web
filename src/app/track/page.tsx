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

export default function PublicTrackMapPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [status, setStatus] = useState("Loading…");

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://46.62.197.103:8080"
  ).replace(/\/+$/, "");

  async function fetchLatest() {
    if (!token) throw new Error("Missing tracking token");

    const res = await fetch(
      `${API_BASE}/public/track/${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }

    return (await res.json()) as ApiResp;
  }

  useEffect(() => {
    if (!token) {
      setStatus("Invalid or missing tracking link");
      return;
    }

    let mounted = true;
    let timer: number | null = null;

    async function init() {
      try {
        const L = await import("leaflet");
        if (!mounted || !containerRef.current) return;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const data = await fetchLatest();
        if (!mounted) return;

        const lat = data.latest?.latitude ?? 11.0168;
        const lng = data.latest?.longitude ?? 76.9558;

        const map = L.map(containerRef.current).setView(
          [lat, lng],
          data.latest ? 15 : 13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;

        if (data.latest) {
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(data.vehicle_number).openPopup();
          markerRef.current = marker;
          setStatus("Live");
        } else {
          setStatus("Waiting for GPS data…");
        }

        timer = window.setInterval(async () => {
          try {
            const d = await fetchLatest();
            if (!mounted || !d.latest) return;

            const { latitude, longitude, speed } = d.latest;

            markerRef.current?.setLatLng([latitude, longitude]);
            mapRef.current?.panTo([latitude, longitude], { animate: true });

            setStatus(
              `Live • ${d.vehicle_number} • speed ${Math.round(speed ?? 0)}`
            );
          } catch {
            setStatus("Link expired or server unreachable");
          }
        }, 5000);
      } catch (e: any) {
        setStatus(e?.message || "Failed to load map");
      }
    }

    init();

    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white">
        <div className="font-semibold">Live Vehicle Tracking</div>
        <div className="opacity-90">{status}</div>
      </div>

      <div
        ref={containerRef}
        style={{ height: "calc(100vh - 48px)", width: "100%" }}
      />
    </div>
  );
}