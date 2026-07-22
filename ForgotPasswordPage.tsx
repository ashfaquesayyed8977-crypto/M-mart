import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { Field, Input } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      notify(error, 'error');
      return;
    }
    setSent(true);
    notify('Password reset email sent. Check your inbox.', 'success');
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll email you a reset link"
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-12 w-12 text-emerald-600" />
          <p className="text-sm text-slate-600">
            If an account exists for <span className="font-semibold text-slate-800">{email}</span>, a password reset link is on its way.
          </p>
          <Link to="/login" className="mt-2 font-semibold text-emerald-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
