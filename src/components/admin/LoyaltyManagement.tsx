import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Users, TrendingUp, Gift, Pencil, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyStats {
  totalUsers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeUsers: number;
}

interface LoyaltyContent {
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  metadata: {
    points_value: number;
    points_per_sar: number;
  };
}

const LoyaltyManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<LoyaltyStats>({
    totalUsers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    activeUsers: 0
  });
  const [content, setContent] = useState<LoyaltyContent>({
    title_en: 'Loyalty Points',
    title_ar: 'نقاط الولاء',
    content_en: 'Earn points with every purchase and redeem them for discounts!',
    content_ar: 'اكسب نقاط مع كل عملية شراء واستبدلها بخصومات!',
    metadata: {
      points_value: 0.1,
      points_per_sar: 1
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch loyalty stats
      const { data: pointsData } = await supabase
        .from('loyalty_points')
        .select('*');

      if (pointsData) {
        setStats({
          totalUsers: pointsData.length,
          totalPointsIssued: pointsData.reduce((sum, p) => sum + (p.total_earned || 0), 0),
          totalPointsRedeemed: pointsData.reduce((sum, p) => sum + (p.total_redeemed || 0), 0),
          activeUsers: pointsData.filter(p => p.points > 0).length
        });
      }

      // Fetch content
      const { data: contentData } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'loyalty_program')
        .single();

      if (contentData) {
        setContent({
          title_en: contentData.title_en || 'Loyalty Points',
          title_ar: contentData.title_ar || 'نقاط الولاء',
          content_en: contentData.content_en || '',
          content_ar: contentData.content_ar || '',
          metadata: (contentData.metadata as LoyaltyContent['metadata']) || { points_value: 0.1, points_per_sar: 1 }
        });
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_key: 'loyalty_program',
          title_en: content.title_en,
          title_ar: content.title_ar,
          content_en: content.content_en,
          content_ar: content.content_ar,
          metadata: content.metadata,
          updated_at: new Date().toISOString()
        }, { onConflict: 'page_key' });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Settings saved!' : 'تم حفظ الإعدادات!'
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: language === 'en' ? 'Error saving settings' : 'خطأ في حفظ الإعدادات',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: language === 'en' ? 'Total Members' : 'إجمالي الأعضاء',
      value: stats.totalUsers,
      color: 'primary'
    },
    {
      icon: TrendingUp,
      label: language === 'en' ? 'Points Issued' : 'النقاط الممنوحة',
      value: stats.totalPointsIssued.toLocaleString(),
      color: 'green'
    },
    {
      icon: Gift,
      label: language === 'en' ? 'Points Redeemed' : 'النقاط المستبدلة',
      value: stats.totalPointsRedeemed.toLocaleString(),
      color: 'secondary'
    },
    {
      icon: Coins,
      label: language === 'en' ? 'Active Members' : 'الأعضاء النشطين',
      value: stats.activeUsers,
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Coins className="w-6 h-6 text-amber-500" />
          {language === 'en' ? 'Loyalty Program Management' : 'إدارة برنامج الولاء'}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Content Editor */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            {language === 'en' ? 'Program Content' : 'محتوى البرنامج'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Title (English)' : 'العنوان (إنجليزي)'}</Label>
              <Input
                value={content.title_en}
                onChange={(e) => setContent({ ...content, title_en: e.target.value })}
                placeholder="Loyalty Points"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Title (Arabic)' : 'العنوان (عربي)'}</Label>
              <Input
                value={content.title_ar}
                onChange={(e) => setContent({ ...content, title_ar: e.target.value })}
                placeholder="نقاط الولاء"
                dir="rtl"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description (English)' : 'الوصف (إنجليزي)'}</Label>
              <Textarea
                value={content.content_en}
                onChange={(e) => setContent({ ...content, content_en: e.target.value })}
                placeholder="Earn points with every purchase..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description (Arabic)' : 'الوصف (عربي)'}</Label>
              <Textarea
                value={content.content_ar}
                onChange={(e) => setContent({ ...content, content_ar: e.target.value })}
                placeholder="اكسب نقاط مع كل عملية شراء..."
                dir="rtl"
                rows={3}
              />
            </div>
          </div>

          {/* Points Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Point Value (SAR)' : 'قيمة النقطة (ريال)'}</Label>
              <Input
                type="number"
                step="0.01"
                value={content.metadata.points_value}
                onChange={(e) => setContent({
                  ...content,
                  metadata: { ...content.metadata, points_value: parseFloat(e.target.value) || 0.1 }
                })}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? '1 point = 0.1 SAR by default' : '1 نقطة = 0.1 ريال افتراضياً'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Points per SAR' : 'النقاط لكل ريال'}</Label>
              <Input
                type="number"
                value={content.metadata.points_per_sar}
                onChange={(e) => setContent({
                  ...content,
                  metadata: { ...content.metadata, points_per_sar: parseInt(e.target.value) || 1 }
                })}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'How many points earned per 1 SAR spent' : 'كم نقطة تُكتسب لكل 1 ريال'}
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {language === 'en' ? 'Save Settings' : 'حفظ الإعدادات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyManagement;
