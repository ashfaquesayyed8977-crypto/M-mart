import { Link } from 'react-router-dom';
import { Heart, Plus, ImageOff } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, effectivePrice, discountPercent, classNames } from '@/lib/helpers';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { user } = useAuth();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const img = product.product_images?.[0]?.image_url;
  const price = effectivePrice(product.price, product.sale_price);
  const pct = discountPercent(product.price, product.sale_price);
  const wished = inWishlist(product.id);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to add items to cart.', 'info');
      return;
    }
    setBusy(true);
    const { error } = await addToCart(product.id, 1);
    setBusy(false);
    notify(error ? error : 'Added to cart', error ? 'error' : 'success');
  }

  async function handleWish(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      notify('Please sign in to use wishlist.', 'info');
      return;
    }
    const { error, added } = await toggleWishlist(product.id);
    notify(error ? error : added ? 'Added to wishlist' : 'Removed from wishlist', error ? 'error' : 'success');
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {pct > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-lg bg-green-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            {pct}% OFF
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-xs font-bold uppercase tracking-wide text-slate-600">
            Out of Stock
          </span>
        )}
      </Link>

      <button
        onClick={handleWish}
        aria-label="Toggle wishlist"
        className={classNames(
          'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110',
          wished ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <Heart className={classNames('h-4.5 w-4.5', wished && 'fill-current')} />
      </button>

      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 hover:text-green-700">
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-slate-400">{product.unit}</p>

        <div className="mt-auto flex items-end justify-between pt-2.5">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900">{formatPrice(price)}</span>
            {pct > 0 && <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>}
          </div>
          <button
            onClick={handleAdd}
            disabled={busy || !product.in_stock}
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
