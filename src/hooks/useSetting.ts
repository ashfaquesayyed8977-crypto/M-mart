import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Settings = Record<string, string>;

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.from('settings').select('key, value');
      if (!mounted) return;
      const map: Settings = {};
      (data ?? []).forEach((r: { key: string; value: string | null }) => {
        map[r.key] = r.value ?? '';
      });
      setSettings(map);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading };
}
