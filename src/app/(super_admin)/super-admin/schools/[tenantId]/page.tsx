"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  valid_till?: string | null;
  is_active: boolean;
  created_at?: string | null;
  users_count: number;
  vehicles_count: number;
  school_admin?: {
    id: number;
    username: string;
    name?: string | null;
    created_at?: string | null;
  } | null;
};

type ResetResp = {
  message: string;
  tenant_id: string;
  username: string;
  temp_password: string;
};

export default function TenantViewPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResp | null>(null);

  const [dangerBusy, setDangerBusy] = useState(false);

  async function loadTenant() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/api/super_admin/tenants/${encodeURIComponent(tenantId)}`
      );

      // normalize backend shape
      const raw = (res.data?.tenant ?? res.data) as any;

      const normalized: Tenant = {
        id: String(raw?.id ?? ""),
        name: String(raw?.name ?? ""),
        slug: String(raw?.slug ?? tenantId),
        email: raw?.email ?? null,
        valid_till: raw?.valid_till ?? null,
        is_active: Boolean(raw?.is_active),
        created_at: raw?.created_at ?? null,
        users_count: Number(raw?.users_count ?? 0),
        vehicles_count: Number(raw?.vehicles_count ?? 0),

        // ✅ THIS WAS MISSING
        school_admin: raw?.school_admin ?? null,
      };

      setTenant(normalized);
    } catch (e: any) {
      setError(
        e?.response?.data?.description || e?.message || "Failed to load tenant"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  async function resetAdminPassword() {
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await api.post(`/api/super_admin/reset_school_password`, {
        tenant_id: tenantId, // slug
      });
      setResetResult(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.description || "Password reset failed");
    } finally {
      setResetLoading(false);
    }
  }

  async function downloadTenantZip() {
    setDangerBusy(true);
    try {
      const res = await api.get(
        `/api/super_admin/tenants/${encodeURIComponent(tenantId)}/export`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const cd = res.headers["content-disposition"] as string | undefined;
      const match = cd?.match(/filename="([^"]+)"/);
      a.download = match?.[1] || `${tenantId}_export.zip`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to download ZIP");
    } finally {
      setDangerBusy(false);
    }
  }

  async function deleteTenant() {
    const ok = confirm(
      `Delete tenant "${tenantId}"?\n\nThis will permanently delete:\n- Drivers\n- School admins\n- Vehicles\n- Trips\n- GPS\n- Tracking links\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setDangerBusy(true);
    try {
      await api.delete(
        `/api/super_admin/tenants/${encodeURIComponent(tenantId)}`
      );
      router.push("/super-admin/tenants");
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to delete tenant");
    } finally {
      setDangerBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-zinc-600">Loading…</div>;
  if (error) return <div className="p-6 text-sm text-red-700">{error}</div>;
  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">School Details</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Tenant / School information and admin operations.
        </p>
      </div>

      {/* Tenant info */}
      <div className="border rounded p-4 space-y-2">
        <Info label="Name" value={tenant.name} />
        <Info
          label="School Admin Username"
          value={tenant.school_admin?.username || "-"}
        />
        <Info label="Slug" value={tenant.slug} />
        <Info label="Email" value={tenant.email || "-"} />
        <Info label="Valid Till" value={tenant.valid_till || "-"} />
        <Info label="Active" value={tenant.is_active ? "Yes" : "No"} />
        <Info label="Created At" value={tenant.created_at || "-"} />
        <Info label="Users" value={String(tenant.users_count ?? 0)} />
        <Info label="Vehicles" value={String(tenant.vehicles_count ?? 0)} />
      </div>

      {/* Reset password */}
      <div className="border rounded p-4 space-y-3">
        <div className="font-semibold">Reset School Admin Password</div>
        <button
          onClick={resetAdminPassword}
          disabled={resetLoading}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {resetLoading ? "Resetting..." : "Reset Password"}
        </button>

        {resetResult && (
          <div className="rounded border bg-green-50 p-3 text-sm">
            <div>
              Username: <b>{resetResult.username}</b>
            </div>
            <div className="mt-1">
              Temp password:{" "}
              <span className="font-mono text-base">
                {resetResult.temp_password}
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              Share securely. Visible once.
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="border rounded p-4 space-y-3">
        <div className="font-semibold text-red-700">Danger Zone</div>
        <div className="text-sm text-zinc-600">
          Download full tenant data or permanently delete this tenant and all
          related records.
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadTenantZip}
            disabled={dangerBusy}
            className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
          >
            {dangerBusy ? "Working..." : "Download ZIP (All Data)"}
          </button>

          <button
            onClick={deleteTenant}
            disabled={dangerBusy}
            className="rounded bg-red-600 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {dangerBusy ? "Working..." : "Delete Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="font-medium">{label}:</span> {value}
    </div>
  );
}
