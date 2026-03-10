import { useState, useEffect } from 'react';
import API from '../api/axios';
import { TrendingUp, Car, CheckCircle } from 'lucide-react';

export default function RideHistory() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/rides/driver/history')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne', fontSize: 28, marginBottom: 4 }}>Ride History</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        All your completed and cancelled rides
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Rides',    value: data?.totalRides || 0,             icon: Car,         color: '#6366F1' },
          { label: 'Completed',      value: data?.rides?.filter(r => r.status === 'completed').length || 0, icon: CheckCircle, color: '#22C55E' },
          { label: 'Total Earnings', value: `₹${data?.totalEarnings || 0}`,    icon: TrendingUp,  color: '#F5C518' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
            <Icon size={22} color={color} style={{ marginBottom: 8 }} />
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color }}>
              {value}
            </div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Ride List */}
      {!data?.rides?.length ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 8 }}>No Rides Yet</h2>
          <p style={{ color: '#888' }}>Your completed rides will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.rides.map(ride => (
            <div key={ride._id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>
                    {ride.user?.name}
                  </div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                    {new Date(ride.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#F5C518' }}>
                    ₹{ride.fare?.final || ride.fare?.estimated}
                  </div>
                  <span className={`badge badge-${ride.status}`}>
                    {ride.status}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                <div>🟡 {ride.pickup?.address?.substring(0, 50)}...</div>
                <div style={{ marginTop: 4 }}>🔴 {ride.dropoff?.address?.substring(0, 50)}...</div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#888' }}>
                <span>📏 {ride.distance} km</span>
                <span>⏱️ {ride.duration} min</span>
                <span>🚗 {ride.cabType}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}