import { createContext, useContext, useState, type ReactNode } from 'react';

const ADMIN_PASSKEY = 'ILOVENOORI';
const STORAGE_KEY = 'mm_admin_auth';

type AdminContextValue = {
  isAdmin: boolean;
  login: (passkey: string) => boolean;
  logout: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');

  function login(passkey: string) {
    if (passkey.trim().toUpperCase() === ADMIN_PASSKEY) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }

  return <AdminContext.Provider value={{ isAdmin, login, logout }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
