import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Car } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone)
      return toast.error('All fields are required');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await API.post('/auth/user/register', form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to Ucab 🚕');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 30% 70%, rgba(245,197,24,0.07) 0%, transparent 60%)'
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            background: 'var(--yellow)', borderRadius: 18,
            width: 56, height: 56, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Car size={28} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 30, marginBottom: 8 }}>
            Join <span style={{ color: 'var(--yellow)' }}>Ucab</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            Create your free account in seconds
          </p>
        </div>

        <div className="card">
          {[
            { key: 'name',     label: 'Full Name',     type: 'text',     ph: 'Sarah Khan' },
            { key: 'email',    label: 'Email Address', type: 'email',    ph: 'sarah@gmail.com' },
            { key: 'phone',    label: 'Phone Number',  type: 'tel',      ph: '9876543210' },
            { key: 'password', label: 'Password',      type: 'password', ph: 'Min. 6 characters' }
          ].map(field => (
            <div className="input-group" key={field.key}>
              <label>{field.label}</label>
              <input
                type={field.type}
                placeholder={field.ph}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 8 }}>
            {loading
              ? <><span className="spinner" /> &nbsp; Creating account...</>
              : 'Create Account →'}
          </button>

          <p style={{
            textAlign: 'center', marginTop: 20,
            color: 'var(--muted)', fontSize: 14
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--yellow)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}