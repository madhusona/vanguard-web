"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Vehicle = {
  id: number | string;
  vehicle_number: string;
  description?: string | null;
};

export default function VehiclesPage() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [vehicle_number, setVehicleNumber] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await api.get<Vehicle[]>("/api/vehicles");
    setItems(res.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addVehicle() {
    if (!vehicle_number.trim()) return alert("Vehicle number required");

    setLoading(true);
    try {
      await api.post("/api/vehicles", {
        vehicle_number: vehicle_number.trim(),
        description: description.trim() || null,
      });
      setVehicleNumber("");
      setDescription("");
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVehicle(id: Vehicle["id"]) {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/api/vehicles/${id}`);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to delete vehicle");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <p className="text-sm text-gray-600">Add and manage vehicles for this school.</p>
      </div>

      <div className="border rounded p-4 space-y-3 max-w-xl">
        <div className="text-sm font-medium">Add Vehicle</div>

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Vehicle Number (e.g., TN09AB1234)"
          value={vehicle_number}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={addVehicle}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Vehicle No</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={String(v.id)} className="border-t">
                <td className="p-2">{v.vehicle_number}</td>
                <td className="p-2">{v.description ?? "-"}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteVehicle(v.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={3}>
                  No vehicles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
