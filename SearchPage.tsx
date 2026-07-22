import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .order('created_at', { ascending: false });
      setResults((data ?? []) as Product[]);
      setLoading(false);
    })();
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Search</span>
      </nav>

      <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-slate-900">
        <SearchIcon className="h-6 w-6 text-emerald-600" />
        Results for "{q}"
      </h1>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">No products found for "{q}".</p>
          <Link to="/categories" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Browse all categories
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
