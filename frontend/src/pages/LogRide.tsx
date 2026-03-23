import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBikes, createRide, updateRide, getRide } from '../api/client';
import type { Bike, RideCreate, TrailCondition, Weather } from '../types';

const CONDITIONS: { value: TrailCondition; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'tacky', label: 'Tacky' },
  { value: 'wet', label: 'Wet' },
  { value: 'muddy', label: 'Muddy' },
  { value: 'mixed', label: 'Mixed' },
];

const WEATHER_OPTIONS: { value: Weather; label: string }[] = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'cold', label: 'Cold' },
];

interface FormData {
  bike_id: string;
  date: string;
  trail_name: string;
  trail_condition: string;
  weather: string;
  temperature_f: string;
  duration_minutes: string;
  rating: number;
  notes: string;
  front_tire_brand: string;
  front_tire_model: string;
  front_tire_pressure_psi: string;
  rear_tire_brand: string;
  rear_tire_model: string;
  rear_tire_pressure_psi: string;
  fork_air_pressure_psi: string;
  fork_rebound_clicks: string;
  fork_compression_clicks: string;
  fork_tokens: string;
  shock_air_pressure_psi: string;
  shock_rebound_clicks: string;
  shock_compression_clicks: string;
  shock_volume_spacers: string;
  setup_notes: string;
}

