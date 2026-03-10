import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Car, Users, Wind,
  Clock, CheckCircle
} from 'lucide-react';
import MapPicker from '../components/MapPicker';

const CAB_TYPES = [
  { type: 'Mini',  icon: Car,   desc: 'Compact & affordable', seats: 4 },
  { type: 'Sedan', icon: Car,   desc: 'Comfortable & stylish', seats: 4 },
  { type: 'SUV',   icon: Users, desc: 'Spacious for groups',   seats: 6 },
  { type: 'Auto',  icon: Wind,  desc: 'Quick short rides',     seats: 3 },
];

export default function Home() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    pickupAddress:  '',
    dropoffAddress: '',
    cabType:        'Sedan',
    distanceKm:     5,
    durationMin:    15,
    pickupLat:      0,
    pickupLng:      0,
    dropoffLat:     0,
    dropoffLng:     0,
  });

  const [estimates,     setEstimates]     = useState(null);
  const [bookedRide,    setBookedRide]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [step,          setStep]          = useState(1);
  const [mapData,       setMapData]       = useState(null);
  const [coupon,        setCoupon]        = useState('');
  const [couponResult,  setCouponResult]  = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Apply coupon ────────────────────────────────────
  const applyCouponCode = async () => {
    if (!coupon) return toast.error('Enter a coupon code');
    const fare = estimates[form.cabType]?.fare || estimates[form.cabType];
    setCouponLoading(true);
    try {
      const { data } = await API.post('/coupons/validate', { code: coupon, fare });
      setCouponResult(data.coupon);
      toast.success(data.message);
    } catch (err) {
      setCouponResult(null);
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Handle map location selection ──────────────────
  const handleLocationSelect = (data) => {
    if (!data) {
      setMapData(null);
      setForm(prev => ({
        ...prev,
        pickupAddress:  '',
        dropoffAddress: '',
        distanceKm:     5,
        durationMin:    15,
        pickupLat:      0,
        pickupLng:      0,
        dropoffLat:     0,
        dropoffLng:     0,
      }));
      return;
    }
    setMapData(data);
    setForm(prev => ({
      ...prev,
      pickupAddress:  data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      pickupLat:      data.pickupLat,
      pickupLng:      data.pickupLng,
      dropoffLat:     data.dropoffLat,
      dropoffLng:     data.dropoffLng,
      distanceKm:     data.distanceKm,
      durationMin:    data.durationMin,
    }));
  };

  // ── Get fare estimates ──────────────────────────────
  const getEstimates = async () => {
    if (!form.pickupAddress || !form.dropoffAddress)
      return toast.error('Select pickup and dropoff on the map first');
    setLoading(true);
    try {
      const { data } = await API.post('/rides/estimate', {
        cabType:    'all',
        distanceKm:  form.distanceKm,
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

  // ── Book ride ───────────────────────────────────────
  const bookRide = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/rides/book', {
        ...form,
        couponCode: couponResult ? coupon : undefined
      });
      setBookedRide(data.ride);
      setStep(3);
      toast.success('🚕 Ride booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset everything ────────────────────────────────
  const reset = () => {
    setStep(1);
    setEstimates(null);
    setBookedRide(null);
    setMapData(null);
    setCoupon('');
    setCouponResult(null);
    setForm({
      pickupAddress:  '',
      dropoffAddress: '',
      cabType:        'Sedan',
      distanceKm:     5,
      durationMin:    15,
      pickupLat:      0,
      pickupLng:      0,
      dropoffLat:     0,
      dropoffLng:     0,
    });
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
        <h1 className="fade-up-2" style={{
          fontSize: 'clamp(32px, 6vw, 52px)',
          lineHeight: 1.1, marginBottom: 12
        }}>
          Where to,{' '}
          <span style={{ color: 'var(--yellow)' }}>
            {user?.name?.split(' ')[0]}?
          </span>
        </h1>
        <p className="fade-up-3" style={{ color: 'var(--muted)', fontSize: 16 }}>
          Book a ride in under 30 seconds
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* ══════════════════════════════════════════════
            STEP 1 — Map Location Picker
        ══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="card fade-up" style={{ marginTop: 8 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 6 }}>
              Where are you going? 🗺️
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
              Search address or click directly on the map
            </p>

            {/* Map Component */}
            <MapPicker onLocationSelect={handleLocationSelect} />

            {/* Location Summary */}
            {mapData && (
              <div style={{
                marginTop: 16, padding: '14px 16px',
                background: 'var(--dark)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}>
                {/* Pickup */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, marginTop: 2 }}>🟡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, marginBottom: 3 }}>
                      PICKUP
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 600, lineHeight: 1.4 }}>
                      {mapData.pickupAddress.length > 80
                        ? mapData.pickupAddress.substring(0, 80) + '...'
                        : mapData.pickupAddress}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div style={{ width: 1, height: 14, background: 'var(--border)', marginLeft: 10, marginBottom: 10 }} />

                {/* Dropoff */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, marginTop: 2 }}>🔴</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, marginBottom: 3 }}>
                      DROP-OFF
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 600, lineHeight: 1.4 }}>
                      {mapData.dropoffAddress.length > 80
                        ? mapData.dropoffAddress.substring(0, 80) + '...'
                        : mapData.dropoffAddress}
                    </div>
                  </div>
                </div>

                {/* Distance & Duration */}
                <div style={{ display: 'flex', gap: 24, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, marginBottom: 3 }}>DISTANCE</div>
                    <div style={{ color: 'var(--yellow)', fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
                      {mapData.distanceText}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, marginBottom: 3 }}>DURATION</div>
                    <div style={{ color: 'var(--yellow)', fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
                      {mapData.durationText}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={getEstimates}
              disabled={!mapData || loading}
              style={{ marginTop: 16 }}>
              {loading
                ? <><span className="spinner" /> &nbsp; Finding rides...</>
                : !mapData
                  ? '📍 Select pickup & drop-off first'
                  : 'See Available Rides →'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2 — Cab Selection + Coupon
        ══════════════════════════════════════════════ */}
        {step === 2 && estimates && (
          <div className="fade-up">

            {/* Header */}
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
              borderRadius: 12, padding: '12px 16px', marginBottom: 16
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)' }}>
                <span style={{ background: 'var(--yellow)', color: '#000', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  FROM
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {form.pickupAddress.substring(0, 40)}{form.pickupAddress.length > 40 ? '...' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)' }}>
                <span style={{ background: 'var(--border)', color: 'var(--white)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  TO
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {form.dropoffAddress.substring(0, 40)}{form.dropoffAddress.length > 40 ? '...' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ background: 'rgba(245,197,24,0.1)', color: 'var(--yellow)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                  📏 {mapData?.distanceText || `${form.distanceKm} km`}
                </span>
                <span style={{ background: 'rgba(245,197,24,0.1)', color: 'var(--yellow)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                  ⏱️ {mapData?.durationText || `${form.durationMin} min`}
                </span>
              </div>
            </div>

            {/* ── Cab Cards ─────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAB_TYPES.map(({ type, desc, seats }) => (
                <div
                  key={type}
                  onClick={() => { setForm({ ...form, cabType: type }); setCouponResult(null); setCoupon(''); }}
                  style={{
                    background: form.cabType === type ? 'rgba(245,197,24,0.08)' : 'var(--card)',
                    border: `1.5px solid ${form.cabType === type ? 'var(--yellow)' : 'var(--border)'}`,
                    borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>

                  {/* Left — Cab info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: form.cabType === type ? 'var(--yellow)' : 'var(--border)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      <Car size={20} color={form.cabType === type ? '#000' : 'var(--muted)'} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{type}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                        {desc} · {seats} seats
                      </div>
                    </div>
                  </div>

                  {/* Right — Fare + Arrival */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'Syne', fontWeight: 800, fontSize: 20,
                      color: form.cabType === type ? 'var(--yellow)' : 'var(--white)'
                    }}>
                      ₹{estimates[type]?.fare || estimates[type]}
                    </div>
                    <div style={{
                      color: 'var(--success)', fontSize: 11,
                      display: 'flex', alignItems: 'center',
                      gap: 4, marginTop: 2, justifyContent: 'flex-end'
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

            {/* ── Coupon Code Box ───────────────────────── */}
            {/* FIXED: Moved outside cab cards map, placed correctly after cards */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', marginTop: 16
            }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, letterSpacing: 1 }}>
                HAVE A COUPON?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{
                    flex: 1, background: 'var(--dark)',
                    border: `1.5px solid ${couponResult ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '10px 14px',
                    color: 'var(--white)', fontFamily: 'DM Sans',
                    fontSize: 14, outline: 'none',
                    textTransform: 'uppercase', letterSpacing: 2
                  }}
                  placeholder="e.g. UCAB10"
                  value={coupon}
                  onChange={e => { setCoupon(e.target.value); setCouponResult(null); }}
                />
                <button
                  onClick={applyCouponCode}
                  disabled={couponLoading}
                  style={{
                    background: 'var(--yellow)', color: '#000',
                    border: 'none', borderRadius: 10, padding: '10px 18px',
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>

              {/* Coupon Result */}
              {couponResult && (
                <div style={{
                  marginTop: 10, padding: '10px 14px',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid var(--success)',
                  borderRadius: 8, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>
                      ✓ {couponResult.code} applied!
                    </span>
                    <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                      You save ₹{couponResult.discountAmount}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--muted)', fontSize: 11, textDecoration: 'line-through' }}>
                      ₹{couponResult.originalFare}
                    </div>
                    <div style={{ color: 'var(--yellow)', fontWeight: 800, fontFamily: 'Syne', fontSize: 18 }}>
                      ₹{couponResult.finalFare}
                    </div>
                  </div>
                </div>
              )}

              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Try: UCAB10 · UCAB20 · FIRST50 · SAVE15 · VIT25
              </p>
            </div>

            {/* Book Button */}
            <button
              className="btn-primary"
              onClick={bookRide}
              disabled={loading}
              style={{ marginTop: 16 }}>
              {loading
                ? <><span className="spinner" /> &nbsp; Booking...</>
                : `Book ${form.cabType} · ₹${couponResult ? couponResult.finalFare : (estimates[form.cabType]?.fare || estimates[form.cabType])} →`}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3 — Ride Confirmed
        ══════════════════════════════════════════════ */}
        {step === 3 && bookedRide && (
          <div className="fade-up">

            {/* Success Icon */}
            <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: 26, marginBottom: 8 }}>Ride Confirmed!</h2>
              <p style={{ color: 'var(--muted)' }}>Your driver is on the way</p>
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

            {/* Ride Details */}
            <div className="card" style={{ marginBottom: 16 }}>
              {[
                ['Cab Type',  bookedRide.cabType],
                ['Pickup',    bookedRide.pickup?.address],
                ['Drop-off',  bookedRide.dropoff?.address],
                ['Distance',  mapData?.distanceText || `${form.distanceKm} km`],
                ['Duration',  mapData?.durationText || `${form.durationMin} min`],
                ['Est. Fare', `₹${bookedRide.estimatedFare}`],
                ['Status',    bookedRide.status],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
                  <span style={{
                    fontWeight: 600, fontSize: 14,
                    textTransform: 'capitalize',
                    maxWidth: '60%', textAlign: 'right'
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Driver Card */}
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

            {/* ── PAY NOW BUTTON ── ✅ NEW */}
            <button
              className="btn-primary"
              onClick={() => navigate(`/payment/${bookedRide.id}`)}
              style={{ marginBottom: 10 }}>
              💰 Pay Now · ₹{bookedRide.estimatedFare}
            </button>

            {/* Book Another Ride */}
            <button
              className="btn-outline"
              onClick={reset}>
              Book Another Ride
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
