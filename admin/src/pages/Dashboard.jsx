import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  Users, Car, MapPin, TrendingUp,
  CheckCircle, XCircle, Zap, IndianRupee
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, color, sub, delay = '0s' }) => (
  <div style={{
    background: 'var(--card)',
    border: `1px solid var(--border)`,
    borderRadius: 12, padding: '20px',
    animation: `fadeUp 0.4s ${delay} ease both`,
    position: 'relative', overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 2, background: color, opacity: 0.6
    }} />
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: 16
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 2,
        color: 'var(--muted)', textTransform: 'uppercase'
      }}>{label}</span>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={15} color={color} />
      </div>
    </div>
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 30, fontWeight: 700, color,
      animation: 'countUp 0.5s ease both', lineHeight: 1,
      marginBottom: 6
    }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: 'var(--yellow)', fontFamily: 'JetBrains Mono' }}>
        ₹{payload[0]?.value || 0}
      </div>
      <div style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono' }}>
        {payload[1]?.value || 0} rides
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [chart, setChart]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => {
        setStats(data.stats);
        setChart(data.revenueChart.map(d => ({
          date:    d._id.slice(5),
          revenue: d.revenue || 0,
          rides:   d.rides   || 0
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{
        width:36,height:36,border:'3px solid var(--border)',
        borderTopColor:'var(--yellow)',borderRadius:'50%',
        animation:'spin 0.7s linear infinite'
      }} />
    </div>
  );

  return (
    <div style={{ padding: '28px' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 36, lineHeight: 1, marginBottom: 6 }}>
          COMMAND <span style={{ color: 'var(--yellow)' }}>CENTER</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Real-time overview · {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </p>
      </div>

      {/* Stat Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14, marginBottom: 24
      }}>
        <StatCard label="Total Users"      value={stats?.totalUsers}       icon={Users}        color="var(--cyan)"   delay="0s"    sub="Registered riders" />
        <StatCard label="Total Drivers"    value={stats?.totalDrivers}     icon={Car}          color="var(--yellow)" delay="0.06s" sub={`${stats?.verifiedDrivers} verified`} />
        <StatCard label="Total Rides"      value={stats?.totalRides}       icon={MapPin}       color="#a855f7"       delay="0.12s" sub={`${stats?.completionRate}% completion`} />
        <StatCard label="Active Now"       value={stats?.activeRides}      icon={Zap}          color="var(--green)"  delay="0.18s" sub="Live rides" />
        <StatCard label="Completed"        value={stats?.completedRides}   icon={CheckCircle}  color="var(--green)"  delay="0.24s" />
        <StatCard label="Cancelled"        value={stats?.cancelledRides}   icon={XCircle}      color="var(--red)"    delay="0.30s" />
        <StatCard label="Unverified"       value={stats?.unverifiedDrivers}icon={Car}          color="var(--red)"    delay="0.36s" sub="Needs review" />
        <StatCard label="Revenue"          value={`₹${stats?.totalRevenue||0}`} icon={TrendingUp} color="var(--yellow)" delay="0.42s" sub="Total collected" />
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px',
        animation: 'fadeUp 0.5s 0.3s ease both'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>
              REVENUE <span style={{ color: 'var(--yellow)' }}>CHART</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>Last 7 days performance</p>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--muted)' }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--yellow)' }} />Revenue
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--muted)' }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--cyan)' }} />Rides
            </div>
          </div>
        </div>

        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--yellow)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--yellow)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--cyan)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--yellow)" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="rides"   stroke="var(--cyan)"   strokeWidth={2} fill="url(#rideGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
            No ride data yet
          </div>
        )}
      </div>
    </div>
  );
}