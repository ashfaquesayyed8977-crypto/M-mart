import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import type { Category } from '@/types';
import { slugify } from '@/lib/helpers';
import { useToast } from '@/context/ToastContext';
import { Field, Input, Textarea, Label } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AdminCategories() {
  const { notify } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(c: Category) {
    if (!confirm(`Delete category "${c.name}"? Products will be uncategorized.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) notify(error.message, 'error');
    else {
      notify('Category deleted', 'success');
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">{categories.length} categories</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>
      ) : categories.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderTree className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No categories yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {c.image_url ? <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500">/{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setShowForm(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order?.toString() || '0',
  });

  async function handleUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadImage(file, 'categories');
    setUploading(false);
    if (error) notify(error, 'error');
    else if (url) setForm({ ...form, image_url: url });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { notify('Name is required.', 'error'); return; }
    setSaving(true);
    const slug = (category?.slug ?? slugify(form.name)) + (category ? '' : '-' + Math.random().toString(36).slice(2, 5));
    const payload = {
      name: form.name,
      slug,
      description: form.description,
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
    };
    let error;
    if (category) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', category.id));
    } else {
      ({ error } = await supabase.from('categories').insert(payload));
    }
    setSaving(false);
    if (error) notify(error.message, 'error');
    else { notify(category ? 'Category updated' : 'Category created', 'success'); onSaved(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Sort order"><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
          <div>
            <Label>Image</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload image'}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{category ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
