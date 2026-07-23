import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, ChevronRight, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatPrice, effectivePrice, discountPercent, classNames } from '@/lib/helpers';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { user } = useAuth();
  const { notify } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      const p = data as Product | null;
      setProduct(p);
      if (p?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('category_id', p.category_id)
          .neq('id', p.id)
          .limit(5);
        setRelated((rel ?? []) as Product[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  async function handleAdd() {
    if (!product) return;
    if (!user) {
      notify('Please sign in to add items to cart.', 'info');
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    setBusy(true);
    const { error } = await addToCart(product.id, qty);
    setBusy(false);
    notify(error ? error : 'Added to cart', error ? 'error' : 'success');
  }

  async function handleBuyNow() {
    if (!product) return;
    if (!user) {
      notify('Please sign in to checkout.', 'info');
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    setBusy(true);
    const { error } = await addToCart(product.id, qty);
    setBusy(false);
    if (!error) navigate('/cart');
    else notify(error, 'error');
  }

  async function handleWish() {
    if (!product) return;
    if (!user) {
      notify('Please sign in to use wishlist.', 'info');
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    const { error, added } = await toggleWishlist(product.id);
    notify(error ? error : added ? 'Added to wishlist' : 'Removed from wishlist', error ? 'error' : 'success');
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link to="/" className="mt-4 inline-block text-emerald-700 hover:underline">Back to home</Link>
      </div>
    );
  }

  const images = product.product_images?.map((i) => i.image_url).filter(Boolean) ?? [];
  const price = effectivePrice(product.price, product.sale_price);
  const pct = discountPercent(product.price, product.sale_price);
  const wished = inWishlist(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-emerald-700">{product.category.name}</Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="truncate text-slate-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <ShoppingCart className="h-16 w-16" />
              </div>
            )}
            {pct > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                -{pct}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={classNames(
                    'h-20 w-20 overflow-hidden rounded-xl border-2 transition',
                    i === activeImg ? 'border-emerald-600' : 'border-slate-200 hover:border-emerald-300'
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            {product.offer_label && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{product.offer_label}</span>
            )}
            <span className={classNames('rounded-full px-3 py-1 text-xs font-semibold', product.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700')}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-sm text-slate-500">(4.8)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">{formatPrice(price)}</span>
            {pct > 0 && <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>}
            <span className="text-sm text-slate-500">/ {product.unit}</span>
          </div>

          {product.description && (
            <p className="mt-5 text-slate-600 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-xl"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-slate-800">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-xl"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAdd} loading={busy} disabled={!product.in_stock} size="lg" variant="outline">
              <ShoppingCart className="h-5 w-5" /> Add to cart
            </Button>
            <button
              onClick={handleWish}
              className={classNames(
                'flex h-11 w-11 items-center justify-center rounded-xl border transition',
                wished ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-300 text-slate-500 hover:bg-slate-100'
              )}
            >
              <Heart className={classNames('h-5 w-5', wished && 'fill-current')} />
            </button>
          </div>

          <Button onClick={handleBuyNow} loading={busy} disabled={!product.in_stock} size="lg" className="mt-3 w-full">
            Buy now
          </Button>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            {[
              { icon: Truck, label: 'Fast Delivery' },
              { icon: ShieldCheck, label: 'Quality Promise' },
              { icon: RotateCcw, label: 'Easy Returns' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2 text-center">
                <f.icon className="h-6 w-6 text-emerald-600" />
                <span className="text-xs font-medium text-slate-600">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
