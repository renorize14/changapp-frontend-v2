import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocketNotifications } from '../components/useWebSocketNotifications';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  signIn: (token: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  email: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useWebSocketNotifications(email ?? '');

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      }
    };
    loadToken();
  }, []);

  const signIn = async (newToken: string, inputEmail: string) => {
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setEmail(inputEmail);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        email,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);