const initialForm: FormData = {
  bike_id: '',
  date: new Date().toISOString().split('T')[0],
  trail_name: '',
  trail_condition: '',
  weather: '',
  temperature_f: '',
  duration_minutes: '',
  rating: 0,
  notes: '',
  front_tire_brand: '',
  front_tire_model: '',
  front_tire_pressure_psi: '',
  rear_tire_brand: '',
  rear_tire_model: '',
  rear_tire_pressure_psi: '',
  fork_air_pressure_psi: '',
  fork_rebound_clicks: '',
  fork_compression_clicks: '',
  fork_tokens: '',
  shock_air_pressure_psi: '',
  shock_rebound_clicks: '',
  shock_compression_clicks: '',
  shock_volume_spacers: '',
  setup_notes: '',
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
            trail_condition: ride.trail_condition || '',
            weather: ride.weather || '',
            temperature_f: ride.temperature_f?.toString() || '',
            duration_minutes: ride.duration_minutes?.toString() || '',
            rating: ride.rating || 0,
            notes: ride.notes || '',
            front_tire_brand: ride.setup?.front_tire_brand || '',
            front_tire_model: ride.setup?.front_tire_model || '',
            front_tire_pressure_psi: ride.setup?.front_tire_pressure_psi?.toString() || '',
            rear_tire_brand: ride.setup?.rear_tire_brand || '',
            rear_tire_model: ride.setup?.rear_tire_model || '',
            rear_tire_pressure_psi: ride.setup?.rear_tire_pressure_psi?.toString() || '',
            fork_air_pressure_psi: ride.setup?.fork_air_pressure_psi?.toString() || '',
            fork_rebound_clicks: ride.setup?.fork_rebound_clicks?.toString() || '',
            fork_compression_clicks: ride.setup?.fork_compression_clicks?.toString() || '',
            fork_tokens: ride.setup?.fork_tokens?.toString() || '',
            shock_air_pressure_psi: ride.setup?.shock_air_pressure_psi?.toString() || '',
            shock_rebound_clicks: ride.setup?.shock_rebound_clicks?.toString() || '',
            shock_compression_clicks: ride.setup?.shock_compression_clicks?.toString() || '',
            shock_volume_spacers: ride.setup?.shock_volume_spacers?.toString() || '',
            setup_notes: ride.setup?.notes || '',
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
      trail_condition: (form.trail_condition as TrailCondition) || undefined,
      weather: (form.weather as Weather) || undefined,
      temperature_f: parseNum(form.temperature_f),
      duration_minutes: parseInt_(form.duration_minutes),
      rating: form.rating || undefined,
      notes: form.notes || undefined,
      setup: {
        front_tire_brand: form.front_tire_brand || undefined,
        front_tire_model: form.front_tire_model || undefined,
        front_tire_pressure_psi: parseNum(form.front_tire_pressure_psi),
        rear_tire_brand: form.rear_tire_brand || undefined,
        rear_tire_model: form.rear_tire_model || undefined,
        rear_tire_pressure_psi: parseNum(form.rear_tire_pressure_psi),
        fork_air_pressure_psi: parseNum(form.fork_air_pressure_psi),
        fork_rebound_clicks: parseInt_(form.fork_rebound_clicks),
        fork_compression_clicks: parseInt_(form.fork_compression_clicks),
        fork_tokens: parseInt_(form.fork_tokens),
        shock_air_pressure_psi: parseNum(form.shock_air_pressure_psi),
        shock_rebound_clicks: parseInt_(form.shock_rebound_clicks),
        shock_compression_clicks: parseInt_(form.shock_compression_clicks),
        shock_volume_spacers: parseInt_(form.shock_volume_spacers),
        notes: form.setup_notes || undefined,
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
                onChange={(e) => setForm((prev) => ({ ...prev, bike_id: e.target.value }))}
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
              <label className="label">Trail Condition</label>
              <select
                className="input"
                value={form.trail_condition}
                onChange={(e) => setForm((prev) => ({ ...prev, trail_condition: e.target.value }))}
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Weather</label>
              <select
                className="input"
                value={form.weather}
                onChange={(e) => setForm((prev) => ({ ...prev, weather: e.target.value }))}
              >
                <option value="">Select weather</option>
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <NumField
              label="Temperature (°F)"
              value={form.temperature_f}
              onChange={set('temperature_f')}
              placeholder="e.g. 65"
            />
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
          <div>
            <label className="label">Ride Notes</label>
            <textarea
              className="input min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="How was the ride?"
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
                <label className="label">Brand</label>
                <input
                  type="text"
                  className="input"
                  value={form.front_tire_brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, front_tire_brand: e.target.value }))}
                  placeholder="e.g. Maxxis"
                />
              </div>
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  className="input"
                  value={form.front_tire_model}
                  onChange={(e) => setForm((prev) => ({ ...prev, front_tire_model: e.target.value }))}
                  placeholder="e.g. Assegai"
                />
              </div>
              <NumField
                label="Pressure (PSI)"
                value={form.front_tire_pressure_psi}
                onChange={set('front_tire_pressure_psi')}
                step="0.5"
                placeholder="e.g. 24"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400">Rear Tire</h3>
              <div>
                <label className="label">Brand</label>
                <input
                  type="text"
                  className="input"
                  value={form.rear_tire_brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, rear_tire_brand: e.target.value }))}
                  placeholder="e.g. Maxxis"
                />
              </div>
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  className="input"
                  value={form.rear_tire_model}
                  onChange={(e) => setForm((prev) => ({ ...prev, rear_tire_model: e.target.value }))}
                  placeholder="e.g. Minion DHR II"
                />
              </div>
              <NumField
                label="Pressure (PSI)"
                value={form.rear_tire_pressure_psi}
                onChange={set('rear_tire_pressure_psi')}
                step="0.5"
                placeholder="e.g. 27"
              />
            </div>
          </div>
        </div>

        {/* Fork Setup */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Fork Setup</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NumField
              label="Air Pressure (PSI)"
              value={form.fork_air_pressure_psi}
              onChange={set('fork_air_pressure_psi')}
              step="0.5"
              placeholder="e.g. 75"
            />
            <NumField
              label="Rebound (clicks)"
              value={form.fork_rebound_clicks}
              onChange={set('fork_rebound_clicks')}
              placeholder="e.g. 8"
            />
            <NumField
              label="Compression (clicks)"
              value={form.fork_compression_clicks}
              onChange={set('fork_compression_clicks')}
              placeholder="e.g. 6"
            />
            <NumField
              label="Volume Tokens"
              value={form.fork_tokens}
              onChange={set('fork_tokens')}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        {/* Shock Setup */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Shock Setup</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NumField
              label="Air Pressure (PSI)"
              value={form.shock_air_pressure_psi}
              onChange={set('shock_air_pressure_psi')}
              step="0.5"
              placeholder="e.g. 190"
            />
            <NumField
              label="Rebound (clicks)"
              value={form.shock_rebound_clicks}
              onChange={set('shock_rebound_clicks')}
              placeholder="e.g. 5"
            />
            <NumField
              label="Compression (clicks)"
              value={form.shock_compression_clicks}
              onChange={set('shock_compression_clicks')}
              placeholder="e.g. 6"
            />
            <NumField
              label="Volume Spacers"
              value={form.shock_volume_spacers}
              onChange={set('shock_volume_spacers')}
              placeholder="e.g. 1"
            />
          </div>
        </div>

        {/* Setup Notes */}
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Setup Notes</h2>
          <textarea
            className="input min-h-[100px]"
            value={form.setup_notes}
            onChange={(e) => setForm((prev) => ({ ...prev, setup_notes: e.target.value }))}
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
