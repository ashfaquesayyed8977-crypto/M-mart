import { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, X, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { formatPrice, classNames } from '@/lib/helpers';
import { useToast } from '@/context/ToastContext';
import { Select } from '@/components/ui/Form';
import Spinner from '@/components/ui/Spinner';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

type OrderWithItems = Order & { order_items: NonNullable<Order['order_items']> };

export default function AdminOrders() {
  const { notify } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [viewing, setViewing] = useState<OrderWithItems | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders((data ?? []) as OrderWithItems[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(order: OrderWithItems, status: OrderStatus) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (error) notify(error.message, 'error');
    else {
      notify(`Order marked as ${status}`, 'success');
      setOrders(orders.map((o) => (o.id === order.id ? { ...o, status } : o)));
      if (viewing?.id === order.id) setViewing({ ...order, status });
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500">{orders.length} orders total</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')} className="max-w-[200px]">
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No orders found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{o.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">{o.phone || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(Number(o.total))}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                      className={classNames('h-8 w-32 border-0 px-2 py-1 text-xs font-semibold capitalize', statusStyles[o.status])}
                    >
                      {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(o)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Order #{viewing.id.slice(0, 8)}</h3>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p><span className="font-medium text-slate-800">Customer:</span> {viewing.full_name || '—'}</p>
              <p><span className="font-medium text-slate-800">Phone:</span> {viewing.phone || '—'}</p>
              <p><span className="font-medium text-slate-800">Address:</span> {viewing.shipping_address}, {viewing.city} - {viewing.pincode}</p>
              <p><span className="font-medium text-slate-800">Payment:</span> Cash on Delivery</p>
              <p><span className="font-medium text-slate-800">Date:</span> {new Date(viewing.created_at).toLocaleString('en-IN')}</p>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500">Items</div>
              <div className="divide-y divide-slate-100">
                {viewing.order_items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 px-4 py-3">
                    {it.image_url && <img src={it.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{it.name}</p>
                      <p className="text-xs text-slate-500">{formatPrice(Number(it.price))} × {it.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{formatPrice(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-200 px-4 py-3 font-bold text-slate-900">
                <span>Total</span><span>{formatPrice(Number(viewing.total))}</span>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Update status</label>
              <Select value={viewing.status} onChange={(e) => changeStatus(viewing, e.target.value as OrderStatus)} className="capitalize">
                {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
