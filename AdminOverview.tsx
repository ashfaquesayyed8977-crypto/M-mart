import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import Spinner from '@/components/ui/Spinner';

type Stats = {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
  recentOrders: { id: string; total: number; status: string; created_at: string; full_name: string | null }[];
  lowStock: { id: string; name: string; stock: number }[];
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, o, c, recent, low] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status, created_at, full_name').order('created_at', { ascending: false }).limit(6),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total').in('status', ['delivered', 'shipped', 'processing', 'confirmed']),
        supabase.from('products').select('id, name, stock').lt('stock', 5).order('stock', { ascending: true }).limit(5),
      ]);

      const revenueRows = (o.data ?? []).map((r) => Number(r.total));
      const deliveredRevenue = (recent.data ?? []).reduce((s, r) => s + Number(r.total), 0);

      setStats({
        products: p.count ?? 0,
        orders: o.count ?? 0,
        customers: c.count ?? 0,
        revenue: deliveredRevenue,
        recentOrders: (o.data ?? []) as Stats['recentOrders'],
        lowStock: (low.data ?? []) as Stats['lowStock'],
      });
      void revenueRows;
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats?.products ?? 0, icon: Package, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats?.orders ?? 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Customers', value: stats?.customers ?? 0, icon: Users, color: 'bg-amber-500' },
    { label: 'Revenue', value: formatPrice(stats?.revenue ?? 0), icon: IndianRupee, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Welcome back, Admin</h2>
      <p className="mt-1 text-sm text-slate-500">Here's what's happening in your store today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            <Link to="/admin/dashboard/orders" className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No orders yet.</td></tr>
                )}
                {stats?.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 font-mono text-xs text-slate-600">#{o.id.slice(0, 8)}</td>
                    <td className="py-3 text-slate-700">{o.full_name || '—'}</td>
                    <td className="py-3"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium capitalize text-amber-800">{o.status}</span></td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatPrice(Number(o.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900">Low Stock Alert</h3>
          <div className="mt-4 space-y-3">
            {stats?.lowStock.length === 0 && <p className="text-sm text-slate-400">All products well stocked.</p>}
            {stats?.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                <span className="text-xs font-bold text-red-600">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
