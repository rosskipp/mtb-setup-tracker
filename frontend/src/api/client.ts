import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
export const updateRide = (id: string, data: any) => api.patch(`/rides/${id}`, data);
export const deleteRide = (id: string) => api.delete(`/rides/${id}`);

// ---- Analytics ----
export const getSweetSpots = (params?: Record<string, any>) =>
  api.get('/analytics/sweet-spots', { params });
export const getCompareTrail = (trail: string, bikeId?: string) =>
  api.get('/analytics/compare', { params: { trail, bike_id: bikeId } });
export const getCompareSetups = (bikeId: string) =>
  api.get('/analytics/compare-setups', { params: { bike_id: bikeId } });
