import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Car, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password)
      return toast.error('Please fill all fields');

    setLoading(true);
    try {
      const { data } = await API.post('/auth/user/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! 🚕`);
      navigate('/');
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
      padding: '24px',
      background: 'radial-gradient(ellipse at 60% 20%, rgba(245,197,24,0.07) 0%, transparent 60%)'
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            background: 'var(--yellow)', borderRadius: 18,
            width: 56, height: 56, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Car size={28} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>
            Welcome to <span style={{ color: 'var(--yellow)' }}>Ucab</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            Sign in to book your next ride
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email" placeholder="sarah@gmail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 8 }}>
            {loading
              ? <><span className="spinner" /> &nbsp; Signing in...</>
              : 'Sign In →'}
          </button>

          <p style={{
            textAlign: 'center', marginTop: 20,
            color: 'var(--muted)', fontSize: 14
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--yellow)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Driver login link */}
        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)', fontSize: 13 }}>
          Are you a driver?{' '}
          <Link to="/driver-login" style={{ color: 'var(--white)', textDecoration: 'none', fontWeight: 600 }}>
            Driver Login →
          </Link>
        </p>
      </div>
    </div>
  );
}