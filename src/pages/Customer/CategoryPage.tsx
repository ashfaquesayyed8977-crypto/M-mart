import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { Tag, ChevronRight } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
      setCategory(cat as Category | null);
      const { data: prods } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category_id', (cat as Category | null)?.id ?? '')
        .order('created_at', { ascending: false });
      setProducts((prods ?? []) as Product[]);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/categories" className="hover:text-emerald-700">Categories</Link>
        {category && <><ChevronRight className="h-4 w-4" /><span className="text-slate-700">{category.name}</span></>}
      </nav>

      <div className="mt-6 flex items-center gap-4">
        {category?.image_url ? (
          <img src={category.image_url} alt={category.name} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Tag className="h-7 w-7" />
          </span>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{category?.name || 'Category'}</h1>
          {category?.description && <p className="mt-1 text-slate-500">{category.description}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : products.length === 0 ? (
        <p className="mt-10 text-slate-500">No products in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
