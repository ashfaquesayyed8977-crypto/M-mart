import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { Tag, ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      setCategories((data ?? []) as Category[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Categories</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">All Categories</h1>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : categories.length === 0 ? (
        <p className="mt-10 text-slate-500">No categories yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <Tag className="h-9 w-9 text-emerald-600" />
                )}
              </div>
              <span className="text-center text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{c.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
