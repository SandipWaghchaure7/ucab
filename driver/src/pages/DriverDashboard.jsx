import { useState, useEffect } from 'react';
import { useDriverAuth } from '../context/DriverAuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { TrendingUp, Star, Car, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

export default function DriverDashboard() {
  const { driver, updateDriver } = useDriverAuth();
  const [activeRide, setActiveRide]     = useState(null);
  const [stats,      setStats]          = useState(null);
  const [toggling,   setToggling]       = useState(false);
  const [updating,   setUpdating]       = useState(false);

  useEffect(() => { fetchData(); }, []);

const fetchData = async () => {
  try {
    // ✅ Always re-fetch fresh profile from backend on mount
    const [profileRes, activeRes] = await Promise.all([
      API.get('/auth/profile'),
      API.get('/rides/driver/active'),
    ]);

    // Sync latest isVerified, isAvailable, earnings, rating, totalRides into context
    const p = profileRes.data.profile;
    updateDriver({
      isVerified:  p.isVerified,
      isAvailable: p.isAvailable,
      rating:      p.rating,
      totalRides:  p.totalRides,
      earnings:    p.earnings,
    });

    setActiveRide(activeRes.data.ride);
  } catch {}
};

useEffect(() => {
  const onFocus = () => fetchData();
  window.addEventListener('focus', onFocus);
  return () => window.removeEventListener('focus', onFocus);
}, []);


  // Toggle online/offline
  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await API.put('/rides/driver/availability');
      updateDriver({ isAvailable: data.isAvailable });
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  // Update ride status
  const updateRideStatus = async (rideId, status) => {
    setUpdating(true);
    try {
      await API.put(`/rides/${rideId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
      if (status === 'completed') {
        updateDriver({ isAvailable: true });
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const statusSteps = {
    accepted: { next: 'arriving',  label: '🚗 Mark as Arriving' },
    arriving: { next: 'ongoing',   label: '▶️ Start Ride'       },
    ongoing:  { next: 'completed', label: '✅ Complete Ride'    },
  };

  return (
    <div>
      <div className="fade-up">
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
          Welcome back, {driver?.name?.split(' ')[0]}! 👋
        </p>
      </div>

      {/* Verification Warning */}
      {!driver?.isVerified && (
        <div style={{
          padding: '14px 18px', marginBottom: 20,
          background: 'rgba(255,68,68,0.08)',
          border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} color="#FF4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#FF4444', fontSize: 14, marginBottom: 4 }}>
              Account Pending Verification
            </div>
            <div style={{ color: '#888', fontSize: 13 }}>
              An admin needs to verify your account before you can accept rides. This usually takes a few hours.
            </div>
          </div>
        </div>
      )}

      {/* Online/Offline Toggle */}
      <div className="card fade-up" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20
      }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {driver?.isAvailable ? '🟢 You are Online' : '🔴 You are Offline'}
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>
            {driver?.isAvailable
              ? 'You can receive ride requests'
              : 'Toggle on to start receiving rides'}
          </div>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={toggling || !driver?.isVerified}
          style={{
            background: 'transparent', border: 'none',
            cursor: driver?.isVerified ? 'pointer' : 'not-allowed',
            opacity: driver?.isVerified ? 1 : 0.4
          }}>
          {driver?.isAvailable
            ? <ToggleRight size={52} color="#22C55E" />
            : <ToggleLeft  size={52} color="#888" />}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Rides',  value: driver?.totalRides || 0,           icon: Car,         color: '#6366F1' },
          { label: 'Rating',       value: `${driver?.rating || 5.0} ⭐`,     icon: Star,        color: '#F5C518' },
          { label: 'Earnings',     value: `₹${driver?.earnings || 0}`,       icon: TrendingUp,  color: '#22C55E' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `rgba(${color === '#F5C518' ? '245,197,24' : color === '#22C55E' ? '34,197,94' : '99,102,241'}, 0.15)`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 10px'
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color }}>
              {value}
            </div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Active Ride */}
      {activeRide ? (
        <div className="card fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
              🚕 Active Ride
            </h3>
            <span className={`badge badge-${activeRide.status}`}>
              {activeRide.status}
            </span>
          </div>

          {/* Passenger */}
          <div style={{
            padding: '12px 14px', background: '#111',
            borderRadius: 10, marginBottom: 14
          }}>
            <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>PASSENGER</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>
              {activeRide.user?.name}
            </div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
              📱 {activeRide.user?.phone}
            </div>
          </div>

          {/* Route */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>🟡</span>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>PICKUP</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{activeRide.pickup?.address}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 14 }}>🔴</span>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>DROP-OFF</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{activeRide.dropoff?.address}</div>
              </div>
            </div>
          </div>

          {/* OTP */}
          <div style={{
            padding: '10px 14px', marginBottom: 14,
            background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.3)',
            borderRadius: 10, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ color: '#888', fontSize: 13 }}>Ride OTP</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, color: '#F5C518', letterSpacing: 4 }}>
              {activeRide.otp}
            </span>
          </div>

          {/* Fare */}
          <div style={{
            padding: '10px 14px', marginBottom: 16,
            background: '#111', borderRadius: 10,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span style={{ color: '#888', fontSize: 13 }}>Est. Fare</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5C518', fontSize: 18 }}>
              ₹{activeRide.fare?.estimated}
            </span>
          </div>

          {/* Next Status Button */}
          {statusSteps[activeRide.status] && (
            <button
              className="btn-success"
              onClick={() => updateRideStatus(activeRide._id, statusSteps[activeRide.status].next)}
              disabled={updating}>
              {updating ? <><span className="spinner" /> &nbsp; Updating...</> : statusSteps[activeRide.status].label}
            </button>
          )}
        </div>
      ) : (
        <div className="card fade-up" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            No Active Ride
          </div>
          <div style={{ color: '#888', fontSize: 14 }}>
            {driver?.isAvailable
              ? 'Go to Ride Requests to accept a ride'
              : 'Toggle online to start receiving rides'}
          </div>
        </div>
      )}
    </div>
  );
}