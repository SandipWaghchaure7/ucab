import { useDriverAuth } from '../context/DriverAuthContext';
import { Car, Phone, Mail, Shield, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverProfile() {
  const { driver, logout } = useDriverAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const Row = ({ label, value }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid #2A2A2A'
    }}>
      <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 28, marginBottom: 24 }}>My Profile</h1>

      {/* Avatar Card */}
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#F5C518', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne', fontWeight: 800,
          fontSize: 32, color: '#000', margin: '0 auto 16px'
        }}>
          {driver?.name?.charAt(0)}
        </div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
          {driver?.name}
        </div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
          {driver?.email}
        </div>
        {driver?.isVerified ? (
          <span style={{
            background: 'rgba(34,197,94,0.15)', color: '#22C55E',
            fontSize: 11, padding: '4px 12px', borderRadius: 20,
            fontWeight: 700, letterSpacing: 0.5
          }}>
            ✓ VERIFIED DRIVER
          </span>
        ) : (
          <span style={{
            background: 'rgba(255,68,68,0.15)', color: '#FF4444',
            fontSize: 11, padding: '4px 12px', borderRadius: 20,
            fontWeight: 700, letterSpacing: 0.5
          }}>
            ⏳ PENDING VERIFICATION
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Rides',    value: driver?.totalRides || 0,        color: '#6366F1' },
          { label: 'Rating',   value: `${driver?.rating || 5.0} ⭐`,  color: '#F5C518' },
          { label: 'Earnings', value: `₹${driver?.earnings || 0}`,    color: '#22C55E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ marginBottom: 0, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color }}>{value}</div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Personal Info */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#F5C518' }}>
          👤 Personal Info
        </h3>
        <Row label="Full Name"       value={driver?.name} />
        <Row label="Email"           value={driver?.email} />
        <Row label="Phone"           value={driver?.phone} />
        <Row label="License Number"  value={driver?.licenseNumber || '—'} />
      </div>

      {/* Vehicle Info */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#F5C518' }}>
          🚗 Vehicle Info
        </h3>
        <Row label="Cab Type"     value={driver?.vehicle?.type} />
        <Row label="Model"        value={driver?.vehicle?.model} />
        <Row label="Plate Number" value={driver?.vehicle?.plateNumber} />
        <Row label="Color"        value={driver?.vehicle?.color || '—'} />
      </div>

      {/* Logout */}
      <button className="btn-danger" onClick={handleLogout} style={{ marginTop: 8 }}>
        Logout
      </button>
    </div>
  );
}