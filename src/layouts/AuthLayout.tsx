import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-emerald-700 p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <Store className="h-6 w-6" />
          </span>
          <span className="text-xl font-extrabold">MAHAPOLI MART</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Fresh groceries, delivered daily.</h2>
          <p className="mt-4 text-emerald-100">Quality products at the best prices from your neighborhood store.</p>
        </div>
        <p className="text-sm text-emerald-200">© Mahapoli Mart</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Store className="h-6 w-6" />
            </span>
            <span className="text-xl font-extrabold text-slate-900">MAHAPOLI MART</span>
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
