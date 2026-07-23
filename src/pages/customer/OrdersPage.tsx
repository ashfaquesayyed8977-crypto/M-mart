import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/helpers';
import Spinner from '@/components/ui/Spinner';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to view orders</h1>
        <Link to="/login" state={{ from: '/orders' }} className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">You have no orders yet.</p>
          <Link to="/categories" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/order-confirmation/${o.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[o.status]}`}>
                  {o.status}
                </span>
                <span className="font-bold text-slate-900">{formatPrice(o.total)}</span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.order_items?.slice(0, 4).map((it) => (
                  <div key={it.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1">
                    {it.image_url && <img src={it.image_url} alt="" className="h-6 w-6 rounded object-cover" />}
                    <span className="text-xs text-slate-600">{it.name} × {it.quantity}</span>
                  </div>
                ))}
                {o.order_items && o.order_items.length > 4 && (
                  <span className="text-xs text-slate-500">+{o.order_items.length - 4} more</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
