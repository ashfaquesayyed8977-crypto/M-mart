import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Form';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const { login } = useAdmin();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passkey.trim()) {
      setError('Please enter the admin passkey.');
      return;
    }
    if (login(passkey)) {
      notify('Welcome, admin!', 'success');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid passkey. Access denied.');
      notify('Invalid passkey.', 'error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
            <Store className="h-6 w-6" />
          </span>
          <span className="text-xl font-extrabold">MAHAPOLI MART</span>
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Access</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your passkey to open the dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError(null);
                }}
                placeholder="Admin passkey"
                className="pl-10"
                autoFocus
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full">
              Enter Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <Link to="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-emerald-700">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
