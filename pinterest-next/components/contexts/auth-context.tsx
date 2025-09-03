'use client';

import React, { createContext, useContext, useState } from 'react';
import { API } from '@/lib/api-client/api';
import { UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';

type AuthContextType = {
  user: UserWithNoPassword | null;
  isAuthenticated: boolean;
  setUser: (user: UserWithNoPassword | null) => void;
  logout: () => Promise<void>;
};

const defaultValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  setUser: () => {
  },
  logout: async () => {
  },
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProviderUser = ({ children, initialUser }: {
  children: React.ReactNode,
  initialUser: UserWithNoPassword | null
}) => {
  const [user, setUser] = useState<UserWithNoPassword | null>(initialUser);

  const logout = async () => {
    try {
      if (await API.auth.logout()) {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      setUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
