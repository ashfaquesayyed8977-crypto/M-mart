import { useEffect, useState } from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import Spinner from '@/components/ui/Spinner';

type CustomerRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  email: string | null;
  order_count: number;
  total_spent: number;
};

export default function AdminCustomers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: orders } = await supabase.from('orders').select('user_id, total');

      const orderMap = new Map<string, { count: number; spent: number }>();
      (orders ?? []).forEach((o: { user_id: string; total: number }) => {
        const cur = orderMap.get(o.user_id) || { count: 0, spent: 0 };
        cur.count += 1;
        cur.spent += Number(o.total);
        orderMap.set(o.user_id, cur);
      });

      const merged: CustomerRow[] = (profiles ?? []).map((p: Record<string, unknown>) => {
        const id = p.id as string;
        const stats = orderMap.get(id) || { count: 0, spent: 0 };
        return {
          id,
          full_name: (p.full_name as string) || null,
          phone: (p.phone as string) || null,
          address: (p.address as string) || null,
          city: (p.city as string) || null,
          created_at: p.created_at as string,
          email: null,
          order_count: stats.count,
          total_spent: stats.spent,
        };
      });
      setRows(merged);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
      <p className="text-sm text-slate-500">{rows.length} registered customers</p>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No customers yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {(c.full_name || c.email || 'U')[0].toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{c.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-slate-600"><Mail className="h-3.5 w-3.5" /> {c.email || '—'}</p>
                    <p className="flex items-center gap-1 text-slate-500"><Phone className="h-3.5 w-3.5" /> {c.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.city || '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.order_count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatPrice(c.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
