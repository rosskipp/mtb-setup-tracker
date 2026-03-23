import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getRides, getBikes } from '../api/client';
import type { Ride, Bike } from '../types';

const COLORS = {
  brand: '#22c55e',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b',
};

function useIsDark() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark'),
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function useTooltipStyle(isDark: boolean) {
  return useMemo(
    () => ({
      backgroundColor: isDark ? 'rgb(17 24 39)' : 'rgb(255 255 255)',
      border: `1px solid ${isDark ? 'rgb(55 65 81)' : 'rgb(229 231 235)'}`,
      borderRadius: '0.5rem',
      color: isDark ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
    }),
    [isDark],
  );
}

function avg(values: (number | undefined)[]): number {
  const nums = values.filter((v): v is number => v != null);
  return nums.length > 0
    ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
    : 0;
}

export default function Analytics() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [bikeFilter, setBikeFilter] = useState('');
  const [selectedTrail, setSelectedTrail] = useState('');

  const isDark = useIsDark();
  const tooltipStyle = useTooltipStyle(isDark);
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  useEffect(() => {
    Promise.all([getRides(), getBikes()])
      .then(([ridesRes, bikesRes]) => {
        setRides(ridesRes.data);
        setBikes(bikesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRides = useMemo(() => {
    if (!bikeFilter) return rides;
    return rides.filter((r) => r.bike_id === bikeFilter);
  }, [rides, bikeFilter]);

  const highRated = useMemo(
    () => filteredRides.filter((r) => (r.rating || 0) >= 4),
    [filteredRides],
  );

  // ---- Sweet Spot: Tire Pressures ----
  const tirePressureData = useMemo(
    () => [
      {
        name: 'Front',
        psi: avg(highRated.map((r) => r.setup?.front_tire_pressure_psi)),
      },
      {
        name: 'Rear',
        psi: avg(highRated.map((r) => r.setup?.rear_tire_pressure_psi)),
      },
    ],
    [highRated],
  );

  // ---- Sweet Spot: Suspension Air ----
  const suspPressureData = useMemo(
    () => [
      {
        name: 'Fork',
        psi: avg(highRated.map((r) => r.setup?.fork_air_pressure_psi)),
      },
      {
        name: 'Shock',
        psi: avg(highRated.map((r) => r.setup?.shock_air_pressure_psi)),
      },
    ],
    [highRated],
  );

  // ---- Sweet Spot: Fork Damping ----
  const forkDampingData = useMemo(
    () => [
      { name: 'Rebound', clicks: avg(highRated.map((r) => r.setup?.fork_rebound_clicks)) },
      { name: 'Compression', clicks: avg(highRated.map((r) => r.setup?.fork_compression_clicks)) },
    ],
    [highRated],
  );

  // ---- Sweet Spot: Shock Damping ----
  const shockDampingData = useMemo(
    () => [
      { name: 'Rebound', clicks: avg(highRated.map((r) => r.setup?.shock_rebound_clicks)) },
      { name: 'Compression', clicks: avg(highRated.map((r) => r.setup?.shock_compression_clicks)) },
    ],
    [highRated],
  );

  // ---- Trail Comparison ----
  const trails = useMemo(() => {
    const names = [...new Set(filteredRides.map((r) => r.trail_name))];
    return names.sort();
  }, [filteredRides]);

  const trailChartData = useMemo(() => {
    if (!selectedTrail) return [];
    return filteredRides
      .filter((r) => r.trail_name === selectedTrail)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        forkPsi: r.setup?.fork_air_pressure_psi,
        shockPsi: r.setup?.shock_air_pressure_psi,
        frontTire: r.setup?.front_tire_pressure_psi,
        rearTire: r.setup?.rear_tire_pressure_psi,
        rating: r.rating,
      }));
  }, [filteredRides, selectedTrail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const hasData = highRated.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Find your sweet spot and track setup trends
        </p>
      </div>

      {/* Bike Filter */}
      <div className="card p-4">
        <label className="label">Filter by Bike</label>
        <select
          className="input max-w-xs"
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

      {/* Sweet Spot Analysis */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Sweet Spot Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average settings from your {highRated.length} ride{highRated.length !== 1 ? 's' : ''}{' '}
            rated 4-5 stars
          </p>
        </div>

        {!hasData ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Rate some rides 4 or 5 stars to see your sweet spot settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tire Pressures */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Tire Pressures (PSI)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tirePressureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="psi" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Suspension Air */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Suspension Air Pressure (PSI)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={suspPressureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="psi" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fork Damping */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Fork Damping (clicks)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={forkDampingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="clicks" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Shock Damping */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Shock Damping (clicks)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shockDampingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="clicks" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* Trail Setup Comparison */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Setup Comparison by Trail</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            See how your settings varied across rides on the same trail
          </p>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label">Select Trail</label>
            <select
              className="input max-w-xs"
              value={selectedTrail}
              onChange={(e) => setSelectedTrail(e.target.value)}
            >
              <option value="">Choose a trail</option>
              {trails.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {selectedTrail && trailChartData.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No rides found for this trail.
            </p>
          )}

          {trailChartData.length > 0 && (
            <div className="space-y-6">
              {/* Pressures over time */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Pressures Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trailChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="forkPsi"
                      name="Fork PSI"
                      stroke={COLORS.blue}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="shockPsi"
                      name="Shock PSI"
                      stroke={COLORS.purple}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="frontTire"
                      name="Front Tire PSI"
                      stroke={COLORS.amber}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="rearTire"
                      name="Rear Tire PSI"
                      stroke={COLORS.brand}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Rating over time */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ride Rating
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trailChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 12 }} />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="rating" name="Rating" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {!selectedTrail && trails.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a trail above to compare setups across rides.
            </p>
          )}

          {trails.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log some rides to start comparing setups by trail.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
