import { useEffect, useState, useCallback } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Field, Input, Textarea, Label } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const SETTING_KEYS = [
  'store_name',
  'store_tagline',
  'hero_title',
  'hero_subtitle',
  'about_text',
  'contact_phone',
  'contact_email',
  'contact_address',
  'footer_text',
];

const LABELS: Record<string, string> = {
  store_name: 'Store Name',
  store_tagline: 'Store Tagline',
  hero_title: 'Hero Title',
  hero_subtitle: 'Hero Subtitle',
  about_text: 'About Text',
  contact_phone: 'Contact Phone',
  contact_email: 'Contact Email',
  contact_address: 'Contact Address',
  footer_text: 'Footer Text',
};

export default function AdminSettings() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('key, value');
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: { key: string; value: string | null }) => {
      map[r.key] = r.value ?? '';
    });
    SETTING_KEYS.forEach((k) => { if (!(k in map)) map[k] = ''; });
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) notify(error.message, 'error');
    else notify('Settings saved. Changes are live on the site.', 'success');
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-slate-900">Website Settings</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">Edit your website content. Changes appear instantly on the live store.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={LABELS.store_name}>
            <Input value={settings.store_name || ''} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} />
          </Field>
          <Field label={LABELS.store_tagline}>
            <Input value={settings.store_tagline || ''} onChange={(e) => setSettings({ ...settings, store_tagline: e.target.value })} />
          </Field>
        </div>
        <Field label={LABELS.hero_title}>
          <Input value={settings.hero_title || ''} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} />
        </Field>
        <Field label={LABELS.hero_subtitle}>
          <Textarea rows={2} value={settings.hero_subtitle || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} />
        </Field>
        <Field label={LABELS.about_text}>
          <Textarea rows={4} value={settings.about_text || ''} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={LABELS.contact_phone}>
            <Input value={settings.contact_phone || ''} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} />
          </Field>
          <Field label={LABELS.contact_email}>
            <Input value={settings.contact_email || ''} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
          </Field>
        </div>
        <Field label={LABELS.contact_address}>
          <Input value={settings.contact_address || ''} onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })} />
        </Field>
        <Field label={LABELS.footer_text}>
          <Input value={settings.footer_text || ''} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} />
        </Field>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving} size="lg">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
