"use client";

import Link from "next/link";

export default function SchoolHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">School Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Vehicles, drivers, trips and public tracking links.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/school/vehicles" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Vehicles</div>
          <div className="text-sm text-zinc-600 mt-1">Add or remove vehicles</div>
        </Link>
        <Link href="/school/drivers" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Drivers</div>
          <div className="text-sm text-zinc-600 mt-1">Create driver logins</div>
        </Link>
        <Link href="/school/trips" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Trips</div>
          <div className="text-sm text-zinc-600 mt-1">View trip history</div>
        </Link>
        <Link href="/school/tracking-links" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Tracking Links</div>
          <div className="text-sm text-zinc-600 mt-1">Generate parent tracking links</div>
        </Link>
      </div>
    </div>
  );
}
