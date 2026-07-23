import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Image, Settings, BarChart3, LogOut, Store, Menu, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useState } from 'react';
import { classNames } from '@/lib/helpers';

const nav = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/dashboard/products', label: 'Products', icon: Package },
  { to: '/admin/dashboard/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/admin/dashboard/banners', label: 'Banners', icon: Image },
  { to: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin');
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Store className="h-5 w-5" />
            </span>
            <span className="font-extrabold">MAHAPOLI</span>
          </Link>
          <button onClick={() => setOpen(false)} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/admin/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
          <Link to="/" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
            <Store className="h-5 w-5" /> View store
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button onClick={() => setOpen(true)} className="text-slate-600 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
          <Link to="/" className="text-sm font-medium text-emerald-700 hover:underline">View store →</Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
