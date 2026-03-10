import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDriverAuth } from '../context/DriverAuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CAB_TYPES = ['Mini', 'Sedan', 'SUV', 'Auto'];

export default function DriverRegister() {
  const { login }  = useDriverAuth();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    licenseNumber: '', vehicleType: 'Sedan',
    vehicleModel: '', plateNumber: '', color: ''
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
  const required = ['name','email','password','phone','licenseNumber','vehicleModel','plateNumber'];
  for (const key of required) {
    if (!form[key]) return toast.error(`Please fill in ${key}`);
  }
  setLoading(true);
  try {
    // ✅ Send flat fields — backend destructures them directly from req.body
    const payload = {
      name:          form.name,
      email:         form.email,
      password:      form.password,
      phone:         form.phone,
      licenseNumber: form.licenseNumber,
      vehicleType:   form.vehicleType,   // backend reads vehicleType directly
      vehicleModel:  form.vehicleModel,  // backend reads vehicleModel directly
      plateNumber:   form.plateNumber,   // backend reads plateNumber directly
      color:         form.color          // backend reads color directly
    };

    const { data } = await API.post('/auth/driver/register', payload);
    login(data.driver, data.token);
    toast.success('Registration successful! Awaiting admin verification 🎉');
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  const inputStyle = {
    width: '100%', background: '#111',
    border: '1.5px solid #2A2A2A', borderRadius: 12,
    padding: '12px 14px', color: '#F0F0F0',
    fontFamily: 'DM Sans', fontSize: 14,
    outline: 'none', boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: 11, color: '#888',
    letterSpacing: 1, marginBottom: 6,
    display: 'block'
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, color: '#F5C518' }}>
            🚕 Ucab
          </div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Driver Registration
          </div>
        </div>

        {/* Personal Info */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#F5C518' }}>
            👤 Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>FULL NAME</label>
              <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>PHONE</label>
              <input style={inputStyle} placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input style={inputStyle} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>LICENSE NUMBER</label>
              <input style={inputStyle} placeholder="e.g. MH12-2024-1234567" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#F5C518' }}>
            🚗 Vehicle Information
          </h3>

          {/* Cab Type Selector */}
          <label style={labelStyle}>CAB TYPE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {CAB_TYPES.map(type => (
              <button
                key={type}
                onClick={() => set('vehicleType', type)}
                style={{
                  padding: '10px 6px', borderRadius: 10,
                  border: `1.5px solid ${form.vehicleType === type ? '#F5C518' : '#2A2A2A'}`,
                  background: form.vehicleType === type ? 'rgba(245,197,24,0.08)' : '#111',
                  color: form.vehicleType === type ? '#F5C518' : '#888',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                {type}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>VEHICLE MODEL</label>
              <input style={inputStyle} placeholder="e.g. Maruti Swift" value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>PLATE NUMBER</label>
              <input style={inputStyle} placeholder="e.g. MH12AB1234" value={form.plateNumber} onChange={e => set('plateNumber', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>VEHICLE COLOR</label>
              <input style={inputStyle} placeholder="e.g. White" value={form.color} onChange={e => set('color', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notice */}
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'rgba(245,197,24,0.06)',
          border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: 10, fontSize: 13, color: '#888'
        }}>
          ℹ️ After registration, an admin will verify your account before you can accept rides.
        </div>

        <button className="btn-primary" onClick={handleRegister} disabled={loading}>
          {loading ? <><span className="spinner" /> &nbsp; Registering...</> : 'Register as Driver →'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 16 }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#F5C518', textDecoration: 'none', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}