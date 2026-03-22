import { useState, useEffect } from 'react';
import { getBikes, getCompareSetups } from '../api/client';
import type { Bike } from '../types';

interface CompareRide {
  ride_id: string;
  date: string;
  rating: number | null;
  notes: string | null;
  front_tire_psi: number | null;
  rear_tire_psi: number | null;
  fork_psi: number | null;
  shock_psi: number | null;
  setup_notes: string | null;
}

interface TrailGroup {
  trail_name: string;
  rides: CompareRide[];
  best_ride_id: string | null;
}

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-gray-500 dark:text-gray-600">—</span>;
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-amber-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </span>
  );
}

function fmt(val: number | null): string {
  return val != null ? String(val) : '—';
}

function TrailTable({ group }: { group: TrailGroup }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-base">{group.trail_name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {group.rides.length} ride{group.rides.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs">
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Rating</th>
              <th className="text-right px-4 py-2 font-medium">Tire F (PSI)</th>
              <th className="text-right px-4 py-2 font-medium">Tire R (PSI)</th>
              <th className="text-right px-4 py-2 font-medium">Fork (PSI)</th>
              <th className="text-right px-4 py-2 font-medium">Shock (PSI)</th>
              <th className="text-left px-4 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {group.rides.map((ride) => {
              const isBest = ride.ride_id === group.best_ride_id;
              return (
                <tr
                  key={ride.ride_id}
                  className={
                    isBest
                      ? 'bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30'
                      : 'border-b border-gray-100 dark:border-gray-800 last:border-b-0'
                  }
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {new Date(ride.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {isBest && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                        best
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Stars rating={ride.rating} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(ride.front_tire_psi)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(ride.rear_tire_psi)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(ride.fork_psi)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(ride.shock_psi)}</td>
                  <td className="px-4 py-2.5 max-w-xs">
                    <span className="text-gray-600 dark:text-gray-400 text-xs truncate block">
                      {ride.setup_notes || ride.notes || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Compare() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [trails, setTrails] = useState<TrailGroup[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBikes()
      .then((res) => setBikes(res.data))
      .catch(console.error)
      .finally(() => setLoadingBikes(false));
  }, []);

  useEffect(() => {
    if (!selectedBikeId) {
      setTrails([]);
      return;
    }
    setLoadingData(true);
    setError(null);
    getCompareSetups(selectedBikeId)
      .then((res) => setTrails(res.data.trails))
      .catch((err) => {
        console.error(err);
        setError('Failed to load comparison data.');
      })
      .finally(() => setLoadingData(false));
  }, [selectedBikeId]);

  if (loadingBikes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Setup Comparison</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Compare setups across rides on each trail
        </p>
      </div>

      <div className="card p-4">
        <label className="label">Select Bike</label>
        <select
          className="input max-w-xs"
          value={selectedBikeId}
          onChange={(e) => setSelectedBikeId(e.target.value)}
        >
          <option value="">Choose a bike</option>
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {loadingData && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )}

      {error && (
        <div className="card p-4 text-red-500 dark:text-red-400">{error}</div>
      )}

      {!loadingData && selectedBikeId && !error && trails.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No rides found for this bike. Log some rides to start comparing setups.
          </p>
        </div>
      )}

      {!loadingData && trails.length > 0 && (
        <div className="space-y-5">
          {trails.map((group) => (
            <TrailTable key={group.trail_name} group={group} />
          ))}
        </div>
      )}

      {!selectedBikeId && bikes.length > 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Select a bike above to compare setups by trail.
          </p>
        </div>
      )}

      {bikes.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Add a bike first, then log some rides to start comparing setups.
          </p>
        </div>
      )}
    </div>
  );
}
