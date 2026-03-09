import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary  from './components/ErrorBoundary';
import LoadingScreen  from './components/LoadingScreen';
import Navbar         from './components/Navbar';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Home           from './pages/Home';
import History        from './pages/History';
import Profile        from './pages/Profile';
import NotFound       from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Starting Ucab..." />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Starting Ucab..." />;
  return !user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* Protected */}
        <Route path="/" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute><History /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1a1a1a',
                color: '#f0f0f0',
                border: '1px solid #2a2a2a',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                borderRadius: '12px'
              },
              success: { iconTheme: { primary: '#f5c518', secondary: '#000' } },
              error:   { iconTheme: { primary: '#ff4444', secondary: '#fff' } }
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}