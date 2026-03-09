import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Star } from 'lucide-react';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  const fetchDrivers = async (q = '', v = 'all') => {
    setLoading(true);
    const params = `?search=${q}&limit=20${v !== 'all' ? `&verified=${v === 'verified'}` : ''}`;
    try {
      const { data } = await API.get(`/admin/drivers${params}`);
      setDrivers(data.drivers);
      setTotal(data.pagination.total);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchDrivers(search, filter), 400);
    return () => clearTimeout(t);
  }, [search, filter]);

  const handleVerify = async (id, current) => {
    try {
      const { data } = await API.put(`/admin/drivers/${id}/verify`, { isVerified: !current });
      setDrivers(d => d.map(x => x._id === id ? { ...x, isVerified: data.driver.isVerified } : x));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: 28 }}>
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 34, lineHeight:1, marginBottom:4 }}>
            DRIVER <span style={{ color:'var(--yellow)' }}>MANAGEMENT</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:13 }}>{total} registered drivers</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {/* Filter Tabs */}
          <div style={{ display:'flex', background:'var(--surface)', borderRadius:8, padding:3, border:'1px solid var(--border)' }}>
            {['all','verified','unverified'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding:'6px 14px', borderRadius:6, border:'none',
                  background: filter === f ? 'var(--yellow)' : 'transparent',
                  color: filter === f ? '#000' : 'var(--muted)',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                  textTransform:'capitalize', transition:'all 0.15s'
                }}>{f}</button>
            ))}
          </div>
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
            <input
              placeholder="Search driver..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:34, width:200 }}
            />
          </div>
        </div>
      </div>

      <div className="fade-up-2" style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:12, overflow:'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>License</th>
              <th>Rating</th>
              <th>Rides</th>
              <th>Earnings</th>
              <th>Status</th>
              <th>Verify</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No drivers found</td></tr>
            ) : drivers.map(driver => (
              <tr key={driver._id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{
                      width:32, height:32, borderRadius:8,
                      background: driver.isVerified ? 'var(--green-lo)' : 'var(--red-lo)',
                      border: `1px solid ${driver.isVerified ? 'var(--green)' : 'var(--red)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'Bebas Neue', fontSize:16,
                      color: driver.isVerified ? 'var(--green)' : 'var(--red)'
                    }}>
                      {driver.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{driver.name}</div>
                      <div style={{ color:'var(--muted)', fontSize:11 }}>{driver.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize:13 }}>{driver.vehicle?.model}</div>
                  <div style={{ color:'var(--muted)', fontSize:11, fontFamily:'JetBrains Mono' }}>
                    {driver.vehicle?.plateNumber}
                  </div>
                </td>
                <td style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'var(--muted)' }}>
                  {driver.licenseNumber}
                </td>
                <td>
                  <span style={{ color:'var(--yellow)', display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
                    <Star size={12} fill="var(--yellow)" /> {driver.rating}
                  </span>
                </td>
                <td style={{ fontFamily:'JetBrains Mono', color:'var(--cyan)' }}>
                  {driver.totalRides}
                </td>
                <td style={{ fontFamily:'JetBrains Mono', color:'var(--green)' }}>
                  ₹{driver.earnings}
                </td>
                <td>
                  <span className={`badge ${driver.isAvailable ? 'badge-green' : 'badge-gray'}`}>
                    {driver.isAvailable ? '● Online' : '● Offline'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn ${driver.isVerified ? 'btn-danger' : 'btn-success'}`}
                    style={{ padding:'6px 12px', fontSize:11 }}
                    onClick={() => handleVerify(driver._id, driver.isVerified)}>
                    {driver.isVerified
                      ? <><XCircle size={12}/> Revoke</>
                      : <><CheckCircle size={12}/> Verify</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}