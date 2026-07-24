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

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    const ok = await login(password);

    setLoading(false);

    if (ok) {
      notify('Welcome, admin!', 'success');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid password.');
      notify('Invalid password.', 'error');
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
          <div className="flex flex-col items-center
