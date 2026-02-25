import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Coins, Gift, TrendingUp, History, Star, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { usePageContent } from '@/hooks/usePageContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const LoyaltyPoints: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { 
    points, 
    totalEarned, 
    totalRedeemed, 
    transactions, 
    loading,
    calculateValueFromPoints 
  } = useLoyaltyPoints();
  const { getText } = usePageContent('loyalty_program');

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const pointsValue = calculateValueFromPoints(points);

  const stats = [
    {
      icon: Coins,
      label: language === 'en' ? 'Current Balance' : 'الرصيد الحالي',
      value: points.toLocaleString(),
      subValue: `${pointsValue.toFixed(1)} ${language === 'en' ? 'SAR' : 'ريال'}`,
      color: 'primary'
    },
    {
      icon: TrendingUp,
      label: language === 'en' ? 'Total Earned' : 'إجمالي المكتسب',
      value: totalEarned.toLocaleString(),
      subValue: language === 'en' ? 'points' : 'نقطة',
      color: 'green'
    },
    {
      icon: Gift,
      label: language === 'en' ? 'Total Redeemed' : 'إجمالي المستبدل',
      value: totalRedeemed.toLocaleString(),
      subValue: language === 'en' ? 'points' : 'نقطة',
      color: 'secondary'
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: language === 'en' ? 'Earn with Every Purchase' : 'اكسب مع كل عملية شراء',
      desc: language === 'en' ? '1 point for every 1 SAR spent' : '1 نقطة لكل 1 ريال'
    },
    {
      icon: Gift,
      title: language === 'en' ? 'Redeem for Discounts' : 'استبدل للحصول على خصومات',
      desc: language === 'en' ? '1 point = 0.1 SAR value' : '1 نقطة = 0.1 ريال'
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Exclusive Rewards' : 'مكافآت حصرية',
      desc: language === 'en' ? 'Special offers for members' : 'عروض خاصة للأعضاء'
    }
  ];

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-cairo">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Back Link */}
        <Link 
          to="/profile" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowRight className={`w-4 h-4 ${language === 'ar' ? '' : 'rotate-180'}`} />
          <span>{language === 'en' ? 'Back to Profile' : 'العودة للملف الشخصي'}</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl"
            >
              <Coins className="w-8 h-8 text-amber-500" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {getText('title', language === 'en' ? 'Loyalty Points' : 'نقاط الولاء')}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {getText('content', language === 'en' 
              ? 'Earn points with every purchase and redeem them for discounts!'
              : 'اكسب نقاط مع كل عملية شراء واستبدلها بخصومات!'
            )}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 text-${stat.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.subValue}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {language === 'en' ? 'How It Works' : 'كيف يعمل البرنامج'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-card/30 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                {language === 'en' ? 'Transaction History' : 'سجل المعاملات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <Coins className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'No transactions yet. Start shopping to earn points!'
                      : 'لا توجد معاملات بعد. ابدأ التسوق لكسب النقاط!'
                    }
                  </p>
                  <Link to="/products">
                    <Button variant="neon" className="mt-4">
                      {language === 'en' ? 'Shop Now' : 'تسوق الآن'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {language === 'en' ? tx.description_en : tx.description_ar}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA')}
                        </p>
                      </div>
                      <span className={`font-bold ${tx.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default LoyaltyPoints;
