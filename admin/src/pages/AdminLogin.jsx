import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password)
      return toast.error('Fill all fields');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/user/login', form);
      if (data.user.role !== 'admin')
        return toast.error('Access denied. Admin only.');
      login(data.user, data.token);
      toast.success('Welcome back, Admin 👑');
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
      background: `
        radial-gradient(ellipse at 20% 50%, rgba(245,197,24,0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, rgba(0,212,255,0.04) 0%, transparent 50%),
        var(--bg)
      `
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 380, padding: 24, position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(245,197,24,0.25)'
          }}>
            <Shield size={28} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 38, marginBottom: 6 }}>
            UCAB <span style={{ color: 'var(--yellow)' }}>ADMIN</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: 1 }}>
            COMMAND CENTER ACCESS
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14, padding: 24
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 700,
              letterSpacing: 2, color: 'var(--muted)',
              textTransform: 'uppercase', marginBottom: 8
            }}>Admin Email</label>
            <input
              style={{ width: '100%' }}
              type="email" placeholder="admin@ucab.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 700,
              letterSpacing: 2, color: 'var(--muted)',
              textTransform: 'uppercase', marginBottom: 8
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ width: '100%', paddingRight: 40 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer'
                }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-yellow"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
            {loading
              ? <span style={{ width:16,height:16,border:'2px solid #000',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}} />
              : '⚡ Access Dashboard'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)', fontSize: 11, letterSpacing: 1 }}>
          RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}