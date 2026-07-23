import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Banknote } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, effectivePrice } from '@/lib/helpers';
import { Field, Input, Textarea } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore();
  const { user, profile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Please sign in to checkout</h1>
        <Link to="/login" state={{ from: '/checkout' }} className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <Link to="/categories" className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Start shopping
        </Link>
      </div>
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.address || !form.city || !form.pincode) {
      notify('Please fill in all delivery details.', 'error');
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        status: 'pending',
        total: cartTotal,
        shipping_address: form.address,
        city: form.city,
        pincode: form.pincode,
        phone: form.phone,
        full_name: form.full_name,
        payment_method: 'cod',
      })
      .select()
      .single();

    if (error || !order) {
      setPlacing(false);
      notify(error?.message || 'Failed to place order.', 'error');
      return;
    }

    const items = cart.map((c) => {
      const p = c.product!;
      const price = effectivePrice(p.price, p.sale_price);
      return {
        order_id: order.id,
        product_id: c.product_id,
        name: p.name,
        price,
        quantity: c.quantity,
        image_url: p.product_images?.[0]?.image_url ?? null,
      };
    });

    const { error: itemError } = await supabase.from('order_items').insert(items);
    if (itemError) {
      setPlacing(false);
      notify(itemError.message, 'error');
      return;
    }

    // Decrement stock
    for (const c of cart) {
      const p = c.product!;
      const newStock = Math.max(0, p.stock - c.quantity);
      await supabase
        .from('products')
        .update({ stock: newStock, in_stock: newStock > 0 })
        .eq('id', c.product_id);
    }

    // Save profile info
    await supabase.from('profiles').update(form).eq('id', user!.id);

    await clearCart();
    setPlacing(false);
    notify('Order placed successfully!', 'success');
    navigate(`/order-confirmation/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Delivery Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
              </div>
              <Field label="City">
                <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="Pincode">
                <Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4">
              <Banknote className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="font-semibold text-slate-800">Cash on Delivery</p>
                <p className="text-sm text-slate-500">Pay with cash when your order arrives.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-auto">
              {cart.map((item) => {
                const p = item.product!;
                const price = effectivePrice(p.price, p.sale_price);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-50">
                      {p.product_images?.[0]?.image_url && <img src={p.product_images[0].image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery</span><span className="text-emerald-600 font-medium">Free</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
              <span>Total</span><span>{formatPrice(cartTotal)}</span>
            </div>
            <Button type="submit" loading={placing} size="lg" className="mt-5 w-full">
              Place order
            </Button>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Fast delivery</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Secure</span>
            </div>
          </div>
        </div>
      </form>
      {placing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
            <Spinner className="h-10 w-10 text-emerald-600" />
          </div>
        )}
    </div>
  );
}
