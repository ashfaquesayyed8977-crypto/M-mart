import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/ui/Spinner';
import type { Product } from '@/types';

export default function WishlistPage() {
  const { wishlist, loadingCart } = useStore();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your wishlist awaits</h1>
        <p className="mt-2 text-slate-500">Sign in to save your favourite products.</p>
        <Link to="/login" state={{ from: '/wishlist' }} className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }

  if (loadingCart) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const products = wishlist.map((w) => w.product).filter(Boolean) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Your Wishlist</h1>
      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No items in your wishlist yet.</p>
          <Link to="/categories" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
