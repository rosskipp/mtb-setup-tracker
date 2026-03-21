import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteRide, getRide } from "../api";
import type { Ride } from "../types";

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getRide(Number(id))
        .then(setRide)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!ride || !confirm("Delete this ride?")) return;
    await deleteRide(ride.id);
    navigate("/rides");
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!ride) return <p className="text-gray-500">Ride not found.</p>;

  const s = ride.setup;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/rides" className="text-sm text-mtb-600 dark:text-mtb-400 hover:underline">
            &larr; All rides
          </Link>
          <h1 className="text-2xl font-bold mt-1">{ride.trail_name}</h1>
        </div>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Delete
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
          Ride Info
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Date" value={ride.date} />
          <Field label="Bike" value={ride.bike?.name} />
          <Field label="Condition" value={ride.trail_condition} />
          <Field label="Weather" value={ride.weather} />
          <Field label="Temp" value={ride.temperature_f ? `${ride.temperature_f}°F` : null} />
          <Field label="Duration" value={ride.duration_minutes ? `${ride.duration_minutes}min` : null} />
          <Field
            label="Rating"
            value={ride.rating ? "★".repeat(ride.rating) + "☆".repeat(5 - ride.rating) : null}
          />
        </dl>
        {ride.notes && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{ride.notes}</p>
        )}
      </div>

      {s && (
        <>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Tires
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Front Brand" value={s.front_tire_brand} />
              <Field label="Front Model" value={s.front_tire_model} />
              <Field label="Front PSI" value={s.front_tire_pressure_psi} />
              <Field label="Rear Brand" value={s.rear_tire_brand} />
              <Field label="Rear Model" value={s.rear_tire_model} />
              <Field label="Rear PSI" value={s.rear_tire_pressure_psi} />
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Fork
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Air PSI" value={s.fork_air_pressure_psi} />
              <Field label="Rebound" value={s.fork_rebound_clicks != null ? `${s.fork_rebound_clicks} clicks` : null} />
              <Field label="Compression" value={s.fork_compression_clicks != null ? `${s.fork_compression_clicks} clicks` : null} />
              <Field label="Tokens" value={s.fork_tokens} />
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Shock
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Air PSI" value={s.shock_air_pressure_psi} />
              <Field label="Rebound" value={s.shock_rebound_clicks != null ? `${s.shock_rebound_clicks} clicks` : null} />
              <Field label="Compression" value={s.shock_compression_clicks != null ? `${s.shock_compression_clicks} clicks` : null} />
              <Field label="Volume Spacers" value={s.shock_volume_spacers} />
            </dl>
          </div>

          {s.notes && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Setup Notes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
