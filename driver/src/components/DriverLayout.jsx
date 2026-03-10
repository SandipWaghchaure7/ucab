import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';

export default function DriverLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <DriverSidebar />
      <div style={{
        marginLeft: 240, flex: 1,
        minHeight: '100vh', padding: '32px',
        background: '#0A0A0A'
      }}>
        <Outlet />
      </div>
    </div>
  );
}