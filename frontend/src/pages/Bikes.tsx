import { useEffect, useState } from "react";
import { createBike, deleteBike, getBikes, updateBike } from "../api";
import type { Bike } from "../types";

export default function Bikes() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ name: "", year: "", travel_front_mm: "", travel_rear_mm: "", wheel_size: "", notes: "" });

  const load = () => {
    setLoading(true);
    getBikes()
      .then(setBikes)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (bike?: Bike) => {
    if (bike) {
      setEditing(bike.id);
      setForm({
        name: bike.name,
        year: bike.year != null ? String(bike.year) : "",
        travel_front_mm: bike.travel_front_mm != null ? String(bike.travel_front_mm) : "",
        travel_rear_mm: bike.travel_rear_mm != null ? String(bike.travel_rear_mm) : "",
        wheel_size: bike.wheel_size ?? "",
        notes: bike.notes ?? "",
      });
    } else {
      setEditing("new");
      setForm({ name: "", year: "", travel_front_mm: "", travel_rear_mm: "", wheel_size: "", notes: "" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      year: form.year ? Number(form.year) : null,
      travel_front_mm: form.travel_front_mm ? Number(form.travel_front_mm) : null,
      travel_rear_mm: form.travel_rear_mm ? Number(form.travel_rear_mm) : null,
      wheel_size: form.wheel_size || null,
      notes: form.notes || null,
    };
    if (editing === "new") {
      await createBike(data);
    } else if (typeof editing === "number") {
      await updateBike(editing, data);
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bike and all its rides?")) return;
    await deleteBike(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <button
          onClick={() => startEdit()}
          className="bg-mtb-600 hover:bg-mtb-700 text-white font-medium px-4 py-2 rounded-md text-sm"
        >
          Add Bike
        </button>
      </div>

      {editing !== null && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4"
        >
          <h2 className="font-semibold">{editing === "new" ? "New Bike" : "Edit Bike"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                placeholder="Canyon Spectral"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Wheel Size
              </label>
              <select
                value={form.wheel_size}
                onChange={(e) => setForm({ ...form, wheel_size: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option value="">--</option>
                <option value="27.5">27.5</option>
                <option value="29">29</option>
                <option value="mixed">Mixed (mullet)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Front Travel (mm)
              </label>
              <input
                type="number"
                value={form.travel_front_mm}
                onChange={(e) => setForm({ ...form, travel_front_mm: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Rear Travel (mm)
              </label>
              <input
                type="number"
                value={form.travel_rear_mm}
                onChange={(e) => setForm({ ...form, travel_rear_mm: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
              Notes
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-mtb-600 hover:bg-mtb-700 text-white font-medium px-4 py-2 rounded-md text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : bikes.length === 0 ? (
        <p className="text-gray-500">No bikes yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  {bike.name} {bike.year && <span className="text-gray-500">({bike.year})</span>}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {[
                    bike.wheel_size && `${bike.wheel_size}"`,
                    bike.travel_front_mm && `${bike.travel_front_mm}mm front`,
                    bike.travel_rear_mm && `${bike.travel_rear_mm}mm rear`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No specs"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(bike)}
                  className="text-sm text-mtb-600 dark:text-mtb-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bike.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
