import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI, setToken, clearToken, getToken } from '../services/api';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from stored token
    const token = getToken();
    if (token) {
      const claims = parseJwt(token);
      if (claims && claims.exp * 1000 > Date.now()) {
        setUser({ id: claims.sub, name: claims.name, email: claims.email, role: claims.role });
      } else {
        clearToken();
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    return res.data;
  }, []);

  const adminLogin = useCallback(async (credentials) => {
    const res = await authAPI.adminLogin(credentials);
    return res.data;
  }, []);

  const verifyOtp = useCallback(async (data) => {
    const res = await authAPI.verifyOtp(data);
    const token = res.data?.data?.access_token;
    if (token) {
      setToken(token);
      const claims = parseJwt(token);
      const userData = { id: claims.sub, name: claims.name, email: claims.email, role: claims.role };
      setUser(userData);
      return { ...res.data, user: userData, token };
    }
    return res.data;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!getToken();
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        register,
        verifyOtp,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
