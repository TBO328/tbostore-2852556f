import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Copy, Users, DollarSign, ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_percent: number;
  total_earnings: number;
  total_orders: number;
  is_active: boolean;
  channel_name: string | null;
  channel_url: string | null;
  created_at: string;
}

const AffiliateManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    user_email: '',
    affiliate_code: '',
    commission_percent: '10',
    channel_name: '',
    channel_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAffiliates(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase.from('affiliates').update({
          affiliate_code: form.affiliate_code,
          commission_percent: parseFloat(form.commission_percent),
          channel_name: form.channel_name || null,
          channel_url: form.channel_url || null,
          is_active: form.is_active,
        }).eq('id', editing.id);
        if (error) throw error;
        toast({ title: language === 'ar' ? 'تم التحديث' : 'Updated!' });
      } else {
        // Find user by email
        const { data: users } = await supabase.rpc('search_users_for_admin', { p_search_term: form.user_email });
        const user = users?.find((u: any) => u.email === form.user_email);
        if (!user) {
          toast({ title: language === 'ar' ? 'المستخدم غير موجود' : 'User not found', variant: 'destructive' });
          return;
        }
        const { error } = await supabase.from('affiliates').insert({
          user_id: user.user_id,
          affiliate_code: form.affiliate_code,
          commission_percent: parseFloat(form.commission_percent),
          channel_name: form.channel_name || null,
          channel_url: form.channel_url || null,
          is_active: form.is_active,
        });
        if (error) throw error;
        toast({ title: language === 'ar' ? 'تمت الإضافة' : 'Added!' });
      }
      setDialogOpen(false);
      resetForm();
      fetchAffiliates();
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ user_email: '', affiliate_code: '', commission_percent: '10', channel_name: '', channel_url: '', is_active: true });
  };

  const editAffiliate = (a: Affiliate) => {
    setEditing(a);
    setForm({
      user_email: '',
      affiliate_code: a.affiliate_code,
      commission_percent: a.commission_percent.toString(),
      channel_name: a.channel_name || '',
      channel_url: a.channel_url || '',
      is_active: a.is_active,
    });
    setDialogOpen(true);
  };

  const deleteAffiliate = async (id: string) => {
    if (!confirm(language === 'ar' ? 'حذف هذا الشريك؟' : 'Delete this affiliate?')) return;
    await supabase.from('affiliates').delete().eq('id', id);
    fetchAffiliates();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: language === 'ar' ? 'تم النسخ' : 'Copied!' });
  };

  const totalEarnings = affiliates.reduce((s, a) => s + Number(a.total_earnings), 0);
  const totalOrders = affiliates.reduce((s, a) => s + a.total_orders, 0);

  const filtered = affiliates.filter(a =>
    a.affiliate_code.toLowerCase().includes(search.toLowerCase()) ||
    (a.channel_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'ar' ? 'إدارة الشراكات' : 'Affiliate Management'}
        </h2>
        <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="neon-filled"><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'إضافة شريك' : 'Add Affiliate'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? (language === 'ar' ? 'تعديل الشريك' : 'Edit Affiliate') : (language === 'ar' ? 'إضافة شريك جديد' : 'Add Affiliate')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'البريد الإلكتروني للمستخدم' : 'User Email'}</Label>
                  <Input value={form.user_email} onChange={e => setForm({ ...form, user_email: e.target.value })} required />
                </div>
              )}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'كود الشراكة' : 'Affiliate Code'}</Label>
                <Input value={form.affiliate_code} onChange={e => setForm({ ...form, affiliate_code: e.target.value.toUpperCase() })} required placeholder="e.g. STREAMER10" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نسبة العمولة %' : 'Commission %'}</Label>
                <Input type="number" min="1" max="100" value={form.commission_percent} onChange={e => setForm({ ...form, commission_percent: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم القناة' : 'Channel Name'}</Label>
                <Input value={form.channel_name} onChange={e => setForm({ ...form, channel_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'رابط القناة' : 'Channel URL'}</Label>
                <Input value={form.channel_url} onChange={e => setForm({ ...form, channel_url: e.target.value })} placeholder="https://twitch.tv/..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={checked => setForm({ ...form, is_active: checked })} />
                <Label>{language === 'ar' ? 'فعّال' : 'Active'}</Label>
              </div>
              <Button type="submit" variant="neon-filled" className="w-full">
                {editing ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الشركاء' : 'Total Affiliates'}</p>
            <p className="text-xl font-bold text-foreground">{affiliates.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-500" /></div>
          <div>
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي العمولات' : 'Total Earnings'}</p>
            <p className="text-xl font-bold text-foreground">{totalEarnings.toFixed(2)} SAR</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'طلبات عبر الشركاء' : 'Affiliate Orders'}</p>
            <p className="text-xl font-bold text-foreground">{totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {a.affiliate_code.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-foreground">{a.affiliate_code}</span>
                    <button onClick={() => copyCode(a.affiliate_code)} className="text-muted-foreground hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {a.is_active ? (language === 'ar' ? 'فعّال' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.channel_name || (language === 'ar' ? 'بدون اسم' : 'No name')} • {a.commission_percent}% • {a.total_orders} {language === 'ar' ? 'طلب' : 'orders'} • {Number(a.total_earnings).toFixed(2)} SAR
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => editAffiliate(a)} className="hover:bg-primary/10 hover:text-primary"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteAffiliate(a.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{language === 'ar' ? 'لا يوجد شركاء' : 'No affiliates yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateManagement;
