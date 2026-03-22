import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rides from './pages/Rides';
import LogRide from './pages/LogRide';
import Bikes from './pages/Bikes';
import Analytics from './pages/Analytics';
import Compare from './pages/Compare';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/rides/new" element={<LogRide />} />
        <Route path="/rides/:id/edit" element={<LogRide />} />
        <Route path="/bikes" element={<Bikes />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
