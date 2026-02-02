import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import tboStoreLogo from '@/assets/tbo-store-logo.png';
import footerWave from '@/assets/footer-wave.png';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const quickLinks = [
    { label: { en: 'Home', ar: 'الرئيسية' }, to: '/' },
    { label: { en: 'Products', ar: 'المنتجات' }, to: '/products' },
    { label: { en: 'About Us', ar: 'من نحن' }, to: '/about' },
    { label: { en: 'Reviews', ar: 'التقييمات' }, to: '/reviews' },
    { label: { en: 'Contact', ar: 'اتصل بنا' }, to: '/contact' },
  ];

  const categories = [
    { label: { en: 'Subscriptions', ar: 'اشتراكات' }, to: '/products' },
    { label: { en: 'Designs', ar: 'تصاميم' }, to: '/products' },
    { label: { en: 'Engagement', ar: 'تفاعل' }, to: '/products' },
    { label: { en: 'Discord', ar: 'ديسكورد' }, to: '/products' },
  ];

  return (
    <>
      {/* Wave Background - Below all content but above background */}
      <div className="w-full h-80 md:h-[500px] -mt-32 md:-mt-48 relative pointer-events-none z-0">
        <img 
          src={footerWave} 
          alt="" 
          className="w-full h-full object-cover"
        />
        {/* Seamless blend at top */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent" />
        {/* Seamless blend at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
      </div>

      <footer className="bg-card border-t border-border relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img 
                src={tboStoreLogo} 
                alt="TBO Store" 
                className="h-12 w-auto"
              />
              <span className="font-display text-2xl font-bold text-foreground">
                TBO <span className="text-primary glow-text-cyan">STORE</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6">
              {language === 'en'
                ? 'Your destination for premium products with cutting-edge design and unmatched quality.'
                : 'وجهتك للمنتجات الفاخرة بتصميم متطور وجودة لا مثيل لها.'}
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://www.instagram.com/tbostore1/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://discord.gg/tbo1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#5865F2] hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {language === 'en' ? 'Quick Links' : 'روابط سريعة'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {language === 'en' ? 'Categories' : 'الفئات'}
            </h4>
            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li key={index}>
                  <Link
                    to={cat.to}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {cat.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {language === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>support@tbostore.com</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+905510070277" className="hover:text-primary transition-colors">
                  +90 551 007 02 77
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span>{language === 'en' ? 'Riyadh, Saudi Arabia' : 'الرياض، المملكة العربية السعودية'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 TBO STORE. {t('allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/policies" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
            </Link>
            <Link to="/policies" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
            </Link>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
