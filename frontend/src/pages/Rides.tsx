import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRides, getBikes, deleteRide } from '../api/client';
import type { Ride, Bike, TrailCondition } from '../types';

const CONDITIONS: { value: TrailCondition; label: string; emoji: string }[] = [
  { value: 'dry', label: 'Dry', emoji: '☀️' },
  { value: 'tacky', label: 'Tacky', emoji: '👌' },
  { value: 'wet', label: 'Wet', emoji: '🌧️' },
  { value: 'muddy', label: 'Muddy', emoji: '💩' },
  { value: 'mixed', label: 'Mixed', emoji: '🌤️' },
];

export default function Rides() {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bikeFilter, setBikeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  useEffect(() => {
    Promise.all([getRides(), getBikes()])
      .then(([ridesRes, bikesRes]) => {
        setRides(ridesRes.data);
        setBikes(bikesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getBikeName = (bikeId: string) =>
    bikes.find((b) => b.id === bikeId)?.name ?? 'Unknown';

  const filteredRides = useMemo(() => {
    let result = [...rides];

    if (bikeFilter) {
      result = result.filter((r) => r.bike_id === bikeFilter);
    }
    if (conditionFilter) {
      result = result.filter((r) => r.trail_condition === conditionFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.trail_name.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [rides, bikeFilter, conditionFilter, searchQuery, sortBy]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ride at ${name}?`)) return;
    try {
      await deleteRide(id);
      setRides((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete ride:', err);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rides</h1>
        <Link to="/rides/new" className="btn-primary">
          ➕ Log Ride
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Trail, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Bike</label>
            <select
              className="input"
              value={bikeFilter}
              onChange={(e) => setBikeFilter(e.target.value)}
            >
              <option value="">All bikes</option>
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Conditions</label>
            <select
              className="input"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
            >
              <option value="">All conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Sort by</label>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
            >
              <option value="date">Date (newest)</option>
              <option value="rating">Rating (best)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''}
      </p>

      {/* Ride list */}
      {filteredRides.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {rides.length === 0 ? 'No rides logged yet.' : 'No rides match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRides.map((ride) => (
            <div key={ride.id} className="card p-4 hover:border-brand-500/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/rides/${ride.id}/edit`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{ride.trail_name}</h3>
                    {ride.trail_condition && (
                      <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {CONDITIONS.find((c) => c.value === ride.trail_condition)?.emoji}{' '}
                        {CONDITIONS.find((c) => c.value === ride.trail_condition)?.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    <span>{new Date(ride.date).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{getBikeName(ride.bike_id)}</span>
                    {ride.duration_minutes && (
                      <>
                        <span>·</span>
                        <span>{ride.duration_minutes} min</span>
                      </>
                    )}
                  </div>

                  {/* Setup preview */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ride.setup?.fork_air_pressure_psi && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Fork {ride.setup.fork_air_pressure_psi}psi
                      </span>
                    )}
                    {ride.setup?.shock_air_pressure_psi && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        · Shock {ride.setup.shock_air_pressure_psi}psi
                      </span>
                    )}
                    {ride.setup?.front_tire_pressure_psi && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        · Tires F{ride.setup.front_tire_pressure_psi}/R{ride.setup.rear_tire_pressure_psi}
                      </span>
                    )}
                  </div>

                  {ride.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {ride.notes}
                    </p>
                  )}
                </Link>

                <div className="flex flex-col items-end gap-2">
                  {ride.rating && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= ride.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/rides/new?from=${ride.id}`);
                    }}
                    className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(ride.id, ride.trail_name);
                    }}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
