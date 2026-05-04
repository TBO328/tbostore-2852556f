import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Share2, ArrowLeft, Twitter, Youtube, Twitch, Instagram, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Scroll3DWrapper from '@/components/Scroll3DWrapper';

interface Profile {
  id: string;
  slug: string;
  display_name: string;
  bio_ar: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  social_links: Record<string, string> | null;
}

interface PortfolioItem {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  media_url: string;
  media_type: string;
  media_files: any;
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  instagram: Instagram,
  website: Globe,
};

const StreamerProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isAr = language === 'ar';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      const { data: p } = await supabase
        .from('streamer_profiles')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (p) {
        setProfile(p as any);
        const { data: links } = await supabase
          .from('streamer_portfolio_items')
          .select('portfolio_item_id, display_order, portfolio_items(*)')
          .eq('streamer_id', p.id)
          .order('display_order', { ascending: true });

        const portfolioItems = (links || [])
          .map((l: any) => l.portfolio_items)
          .filter(Boolean);
        setItems(portfolioItems);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.display_name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: isAr ? 'تم نسخ الرابط' : 'Link copied' });
      }
    } catch {
      // user cancelled
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{isAr ? 'البروفايل غير موجود' : 'Profile not found'}</h1>
        <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />{isAr ? 'الرئيسية' : 'Home'}</Button></Link>
      </div>
    );
  }

  const bio = isAr ? profile.bio_ar : profile.bio_en;
  const social = profile.social_links || {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / Banner */}
      <section className="relative pt-20">
        <div
          className="h-64 md:h-80 w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 relative overflow-hidden"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-card overflow-hidden shadow-2xl shadow-primary/30">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-neon flex items-center justify-center text-4xl font-bold text-primary-foreground">
                  {profile.display_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-start">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-gradient-neon">{profile.display_name}</h1>
              {bio && <p className="text-muted-foreground mt-2 max-w-2xl">{bio}</p>}
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {Object.entries(social).map(([key, url]) => {
                  if (!url) return null;
                  const Icon = SOCIAL_ICONS[key.toLowerCase()] || Globe;
                  return (
                    <a key={key} href={url as string} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Icon className="w-4 h-4" />
                      </Button>
                    </a>
                  );
                })}
                <Button variant="neon-filled" onClick={handleShare} className="rounded-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  {isAr ? 'مشاركة' : 'Share'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 text-center">
          {isAr ? 'أعماله معنا' : 'Works with us'}
        </h2>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {isAr ? 'لا توجد أعمال مضافة بعد' : 'No works added yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Scroll3DWrapper key={item.id} intensity={0.6}>
                <Link to={`/portfolio/${item.id}`}>
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 shadow-card transition-all">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {item.media_type === 'video' ? (
                        <video src={item.media_url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={item.media_url} alt={isAr ? item.title_ar : item.title_en} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground">{isAr ? item.title_ar : item.title_en}</h3>
                      {(isAr ? item.description_ar : item.description_en) && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {isAr ? item.description_ar : item.description_en}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </Scroll3DWrapper>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default StreamerProfile;
