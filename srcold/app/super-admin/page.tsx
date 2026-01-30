"use client";
import RequireRole from "@/components/RequireRole";

export default function SuperAdminHome() {
  return (
    <RequireRole role="super_admin">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Tenants, subscriptions, payments.</p>
      </div>
    </RequireRole>
  );
}
