import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Truck, ShieldCheck, Clock, Tag, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Banner, Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

export default function HomePage() {
  const { settings } = useSettings();
  const { user, profile } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [b, c, f] = await Promise.all([
        supabase.from('banners').select('*').eq('active', true).order('position', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase
          .from('products')
          .select('*, product_images(*)')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      setBanners((b.data ?? []) as Banner[]);
      setCategories((c.data ?? []) as Category[]);
      setFeatured((f.data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const heroBanner = banners[slide];
  const greeting = user ? `Hi, ${profile?.full_name?.split(' ')[0] || 'there'}` : 'Welcome to Mahapoli Mart';

  return (
    <div>
      {/* Greeting + Search header */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-green-600">{settings.store_tagline || 'Fresh groceries, delivered daily'}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">{greeting}</h1>
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`); }}
            className="relative mt-4 max-w-2xl"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for groceries, snacks, dairy..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </form>
        </div>
      </section>

      {/* Hero banner */}
      <section className="mx-auto max-w-7xl px-4 pt-2">
        {loading ? (
          <div className="flex h-56 items-center justify-center rounded-3xl bg-white text-slate-400">
            <Spinner className="h-8 w-8" />
          </div>
        ) : heroBanner ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 shadow-xl">
            {heroBanner.image_url && (
              <img src={heroBanner.image_url} alt={heroBanner.title || ''} className="absolute inset-0 h-full w-full object-cover opacity-30" />
            )}
            <div className="relative flex flex-col items-start gap-4 p-8 sm:p-12 lg:p-16">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                {settings.store_name || 'Mahapoli Mart'}
              </span>
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {heroBanner.title || settings.hero_title || 'Fresh Groceries, Delivered Daily'}
              </h2>
              <p className="max-w-md text-sm text-green-50 sm:text-base">
                {heroBanner.subtitle || settings.hero_subtitle}
              </p>
              <Link
                to={heroBanner.link || '/categories'}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-green-700 shadow-lg transition hover:bg-green-50 hover:gap-3"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8 text-white shadow-xl sm:p-12 lg:p-16">
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {settings.hero_title || 'Fresh Groceries, Delivered Daily'}
            </h2>
            <p className="mt-4 max-w-md text-sm text-green-50 sm:text-base">{settings.hero_subtitle}</p>
            <Link to="/categories" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-green-700 shadow-lg transition hover:bg-green-50">
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Same-day in your area' },
            { icon: ShieldCheck, title: 'Quality Promise', desc: 'Fresh or refund' },
            { icon: Clock, title: 'Open 7 days', desc: 'Always here for you' },
            { icon: Tag, title: 'Best Prices', desc: 'Daily essentials for less' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <f.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{f.title}</p>
                <p className="truncate text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Shop by Category</h2>
              <p className="mt-0.5 text-sm text-slate-500">Pick what you need from our fresh aisles</p>
            </div>
            <Link to="/categories" className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:gap-2 transition-all">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-6 md:overflow-visible">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="group flex min-w-[120px] flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:min-w-0"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-green-50 transition group-hover:bg-green-100">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <Tag className="h-7 w-7 text-green-600" />
                  )}
                </div>
                <span className="text-center text-sm font-semibold text-slate-700 group-hover:text-green-700">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Fresh Picks for You</h2>
            <p className="mt-0.5 text-sm text-slate-500">Handpicked quality products at the best prices</p>
          </div>
          <Link to="/categories" className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:gap-2 transition-all">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Spinner className="h-8 w-8" />
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-6 text-slate-500">No products yet. Check back soon.</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
