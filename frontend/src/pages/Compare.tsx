import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBikes, getRides } from '../api/client';
import type { Bike, Ride } from '../types';

function Stars({ rating }: { rating: number | undefined }) {
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

function fmt(val: number | undefined): string {
  return val != null ? String(val) : '—';
}

function fmtCondition(val: string | undefined): string {
  if (!val) return '—';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

interface TrailGroup {
  trail_name: string;
  rides: Ride[];
  best_ride_id: string | null;
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
        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs">
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Date</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Rating</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Condition</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Fork PSI</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Fork Reb</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Fork Comp</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Fork Tok</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Shock PSI</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Shock Reb</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Shock Comp</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Spacers</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Tire F</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Tire R</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Notes</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody>
            {group.rides.map((ride) => {
              const isBest = ride.id === group.best_ride_id;
              const s = ride.setup;
              return (
                <tr
                  key={ride.id}
                  className={
                    isBest
                      ? 'bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30'
                      : 'border-b border-gray-100 dark:border-gray-800 last:border-b-0'
                  }
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {new Date(ride.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {isBest && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium px-1.5 py-0.5 rounded">
                        best
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Stars rating={ride.rating} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                    {fmtCondition(ride.trail_condition)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.fork_air_pressure_psi)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.fork_rebound_clicks)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.fork_compression_clicks)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.fork_tokens)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.shock_air_pressure_psi)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.shock_rebound_clicks)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.shock_compression_clicks)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.shock_volume_spacers)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.front_tire_pressure_psi)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s?.rear_tire_pressure_psi)}</td>
                  <td className="px-3 py-2.5 max-w-[160px]">
                    <span className="text-gray-600 dark:text-gray-400 text-xs truncate block">
                      {s?.notes || ride.notes || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Link
                      to={`/rides/new?from=${ride.id}`}
                      className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                    >
                      Duplicate
                    </Link>
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
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedTrail, setSelectedTrail] = useState('');
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
      setRides([]);
      setSelectedTrail('');
      return;
    }
    setLoadingData(true);
    setError(null);
    getRides({ bike_id: selectedBikeId })
      .then((res) => {
        setRides(res.data);
        setSelectedTrail('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load ride data.');
      })
      .finally(() => setLoadingData(false));
  }, [selectedBikeId]);

  const trailNames = useMemo(() => {
    const names = Array.from(new Set(rides.map((r) => r.trail_name))).sort();
    return names;
  }, [rides]);

  const trailGroups = useMemo((): TrailGroup[] => {
    const filtered = selectedTrail ? rides.filter((r) => r.trail_name === selectedTrail) : rides;
    const map = new Map<string, Ride[]>();
    for (const ride of filtered) {
      const existing = map.get(ride.trail_name) ?? [];
      existing.push(ride);
      map.set(ride.trail_name, existing);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([trail_name, trailRides]) => {
        const sorted = [...trailRides].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const best = sorted.reduce<Ride | null>((top, ride) => {
          if (ride.rating == null) return top;
          if (top == null || (top.rating ?? 0) < ride.rating) return ride;
          return top;
        }, null);
        return { trail_name, rides: sorted, best_ride_id: best?.id ?? null };
      });
  }, [rides, selectedTrail]);

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

      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
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

        {rides.length > 0 && (
          <div>
            <label className="label">Filter by Trail</label>
            <select
              className="input max-w-xs"
              value={selectedTrail}
              onChange={(e) => setSelectedTrail(e.target.value)}
            >
              <option value="">All trails</option>
              {trailNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingData && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )}

      {error && (
        <div className="card p-4 text-red-500 dark:text-red-400">{error}</div>
      )}

      {!loadingData && selectedBikeId && !error && rides.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No rides found for this bike. Log some rides to start comparing setups.
          </p>
        </div>
      )}

      {!loadingData && trailGroups.length > 0 && (
        <div className="space-y-5">
          {trailGroups.map((group) => (
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
