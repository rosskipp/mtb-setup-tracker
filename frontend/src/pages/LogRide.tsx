import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBikes, createRide, updateRide, getRide, getLastSetup } from '../api/client';
import type { Bike, RideCreate, Condition } from '../types';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'tacky', label: 'Tacky' },
  { value: 'wet', label: 'Wet' },
  { value: 'muddy', label: 'Muddy' },
  { value: 'snow', label: 'Snow' },
  { value: 'loose', label: 'Loose' },
  { value: 'hero_dirt', label: 'Hero Dirt' },
];

interface FormData {
  bike_id: string;
  date: string;
  trail_name: string;
  location: string;
  conditions: string;
  duration_minutes: string;
  rating: number;
  notes: string;
  front_tire_model: string;
  rear_tire_model: string;
  front_tire_pressure_psi: string;
  rear_tire_pressure_psi: string;
  front_tire_insert: boolean;
  rear_tire_insert: boolean;
  fork_air_pressure_psi: string;
  fork_hsc: string;
  fork_lsc: string;
  fork_hsr: string;
  fork_lsr: string;
  fork_tokens: string;
  shock_air_pressure_psi: string;
  shock_hsc: string;
  shock_lsc: string;
  shock_hsr: string;
  shock_lsr: string;
  shock_tokens: string;
}

