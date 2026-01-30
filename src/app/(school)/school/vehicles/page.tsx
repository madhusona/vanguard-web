"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function normalizeVehicles(data: any): Vehicle[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.vehicles)) return data.vehicles;
    if (Array.isArray(data?.message)) return data.message;
    return [];
  }

type Vehicle = {
  id: number | string;
  vehicle_number: string;
  description?: string | null;
  driver?: {
    id: number | string;
    name: string;
    username?: string;
  } | null;
};

type Driver = {
  id: number | string;
  name: string;
  username?: string | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});

  async function load() {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get("/api/vehicles"),
        api.get("/api/drivers"),
      ]);
  
      const vehiclesList = normalizeVehicles(vRes.data);
      const driversList = Array.isArray(dRes.data) ? dRes.data : [];
  
      setVehicles(vehiclesList);
      setDrivers(driversList);
    } catch (err) {
      console.error("Failed to load vehicles/drivers", err);
      setVehicles([]);
      setDrivers([]);
    }
  }
  

  useEffect(() => {
    load();
  }, []);

  async function addVehicle() {
    if (!vehicleNumber.trim()) return alert("Vehicle number required");

    setLoading(true);
    try {
      await api.post("/api/vehicles", {
        vehicle_number: vehicleNumber.trim(),
        model: description.trim() || null,   // or rename UI label to "Model"
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
    await api.delete(`/api/vehicles/${id}`);
    await load();
  }

  async function assignDriver(vehicleId: Vehicle["id"]) {
    const key = String(vehicleId);
    const driverId = selectedDriver[key];
    if (!driverId) return alert("Select a driver");

    setAssigning((m) => ({ ...m, [key]: true }));
    try {
      await api.post(`/api/vehicles/${vehicleId}/assign_driver`, {
        driver_id: driverId,
      });
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to assign driver");
    } finally {
      setAssigning((m) => ({ ...m, [key]: false }));
    }
  }

  async function unassignDriver(vehicleId: Vehicle["id"]) {
    if (!confirm("Unassign driver from this vehicle?")) return;
    await api.post(`/api/vehicles/${vehicleId}/unassign_driver`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <p className="text-sm text-gray-600">
          Manage vehicles and assign drivers (recommended).
        </p>
      </div>

      {/* Add Vehicle */}
      <div className="border rounded p-4 space-y-3 max-w-xl">
        <div className="font-medium text-sm">Add Vehicle</div>

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Vehicle Number (TN09AB1234)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={addVehicle}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Vehicle"}
        </button>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Vehicle</th>
              <th className="text-left p-2">Driver</th>
              <th className="text-left p-2">Assign</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const key = String(v.id);
              return (
                <tr key={key} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{v.vehicle_number}</div>
                    <div className="text-gray-500 text-xs">
                      {v.description ?? ""}
                    </div>
                  </td>

                  <td className="p-2">
                    {v.driver ? (
                      <div className="space-y-1">
                        <div>{v.driver.name}</div>
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => unassignDriver(v.id)}
                        >
                          Unassign
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">Not assigned</span>
                    )}
                  </td>

                  <td className="p-2">
                    <div className="flex gap-2">
                      <select
                        className="border rounded p-1 text-sm"
                        value={selectedDriver[key] ?? ""}
                        onChange={(e) =>
                          setSelectedDriver((m) => ({
                            ...m,
                            [key]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select driver</option>
                        {drivers.map((d) => (
                          <option key={String(d.id)} value={String(d.id)}>
                            {d.name} ({d.username})
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={assigning[key]}
                        onClick={() => assignDriver(v.id)}
                        className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                      >
                        Assign
                      </button>
                    </div>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-gray-500">
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
