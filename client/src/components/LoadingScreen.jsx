export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--black)',
      gap: 20
    }}>
      {/* Animated cab icon */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 18,
        background: 'var(--yellow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <span style={{ fontSize: 30 }}>🚕</span>
      </div>

      {/* Spinner bar */}
      <div style={{
        width: 180, height: 3,
        background: 'var(--border)',
        borderRadius: 99, overflow: 'hidden'
      }}>
        <div style={{
          width: '40%', height: '100%',
          background: 'var(--yellow)',
          borderRadius: 99,
          animation: 'slideBar 1.2s ease-in-out infinite'
        }} />
      </div>

      <p style={{
        color: 'var(--muted)',
        fontFamily: 'DM Sans',
        fontSize: 14
      }}>{message}</p>

      <style>{`
        @keyframes slideBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%);  }
          100% { transform: translateX(350%);  }
        }
      `}</style>
    </div>
  );
}