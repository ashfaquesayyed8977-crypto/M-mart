import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, effectivePrice } from '@/lib/helpers';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function CartPage() {
  const { cart, loadingCart, updateCartQty, removeFromCart, cartTotal } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your cart is waiting</h1>
        <p className="mt-2 text-slate-500">Sign in to view your cart and checkout.</p>
        <Link to="/login" state={{ from: '/cart' }} className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
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

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Browse our fresh groceries and add items to your cart.</p>
        <Link to="/categories" className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const p = item.product;
            if (!p) return null;
            const price = effectivePrice(p.price, p.sale_price);
            const img = p.product_images?.[0]?.image_url;
            return (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <Link to={`/product/${p.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {img ? <img src={img} alt={p.name} className="h-full w-full object-cover" /> : null}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${p.slug}`} className="text-sm font-semibold text-slate-800 hover:text-emerald-700">{p.name}</Link>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{p.unit}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-slate-900">{formatPrice(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <Button onClick={() => navigate('/checkout')} size="lg" className="mt-5 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/categories" className="mt-3 block text-center text-sm text-slate-500 hover:text-emerald-700">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
