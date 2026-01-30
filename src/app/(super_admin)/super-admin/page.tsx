"use client";

import Link from "next/link";

export default function SuperAdminHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage tenants (schools) and their subscriptions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/super-admin/tenants" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Tenants</div>
          <div className="text-sm text-zinc-600 mt-1">View & manage all schools</div>
        </Link>

        <Link href="/super-admin/tenants/new" className="border rounded-lg p-4 hover:bg-zinc-50">
          <div className="font-medium">Create Tenant</div>
          <div className="text-sm text-zinc-600 mt-1">Onboard a new school</div>
        </Link>
      </div>

      <div className="text-sm text-zinc-500">
        Next: add billing status, plan expiry reminders, and payment links.
      </div>
    </div>
  );
}
