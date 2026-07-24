import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'mm_admin_auth';
const ADMIN_EMAIL = 'admin@mahapolimart.com';

type AdminContextValue = {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === '1'
  );

  async function login(password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });

    if (error) {
      return false;
    }

    sessionStorage.setItem(STORAGE_KEY, '1');
    setIsAdmin(true);
    return true;
  }

  async function logout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
