import { NavLink, useNavigate } from 'react-router-dom';
import { useDriverAuth } from '../context/DriverAuthContext';
import {
  LayoutDashboard, Car, Clock,
  User, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/requests',  icon: Car,             label: 'Ride Requests' },
  { to: '/history',   icon: Clock,           label: 'History'       },
  { to: '/profile',   icon: User,            label: 'Profile'       },
];

export default function DriverSidebar() {
  const { driver, logout } = useDriverAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{
      width: 240, minHeight: '100vh', position: 'fixed',
      left: 0, top: 0, background: '#0D0F12',
      borderRight: '1px solid #1E2028',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', zIndex: 100
    }}>

      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1E2028' }}>
        <div style={{
          fontFamily: 'Syne', fontWeight: 800,
          fontSize: 24, color: '#F5C518'
        }}>
          🚕 Ucab
        </div>
        <div style={{ color: '#555', fontSize: 11, marginTop: 2, letterSpacing: 1 }}>
          DRIVER PANEL
        </div>
      </div>

      {/* Driver Info */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #1E2028'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#F5C518', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne', fontWeight: 800,
          fontSize: 18, color: '#000', marginBottom: 8
        }}>
          {driver?.name?.charAt(0)}
        </div>
        <div style={{
          fontFamily: 'Syne', fontWeight: 700,
          fontSize: 14, color: '#F0F0F0'
        }}>
          {driver?.name}
        </div>
        <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>
          {driver?.vehicle?.type} · {driver?.vehicle?.plateNumber}
        </div>
        {/* Verification Badge */}
        <div style={{ marginTop: 8 }}>
          {driver?.isVerified ? (
            <span style={{
              background: 'rgba(34,197,94,0.15)',
              color: '#22C55E', fontSize: 10,
              padding: '2px 8px', borderRadius: 20,
              fontWeight: 700, letterSpacing: 0.5
            }}>
              ✓ VERIFIED
            </span>
          ) : (
            <span style={{
              background: 'rgba(255,68,68,0.15)',
              color: '#FF4444', fontSize: 10,
              padding: '2px 8px', borderRadius: 20,
              fontWeight: 700, letterSpacing: 0.5
            }}>
              ⏳ PENDING VERIFICATION
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 10,
              marginBottom: 4, textDecoration: 'none',
              color: isActive ? '#F5C518' : '#888',
              background: isActive ? 'rgba(245,197,24,0.08)' : 'transparent',
              fontWeight: isActive ? 700 : 400,
              fontSize: 14, transition: 'all 0.2s'
            })}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid #1E2028' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex',
            alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 10,
            background: 'transparent', border: 'none',
            color: '#888', cursor: 'pointer',
            fontSize: 14, fontFamily: 'DM Sans'
          }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}