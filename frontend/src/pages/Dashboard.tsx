import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBikes, getRides } from "../api";
import type { Bike, Ride } from "../types";

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-400">--</span>;
  return (
    <span className="text-yellow-500">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function Dashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRides({ limit: "5" }), getBikes()])
      .then(([r, b]) => {
        setRides(r);
        setBikes(b);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {rides.length} recent ride{rides.length !== 1 ? "s" : ""} &middot;{" "}
          {bikes.length} bike{bikes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bikes.length === 0 && (
        <div className="bg-mtb-50 dark:bg-mtb-900/30 border border-mtb-200 dark:border-mtb-800 rounded-lg p-6 text-center">
          <p className="text-lg font-medium mb-2">Get started</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first bike, then log a ride with your setup.
          </p>
          <Link
            to="/bikes"
            className="inline-block bg-mtb-600 hover:bg-mtb-700 text-white font-medium px-4 py-2 rounded-md"
          >
            Add a Bike
          </Link>
        </div>
      )}

      {rides.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Rides</h2>
          <div className="space-y-3">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                to={`/rides/${ride.id}`}
                className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-mtb-400 dark:hover:border-mtb-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{ride.trail_name}</span>
                  <RatingStars rating={ride.rating} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{ride.date}</span>
                  {ride.bike && <span>{ride.bike.name}</span>}
                  {ride.trail_condition && (
                    <span className="capitalize">{ride.trail_condition}</span>
                  )}
                  {ride.setup && (
                    <span>
                      F:{ride.setup.front_tire_pressure_psi}psi R:
                      {ride.setup.rear_tire_pressure_psi}psi
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/rides"
            className="inline-block mt-3 text-sm text-mtb-600 dark:text-mtb-400 hover:underline"
          >
            View all rides &rarr;
          </Link>
        </div>
      )}

      {bikes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Bikes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bikes.map((bike) => (
              <div
                key={bike.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <p className="font-medium">
                  {bike.name} {bike.year && `(${bike.year})`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {[
                    bike.wheel_size && `${bike.wheel_size}"`,
                    bike.travel_front_mm && `${bike.travel_front_mm}mm front`,
                    bike.travel_rear_mm && `${bike.travel_rear_mm}mm rear`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No specs"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
