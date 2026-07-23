import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import type { Banner } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Field, Input, Textarea, Label } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AdminBanners() {
  const { notify } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('position', { ascending: true });
    setBanners((data ?? []) as Banner[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(b: Banner) {
    const { error } = await supabase.from('banners').update({ active: !b.active }).eq('id', b.id);
    if (error) notify(error.message, 'error');
    else load();
  }

  async function handleDelete(b: Banner) {
    if (!confirm('Delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', b.id);
    if (error) notify(error.message, 'error');
    else { notify('Banner deleted', 'success'); load(); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Homepage Banners</h2>
          <p className="text-sm text-slate-500">{banners.length} banner slides</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>
      ) : banners.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">No banners yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative h-36 bg-slate-100">
                {b.image_url ? <img src={b.image_url} alt={b.title || ''} className="h-full w-full object-cover" /> : (
                  <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon className="h-8 w-8" /></div>
                )}
                <button
                  onClick={() => toggleActive(b)}
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${b.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'}`}
                >
                  {b.active ? 'Active' : 'Hidden'}
                </button>
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-800">{b.title || 'Untitled'}</p>
                <p className="text-sm text-slate-500 line-clamp-1">{b.subtitle}</p>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => { setEditing(b); setShowForm(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(b)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerForm banner={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function BannerForm({ banner, onClose, onSaved }: { banner: Banner | null; onClose: () => void; onSaved: () => void }) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image_url: banner?.image_url || '',
    link: banner?.link || '',
    position: banner?.position?.toString() || '0',
    active: banner?.active ?? true,
  });

  async function handleUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadImage(file, 'banners');
    setUploading(false);
    if (error) notify(error, 'error');
    else if (url) setForm({ ...form, image_url: url });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      image_url: form.image_url || null,
      link: form.link || null,
      position: Number(form.position) || 0,
      active: form.active,
    };
    let error;
    if (banner) {
      ({ error } = await supabase.from('banners').update(payload).eq('id', banner.id));
    } else {
      ({ error } = await supabase.from('banners').insert(payload));
    }
    setSaving(false);
    if (error) notify(error.message, 'error');
    else { notify(banner ? 'Banner updated' : 'Banner created', 'success'); onSaved(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{banner ? 'Edit Banner' : 'Add Banner'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Subtitle"><Textarea rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></Field>
          <Field label="Link (optional)"><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/categories" /></Field>
          <Field label="Position"><Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
          <div>
            <Label>Image</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.image_url && <img src={form.image_url} alt="" className="h-20 w-32 rounded-xl object-cover" />}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload image'}
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
            Active (show on homepage)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{banner ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
