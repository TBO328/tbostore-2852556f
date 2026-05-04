import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
  id: string;
  slug: string;
  display_name: string;
  bio_ar: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  social_links: any;
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  title_ar: string;
  title_en: string;
}

const blank = {
  slug: '',
  display_name: '',
  bio_ar: '',
  bio_en: '',
  avatar_url: '',
  banner_url: '',
  twitter: '',
  youtube: '',
  twitch: '',
  instagram: '',
  website: '',
  is_active: true,
};

const StreamerProfilesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isAr = language === 'ar';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState(blank);

  // Linking
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [savingLinks, setSavingLinks] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('streamer_profiles').select('*').order('created_at', { ascending: false });
    setProfiles((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null);
    setForm(blank);
  };

  const openEdit = (p: Profile) => {
    setEditing(p);
    const s = p.social_links || {};
    setForm({
      slug: p.slug,
      display_name: p.display_name,
      bio_ar: p.bio_ar || '',
      bio_en: p.bio_en || '',
      avatar_url: p.avatar_url || '',
      banner_url: p.banner_url || '',
      twitter: s.twitter || '',
      youtube: s.youtube || '',
      twitch: s.twitch || '',
      instagram: s.instagram || '',
      website: s.website || '',
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      display_name: form.display_name,
      bio_ar: form.bio_ar || null,
      bio_en: form.bio_en || null,
      avatar_url: form.avatar_url || null,
      banner_url: form.banner_url || null,
      social_links: {
        twitter: form.twitter,
        youtube: form.youtube,
        twitch: form.twitch,
        instagram: form.instagram,
        website: form.website,
      },
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from('streamer_profiles').update(payload).eq('id', editing.id)
      : await supabase.from('streamer_profiles').insert(payload);

    if (error) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: isAr ? 'تم الحفظ' : 'Saved' });
    setDialogOpen(false);
    reset();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(isAr ? 'حذف البروفايل؟' : 'Delete profile?')) return;
    await supabase.from('streamer_profiles').delete().eq('id', id);
    load();
  };

  const openLinks = async (p: Profile) => {
    setActiveProfile(p);
    const [{ data: items }, { data: links }] = await Promise.all([
      supabase.from('portfolio_items').select('id, title_ar, title_en').order('created_at', { ascending: false }),
      supabase.from('streamer_portfolio_items').select('portfolio_item_id').eq('streamer_id', p.id),
    ]);
    setAllItems((items as any) || []);
    setSelectedItemIds(new Set((links || []).map((l: any) => l.portfolio_item_id)));
    setLinkDialogOpen(true);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const saveLinks = async () => {
    if (!activeProfile) return;
    setSavingLinks(true);
    await supabase.from('streamer_portfolio_items').delete().eq('streamer_id', activeProfile.id);
    if (selectedItemIds.size > 0) {
      const rows = Array.from(selectedItemIds).map((portfolio_item_id, i) => ({
        streamer_id: activeProfile.id,
        portfolio_item_id,
        display_order: i,
      }));
      await supabase.from('streamer_portfolio_items').insert(rows);
    }
    setSavingLinks(false);
    setLinkDialogOpen(false);
    toast({ title: isAr ? 'تم تحديث الأعمال' : 'Works updated' });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">{isAr ? 'بروفايلات الستريمرز' : 'Streamer Profiles'}</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button variant="neon-filled"><Plus className="w-4 h-4 mr-2" />{isAr ? 'إضافة بروفايل' : 'Add Profile'}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? (isAr ? 'تعديل' : 'Edit') : (isAr ? 'إضافة بروفايل' : 'Add Profile')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? 'الرابط (slug)' : 'URL slug'}</Label>
                  <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="my-streamer" required />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'اسم العرض' : 'Display name'}</Label>
                  <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? 'النبذة (عربي)' : 'Bio (AR)'}</Label>
                  <Textarea value={form.bio_ar} onChange={e => setForm({ ...form, bio_ar: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>Bio (EN)</Label>
                  <Textarea value={form.bio_en} onChange={e => setForm({ ...form, bio_en: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? 'صورة شخصية (رابط)' : 'Avatar URL'}</Label>
                  <Input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'صورة الغلاف (رابط)' : 'Banner URL'}</Label>
                  <Input value={form.banner_url} onChange={e => setForm({ ...form, banner_url: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['twitter', 'youtube', 'twitch', 'instagram', 'website'] as const).map(k => (
                  <div key={k} className="space-y-2">
                    <Label className="capitalize">{k}</Label>
                    <Input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder="https://..." />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
                <Label>{isAr ? 'مفعل' : 'Active'}</Label>
              </div>
              <Button type="submit" variant="neon-filled" className="w-full">{isAr ? 'حفظ' : 'Save'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{p.display_name}</h3>
                <p className="text-xs text-muted-foreground truncate">/streamer/{p.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="outline" size="sm" onClick={() => openLinks(p)}>
                <LinkIcon className="w-3.5 h-3.5 mr-1" />{isAr ? 'الأعمال' : 'Works'}
              </Button>
              <a href={`/streamer/${p.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
              </a>
              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            {isAr ? 'لا توجد بروفايلات بعد' : 'No profiles yet'}
          </div>
        )}
      </div>

      {/* Link works dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isAr ? `ربط الأعمال - ${activeProfile?.display_name}` : `Link works - ${activeProfile?.display_name}`}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-3">
            <div className="space-y-2">
              {allItems.map(item => (
                <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <Checkbox checked={selectedItemIds.has(item.id)} onCheckedChange={() => toggleItem(item.id)} />
                  <span className="text-sm">{isAr ? item.title_ar : item.title_en}</span>
                </label>
              ))}
              {allItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{isAr ? 'لا توجد أعمال متاحة' : 'No portfolio items'}</p>}
            </div>
          </ScrollArea>
          <Button onClick={saveLinks} disabled={savingLinks} variant="neon-filled" className="w-full">
            {savingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAr ? 'حفظ' : 'Save')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamerProfilesManagement;
