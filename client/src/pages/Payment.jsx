import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id:    'cash',
    label: 'Cash',
    icon:  Banknote,
    desc:  'Pay driver directly in cash',
    color: '#22C55E',
    emoji: '💵'
  },
  {
    id:    'upi',
    label: 'UPI',
    icon:  Smartphone,
    desc:  'GPay, PhonePe, Paytm',
    color: '#6366F1',
    emoji: '📱'
  },
  {
    id:    'card',
    label: 'Card',
    icon:  CreditCard,
    desc:  'Credit or Debit card',
    color: '#F59E0B',
    emoji: '💳'
  },
  {
    id:    'wallet',
    label: 'Wallet',
    icon:  Wallet,
    desc:  'Ucab wallet balance',
    color: '#EC4899',
    emoji: '👛'
  },
];

// Helper: hex color to rgb values
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '245, 197, 24';
}

export default function Payment() {
  const { rideId } = useParams();
  const navigate   = useNavigate();

  const [ride,     setRide]     = useState(null);
  const [method,   setMethod]   = useState('cash');
  const [loading,  setLoading]  = useState(false);
  const [paid,     setPaid]     = useState(false);
  const [receipt,  setReceipt]  = useState(null);
  const [fetching, setFetching] = useState(true);

  // Load ride details on mount
  useEffect(() => {
    API.get(`/rides/${rideId}`)
      .then(({ data }) => {
        setRide(data.ride);
        if (data.ride.paymentStatus === 'paid') {
          setPaid(true);
        }
      })
      .catch(() => toast.error('Ride not found'))
      .finally(() => setFetching(false));
  }, [rideId]);

  // Handle payment
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate processing delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data } = await API.post('/payments/pay', { rideId, method });

      setReceipt(data.payment);
      setPaid(true);
      toast.success(data.message);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading Screen ────────────────────────────────
  if (fetching) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          width: 36, height: 36, margin: '0 auto 12px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--yellow)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }}/>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Loading payment details...
        </p>
      </div>
    </div>
  );

  // ── Success / Receipt Screen ──────────────────────
  if (paid) return (
    <div style={{
      minHeight: '100vh',
      padding: '80px 24px 60px',
      maxWidth: 480, margin: '0 auto'
    }}>
      {/* Success Icon */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)',
          border: '2px solid var(--success)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <CheckCircle size={40} color="var(--success)" />
        </div>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>
          Payment Done! 🎉
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Your ride payment was successful
        </p>
      </div>

      {/* Receipt Card */}
      {receipt && (
        <div className="card fade-up" style={{ marginBottom: 16 }}>
          <p style={{
            color: 'var(--muted)', fontSize: 12,
            letterSpacing: 1, marginBottom: 14
          }}>
            PAYMENT RECEIPT
          </p>

          {[
            ['Amount Paid',     `₹${receipt.amount}`],
            ['Payment Method',  receipt.method.toUpperCase()],
            ['Transaction ID',  receipt.transactionId],
            ['Date & Time',     new Date(receipt.paidAt).toLocaleString('en-IN')],
            ['Status',          '✅ SUCCESS'],
          ].map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                {label}
              </span>
              <span style={{
                fontWeight: 600, fontSize: 13,
                color: label === 'Status' ? 'var(--success)' : 'var(--white)'
              }}>
                {value}
              </span>
            </div>
          ))}

          {/* Big amount display */}
          <div style={{
            marginTop: 16, padding: '16px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 12, textAlign: 'center'
          }}>
            <div style={{
              color: 'var(--muted)', fontSize: 12,
              marginBottom: 6, letterSpacing: 1
            }}>
              TOTAL PAID
            </div>
            <div style={{
              fontFamily: 'Syne', fontWeight: 800,
              fontSize: 36, color: 'var(--success)'
            }}>
              ₹{receipt.amount}
            </div>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={() => navigate('/history')}>
        View Ride History
      </button>
      <button
        className="btn-outline"
        onClick={() => navigate('/')}
        style={{ marginTop: 10 }}>
        Book Another Ride
      </button>
    </div>
  );

  // ── Payment Selection Screen ──────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      padding: '80px 24px 60px',
      maxWidth: 480, margin: '0 auto'
    }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          Complete Payment 💰
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Choose how you want to pay for your ride
        </p>
      </div>

      {/* Ride Summary Card */}
      {ride && (
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <p style={{
            color: 'var(--muted)', fontSize: 12,
            letterSpacing: 1, marginBottom: 12
          }}>
            RIDE SUMMARY
          </p>

          {[
            ['Cab Type', ride.cabType],
            ['From',     ride.pickup?.address?.length > 50
                           ? ride.pickup.address.substring(0, 50) + '...'
                           : ride.pickup?.address],
            ['To',       ride.dropoff?.address?.length > 50
                           ? ride.dropoff.address.substring(0, 50) + '...'
                           : ride.dropoff?.address],
            ['Distance', `${ride.distance} km`],
          ].map(([label, val]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', padding: '8px 0',
              borderBottom: '1px solid var(--border)', gap: 12
            }}>
              <span style={{
                color: 'var(--muted)', fontSize: 13, flexShrink: 0
              }}>
                {label}
              </span>
              <span style={{
                fontWeight: 600, fontSize: 13,
                textAlign: 'right'
              }}>
                {val}
              </span>
            </div>
          ))}

          {/* Total amount */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 14, marginTop: 4
          }}>
            <span style={{
              fontFamily: 'Syne', fontWeight: 700, fontSize: 16
            }}>
              Total Amount
            </span>
            <span style={{
              fontFamily: 'Syne', fontWeight: 800,
              fontSize: 28, color: 'var(--yellow)'
            }}>
              ₹{ride.fare?.final || ride.fare?.estimated}
            </span>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="fade-up" style={{ marginBottom: 20 }}>
        <p style={{
          color: 'var(--muted)', fontSize: 12,
          letterSpacing: 1, marginBottom: 12
        }}>
          SELECT PAYMENT METHOD
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10
        }}>
          {PAYMENT_METHODS.map(({ id, label, desc, color, emoji }) => (
            <div
              key={id}
              onClick={() => setMethod(id)}
              style={{
                padding: '16px 14px',
                borderRadius: 14,
                border: `1.5px solid ${method === id ? color : 'var(--border)'}`,
                background: method === id
                  ? `rgba(${hexToRgb(color)}, 0.08)`
                  : 'var(--card)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {emoji}
              </div>
              <div style={{
                fontFamily: 'Syne', fontWeight: 700,
                fontSize: 15, marginBottom: 4,
                color: method === id ? color : 'var(--white)'
              }}>
                {label}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                {desc}
              </div>
              {method === id && (
                <div style={{
                  marginTop: 8, fontSize: 11,
                  color, fontWeight: 600
                }}>
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo notice */}
      {(method === 'upi' || method === 'card') && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'rgba(245,197,24,0.06)',
          border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: 10, fontSize: 13,
          color: 'var(--muted)'
        }}>
          ℹ️ Demo mode — No actual {method.toUpperCase()} transaction will happen
        </div>
      )}

      {/* Pay Button */}
      <button
        className="btn-primary"
        onClick={handlePayment}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10
        }}>
        {loading ? (
          <>
            <div className="spinner" style={{
              width: 18, height: 18,
              border: '2px solid rgba(0,0,0,0.3)',
              borderTopColor: '#000', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}/>
            Processing payment...
          </>
        ) : (
          `Pay ₹${ride?.fare?.final || ride?.fare?.estimated} via ${method.toUpperCase()}`
        )}
      </button>

      <button
        className="btn-outline"
        onClick={() => navigate('/')}
        style={{ marginTop: 10 }}>
        ← Back to Home
      </button>
    </div>
  );
}