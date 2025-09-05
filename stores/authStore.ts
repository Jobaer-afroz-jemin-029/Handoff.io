import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  varsityId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role?: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, 'id'> & { password: string }
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  getToken: () => string | null;
}


//const API_BASE_URL = 'http://192.168.1.105:8000'; 
const API_BASE_URL = 'https://handoff-backend.onrender.com';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,

login: async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json(); // Call only once

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.isVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const userData = {
      varsityId: data.user.varsityId,
      fullName: data.user.name,
      email: data.user.email,
      phoneNumber: '',
      role: data.user.role || 'user',
    };

    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('token', data.token);

    set({ user: userData, isAuthenticated: true, token: data.token });

    return true;
  } catch (error: any) {
    console.error('Login error:', error.message || error);
    return false;
  }
},

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          varsityId: userData.varsityId,
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      console.log('Logout: Starting logout process...');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, token: null });
      console.log('Logout: Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuthStatus: async () => {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);

      if (userData && token) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true, token });
      }
    } catch (error) {
      console.error('Check auth status error:', error);
    }
  },

  getToken: () => {
    return get().token;
  },
}));
