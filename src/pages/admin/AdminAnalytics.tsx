import { useEffect, useState } from 'react';
import { IndianRupee, ShoppingCart, Package, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import Spinner from '@/components/ui/Spinner';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    avgOrder: 0,
    delivered: 0,
    pending: 0,
    topProducts: [] as { name: string; qty: number; revenue: number }[],
    statusBreakdown: [] as { status: string; count: number }[],
  });

  useEffect(() => {
    (async () => {
      const [orders, products, items] = await Promise.all([
        supabase.from('orders').select('id, total, status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('order_items').select('name, quantity, price'),
      ]);

      const allOrders = (orders.data ?? []) as { id: string; total: number; status: string }[];
      const revenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
      const statusBreakdown = Object.entries(
        allOrders.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([status, count]) => ({ status, count }));

      const productMap = new Map<string, { qty: number; revenue: number }>();
      (items.data ?? []).forEach((it: { name: string; quantity: number; price: number }) => {
        const cur = productMap.get(it.name) || { qty: 0, revenue: 0 };
        cur.qty += it.quantity;
        cur.revenue += Number(it.price) * it.quantity;
        productMap.set(it.name, cur);
      });
      const topProducts = Array.from(productMap.entries())
        .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        revenue,
        orders: allOrders.length,
        products: products.count ?? 0,
        avgOrder: allOrders.length ? revenue / allOrders.length : 0,
        delivered: allOrders.filter((o) => o.status === 'delivered').length,
        pending: allOrders.filter((o) => o.status === 'pending').length,
        topProducts,
        statusBreakdown,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>;
  }

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Avg Order Value', value: formatPrice(stats.avgOrder), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-amber-500' },
  ];

  const maxStatus = Math.max(1, ...stats.statusBreakdown.map((s) => s.count));

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
      <p className="text-sm text-slate-500">Store performance overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900">Top Products by Revenue</h3>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.qty} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900">Order Status Breakdown</h3>
          {stats.statusBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.statusBreakdown.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-slate-700">{s.status}</span>
                    <span className="text-slate-500">{s.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(s.count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <Award className="h-5 w-5" />
            <span>{stats.delivered} delivered · {stats.pending} pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
