import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { classNames } from '@/lib/helpers';

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}</label>;
}

const baseField =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition';

export function Input({ className, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: string | null }) {
  return (
    <>
      <input className={classNames(baseField, error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={classNames(baseField, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={classNames(baseField, 'appearance-none bg-no-repeat', className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
