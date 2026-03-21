import type { Bike, Ride, Setup, SweetSpot, TrendPoint } from "./types";

const BASE = "/api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Bikes
export const getBikes = () => request<Bike[]>("/bikes");
export const getBike = (id: number) => request<Bike>(`/bikes/${id}`);
export const createBike = (data: Partial<Bike>) =>
  request<Bike>("/bikes", { method: "POST", body: JSON.stringify(data) });
export const updateBike = (id: number, data: Partial<Bike>) =>
  request<Bike>(`/bikes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBike = (id: number) =>
  request<void>(`/bikes/${id}`, { method: "DELETE" });

// Rides
export const getRides = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Ride[]>(`/rides${qs}`);
};
export const getRide = (id: number) => request<Ride>(`/rides/${id}`);
export const getLatestSetup = (bikeId: number) =>
  request<Setup | null>(`/rides/latest-setup?bike_id=${bikeId}`);
export const createRide = (data: Record<string, unknown>) =>
  request<Ride>("/rides", { method: "POST", body: JSON.stringify(data) });
export const updateRide = (id: number, data: Record<string, unknown>) =>
  request<Ride>(`/rides/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRide = (id: number) =>
  request<void>(`/rides/${id}`, { method: "DELETE" });

// Setups
export const compareSetups = (trailName: string, bikeId?: number) => {
  const params = new URLSearchParams({ trail_name: trailName });
  if (bikeId) params.set("bike_id", String(bikeId));
  return request<Ride[]>(`/setups/compare?${params}`);
};

// Analytics
export const getSweetSpots = (bikeId?: number, minRating?: number) => {
  const params = new URLSearchParams();
  if (bikeId) params.set("bike_id", String(bikeId));
  if (minRating) params.set("min_rating", String(minRating));
  return request<SweetSpot[]>(`/analytics/sweet-spots?${params}`);
};
export const getTrends = (bikeId: number, field: string) =>
  request<TrendPoint[]>(
    `/analytics/trends?bike_id=${bikeId}&field=${field}`,
  );
