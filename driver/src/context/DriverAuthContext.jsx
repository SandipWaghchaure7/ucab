import { createContext, useContext, useState } from 'react';

const DriverAuthContext = createContext();

export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(() => {
    try {
      const d = localStorage.getItem('driver_user');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('driver_token') || null
  );

  const login = (driverData, tokenData) => {
    setDriver(driverData);
    setToken(tokenData);
    localStorage.setItem('driver_token', tokenData);
    localStorage.setItem('driver_user', JSON.stringify(driverData));
  };

  const logout = () => {
    setDriver(null);
    setToken(null);
    localStorage.removeItem('driver_token');
    localStorage.removeItem('driver_user');
  };

  const updateDriver = (updates) => {
    const updated = { ...driver, ...updates };
    setDriver(updated);
    localStorage.setItem('driver_user', JSON.stringify(updated));
  };

  return (
    <DriverAuthContext.Provider value={{ driver, token, login, logout, updateDriver }}>
      {children}
    </DriverAuthContext.Provider>
  );
}

export const useDriverAuth = () => useContext(DriverAuthContext);