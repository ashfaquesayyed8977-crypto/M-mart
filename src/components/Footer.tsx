import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
              <Store className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">
              MAHAPOLI<span className="text-green-400">MART</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-400">{settings.store_tagline || 'Fresh groceries delivered to your door'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/categories" className="hover:text-green-400">Categories</Link></li>
            <li><Link to="/cart" className="hover:text-green-400">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-green-400">Wishlist</Link></li>
            <li><Link to="/orders" className="hover:text-green-400">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-green-400">Sign In</Link></li>
            <li><Link to="/signup" className="hover:text-green-400">Sign Up</Link></li>
            <li><Link to="/profile" className="hover:text-green-400">Profile</Link></li>
            <li><Link to="/admin" className="hover:text-green-400">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {settings.contact_phone && (
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.contact_phone}</li>
            )}
            {settings.contact_email && (
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {settings.contact_email}</li>
            )}
            {settings.contact_address && (
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {settings.contact_address}</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        {settings.footer_text || '© Mahapoli Mart. All rights reserved.'}
      </div>
    </footer>
  );
}
