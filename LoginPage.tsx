import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { Field, Input } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      notify(error, 'error');
      return;
    }
    notify('Welcome back!', 'success');
    const dest = (location.state as { from?: string })?.from || '/';
    navigate(dest);
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back to Mahapoli Mart"
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-emerald-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-emerald-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
