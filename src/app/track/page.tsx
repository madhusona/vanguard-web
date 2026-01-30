import { Suspense } from "react";
import TrackClient from "./TrackClient";

export const dynamic = "force-dynamic";

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <TrackClient />
    </Suspense>
  );
}