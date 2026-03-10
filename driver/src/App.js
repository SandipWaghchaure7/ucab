import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DriverAuthProvider, useDriverAuth } from './context/DriverAuthContext';
import DriverLayout    from './components/DriverLayout';
import DriverLogin     from './pages/DriverLogin';
import DriverRegister  from './pages/DriverRegister';
import DriverDashboard from './pages/DriverDashboard';
import RideRequests    from './pages/RideRequests';
import RideHistory     from './pages/RideHistory';
import DriverProfile   from './pages/DriverProfile';

// Protected route
function PrivateRoute({ children }) {
  const { driver } = useDriverAuth();
  return driver ? children : <Navigate to="/login" />;
}

// Public route (redirect if logged in)
function PublicRoute({ children }) {
  const { driver } = useDriverAuth();
  return !driver ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1A1A1A', color: '#F0F0F0', border: '1px solid #2A2A2A' }
      }} />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><DriverLogin /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><DriverRegister /></PublicRoute>} />

        {/* Protected with Sidebar Layout */}
        <Route path="/" element={<PrivateRoute><DriverLayout /></PrivateRoute>}>
          <Route index             element={<Navigate to="/dashboard" />} />
          <Route path="dashboard"  element={<DriverDashboard />} />
          <Route path="requests"   element={<RideRequests />} />
          <Route path="history"    element={<RideHistory />} />
          <Route path="profile"    element={<DriverProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <DriverAuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DriverAuthProvider>
  );
}