import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(245,197,24,0.05) 0%, transparent 70%)'
    }}>
      {/* Big 404 */}
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: 'clamp(80px, 20vw, 160px)',
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '2px var(--border)',
        marginBottom: 16,
        animation: 'fadeUp 0.6s ease forwards'
      }}>
        404
      </div>

      <div style={{ fontSize: 48, marginBottom: 20 }}>🚕</div>

      <h2 className="fade-up" style={{ fontSize: 26, marginBottom: 12 }}>
        Oops! Wrong turn.
      </h2>
      <p className="fade-up-2" style={{
        color: 'var(--muted)', maxWidth: 320,
        lineHeight: 1.6, marginBottom: 32
      }}>
        The page you're looking for doesn't exist.
        Let's get you back on track.
      </p>

      <div className="fade-up-3" style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => navigate('/')}
          style={{ width: 'auto', padding: '12px 28px' }}>
          Go Home →
        </button>
        <button
          className="btn-outline"
          onClick={() => navigate(-1)}
          style={{ width: 'auto', padding: '12px 28px' }}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}