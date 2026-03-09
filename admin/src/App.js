import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout  from './components/AdminLayout';
import AdminLogin   from './pages/AdminLogin';
import Dashboard    from './pages/Dashboard';
import AdminUsers   from './pages/AdminUsers';
import AdminDrivers from './pages/AdminDrivers';
import AdminRides   from './pages/AdminRides';

const Protected = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  return admin ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { admin } = useAdminAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" /> : <AdminLogin />} />
      <Route path="/" element={<Protected><AdminLayout /></Protected>}>
        <Route index       element={<Dashboard />}    />
        <Route path="users"   element={<AdminUsers />}   />
        <Route path="drivers" element={<AdminDrivers />} />
        <Route path="rides"   element={<AdminRides />}   />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#191d25',
              color: '#e8eaf0',
              border: '1px solid #252b36',
              fontFamily: 'Manrope',
              fontSize: '13px',
              borderRadius: '10px'
            }
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AdminAuthProvider>
  );
}