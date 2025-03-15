import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthState({ token, user: JSON.parse(localStorage.getItem('user')), loading: false });
    } else {
      setAuthState({ token: null, user: null, loading: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      setAuthState({ token: res.data.token, user: res.data.user || {}, loading: false });
      router.push('/');
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      throw err; // Re-throw the error so it can be caught by the login component
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      setAuthState({ token: res.data.token, user: res.data.user || {}, loading: false });
      router.push('/');
      return res.data;
    } catch (err) {
      console.error('Registration error:', err);
      throw err; // Re-throw the error so it can be caught by the register component
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, user: null, loading: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
