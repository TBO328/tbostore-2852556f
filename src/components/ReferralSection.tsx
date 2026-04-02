import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Gift, Share2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ReferralSection: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        supabase.from('profiles').select('referral_code').eq('user_id', user.id).single(),
        supabase.rpc('get_referral_stats', { p_user_id: user.id }),
      ]);
      if (profileRes.data?.referral_code) {
        setReferralCode(profileRes.data.referral_code);
      }
      if (statsRes.data && statsRes.data.length > 0) {
        setTotalReferrals(Number(statsRes.data[0].total_referrals));
        setTotalPoints(Number(statsRes.data[0].total_points_earned));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: language === 'en' ? 'Link Copied!' : 'تم نسخ الرابط!',
        description: language === 'en' ? 'Share it with your friends' : 'شاركه مع أصدقائك',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? 'Join TBO Store!' : 'انضم لمتجر TBO!',
          text: language === 'en'
            ? 'Sign up using my referral link and we both earn points!'
            : 'سجل عبر رابط الإحالة الخاص بي واحصل على مكافأة!',
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (!user || loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                {language === 'en' ? 'Refer & Earn' : 'أحِل واكسب'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Earn 50 points for each friend who signs up!'
                  : 'اكسب 50 نقطة مع كل صديق يسجل!'}
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-muted/50 rounded-xl p-3 mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <code className="text-xs flex-1 text-foreground truncate select-all" dir="ltr">
              {referralLink}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="shrink-0 h-8 w-8 p-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-5">
            <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2" size="sm">
              <Copy className="w-4 h-4" />
              {language === 'en' ? 'Copy Link' : 'نسخ الرابط'}
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2" size="sm">
              <Share2 className="w-4 h-4" />
              {language === 'en' ? 'Share' : 'مشاركة'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/80 rounded-xl p-3 text-center border border-border/50">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Friends Invited' : 'أصدقاء مُحالين'}
              </p>
            </div>
            <div className="bg-card/80 rounded-xl p-3 text-center border border-border/50">
              <Gift className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Points Earned' : 'نقاط مكتسبة'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReferralSection;
