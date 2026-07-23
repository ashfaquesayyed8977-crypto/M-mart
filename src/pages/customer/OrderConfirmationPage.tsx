import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Banknote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/helpers';
import Spinner from '@/components/ui/Spinner';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .maybeSingle();
      setOrder(data as Order | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
        <Link to="/" className="mt-4 inline-block text-emerald-700 hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Order Confirmed!</h1>
        <p className="mt-2 text-slate-500">Thank you for your purchase. Your order is being processed.</p>
        <p className="mt-1 text-sm text-slate-400">Order ID: <span className="font-mono font-semibold text-slate-600">{order.id.slice(0, 8)}</span></p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <Package className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs text-slate-500">Items</p>
            <p className="font-semibold text-slate-800">{order.order_items?.length ?? 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <Banknote className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs text-slate-500">Payment</p>
            <p className="font-semibold text-slate-800">Cash on Delivery</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs text-slate-500">Deliver to</p>
            <p className="font-semibold text-slate-800 line-clamp-1">{order.city}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-5 text-left">
          <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
          <div className="mt-3 space-y-2">
            {order.order_items?.map((it) => (
              <div key={it.id} className="flex justify-between text-sm text-slate-600">
                <span>{it.name} × {it.quantity}</span>
                <span>{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/orders" className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            View my orders
          </Link>
          <Link to="/categories" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
