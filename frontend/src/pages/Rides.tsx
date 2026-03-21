import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBikes, getRides } from "../api";
import type { Bike, Ride, TrailCondition } from "../types";

const CONDITIONS: TrailCondition[] = ["dry", "tacky", "muddy", "wet", "mixed"];

export default function Rides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bikeFilter, setBikeFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [trailFilter, setTrailFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (bikeFilter) params.bike_id = bikeFilter;
    if (conditionFilter) params.trail_condition = conditionFilter;
    if (trailFilter) params.trail_name = trailFilter;
    getRides(params)
      .then(setRides)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getBikes().then(setBikes);
  }, []);

  useEffect(() => {
    load();
  }, [bikeFilter, conditionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rides</h1>
        <Link
          to="/log"
          className="bg-mtb-600 hover:bg-mtb-700 text-white font-medium px-4 py-2 rounded-md text-sm"
        >
          Log Ride
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={bikeFilter}
          onChange={(e) => setBikeFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm"
        >
          <option value="">All bikes</option>
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm"
        >
          <option value="">All conditions</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <form onSubmit={handleTrailSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search trail..."
            value={trailFilter}
            onChange={(e) => setTrailFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm w-40"
          />
          <button
            type="submit"
            className="text-sm text-mtb-600 dark:text-mtb-400 hover:underline"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rides.length === 0 ? (
        <p className="text-gray-500">No rides found.</p>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Link
              key={ride.id}
              to={`/rides/${ride.id}`}
              className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-mtb-400 dark:hover:border-mtb-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{ride.trail_name}</span>
                <span className="text-yellow-500">
                  {ride.rating ? "★".repeat(ride.rating) + "☆".repeat(5 - ride.rating) : "--"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span>{ride.date}</span>
                {ride.bike && <span>{ride.bike.name}</span>}
                {ride.trail_condition && (
                  <span className="capitalize">{ride.trail_condition}</span>
                )}
                {ride.weather && <span className="capitalize">{ride.weather}</span>}
                {ride.duration_minutes && <span>{ride.duration_minutes}min</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
