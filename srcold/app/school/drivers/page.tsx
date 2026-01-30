"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Driver = {
  id: number | string;
  name: string;
  phone?: string | null;
  username?: string | null;
};

export default function DriversPage() {
  const [items, setItems] = useState<Driver[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await api.get<Driver[]>("/api/drivers");
    setItems(res.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addDriver() {
    if (!name.trim()) return alert("Driver name required");
    if (!username.trim()) return alert("Driver username required");
    if (!password.trim()) return alert("Driver password required");

    setLoading(true);
    try {
      await api.post("/api/drivers", {
        name: name.trim(),
        phone: phone.trim() || null,
        username: username.trim(),
        password: password.trim(),
      });
      setName("");
      setPhone("");
      setUsername("");
      setPassword("");
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to add driver");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDriver(id: Driver["id"]) {
    if (!confirm("Delete this driver?")) return;
    try {
      await api.delete(`/api/drivers/${id}`);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to delete driver");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <p className="text-sm text-gray-600">Create driver accounts (for Flutter app login).</p>
      </div>

      <div className="border rounded p-4 space-y-3 max-w-xl">
        <div className="text-sm font-medium">Add Driver</div>

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Driver Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Username (used for driver login)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded p-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={addDriver}
          className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Driver"}
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Username</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={String(d.id)} className="border-t">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.phone ?? "-"}</td>
                <td className="p-2">{d.username ?? "-"}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteDriver(d.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={4}>
                  No drivers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
