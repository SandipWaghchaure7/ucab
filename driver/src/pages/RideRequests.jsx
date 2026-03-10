import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useDriverAuth } from '../context/DriverAuthContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, IndianRupee, RefreshCw } from 'lucide-react';

export default function RideRequests() {
  const { driver, updateDriver } = useDriverAuth();
  const [rides,     setRides]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchRides();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchRides, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await API.get('/rides/driver/pending');
      setRides(data.rides);
    } catch {
      // silent fail on refresh
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    setAccepting(rideId);
    try {
      await API.put(`/rides/${rideId}/accept`);
      updateDriver({ isAvailable: false });
      toast.success('🚕 Ride accepted! Check Dashboard for details');
      setRides(prev => prev.filter(r => r._id !== rideId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept ride');
    } finally {
      setAccepting(null);
    }
  };

  const rejectRide = async (rideId) => {
    try {
      await API.put(`/rides/${rideId}/reject`);
      setRides(prev => prev.filter(r => r._id !== rideId));
      toast.success('Ride skipped');
    } catch {}
  };

  if (!driver?.isVerified) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 8 }}>Pending Verification</h2>
      <p style={{ color: '#888' }}>
        Your account needs to be verified by admin before you can accept rides.
      </p>
    </div>
  );

  if (!driver?.isAvailable) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔴</div>
      <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 8 }}>You are Offline</h2>
      <p style={{ color: '#888' }}>
        Go to Dashboard and toggle Online to see ride requests.
      </p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, marginBottom: 4 }}>Ride Requests</h1>
          <p style={{ color: '#888', fontSize: 14 }}>
            {rides.length} pending request{rides.length !== 1 ? 's' : ''} · Auto-refreshes every 10s
          </p>
        </div>
        <button
          onClick={fetchRides}
          style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: 10, padding: '8px 14px',
            color: '#888', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13
          }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
        </div>
      ) : rides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 8 }}>No Pending Requests</h2>
          <p style={{ color: '#888' }}>New ride requests will appear here automatically</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rides.map(ride => (
            <div key={ride._id} className="card fade-up" style={{ marginBottom: 0 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>
                    {ride.user?.name}
                  </div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                    📱 {ride.user?.phone}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#F5C518' }}>
                    ₹{ride.fare?.estimated}
                  </div>
                  <div style={{ color: '#888', fontSize: 11 }}>{ride.cabType}</div>
                </div>
              </div>

              {/* Route */}
              <div style={{
                padding: '12px 14px', background: '#111',
                borderRadius: 10, marginBottom: 14
              }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <MapPin size={14} color="#F5C518" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#888', letterSpacing: 1, marginBottom: 2 }}>PICKUP</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ride.pickup?.address}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <MapPin size={14} color="#FF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#888', letterSpacing: 1, marginBottom: 2 }}>DROP-OFF</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ride.dropoff?.address}</div>
                  </div>
                </div>
              </div>

              {/* Distance & Time */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 }}>
                  <Clock size={13} color="#888" />
                  {ride.duration} min
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 }}>
                  📏 {ride.distance} km
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className="btn-danger"
                  onClick={() => rejectRide(ride._id)}
                  style={{ padding: '11px' }}>
                  ✕ Skip
                </button>
                <button
                  className="btn-success"
                  onClick={() => acceptRide(ride._id)}
                  disabled={accepting === ride._id}
                  style={{ padding: '11px' }}>
                  {accepting === ride._id
                    ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> &nbsp; Accepting...</>
                    : '✓ Accept'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}