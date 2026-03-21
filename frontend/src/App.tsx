import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Bikes from "./pages/Bikes";
import Dashboard from "./pages/Dashboard";
import LogRide from "./pages/LogRide";
import RideDetail from "./pages/RideDetail";
import Rides from "./pages/Rides";

function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const nav = [
    { to: "/", label: "Dashboard" },
    { to: "/rides", label: "Rides" },
    { to: "/log", label: "Log Ride" },
    { to: "/bikes", label: "Bikes" },
    { to: "/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg text-mtb-600 dark:text-mtb-400">
            MTB Tracker
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  location.pathname === n.to
                    ? "bg-mtb-100 dark:bg-mtb-900 text-mtb-700 dark:text-mtb-300"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <button
              onClick={() => setDark(!dark)}
              className="ml-2 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/log" element={<LogRide />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
