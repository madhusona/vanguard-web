"use client";

import { useEffect, useMemo, useState } from "react";
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

type Vehicle = {
  id: string;
  vehicle_number: string;
  device_imei?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

function safeStr(v: any, fallback = "") {
  const s = v == null ? "" : String(v);
  return s.trim() || fallback;
}

function pickList(resData: any): any[] {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.vehicles)) return resData.vehicles;
  if (Array.isArray(resData?.items)) return resData.items;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.message)) return resData.message;
  return [];
}

function isoToDateInput(iso?: string | null): string {
  if (!iso) return "";
  // Works for "2026-02-05T00:00:00" or "...Z"
  return String(iso).slice(0, 10);
}

function dateInputToIso(dateStr: string): string | null {
  // Backend uses datetime.fromisoformat(valid_till) so "YYYY-MM-DDT00:00:00" is perfect
  if (!dateStr) return null;
  return `${dateStr}T00:00:00`;
}

export default function SchoolViewPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResp | null>(null);

  const [dangerBusy, setDangerBusy] = useState(false);

  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleQ, setVehicleQ] = useState("");

  // ✅ Status / Validity controls
  const [statusBusy, setStatusBusy] = useState(false);
  const [validTillInput, setValidTillInput] = useState<string>(""); // yyyy-mm-dd

  const filteredVehicles = useMemo(() => {
    const q = vehicleQ.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => v.vehicle_number.toLowerCase().includes(q));
  }, [vehicles, vehicleQ]);

  async function loadTenant() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/super_admin/tenants/${encodeURIComponent(tenantId)}`);
      const raw = (res.data?.tenant ?? res.data) as any;

      const nextTenant: Tenant = {
        id: safeStr(raw?.id),
        name: safeStr(raw?.name),
        slug: safeStr(raw?.slug, tenantId),
        email: raw?.email ?? null,
        valid_till: raw?.valid_till ?? null,
        is_active: Boolean(raw?.is_active),
        created_at: raw?.created_at ?? null,
        users_count: Number(raw?.users_count ?? 0),
        vehicles_count: Number(raw?.vehicles_count ?? 0),
        school_admin: raw?.school_admin ?? null,
      };

      setTenant(nextTenant);

      // Initialize date input from server value
      setValidTillInput(isoToDateInput(nextTenant.valid_till));
    } catch (e: any) {
      setError(e?.response?.data?.description || e?.message || "Failed to load school");
    } finally {
      setLoading(false);
    }
  }

  async function loadVehicles() {
    setVehiclesLoading(true);
    setVehiclesError(null);
    try {
      const res = await api.get("/api/vehicles", {
        params: { tenant_slug: tenantId }, // ✅ uses your backend filter
      });

      const list = pickList(res.data);
      const normalized: Vehicle[] = list.map((v: any) => ({
        id: safeStr(v?.id),
        vehicle_number: safeStr(v?.vehicle_number),
        device_imei: v?.device_imei ?? null,
        driver_name: v?.driver?.name ?? null,
        driver_phone: v?.driver?.phone ?? null,
        is_active: typeof v?.is_active === "boolean" ? v.is_active : undefined,
        created_at: v?.created_at ?? null,
      }));

      setVehicles(normalized);
    } catch (e: any) {
      setVehiclesError(e?.response?.data?.description || e?.message || "Failed to load vehicles");
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }

  useEffect(() => {
    loadTenant();
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  async function resetAdminPassword() {
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await api.post(`/api/super_admin/reset_school_password`, {
        tenant_id: tenant!.id,
      });
      setResetResult(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.description || "Password reset failed");
    } finally {
      setResetLoading(false);
    }
  }

  // ✅ NEW: Set tenant status + validity
  async function setTenantStatus(next: { is_active?: boolean; valid_till?: string | null }) {
    if (!tenant?.id) {
      alert("Tenant not loaded yet. Please refresh and try again.");
      return;
    }
  
    setStatusBusy(true);
    try {
      await api.post("/api/super_admin/set_tenant_status", {
        tenant_id: tenant.id, // ✅ MUST be UUID
        ...next,
      });
      await loadTenant();
    } catch (e: any) {
      alert(e?.response?.data?.description || e?.response?.data?.title || e?.message || "Failed to update school");
    } finally {
      setStatusBusy(false);
    }
  }
  
  async function downloadTenantZip() {
    setDangerBusy(true);
    try {
      const res = await api.get(`/api/super_admin/tenants/${encodeURIComponent(tenantId)}/export`, {
        responseType: "blob",
      });

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
      `Delete school "${tenantId}"?\n\nThis will permanently delete all related records.\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setDangerBusy(true);
    try {
      await api.delete(`/api/super_admin/tenants/${encodeURIComponent(tenantId)}`);
      router.push("/super-admin/schools");
    } catch (e: any) {
      alert(e?.response?.data?.description || "Failed to delete school");
    } finally {
      setDangerBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-zinc-600">Loading…</div>;
  if (error) return <div className="p-6 text-sm text-red-700">{error}</div>;
  if (!tenant) return null;

  const isExpired =
    tenant.valid_till ? new Date(tenant.valid_till).getTime() < Date.now() : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">School Details</h1>
          <p className="mt-1 text-sm text-zinc-600">Tenant / School information and vehicles.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              loadTenant();
              loadVehicles();
            }}
            className="rounded border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border rounded p-4 space-y-2">
        <Info label="Name" value={tenant.name} />
        <Info label="Slug" value={tenant.slug} />
        <Info label="School Admin Username" value={tenant.school_admin?.username || "-"} />
        <Info label="Email" value={tenant.email || "-"} />
        <Info label="Valid Till" value={tenant.valid_till || "-"} />
        <Info label="Active" value={tenant.is_active ? "Yes" : "No"} />
        <Info label="Users" value={String(tenant.users_count ?? 0)} />
        <Info label="Vehicles (count)" value={String(tenant.vehicles_count ?? 0)} />
      </div>

      {/* ✅ NEW PANEL: Activate/Deactivate + Validity */}
      <div className="border rounded p-4 space-y-3">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">School Status & Validity</div>
          <div className="text-sm text-zinc-600">
            Current:{" "}
            <b>
              {tenant.is_active ? "Active" : "Inactive"}
              {tenant.is_active && isExpired ? " (Expired)" : ""}
            </b>
            {" · "}
            Valid till: <b>{tenant.valid_till ? tenant.valid_till.slice(0, 10) : "-"}</b>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">Valid till</span>
              <input
                type="date"
                value={validTillInput}
                onChange={(e) => setValidTillInput(e.target.value)}
                className="mt-1 w-full sm:w-64 rounded border px-3 py-2 text-sm"
              />
            </label>

            <div className="text-xs text-zinc-500">
              Deactivate school → driver login stops immediately. Activate + future date → drivers work
              again with the same password.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                setTenantStatus({
                  valid_till: dateInputToIso(validTillInput),
                })
              }
              disabled={statusBusy}
              className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
            >
              {statusBusy ? "Saving..." : "Save Validity"}
            </button>

            {!tenant.is_active ? (
              <button
                onClick={() =>
                  setTenantStatus({
                    is_active: true,
                    // if date empty, keep existing server valid_till
                    valid_till: dateInputToIso(validTillInput) ?? tenant.valid_till ?? null,
                  })
                }
                disabled={statusBusy}
                className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
              >
                {statusBusy ? "Activating..." : "Activate School"}
              </button>
            ) : (
              <button
                onClick={() => setTenantStatus({ is_active: false })}
                disabled={statusBusy}
                className="rounded bg-red-600 text-white px-4 py-2 text-sm disabled:opacity-60"
              >
                {statusBusy ? "Deactivating..." : "Deactivate School"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold">Vehicles</div>

          <div className="flex gap-2">
            <input
              value={vehicleQ}
              onChange={(e) => setVehicleQ(e.target.value)}
              placeholder="Search vehicle number..."
              className="w-full sm:w-64 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={loadVehicles}
              disabled={vehiclesLoading}
              className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
            >
              {vehiclesLoading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>

        {vehiclesError && <div className="text-sm text-red-700">{vehiclesError}</div>}
        {!vehiclesError && vehiclesLoading && (
          <div className="text-sm text-zinc-600">Loading vehicles…</div>
        )}

        {!vehiclesError && !vehiclesLoading && filteredVehicles.length === 0 && (
          <div className="text-sm text-zinc-600">No vehicles found.</div>
        )}

        {filteredVehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500">
                <tr>
                  <th className="py-2">Vehicle</th>
                  <th className="py-2">Driver</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">IMEI</th>
                  <th className="py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="py-2 font-medium">{v.vehicle_number}</td>
                    <td className="py-2">{v.driver_name || "-"}</td>
                    <td className="py-2">{v.driver_phone || "-"}</td>
                    <td className="py-2">{v.device_imei || "-"}</td>
                    <td className="py-2">{v.is_active == null ? "-" : v.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-xs text-zinc-500">Filter applied: tenant_slug = {tenantId}</div>
      </div>

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
              <span className="font-mono text-base">{resetResult.temp_password}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-600">Share securely. Visible once.</div>
          </div>
        )}
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="font-semibold text-red-700">Danger Zone</div>
        <div className="text-sm text-zinc-600">
          Download full tenant data or permanently delete this school and all related records.
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
            {dangerBusy ? "Working..." : "Delete School"}
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
