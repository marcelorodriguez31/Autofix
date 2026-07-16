import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { signIn } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('autofixUser');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('autofixUser');
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        'autofixUser',
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem('autofixUser');
    }
  }, [user]);

  const login = async (empresa, password) => {
    const data = await signIn(empresa, password);

    if (!data.success) {
      throw new Error(
        data.message || 'Credenciales inválidas'
      );
    }

    setUser(data);
    return data;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user?.success === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}