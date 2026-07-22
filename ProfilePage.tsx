import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Field, Input, Textarea } from '@/components/ui/Form';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <User className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to view your profile</h1>
        <Link to="/login" state={{ from: '/profile' }} className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    notify(error ? error : 'Profile updated', error ? 'error' : 'success');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
              {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <p className="mt-3 font-semibold text-slate-800">{profile?.full_name || 'Customer'}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <Link to="/orders" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              <Package className="h-4 w-4" /> My Orders
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-800">Account info</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {user.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {profile?.phone || 'Not set'}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {profile?.city || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Edit Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
              </div>
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="Pincode">
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </Field>
            </div>
            <Button type="submit" loading={saving} size="lg" className="mt-6">
              Save changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
