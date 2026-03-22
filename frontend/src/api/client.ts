import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;

// ---- Bikes ----
export const getBikes = () => api.get('/bikes');
export const getBike = (id: string) => api.get(`/bikes/${id}`);
export const createBike = (data: any) => api.post('/bikes', data);
export const updateBike = (id: string, data: any) => api.put(`/bikes/${id}`, data);
export const deleteBike = (id: string) => api.delete(`/bikes/${id}`);

// ---- Rides ----
export const getRides = (params?: Record<string, any>) =>
  api.get('/rides', { params });
export const getRide = (id: string) => api.get(`/rides/${id}`);
export const createRide = (data: any) => api.post('/rides', data);
export const updateRide = (id: string, data: any) => api.put(`/rides/${id}`, data);
export const deleteRide = (id: string) => api.delete(`/rides/${id}`);
export const getLastSetup = (bikeId: string) =>
  api.get(`/rides/last-setup/${bikeId}`);

// ---- Analytics ----
export const getAnalytics = (params?: Record<string, any>) =>
  api.get('/analytics', { params });
export const getTrailStats = () => api.get('/analytics/trails');
export const getSetupTrends = (bikeId: string) =>
  api.get(`/analytics/trends/${bikeId}`);
export const getCompareSetups = (bikeId: string) =>
  api.get('/analytics/compare-setups', { params: { bike_id: bikeId } });
