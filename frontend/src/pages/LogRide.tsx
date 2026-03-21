import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRide, getBikes, getLatestSetup } from "../api";
import type { Bike, Setup } from "../types";

const CONDITIONS = ["dry", "tacky", "muddy", "wet", "mixed"];
const WEATHERS = ["sunny", "cloudy", "rainy", "cold"];

function Input({
  label,
  type = "text",
  value,
  onChange,
  step,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
      />
    </div>
  );
}

export default function LogRide() {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Ride fields
  const [bikeId, setBikeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [trailName, setTrailName] = useState("");
  const [trailCondition, setTrailCondition] = useState("");
  const [weather, setWeather] = useState("");
  const [tempF, setTempF] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState("");
  const [rideNotes, setRideNotes] = useState("");

  // Setup fields
  const [ftBrand, setFtBrand] = useState("");
  const [ftModel, setFtModel] = useState("");
  const [ftPsi, setFtPsi] = useState("");
  const [rtBrand, setRtBrand] = useState("");
  const [rtModel, setRtModel] = useState("");
  const [rtPsi, setRtPsi] = useState("");
  const [forkPsi, setForkPsi] = useState("");
  const [forkRebound, setForkRebound] = useState("");
  const [forkComp, setForkComp] = useState("");
  const [forkTokens, setForkTokens] = useState("");
  const [shockPsi, setShockPsi] = useState("");
  const [shockRebound, setShockRebound] = useState("");
  const [shockComp, setShockComp] = useState("");
  const [shockSpacers, setShockSpacers] = useState("");
  const [setupNotes, setSetupNotes] = useState("");

  useEffect(() => {
    getBikes().then((b) => {
      setBikes(b);
      if (b.length === 1) setBikeId(String(b[0].id));
    });
  }, []);

  // Pre-fill from last ride's setup
  useEffect(() => {
    if (!bikeId) return;
    getLatestSetup(Number(bikeId)).then((s: Setup | null) => {
      if (!s) return;
      setFtBrand(s.front_tire_brand ?? "");
      setFtModel(s.front_tire_model ?? "");
      setFtPsi(s.front_tire_pressure_psi != null ? String(s.front_tire_pressure_psi) : "");
      setRtBrand(s.rear_tire_brand ?? "");
      setRtModel(s.rear_tire_model ?? "");
      setRtPsi(s.rear_tire_pressure_psi != null ? String(s.rear_tire_pressure_psi) : "");
      setForkPsi(s.fork_air_pressure_psi != null ? String(s.fork_air_pressure_psi) : "");
      setForkRebound(s.fork_rebound_clicks != null ? String(s.fork_rebound_clicks) : "");
      setForkComp(s.fork_compression_clicks != null ? String(s.fork_compression_clicks) : "");
      setForkTokens(s.fork_tokens != null ? String(s.fork_tokens) : "");
      setShockPsi(s.shock_air_pressure_psi != null ? String(s.shock_air_pressure_psi) : "");
      setShockRebound(s.shock_rebound_clicks != null ? String(s.shock_rebound_clicks) : "");
      setShockComp(s.shock_compression_clicks != null ? String(s.shock_compression_clicks) : "");
      setShockSpacers(s.shock_volume_spacers != null ? String(s.shock_volume_spacers) : "");
    });
  }, [bikeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!bikeId || !trailName || !date) {
      setError("Bike, trail name, and date are required.");
      return;
    }
    setSaving(true);
    try {
      const numOrNull = (v: string) => (v ? Number(v) : null);
      const strOrNull = (v: string) => (v || null);
      const ride = await createRide({
        bike_id: Number(bikeId),
        date,
        trail_name: trailName,
        trail_condition: strOrNull(trailCondition),
        weather: strOrNull(weather),
        temperature_f: numOrNull(tempF),
        duration_minutes: numOrNull(duration),
        rating: numOrNull(rating),
        notes: strOrNull(rideNotes),
        setup: {
          front_tire_brand: strOrNull(ftBrand),
          front_tire_model: strOrNull(ftModel),
          front_tire_pressure_psi: numOrNull(ftPsi),
          rear_tire_brand: strOrNull(rtBrand),
          rear_tire_model: strOrNull(rtModel),
          rear_tire_pressure_psi: numOrNull(rtPsi),
          fork_air_pressure_psi: numOrNull(forkPsi),
          fork_rebound_clicks: numOrNull(forkRebound),
          fork_compression_clicks: numOrNull(forkComp),
          fork_tokens: numOrNull(forkTokens),
          shock_air_pressure_psi: numOrNull(shockPsi),
          shock_rebound_clicks: numOrNull(shockRebound),
          shock_compression_clicks: numOrNull(shockComp),
          shock_volume_spacers: numOrNull(shockSpacers),
          notes: strOrNull(setupNotes),
        },
      });
      navigate(`/rides/${ride.id}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Log Ride</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* Ride Info */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Ride Info
          </legend>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Bike *
            </label>
            <select
              value={bikeId}
              onChange={(e) => setBikeId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="">Select bike</option>
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={date} onChange={setDate} />
            <Input label="Trail Name *" value={trailName} onChange={setTrailName} placeholder="e.g. Downieville" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Condition
              </label>
              <select
                value={trailCondition}
                onChange={(e) => setTrailCondition(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option value="">--</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option value="">--</option>
                {WEATHERS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <Input label="Temp (°F)" type="number" value={tempF} onChange={setTempF} />
            <Input label="Duration (min)" type="number" value={duration} onChange={setDuration} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Rating (1-5)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === String(n) ? "" : String(n))}
                  className={`text-2xl ${Number(rating) >= n ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <Input label="Notes" value={rideNotes} onChange={setRideNotes} placeholder="How did the bike feel?" />
        </fieldset>

        {/* Tires */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Tires
          </legend>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Front Brand" value={ftBrand} onChange={setFtBrand} placeholder="Maxxis" />
            <Input label="Front Model" value={ftModel} onChange={setFtModel} placeholder="Assegai" />
            <Input label="Front PSI" type="number" step="0.5" value={ftPsi} onChange={setFtPsi} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Rear Brand" value={rtBrand} onChange={setRtBrand} placeholder="Maxxis" />
            <Input label="Rear Model" value={rtModel} onChange={setRtModel} placeholder="Dissector" />
            <Input label="Rear PSI" type="number" step="0.5" value={rtPsi} onChange={setRtPsi} />
          </div>
        </fieldset>

        {/* Fork */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Fork
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="Air PSI" type="number" step="0.5" value={forkPsi} onChange={setForkPsi} />
            <Input label="Rebound Clicks" type="number" value={forkRebound} onChange={setForkRebound} />
            <Input label="Comp Clicks" type="number" value={forkComp} onChange={setForkComp} />
            <Input label="Tokens" type="number" value={forkTokens} onChange={setForkTokens} />
          </div>
        </fieldset>

        {/* Shock */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Shock
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="Air PSI" type="number" step="0.5" value={shockPsi} onChange={setShockPsi} />
            <Input label="Rebound Clicks" type="number" value={shockRebound} onChange={setShockRebound} />
            <Input label="Comp Clicks" type="number" value={shockComp} onChange={setShockComp} />
            <Input label="Vol. Spacers" type="number" value={shockSpacers} onChange={setShockSpacers} />
          </div>
        </fieldset>

        <Input label="Setup Notes" value={setupNotes} onChange={setSetupNotes} placeholder="Any changes from last ride?" />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-mtb-600 hover:bg-mtb-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md"
        >
          {saving ? "Saving..." : "Save Ride"}
        </button>
      </form>
    </div>
  );
}
