import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Navigation, Car, Zap, Users, Wind,
  Clock, IndianRupee, CheckCircle
} from 'lucide-react';

const CAB_TYPES = [
  { type: 'Mini',  icon: Car,   desc: 'Compact & affordable',  seats: 4 },
  { type: 'Sedan', icon: Car,   desc: 'Comfortable & stylish',  seats: 4 },
  { type: 'SUV',   icon: Users, desc: 'Spacious for groups',    seats: 6 },
  { type: 'Auto',  icon: Wind,  desc: 'Quick short rides',      seats: 3 },
];

export default function Home() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    pickupAddress:  '',
    dropoffAddress: '',
    cabType:        'Sedan',
    distanceKm:     5,
    durationMin:    15
  });

  const [estimates, setEstimates]   = useState(null);
  const [bookedRide, setBookedRide] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(1); // 1=form, 2=cab select, 3=confirmed

  const getEstimates = async () => {
    if (!form.pickupAddress || !form.dropoffAddress)
      return toast.error('Enter pickup and dropoff locations');

    setLoading(true);
    try {
      const { data } = await API.post('/rides/estimate', {
        cabType: 'all',
        distanceKm: form.distanceKm,
        durationMin: form.durationMin
      });
      setEstimates(data.estimates);
      setStep(2);
    } catch {
      toast.error('Could not estimate fare');
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/rides/book', form);
      setBookedRide(data.ride);
      setStep(3);
      toast.success('🚕 Ride booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setEstimates(null); setBookedRide(null);
    setForm({ pickupAddress: '', dropoffAddress: '', cabType: 'Sedan', distanceKm: 5, durationMin: 15 });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>

      {/* Hero Header */}
      <div style={{
        padding: '40px 24px 32px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(245,197,24,0.1) 0%, transparent 70%)',
        textAlign: 'center'
      }}>
        <p className="fade-up" style={{
          color: 'var(--yellow)', fontSize: 13, fontWeight: 600,
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12
        }}>
          ● Live & Ready
        </p>
        <h1 className="fade-up-2" style={{ fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.1, marginBottom: 12 }}>
          Where to,{' '}
          <span style={{ color: 'var(--yellow)' }}>{user?.name?.split(' ')[0]}?</span>
        </h1>
        <p className="fade-up-3" style={{ color: 'var(--muted)', fontSize: 16 }}>
          Book a ride in under 30 seconds
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* STEP 1 — Location Form */}
        {step === 1 && (
          <div className="card fade-up" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Pickup */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', zIndex: 1
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--yellow)', border: '2px solid var(--black)'
                  }} />
                </div>
                <input
                  style={{
                    width: '100%', background: 'var(--dark)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12, padding: '14px 14px 14px 36px',
                    color: 'var(--white)', fontSize: 15,
                    fontFamily: 'DM Sans', outline: 'none'
                  }}
                  placeholder="📍 Pickup location"
                  value={form.pickupAddress}
                  onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--yellow)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, padding: '0 4px'
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Navigation size={14} color="var(--muted)" />
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Dropoff */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  <MapPin size={14} color="var(--yellow)" />
                </div>
                <input
                  style={{
                    width: '100%', background: 'var(--dark)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12, padding: '14px 14px 14px 36px',
                    color: 'var(--white)', fontSize: 15,
                    fontFamily: 'DM Sans', outline: 'none'
                  }}
                  placeholder="🏁 Drop-off location"
                  value={form.dropoffAddress}
                  onChange={e => setForm({ ...form, dropoffAddress: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--yellow)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Distance Slider */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 10
              }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Estimated Distance
                </span>
                <span style={{ color: 'var(--yellow)', fontWeight: 700, fontFamily: 'Syne' }}>
                  {form.distanceKm} km
                </span>
              </div>
              <input
                type="range" min="1" max="50"
                value={form.distanceKm}
                onChange={e => setForm({ ...form, distanceKm: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--yellow)' }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={getEstimates}
              disabled={loading}
              style={{ marginTop: 20 }}>
              {loading
                ? <><span className="spinner" /> &nbsp; Finding rides...</>
                : 'See Available Rides →'}
            </button>
          </div>
        )}

        {/* STEP 2 — Cab Selection */}
        {step === 2 && estimates && (
          <div className="fade-up">
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 16, marginTop: 8
            }}>
              <h2 style={{ fontSize: 20 }}>Choose your ride</h2>
              <button onClick={() => setStep(1)} style={{
                background: 'none', border: 'none',
                color: 'var(--muted)', cursor: 'pointer', fontSize: 13
              }}>
                ← Back
              </button>
            </div>

            {/* Trip Summary */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', gap: 8, marginBottom: 16, fontSize: 13,
              color: 'var(--muted)', alignItems: 'center'
            }}>
              <span style={{
                background: 'var(--yellow)', color: '#000',
                borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700
              }}>FROM</span>
              {form.pickupAddress}
              <span style={{ color: 'var(--border)' }}>→</span>
              <span style={{
                background: 'var(--border)', color: 'var(--white)',
                borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700
              }}>TO</span>
              {form.dropoffAddress}
            </div>

            {/* Cab Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAB_TYPES.map(({ type, desc, seats }) => (
                <div
                  key={type}
                  onClick={() => setForm({ ...form, cabType: type })}
                  style={{
                    background: form.cabType === type ? 'rgba(245,197,24,0.08)' : 'var(--card)',
                    border: `1.5px solid ${form.cabType === type ? 'var(--yellow)' : 'var(--border)'}`,
                    borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: form.cabType === type ? 'var(--yellow)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <Car size={20} color={form.cabType === type ? '#000' : 'var(--muted)'} />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'Syne', fontWeight: 700, fontSize: 16
                      }}>{type}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                        {desc} · {seats} seats
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
  <div style={{
    fontFamily: 'Syne', fontWeight: 800, fontSize: 20,
    color: form.cabType === type ? 'var(--yellow)' : 'var(--white)'
  }}>
    ₹{estimates[type]?.fare || estimates[type]}
  </div>
  <div style={{
    color: 'var(--success)', fontSize: 11,
    display: 'flex', alignItems: 'center', gap: 4, marginTop: 2
  }}>
    <Clock size={10} />
    {estimates[type]?.arrival?.label || `~${form.durationMin} min`}
  </div>
  <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>
    {estimates[type]?.drivers || 1} driver{estimates[type]?.drivers > 1 ? 's' : ''} nearby
  </div>
</div>
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={bookRide}
              disabled={loading}
              style={{ marginTop: 20 }}>
              {loading
                ? <><span className="spinner" /> &nbsp; Booking...</>
                : `Book ${form.cabType} · ₹${estimates[form.cabType]} →`}
            </button>
          </div>
        )}

        {/* STEP 3 — Confirmed */}
        {step === 3 && bookedRide && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: 26, marginBottom: 8 }}>Ride Confirmed!</h2>
              <p style={{ color: 'var(--muted)' }}>
                Your driver is on the way
              </p>
            </div>

            {/* OTP Card */}
            <div style={{
              background: 'rgba(245,197,24,0.08)',
              border: '1.5px solid var(--yellow)',
              borderRadius: 14, padding: '20px',
              textAlign: 'center', marginBottom: 16
            }}>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
                RIDE OTP — Share with driver
              </p>
              <div style={{
                fontFamily: 'Syne', fontWeight: 800,
                fontSize: 42, color: 'var(--yellow)', letterSpacing: 8
              }}>
                {bookedRide.otp}
              </div>
            </div>

            {/* Details */}
            <div className="card" style={{ marginBottom: 16 }}>
              {[
                ['Cab Type',   bookedRide.cabType],
                ['Pickup',     bookedRide.pickup?.address],
                ['Drop-off',   bookedRide.dropoff?.address],
                ['Est. Fare',  `₹${bookedRide.estimatedFare}`],
                ['Status',     bookedRide.status],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {bookedRide.driver && (
              <div className="card" style={{ marginBottom: 16 }}>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12, letterSpacing: 1 }}>
                  YOUR DRIVER
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
                      {bookedRide.driver.name}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                      {bookedRide.driver.vehicle?.model} · {bookedRide.driver.vehicle?.plateNumber}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(245,197,24,0.1)',
                    borderRadius: 10, padding: '8px 14px', textAlign: 'center'
                  }}>
                    <div style={{ color: 'var(--yellow)', fontWeight: 800, fontFamily: 'Syne' }}>
                      ⭐ {bookedRide.driver.rating}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>rating</div>
                  </div>
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={reset}>
              Book Another Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
}