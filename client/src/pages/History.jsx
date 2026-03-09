import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Clock, MapPin, IndianRupee, Star } from 'lucide-react';

const statusBadge = (status) => {
  const map = {
    completed:  'badge-green',
    cancelled:  'badge-red',
    ongoing:    'badge-yellow',
    requested:  'badge-gray',
    accepted:   'badge-yellow',
  };
  return map[status] || 'badge-gray';
};

export default function History() {
  const [rides, setRides]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/rides/history')
      .then(({ data }) => setRides(data.rides))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', paddingTop: 64
    }}>
      <div className="spinner" style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--yellow)'
      }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, padding: '80px 24px 60px', maxWidth: 600, margin: '0 auto' }}>
      <div className="fade-up">
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Ride History</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 28 }}>
          {rides.length} total rides
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="card fade-up" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚕</div>
          <h3 style={{ marginBottom: 8 }}>No rides yet</h3>
          <p style={{ color: 'var(--muted)' }}>Book your first ride to see it here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rides.map((ride, i) => (
            <div
              key={ride._id}
              className="card fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}>

              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 14
              }}>
                <div>
                  <span style={{
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 16
                  }}>{ride.cabType}</span>
                  <div style={{
                    color: 'var(--muted)', fontSize: 12, marginTop: 3
                  }}>
                    {new Date(ride.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <span className={`badge ${statusBadge(ride.status)}`}>
                  {ride.status}
                </span>
              </div>

              {/* Route */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--yellow)', flexShrink: 0
                  }} />
                  <span style={{ fontSize: 14, color: 'var(--white)' }}>
                    {ride.pickup?.address}
                  </span>
                </div>
                <div style={{
                  marginLeft: 3,
                  width: 2, height: 16, background: 'var(--border)'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={10} color="var(--muted)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {ride.dropoff?.address}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: 12, borderTop: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
                  <Clock size={13} />
                  {ride.distance} km · {ride.duration} min
                </div>
                <div style={{
                  fontFamily: 'Syne', fontWeight: 700, fontSize: 16,
                  color: ride.status === 'completed' ? 'var(--success)' : 'var(--muted)'
                }}>
                  ₹{ride.fare?.final || ride.fare?.estimated || '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}