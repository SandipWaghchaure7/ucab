import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, History, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'var(--yellow)', borderRadius: 10,
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Car size={18} color="#000" strokeWidth={2.5} />
        </div>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 22, color: 'var(--white)', letterSpacing: '-0.5px'
        }}>
          U<span style={{ color: 'var(--yellow)' }}>cab</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/"        active={isActive('/')}>        <Car size={15} />     Book Ride</NavLink>
          <NavLink to="/history" active={isActive('/history')}> <History size={15} /> History</NavLink>
          <NavLink to="/profile" active={isActive('/profile')}> <User size={15} />    Profile</NavLink>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--muted)', padding: '8px 16px',
            borderRadius: 10, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, fontSize: 13,
            fontFamily: 'DM Sans', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}

      {!user && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{
            padding: '8px 20px', borderRadius: 10, textDecoration: 'none',
            border: '1px solid var(--border)', color: 'var(--white)',
            fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600
          }}>Login</Link>
          <Link to="/register" style={{
            padding: '8px 20px', borderRadius: 10, textDecoration: 'none',
            background: 'var(--yellow)', color: '#000',
            fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700
          }}>Sign Up</Link>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
      fontSize: 13, fontFamily: 'DM Sans', fontWeight: 500,
      color: active ? 'var(--black)' : 'var(--muted)',
      background: active ? 'var(--yellow)' : 'transparent',
      transition: 'all 0.2s'
    }}>
      {children}
    </Link>
  );
}