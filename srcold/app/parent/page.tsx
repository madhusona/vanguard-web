"use client";
import RequireRole from "@/components/RequireRole";

export default function ParentHome() {
  return (
    <RequireRole role="parent">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Parent Tracking</h1>
        <p className="mt-2 text-gray-600">Live bus location and updates.</p>
      </div>
    </RequireRole>
  );
}
