import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusBadge = s => ({
  completed: 'badge-green', cancelled: 'badge-red',
  ongoing: 'badge-yellow',  requested: 'badge-gray',
  accepted: 'badge-cyan',   arriving: 'badge-cyan'
}[s] || 'badge-gray');

export default function AdminRides() {
  const [rides, setRides]     = useState([]);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  const fetchRides = async (s = '') => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/rides?status=${s}&limit=20`);
      setRides(data.rides);
      setTotal(data.pagination.total);
    } catch { toast.error('Failed to load rides'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRides(); }, []);
  useEffect(() => { fetchRides(filter); }, [filter]);

  const statuses = ['', 'requested', 'accepted', 'ongoing', 'completed', 'cancelled'];

  return (
    <div style={{ padding: 28 }}>
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:34, lineHeight:1, marginBottom:4 }}>
            RIDE <span style={{ color:'var(--yellow)' }}>MONITOR</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:13 }}>{total} total rides</p>
        </div>

        {/* Status Filter */}
        <div style={{ display:'flex', background:'var(--surface)', borderRadius:8, padding:3, border:'1px solid var(--border)', flexWrap:'wrap', gap:2 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding:'5px 12px', borderRadius:6, border:'none',
                background: filter === s ? 'var(--yellow)' : 'transparent',
                color: filter === s ? '#000' : 'var(--muted)',
                fontSize:11, fontWeight:700, cursor:'pointer',
                textTransform:'uppercase', letterSpacing:0.5, transition:'all 0.15s'
              }}>
              {s || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div className="fade-up-2" style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:12, overflow:'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Passenger</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Cab</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading...</td></tr>
            ) : rides.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No rides found</td></tr>
            ) : rides.map(ride => (
              <tr key={ride._id}>
                <td style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'var(--muted)' }}>
                  #{ride._id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ride.user?.name || '—'}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{ride.user?.phone}</div>
                </td>
                <td>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ride.driver?.name || 'Unassigned'}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{ride.driver?.vehicle?.plateNumber}</div>
                </td>
                <td style={{ maxWidth:180 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {ride.pickup?.address}
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    → {ride.dropoff?.address}
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray">{ride.cabType}</span>
                </td>
                <td style={{ fontFamily:'JetBrains Mono', color:'var(--yellow)', fontWeight:700 }}>
                  ₹{ride.fare?.final || ride.fare?.estimated || 0}
                </td>
                <td>
                  <span className={`badge ${statusBadge(ride.status)}`}>{ride.status}</span>
                </td>
                <td style={{ fontSize:11, color:'var(--muted)' }}>
                  {new Date(ride.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}