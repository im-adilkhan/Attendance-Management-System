import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!sessionStorage.getItem('access_token')) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data))
      .catch(() => sessionStorage.removeItem('access_token'))
      .finally(() => setLoading(false));
  }, []);
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  }
  async function register(profile) {
    const { data } = await api.post('/auth/register', profile);
    sessionStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  }
  function logout() { sessionStorage.removeItem('access_token'); setUser(null); }
  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
