"use client";
import RequireRole from "@/components/RequireRole";

export default function SchoolHome() {
  return (
    <RequireRole role="school">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">School Dashboard</h1>
        <p className="mt-2 text-gray-600">Vehicles, drivers, trip history.</p>
      </div>
    </RequireRole>
  );
}
