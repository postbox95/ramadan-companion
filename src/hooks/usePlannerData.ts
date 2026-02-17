import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getTodayDateString } from '@/lib/ramadan';

export function usePlannerData() {
  const { user } = useAuth();
  const today = getTodayDateString();
  const [profile, setProfile] = useState<any>(null);
  const [dua, setDua] = useState<any>(null);
  const [prayers, setPrayers] = useState<Record<string, boolean>>({
    fajr: false, zohar: false, asr: false, maghrib: false, isha: false, taraweeh: false,
  });
  const [entry, setEntry] = useState({ reflection: '', suhoor_plan: '', iftar_plan: '', notes: '' });
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Update streak
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (prof) {
      const lastLogin = prof.last_login_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prof.current_streak;
      if (lastLogin !== today) {
        newStreak = lastLogin === yesterdayStr ? prof.current_streak + 1 : 1;
        await supabase.from('profiles').update({ current_streak: newStreak, last_login_date: today }).eq('user_id', user.id);
      }
      setProfile({ ...prof, current_streak: newStreak, last_login_date: today });
    }

    // Dua of the day
    const { data: duaHistory } = await supabase.from('user_dua_history').select('dua_id').eq('user_id', user.id).order('shown_date', { ascending: false }).limit(30);
    const excludeIds = duaHistory?.map(h => h.dua_id) || [];
    const { data: allDuas } = await supabase.from('duas').select('*');
    if (allDuas) {
      // Check if today already has a dua
      const { data: todayDua } = await supabase.from('user_dua_history').select('dua_id').eq('user_id', user.id).eq('shown_date', today).maybeSingle();
      if (todayDua) {
        setDua(allDuas.find(d => d.id === todayDua.dua_id));
      } else {
        const available = allDuas.filter(d => !excludeIds.includes(d.id));
        const pool = available.length > 0 ? available : allDuas;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        await supabase.from('user_dua_history').insert({ user_id: user.id, dua_id: picked.id, shown_date: today });
        setDua(picked);
      }
    }

    // Prayers
    const { data: prayerData } = await supabase.from('prayer_status').select('*').eq('user_id', user.id).eq('prayer_date', today).maybeSingle();
    if (prayerData) {
      setPrayers({ fajr: prayerData.fajr, zohar: prayerData.zohar, asr: prayerData.asr, maghrib: prayerData.maghrib, isha: prayerData.isha, taraweeh: prayerData.taraweeh });
    }

    // Daily entry
    const { data: entryData } = await supabase.from('daily_entries').select('*').eq('user_id', user.id).eq('entry_date', today).maybeSingle();
    if (entryData) {
      setEntry({ reflection: entryData.reflection || '', suhoor_plan: entryData.suhoor_plan || '', iftar_plan: entryData.iftar_plan || '', notes: entryData.notes || '' });
    }

    // Checklist
    const { data: items } = await supabase.from('checklist_items').select('*').eq('user_id', user.id).order('sort_order');
    setChecklistItems(items || []);

    const { data: comps } = await supabase.from('checklist_completions').select('*').eq('user_id', user.id).eq('completion_date', today);
    const compMap: Record<string, boolean> = {};
    comps?.forEach(c => { compMap[c.item_id] = c.completed; });
    setCompletions(compMap);

    setLoading(false);
  }, [user, today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const togglePrayer = async (prayer: string) => {
    if (!user) return;
    const newVal = !prayers[prayer];
    setPrayers(p => ({ ...p, [prayer]: newVal }));
    await supabase.from('prayer_status').upsert({
      user_id: user.id, prayer_date: today, ...prayers, [prayer]: newVal,
    }, { onConflict: 'user_id,prayer_date' });
  };

  const saveEntry = useCallback(async (field: string, value: string) => {
    if (!user) return;
    setEntry(prev => ({ ...prev, [field]: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await supabase.from('daily_entries').upsert({
        user_id: user.id, entry_date: today, ...entry, [field]: value,
      }, { onConflict: 'user_id,entry_date' });
    }, 800);
  }, [user, today, entry]);

  const addChecklistItem = async (title: string) => {
    if (!user) return;
    const sortOrder = checklistItems.length;
    const { data } = await supabase.from('checklist_items').insert({ user_id: user.id, title, sort_order: sortOrder }).select().single();
    if (data) setChecklistItems(prev => [...prev, data]);
  };

  const deleteChecklistItem = async (id: string) => {
    if (!user) return;
    await supabase.from('checklist_items').delete().eq('id', id);
    setChecklistItems(prev => prev.filter(i => i.id !== id));
    const newComps = { ...completions };
    delete newComps[id];
    setCompletions(newComps);
  };

  const toggleChecklistItem = async (itemId: string) => {
    if (!user) return;
    const newVal = !completions[itemId];
    setCompletions(prev => ({ ...prev, [itemId]: newVal }));
    await supabase.from('checklist_completions').upsert({
      user_id: user.id, item_id: itemId, completion_date: today, completed: newVal,
    }, { onConflict: 'user_id,item_id,completion_date' });
  };

  const reorderChecklist = async (newItems: any[]) => {
    setChecklistItems(newItems);
    for (let i = 0; i < newItems.length; i++) {
      await supabase.from('checklist_items').update({ sort_order: i }).eq('id', newItems[i].id);
    }
  };

  const clearDailyFields = () => {
    setPrayers({ fajr: false, zohar: false, asr: false, maghrib: false, isha: false, taraweeh: false });
    setEntry({ reflection: '', suhoor_plan: '', iftar_plan: '', notes: '' });
    setCompletions({});
  };

  return {
    profile, dua, prayers, entry, checklistItems, completions, loading,
    togglePrayer, saveEntry, addChecklistItem, deleteChecklistItem,
    toggleChecklistItem, reorderChecklist, clearDailyFields,
  };
}
