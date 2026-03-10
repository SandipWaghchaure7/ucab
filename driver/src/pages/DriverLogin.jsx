import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDriverAuth } from '../context/DriverAuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function DriverLogin() {
  const { login }  = useDriverAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password)
      return toast.error('Enter email and password');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/driver/login', form);
      login(data.driver, data.token);
      toast.success(`Welcome back, ${data.driver.name}! 🚕`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0A0A0A', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'Syne', fontWeight: 800,
            fontSize: 40, color: '#F5C518'
          }}>
            🚕 Ucab
          </div>
          <div style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
            Driver Portal
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 6 }}>
            Driver Login
          </h2>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
            Sign in to start accepting rides
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="input-field"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 20 }}>
            {loading ? <><span className="spinner" /> &nbsp; Signing in...</> : 'Sign In →'}
          </button>

          <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 20 }}>
            New driver?{' '}
            <Link to="/register" style={{ color: '#F5C518', textDecoration: 'none', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}