import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Store, Package, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/lib/helpers';

export default function Navbar() {
  const { cartCount, wishlist } = useStore();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setOpen(false);
    }
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/categories', label: 'Categories' },
    { to: '/orders', label: 'My Orders' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
            <Store className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            MAHAPOLI<span className="text-green-600">MART</span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for groceries..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                classNames(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'text-green-700 bg-green-50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            to="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative group">
              <button className="flex h-10 items-center gap-1.5 rounded-full px-2 hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </span>
              </button>
              <div className="invisible absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{profile?.full_name || 'Account'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for groceries..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </form>
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive ? 'text-green-700 bg-green-50' : 'text-slate-700 hover:bg-slate-50'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
