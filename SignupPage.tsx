import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { Field, Input } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
      notify(error, 'error');
      return;
    }
    notify('Account created. You are signed in!', 'success');
    navigate('/');
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Mahapoli Mart for fresh groceries"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Noori Ahmed" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
