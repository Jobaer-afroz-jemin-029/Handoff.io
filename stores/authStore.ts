import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  varsityId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (varsityId: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Mock users data
const mockUsers = [
  {
    varsityId: '22235103032',
    fullName: 'Admin User',
    email: 'admin@bubt.edu.bd',
    phoneNumber: '+8801234567890',
    password: 'saijja',
  },
  {
    varsityId: '22235103001',
    fullName: 'John Doe',
    email: 'john.doe@gmail.com',
    phoneNumber: '+8801987654321',
    password: '123456',
  },
  {
    varsityId: '22235103002',
    fullName: 'Jane Smith',
    email: 'jane.smith@gmail.com',
    phoneNumber: '+8801555555555',
    password: '123456',
  },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (varsityId: string, password: string) => {
    try {
      const user = mockUsers.find(
        u => u.varsityId === varsityId && u.password === password
      );

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
        set({ user: userWithoutPassword, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (userData) => {
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(
        u => u.varsityId === userData.varsityId || u.email === userData.email
      );

      if (existingUser) {
        return false;
      }

      // In a real app, this would send data to backend
      // For now, we'll just add to mock data
      const newUser = {
        varsityId: userData.varsityId,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
      };

      mockUsers.push(newUser);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuthStatus: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Check auth status error:', error);
    }
  },
}));