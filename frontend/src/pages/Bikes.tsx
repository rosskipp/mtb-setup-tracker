import { useState, useEffect } from 'react';
import { getBikes, createBike, updateBike, deleteBike } from '../api/client';
import type { Bike, BikeCreate } from '../types';

const WHEEL_SIZES = ['27.5"', '29"', 'Mixed'];

const emptyForm: BikeCreate = {
  name: '',
  year: undefined,
  travel_front_mm: undefined,
  travel_rear_mm: undefined,
  wheel_size: '',
  notes: '',
};

export default function Bikes() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BikeCreate>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBikes(); }, []);

  const loadBikes = async () => {
    try {
      const res = await getBikes();
      setBikes(res.data);
    } catch (err) {
      console.error('Failed to load bikes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bike: Bike) => {
    setForm({
      name: bike.name,
      year: bike.year,
      travel_front_mm: bike.travel_front_mm,
      travel_rear_mm: bike.travel_rear_mm,
      wheel_size: bike.wheel_size || '',
      notes: bike.notes || '',
    });
    setEditingId(bike.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload: BikeCreate = {
        name: form.name.trim(),
        year: form.year || undefined,
        travel_front_mm: form.travel_front_mm || undefined,
        travel_rear_mm: form.travel_rear_mm || undefined,
        wheel_size: (form.wheel_size as string)?.trim() || undefined,
        notes: (form.notes as string)?.trim() || undefined,
      };
      if (editingId) {
        await updateBike(editingId, payload);
      } else {
        await createBike(payload);
      }
      await loadBikes();
      resetForm();
    } catch (err) {
      console.error('Failed to save bike:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteBike(id);
      setBikes((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bike:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bikes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your fleet</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Bike</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit Bike' : 'New Bike'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input type="text" className="input" value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Shredder" required />
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" className="input" value={form.year ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                placeholder="e.g. 2024" />
            </div>
            <div>
              <label className="label">Fork Travel (mm)</label>
              <input type="number" className="input" value={form.travel_front_mm ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, travel_front_mm: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                placeholder="e.g. 170" />
            </div>
            <div>
              <label className="label">Rear Travel (mm)</label>
              <input type="number" className="input" value={form.travel_rear_mm ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, travel_rear_mm: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                placeholder="e.g. 160" />
            </div>
            <div>
              <label className="label">Wheel Size</label>
              <select className="input" value={form.wheel_size ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, wheel_size: e.target.value }))}>
                <option value="">Select size</option>
                {WHEEL_SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px]" value={form.notes ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any notes about this bike..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Bike' : 'Add Bike'}
            </button>
          </div>
        </form>
      )}

      {bikes.length === 0 && !showForm ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No bikes added yet.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Add Your First Bike</button>
        </div>
      ) : (
        <div className="space-y-3">
          {bikes.map((bike) => (
            <div key={bike.id} className="card p-5 hover:border-brand-500/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">&#x1f6b2;</span>
                    <h3 className="font-semibold text-lg">{bike.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {[bike.year, bike.wheel_size].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {bike.travel_front_mm && (
                      <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Fork: {bike.travel_front_mm}mm
                      </span>
                    )}
                    {bike.travel_rear_mm && (
                      <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Rear: {bike.travel_rear_mm}mm
                      </span>
                    )}
                    {bike.wheel_size && (
                      <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        {bike.wheel_size}
                      </span>
                    )}
                  </div>
                  {bike.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{bike.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(bike)} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(bike.id, bike.name)} className="text-sm text-red-500 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
