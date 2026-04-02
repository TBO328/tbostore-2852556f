import React, { useState, useEffect } from 'react';
import { Users, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string;
  points_awarded: number;
  created_at: string;
  referrer_email?: string;
  referred_email?: string;
}

const ReferralsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      // Get referrals
      const { data: refs, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!refs || refs.length === 0) {
        setReferrals([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs
      const userIds = [...new Set(refs.flatMap(r => [r.referrer_id, r.referred_id]))];
      
      // Get emails via the admin function
      const { data: users } = await supabase.rpc('get_all_users_with_roles');
      
      const emailMap: Record<string, string> = {};
      if (users) {
        users.forEach((u: any) => {
          emailMap[u.user_id] = u.email;
        });
      }

      const enriched = refs.map(r => ({
        ...r,
        referrer_email: emailMap[r.referrer_id] || r.referrer_id,
        referred_email: emailMap[r.referred_id] || r.referred_id,
      }));

      setReferrals(enriched);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = referrals.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.referrer_email?.toLowerCase().includes(s) ||
      r.referred_email?.toLowerCase().includes(s)
    );
  });

  const totalPoints = referrals.reduce((sum, r) => sum + r.points_awarded, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {language === 'en' ? 'Referrals Management' : 'إدارة الإحالات'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Total Referrals' : 'إجمالي الإحالات'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Points Awarded' : 'نقاط ممنوحة'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Points per Referral' : 'نقاط لكل إحالة'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={language === 'en' ? 'Search by email...' : 'بحث بالبريد...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'No referrals yet' : 'لا توجد إحالات بعد'}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start p-3 text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Referrer (Inviter)' : 'الداعي'}
                  </th>
                  <th className="text-start p-3 text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Referred (Invitee)' : 'المدعو'}
                  </th>
                  <th className="text-start p-3 text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Points' : 'النقاط'}
                  </th>
                  <th className="text-start p-3 text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Date' : 'التاريخ'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-sm text-foreground" dir="ltr">{r.referrer_email}</td>
                    <td className="p-3 text-sm text-foreground" dir="ltr">{r.referred_email}</td>
                    <td className="p-3 text-sm font-medium text-primary">+{r.points_awarded}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReferralsManagement;
