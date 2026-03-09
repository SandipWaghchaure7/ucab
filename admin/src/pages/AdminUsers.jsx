import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Trash2, ToggleLeft, ToggleRight, User } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users?search=${q}&limit=20`);
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/toggle`);
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: data.isActive } : x));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 34, lineHeight:1, marginBottom:4 }}>
            USER <span style={{ color:'var(--yellow)' }}>MANAGEMENT</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:13 }}>{total} registered users</p>
        </div>
        <div style={{ position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: 240 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="fade-up-2" style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:12, overflow:'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
                Loading...
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
                No users found
              </td></tr>
            ) : users.map(user => (
              <tr key={user._id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{
                      width:32, height:32, borderRadius:8,
                      background:'var(--yellow)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'Bebas Neue', fontSize:16, color:'#000'
                    }}>
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{user.name}</div>
                      <div style={{ color:'var(--muted)', fontSize:11 }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color:'var(--muted)', fontFamily:'JetBrains Mono', fontSize:12 }}>
                  {user.phone}
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-yellow' : 'badge-cyan'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                    {user.isActive ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td style={{ color:'var(--muted)', fontSize:12 }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding:'6px 10px' }}
                      onClick={() => handleToggle(user._id)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}>
                      {user.isActive
                        ? <ToggleRight size={14} color="var(--green)" />
                        : <ToggleLeft  size={14} color="var(--muted)" />}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="btn btn-danger"
                        style={{ padding:'6px 10px' }}
                        onClick={() => handleDelete(user._id)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}