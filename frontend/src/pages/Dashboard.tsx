import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRides, getBikes } from '../api/client';
import type { Ride, Bike } from '../types';

const CONDITIONS_EMOJI: Record<string, string> = {
  dry: '☀️',
  tacky: '👌',
  wet: '🌧️',
  muddy: '💩',
  snow: '❄️',
  loose: '🏜️',
  hero_dirt: '🤩',
};

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-gray-400 text-sm">No rating</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRides({ limit: 5 }), getBikes()])
      .then(([ridesRes, bikesRes]) => {
        setRides(ridesRes.data);
        setBikes(bikesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getBikeName = (bikeId: string) =>
    bikes.find((b) => b.id === bikeId)?.name ?? 'Unknown Bike';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Your riding overview
          </p>
        </div>
        <Link to="/rides/new" className="btn-primary">
          ➕ Log Ride
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Rides</div>
          <div className="text-2xl font-bold mt-1">{rides.length > 0 ? '...' : '0'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Bikes</div>
          <div className="text-2xl font-bold mt-1">{bikes.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</div>
          <div className="text-2xl font-bold mt-1">
            {rides.length > 0
              ? (
                  rides.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
                  rides.filter((r) => r.rating).length
                ).toFixed(1)
              : '-'}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Last Ride</div>
          <div className="text-2xl font-bold mt-1">
            {rides.length > 0
              ? new Date(rides[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '-'}
          </div>
        </div>
      </div>

      {/* Bikes summary */}
      {bikes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Your Bikes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bikes.map((bike) => (
              <div key={bike.id} className="card p-4 hover:border-brand-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{bike.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {[bike.year, bike.brand, bike.model].filter(Boolean).join(' ') || 'No details'}
                    </p>
                  </div>
                  <span className="text-2xl">🚲</span>
                </div>
                {(bike.fork_travel_mm || bike.shock_travel_mm) && (
                  <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {bike.fork_travel_mm && <span>Fork: {bike.fork_travel_mm}mm</span>}
                    {bike.shock_travel_mm && <span>Shock: {bike.shock_travel_mm}mm</span>}
                    {bike.wheel_size && <span>{bike.wheel_size}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent rides */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Rides</h2>
          {rides.length > 0 && (
            <Link to="/rides" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
              View all →
            </Link>
          )}
        </div>

        {rides.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No rides logged yet. Get out there! 🤘
            </p>
            <Link to="/rides/new" className="btn-primary">
              Log Your First Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                to={`/rides/${ride.id}/edit`}
                className="card p-4 block hover:border-brand-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{ride.trail_name}</h3>
                      {ride.conditions && (
                        <span className="text-lg" title={ride.conditions}>
                          {CONDITIONS_EMOJI[ride.conditions] || '🏔️'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(ride.date).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{getBikeName(ride.bike_id)}</span>
                      {ride.location && (
                        <>
                          <span>·</span>
                          <span className="truncate">{ride.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <StarRating rating={ride.rating} />
                </div>

                {/* Quick setup preview */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {ride.suspension_setup.fork_air_pressure_psi && (
                    <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Fork: {ride.suspension_setup.fork_air_pressure_psi} psi
                    </span>
                  )}
                  {ride.suspension_setup.shock_air_pressure_psi && (
                    <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      Shock: {ride.suspension_setup.shock_air_pressure_psi} psi
                    </span>
                  )}
                  {ride.tire_setup.front_tire_pressure_psi && (
                    <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      F: {ride.tire_setup.front_tire_pressure_psi} / R: {ride.tire_setup.rear_tire_pressure_psi} psi
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Empty state for bikes */}
      {bikes.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add a bike first to start tracking setups
          </p>
          <Link to="/bikes" className="btn-primary">
            Add a Bike
          </Link>
        </div>
      )}
    </div>
  );
}