const initialForm: FormData = {
  bike_id: '',
  date: new Date().toISOString().split('T')[0],
  trail_name: '',
  location: '',
  conditions: '',
  duration_minutes: '',
  rating: 0,
  notes: '',
  front_tire_model: '',
  rear_tire_model: '',
  front_tire_pressure_psi: '',
  rear_tire_pressure_psi: '',
  front_tire_insert: false,
  rear_tire_insert: false,
  fork_air_pressure_psi: '',
  fork_hsc: '',
  fork_lsc: '',
  fork_hsr: '',
  fork_lsr: '',
  fork_tokens: '',
  shock_air_pressure_psi: '',
  shock_hsc: '',
  shock_lsc: '',
  shock_hsr: '',
  shock_lsr: '',
  shock_tokens: '',
};

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step || '1'}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function LogRide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const bikesRes = await getBikes();
        setBikes(bikesRes.data);

        if (isEdit && id) {
          const rideRes = await getRide(id);
          const ride = rideRes.data;
          setForm({
            bike_id: ride.bike_id,
            date: ride.date,
            trail_name: ride.trail_name,
            location: ride.location || '',
            conditions: ride.conditions || '',
            duration_minutes: ride.duration_minutes?.toString() || '',
            rating: ride.rating || 0,
            notes: ride.notes || '',
            front_tire_model: ride.tire_setup?.front_tire_model || '',
            rear_tire_model: ride.tire_setup?.rear_tire_model || '',
            front_tire_pressure_psi: ride.tire_setup?.front_tire_pressure_psi?.toString() || '',
            rear_tire_pressure_psi: ride.tire_setup?.rear_tire_pressure_psi?.toString() || '',
            front_tire_insert: ride.tire_setup?.front_tire_insert || false,
            rear_tire_insert: ride.tire_setup?.rear_tire_insert || false,
            fork_air_pressure_psi: ride.suspension_setup?.fork_air_pressure_psi?.toString() || '',
            fork_hsc: ride.suspension_setup?.fork_hsc?.toString() || '',
            fork_lsc: ride.suspension_setup?.fork_lsc?.toString() || '',
            fork_hsr: ride.suspension_setup?.fork_hsr?.toString() || '',
            fork_lsr: ride.suspension_setup?.fork_lsr?.toString() || '',
            fork_tokens: ride.suspension_setup?.fork_tokens?.toString() || '',
            shock_air_pressure_psi: ride.suspension_setup?.shock_air_pressure_psi?.toString() || '',
            shock_hsc: ride.suspension_setup?.shock_hsc?.toString() || '',
            shock_lsc: ride.suspension_setup?.shock_lsc?.toString() || '',
            shock_hsr: ride.suspension_setup?.shock_hsr?.toString() || '',
            shock_lsr: ride.suspension_setup?.shock_lsr?.toString() || '',
            shock_tokens: ride.suspension_setup?.shock_tokens?.toString() || '',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleBikeChange = async (bikeId: string) => {
    setForm((prev) => ({ ...prev, bike_id: bikeId }));
    if (!isEdit && bikeId) {
      try {
        const res = await getLastSetup(bikeId);
        const data = res.data;
        if (data) {
          const susp = data.suspension_setup ?? data;
          const tire = data.tire_setup ?? data;
          setForm((prev) => ({
            ...prev,
            front_tire_model: tire.front_tire_model || prev.front_tire_model,
            rear_tire_model: tire.rear_tire_model || prev.rear_tire_model,
            front_tire_pressure_psi: tire.front_tire_pressure_psi?.toString() || prev.front_tire_pressure_psi,
            rear_tire_pressure_psi: tire.rear_tire_pressure_psi?.toString() || prev.rear_tire_pressure_psi,
            front_tire_insert: tire.front_tire_insert ?? prev.front_tire_insert,
            rear_tire_insert: tire.rear_tire_insert ?? prev.rear_tire_insert,
            fork_air_pressure_psi: susp.fork_air_pressure_psi?.toString() || prev.fork_air_pressure_psi,
            fork_hsc: susp.fork_hsc?.toString() || prev.fork_hsc,
            fork_lsc: susp.fork_lsc?.toString() || prev.fork_lsc,
            fork_hsr: susp.fork_hsr?.toString() || prev.fork_hsr,
            fork_lsr: susp.fork_lsr?.toString() || prev.fork_lsr,
            fork_tokens: susp.fork_tokens?.toString() || prev.fork_tokens,
            shock_air_pressure_psi: susp.shock_air_pressure_psi?.toString() || prev.shock_air_pressure_psi,
            shock_hsc: susp.shock_hsc?.toString() || prev.shock_hsc,
            shock_lsc: susp.shock_lsc?.toString() || prev.shock_lsc,
            shock_hsr: susp.shock_hsr?.toString() || prev.shock_hsr,
            shock_lsr: susp.shock_lsr?.toString() || prev.shock_lsr,
            shock_tokens: susp.shock_tokens?.toString() || prev.shock_tokens,
          }));
        }
      } catch {
        // No previous setup — that's fine
      }
    }
  };

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bike_id) {
      setError('Please select a bike');
      return;
    }
    if (!form.trail_name.trim()) {
      setError('Please enter a trail name');
      return;
    }

    setSaving(true);
    setError('');

    const parseNum = (v: string) => (v ? parseFloat(v) : undefined);
    const parseInt_ = (v: string) => (v ? parseInt(v, 10) : undefined);

    const payload: RideCreate = {
      bike_id: form.bike_id,
      date: form.date,
      trail_name: form.trail_name,
      location: form.location || undefined,
      conditions: form.conditions || undefined,
      duration_minutes: parseInt_(form.duration_minutes),
      rating: form.rating || undefined,
      notes: form.notes || undefined,
      suspension_setup: {
        fork_air_pressure_psi: parseNum(form.fork_air_pressure_psi),
        fork_hsc: parseInt_(form.fork_hsc),
        fork_lsc: parseInt_(form.fork_lsc),
        fork_hsr: parseInt_(form.fork_hsr),
        fork_lsr: parseInt_(form.fork_lsr),
        fork_tokens: parseInt_(form.fork_tokens),
        shock_air_pressure_psi: parseNum(form.shock_air_pressure_psi),
        shock_hsc: parseInt_(form.shock_hsc),
        shock_lsc: parseInt_(form.shock_lsc),
        shock_hsr: parseInt_(form.shock_hsr),
        shock_lsr: parseInt_(form.shock_lsr),
        shock_tokens: parseInt_(form.shock_tokens),
      },
      tire_setup: {
        front_tire_pressure_psi: parseNum(form.front_tire_pressure_psi),
        rear_tire_pressure_psi: parseNum(form.rear_tire_pressure_psi),
        front_tire_model: form.front_tire_model || undefined,
        rear_tire_model: form.rear_tire_model || undefined,
        front_tire_insert: form.front_tire_insert,
        rear_tire_insert: form.rear_tire_insert,
      },
    };

    try {
      if (isEdit && id) {
        await updateRide(id, payload);
      } else {
        await createRide(payload);
      }
      navigate('/rides');
    } catch (err) {
      setError('Failed to save ride');
      console.error(err);
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Ride' : 'Log Ride'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isEdit ? 'Update ride details and setup' : 'Record your ride and setup'}
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ride Details */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Ride Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bike *</label>
              <select
                className="input"
                value={form.bike_id}
                onChange={(e) => handleBikeChange(e.target.value)}
                required
              >
                <option value="">Select a bike</option>
                {bikes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Trail Name *</label>
              <input
                type="text"
                className="input"
                value={form.trail_name}
                onChange={(e) => setForm((prev) => ({ ...prev, trail_name: e.target.value }))}
                placeholder="e.g. Flow Trail"
                required
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Whistler, BC"
              />
            </div>
            <div>
              <label className="label">Trail Condition</label>
              <select
                className="input"
                value={form.conditions}
                onChange={(e) => setForm((prev) => ({ ...prev, conditions: e.target.value }))}
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <NumField
              label="Duration (minutes)"
              value={form.duration_minutes}
              onChange={set('duration_minutes')}
              placeholder="e.g. 90"
            />
          </div>
          <div>
            <label className="label">Rating</label>
            <StarInput
              value={form.rating}
              onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))}
            />
          </div>
        </div>

        {/* Tire Setup */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Tire Setup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400">Front Tire</h3>
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  className="input"
                  value={form.front_tire_model}
                  onChange={(e) => setForm((prev) => ({ ...prev, front_tire_model: e.target.value }))}
                  placeholder="e.g. Maxxis Assegai"
                />
              </div>
              <NumField
                label="Pressure (PSI)"
                value={form.front_tire_pressure_psi}
                onChange={set('front_tire_pressure_psi')}
                step="0.5"
                placeholder="e.g. 24"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 dark:bg-gray-800"
                  checked={form.front_tire_insert}
                  onChange={(e) => setForm((prev) => ({ ...prev, front_tire_insert: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tire insert</span>
              </label>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400">Rear Tire</h3>
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  className="input"
                  value={form.rear_tire_model}
                  onChange={(e) => setForm((prev) => ({ ...prev, rear_tire_model: e.target.value }))}
                  placeholder="e.g. Maxxis Minion DHR II"
                />
              </div>
              <NumField
                label="Pressure (PSI)"
                value={form.rear_tire_pressure_psi}
                onChange={set('rear_tire_pressure_psi')}
                step="0.5"
                placeholder="e.g. 27"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 dark:bg-gray-800"
                  checked={form.rear_tire_insert}
                  onChange={(e) => setForm((prev) => ({ ...prev, rear_tire_insert: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tire insert</span>
              </label>
            </div>
          </div>
        </div>

        {/* Fork Setup */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Fork Setup</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <NumField
              label="Air Pressure (PSI)"
              value={form.fork_air_pressure_psi}
              onChange={set('fork_air_pressure_psi')}
              step="0.5"
              placeholder="e.g. 75"
            />
            <NumField
              label="HSC (clicks)"
              value={form.fork_hsc}
              onChange={set('fork_hsc')}
              placeholder="e.g. 8"
            />
            <NumField
              label="LSC (clicks)"
              value={form.fork_lsc}
              onChange={set('fork_lsc')}
              placeholder="e.g. 6"
            />
            <NumField
              label="HSR (clicks)"
              value={form.fork_hsr}
              onChange={set('fork_hsr')}
              placeholder="e.g. 5"
            />
            <NumField
              label="LSR (clicks)"
              value={form.fork_lsr}
              onChange={set('fork_lsr')}
              placeholder="e.g. 7"
            />
            <NumField
              label="Volume Spacers"
              value={form.fork_tokens}
              onChange={set('fork_tokens')}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        {/* Shock Setup */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Shock Setup</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <NumField
              label="Air Pressure (PSI)"
              value={form.shock_air_pressure_psi}
              onChange={set('shock_air_pressure_psi')}
              step="0.5"
              placeholder="e.g. 190"
            />
            <NumField
              label="HSC (clicks)"
              value={form.shock_hsc}
              onChange={set('shock_hsc')}
              placeholder="e.g. 4"
            />
            <NumField
              label="LSC (clicks)"
              value={form.shock_lsc}
              onChange={set('shock_lsc')}
              placeholder="e.g. 6"
            />
            <NumField
              label="HSR (clicks)"
              value={form.shock_hsr}
              onChange={set('shock_hsr')}
              placeholder="e.g. 5"
            />
            <NumField
              label="LSR (clicks)"
              value={form.shock_lsr}
              onChange={set('shock_lsr')}
              placeholder="e.g. 7"
            />
            <NumField
              label="Volume Spacers"
              value={form.shock_tokens}
              onChange={set('shock_tokens')}
              placeholder="e.g. 1"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <textarea
            className="input min-h-[100px]"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="How did the setup feel? Any changes you'd make?"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-8">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Ride' : 'Log Ride'}
          </button>
        </div>
      </form>
    </div>
  );
}
