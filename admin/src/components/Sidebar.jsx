import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard, Users, Car, MapPin,
  LogOut, Shield, ChevronRight
} from 'lucide-react';

const links = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/users',   icon: Users,           label: 'Users'      },
  { to: '/drivers', icon: Car,             label: 'Drivers'    },
  { to: '/rides',   icon: MapPin,          label: 'Rides'      },
];

export default function Sidebar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue', fontSize: 20,
              letterSpacing: 1, lineHeight: 1
            }}>
              U<span style={{ color: 'var(--yellow)' }}>CAB</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>
              ADMIN PANEL
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10, padding: '10px 12px',
              borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: 600,
              color:      isActive ? 'var(--yellow)' : 'var(--muted)',
              background: isActive ? 'var(--yellow-lo)' : 'transparent',
              transition: 'all 0.15s'
            })}>
            {({ isActive }) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={15} />
                  {label}
                </div>
                {isActive && <ChevronRight size={13} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin User */}
      <div style={{
        padding: '16px', borderTop: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 10, marginBottom: 12
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--yellow)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: 16, color: '#000'
          }}>
            {admin?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{admin?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Administrator</div>
          </div>
        </div>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { logout(); navigate('/login'); }}>
          <LogOut size={13} /> Logout
        </button>
      </div>
    </aside>
  );
}