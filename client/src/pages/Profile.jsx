import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, LogOut, Car } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: 80,
      padding: '80px 24px 60px',
      maxWidth: 500, margin: '0 auto'
    }}>
      <h1 className="fade-up" style={{ fontSize: 28, marginBottom: 28 }}>
        My Profile
      </h1>

      {/* Avatar Card */}
      <div className="card fade-up" style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 32, fontWeight: 800,
          fontFamily: 'Syne', color: '#000'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name}</h2>
        <span className="badge badge-yellow">Rider</span>
      </div>

      {/* Info Card */}
      <div className="card fade-up-2" style={{ marginBottom: 16 }}>
        {[
          { icon: Mail,  label: 'Email',  value: user?.email },
          { icon: Phone, label: 'Phone',  value: user?.phone },
          { icon: User,  label: 'Role',   value: user?.role },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={16} color="var(--yellow)" />
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: 1 }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontWeight: 500, fontSize: 15, marginTop: 2 }}>
                {value || '—'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-outline fade-up-3"
        onClick={handleLogout}
        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
        <LogOut size={15} style={{ display: 'inline', marginRight: 8 }} />
        Logout
      </button>
    </div>
  );
}