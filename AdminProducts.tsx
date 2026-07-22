import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Search, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImages } from '@/lib/storage';
import type { Product, Category, ProductImage } from '@/types';
import { formatPrice, effectivePrice, slugify, classNames } from '@/lib/helpers';
import { useToast } from '@/context/ToastContext';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

type ProductWithImages = Product & { product_images: ProductImage[]; category?: Category | null };

export default function AdminProducts() {
  const { notify } = useToast();
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProductWithImages | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, product_images(*), category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
    ]);
    setProducts((p.data ?? []) as unknown as ProductWithImages[]);
    setCategories((c.data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(p: ProductWithImages) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) notify(error.message, 'error');
    else {
      notify('Product deleted', 'success');
      load();
    }
  }

  async function toggleStock(p: ProductWithImages) {
    const { error } = await supabase.from('products').update({ in_stock: !p.in_stock }).eq('id', p.id);
    if (error) notify(error.message, 'error');
    else {
      notify(`Marked ${!p.in_stock ? 'in' : 'out of'} stock`, 'success');
      load();
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">{products.length} products total</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.product_images?.[0]?.image_url ? (
                          <img src={p.product_images[0].image_url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">{formatPrice(effectivePrice(p.price, p.sale_price))}</span>
                    {p.sale_price && p.sale_price > 0 && p.sale_price < p.price && (
                      <span className="ml-1 text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={classNames('font-medium', p.stock < 5 ? 'text-red-600' : 'text-slate-700')}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock(p)}
                      className={classNames(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        p.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {p.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setShowForm(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductWithImages | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    unit: product?.unit || 'pcs',
    category_id: product?.category_id || '',
    is_featured: product?.is_featured ?? false,
    in_stock: product?.in_stock ?? true,
    offer_label: product?.offer_label || '',
  });
  const [images, setImages] = useState<ProductImage[]>(product?.product_images ?? []);
  const [files, setFiles] = useState<File[]>([]);

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    const { urls, errors } = await uploadImages(files, 'products');
    if (urls.length) {
      const newImages = urls.map((url, i) => ({
        id: `temp-${Date.now()}-${i}`,
        product_id: product?.id ?? '',
        image_url: url,
        position: images.length + i,
        created_at: new Date().toISOString(),
      }));
      setImages([...images, ...newImages]);
    }
    if (errors.length) notify(`${errors.length} upload(s) failed`, 'error');
    setFiles([]);
    setUploading(false);
  }

  function removeImage(img: ProductImage) {
    setImages(images.filter((i) => i.id !== img.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      notify('Name and price are required.', 'error');
      return;
    }
    setSaving(true);
    const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6);
    const payload = {
      name: form.name,
      slug: product?.slug ?? slug,
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock: Number(form.stock) || 0,
      unit: form.unit,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      in_stock: form.in_stock,
      offer_label: form.offer_label || null,
    };

    let productId = product?.id;
    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      // Replace images: delete old, insert new
      await supabase.from('product_images').delete().eq('product_id', product.id);
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) {
        notify(error.message, 'error');
        setSaving(false);
        return;
      }
      productId = data.id;
    }

    if (productId && images.length > 0) {
      const rows = images.map((img, i) => ({
        product_id: productId,
        image_url: img.image_url,
        position: i,
      }));
      await supabase.from('product_images').insert(rows);
    }

    notify(product ? 'Product updated' : 'Product created', 'success');
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Product name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₹)">
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Sale price (₹)">
              <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="Optional" />
            </Field>
            <Field label="Stock">
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label="Unit">
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. 1 kg, 500 g, pcs" />
            </Field>
            <Field label="Category">
              <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Offer label">
              <Input value={form.offer_label} onChange={(e) => setForm({ ...form, offer_label: e.target.value })} placeholder="e.g. 20% OFF" />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
              In stock
            </label>
          </div>

          {/* Image upload */}
          <div>
            <Label>Product Images</Label>
            <div className="mt-1 rounded-xl border-2 border-dashed border-slate-300 p-4">
              <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-red-600 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                  <Upload className="h-5 w-5" />
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">{files.length} file(s) selected</span>
                  <Button type="button" size="sm" variant="outline" onClick={handleUpload} loading={uploading}>
                    Upload
                  </Button>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-400">Select files, then click Upload. Images are stored in Supabase Storage.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{product ? 'Save changes' : 'Create product'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
