import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; id: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const signup = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and Password are required' };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        if (data.message === 'Admin Already Exist') {
          return { success: false, message: 'Admin Already Exist' };
        }
        return { success: true, message: data.message || 'Admin Created Successfully' };
      } else if (response.status === 400) {
        return { success: false, message: data.message || 'Email and Password are required' };
      } else {
        return { success: false, message: data.message || 'Internal Server Error' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and Password are required' };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 200 && data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          email: data.data?.Email || email,
          id: data.data?.id || data.data?._id,
        }));

        setToken(data.token);
        setUser({
          email: data.data?.Email || email,
          id: data.data?.id || data.data?._id,
        });
        setIsAuthenticated(true);
        return { success: true, message: data.message || 'Login Successful' };
      } else if (response.status === 400) {
        return { success: false, message: data.message || 'Email and Password are required' };
      } else if (response.status === 404) {
        return { success: false, message: data.message || 'Admin Not Found' };
      } else if (response.status === 401) {
        return { success: false, message: data.message || 'Invalid Password' };
      } else {
        return { success: false, message: data.message || 'Internal Server Error' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
