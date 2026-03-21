import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBikes, getSweetSpots, getTrends } from "../api";
import type { Bike, SweetSpot, TrendPoint } from "../types";

const FIELD_LABELS: Record<string, string> = {
  front_tire_pressure_psi: "Front Tire PSI",
  rear_tire_pressure_psi: "Rear Tire PSI",
  fork_air_pressure_psi: "Fork Air PSI",
  fork_rebound_clicks: "Fork Rebound",
  fork_compression_clicks: "Fork Compression",
  fork_tokens: "Fork Tokens",
  shock_air_pressure_psi: "Shock Air PSI",
  shock_rebound_clicks: "Shock Rebound",
  shock_compression_clicks: "Shock Compression",
  shock_volume_spacers: "Shock Volume Spacers",
};

const TREND_FIELDS = Object.keys(FIELD_LABELS);

export default function Analytics() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bikeId, setBikeId] = useState("");
  const [sweetSpots, setSweetSpots] = useState<SweetSpot[]>([]);
  const [trendField, setTrendField] = useState(TREND_FIELDS[0]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loadingSS, setLoadingSS] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    getBikes().then((b) => {
      setBikes(b);
      if (b.length > 0) setBikeId(String(b[0].id));
    });
  }, []);

  useEffect(() => {
    if (!bikeId) return;
    setLoadingSS(true);
    getSweetSpots(Number(bikeId))
      .then(setSweetSpots)
      .finally(() => setLoadingSS(false));
  }, [bikeId]);

  useEffect(() => {
    if (!bikeId) return;
    setLoadingTrend(true);
    getTrends(Number(bikeId), trendField)
      .then(setTrends)
      .finally(() => setLoadingTrend(false));
  }, [bikeId, trendField]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm"
        >
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sweet Spots */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Sweet Spots</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Most common settings on 4-5 star rides
        </p>
        {loadingSS ? (
          <p className="text-gray-500">Loading...</p>
        ) : sweetSpots.length === 0 ? (
          <p className="text-gray-500">Not enough data yet. Log some rides with ratings!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sweetSpots.map((ss) => (
              <div
                key={ss.field}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {FIELD_LABELS[ss.field] ?? ss.field}
                </p>
                <p className="text-xl font-bold mt-1">
                  {ss.value != null ? ss.value : "--"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  avg {ss.avg_rating}★ &middot; {ss.ride_count} ride{ss.ride_count !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trends */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Setup Trends</h2>
          <select
            value={trendField}
            onChange={(e) => setTrendField(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm"
          >
            {TREND_FIELDS.map((f) => (
              <option key={f} value={f}>
                {FIELD_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        {loadingTrend ? (
          <p className="text-gray-500">Loading...</p>
        ) : trends.length === 0 ? (
          <p className="text-gray-500">No data for this setting yet.</p>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    color: "#f3f4f6",
                  }}
                  formatter={(value: number) => [value, FIELD_LABELS[trendField]]}
                  labelFormatter={(label: string) => {
                    const point = trends.find((t) => t.date === label);
                    return `${label}${point?.trail_name ? ` — ${point.trail_name}` : ""}`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
