import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact: React.FC = () => {
  const { language } = useLanguage();

  const contactInfo = [
    {
      icon: Mail,
      label: { en: 'Email', ar: 'البريد الإلكتروني' },
      value: 'support@tbostore.com',
      color: 'cyan',
    },
    {
      icon: Phone,
      label: { en: 'Phone / WhatsApp', ar: 'الهاتف / واتساب' },
      value: '+90 551 007 02 77',
      color: 'magenta',
    },
    {
      icon: MapPin,
      label: { en: 'Address', ar: 'العنوان' },
      value: { en: 'Istanbul, Turkey', ar: 'إسطنبول، تركيا' },
      color: 'purple',
    },
    {
      icon: Clock,
      label: { en: 'Working Hours', ar: 'ساعات العمل' },
      value: { en: 'Mon - Fri: 9:00 AM - 6:00 PM', ar: 'الاثنين - الجمعة: 9:00 ص - 6:00 م' },
      color: 'cyan',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'text-neon-cyan bg-neon-cyan/10';
      case 'magenta':
        return 'text-neon-magenta bg-neon-magenta/10';
      case 'purple':
        return 'text-neon-purple bg-neon-purple/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
                  {language === 'en' ? 'Contact ' : 'اتصل '}
                  <span className="text-gradient-neon glow-text-cyan">
                    {language === 'en' ? 'Us' : 'بنا'}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'en'
                    ? "Have a question or need assistance? We're here to help!"
                    : 'هل لديك سؤال أو تحتاج مساعدة؟ نحن هنا للمساعدة!'}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <AnimatedSection>
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    {language === 'en' ? 'Send us a Message' : 'أرسل لنا رسالة'}
                  </h2>
                  
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'First Name' : 'الاسم الأول'}
                        </label>
                        <Input 
                          placeholder={language === 'en' ? 'John' : 'أحمد'}
                          className="bg-muted/50 border-border focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'Last Name' : 'اسم العائلة'}
                        </label>
                        <Input 
                          placeholder={language === 'en' ? 'Doe' : 'محمد'}
                          className="bg-muted/50 border-border focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                      </label>
                      <Input 
                        type="email"
                        placeholder={language === 'en' ? 'john@example.com' : 'ahmed@example.com'}
                        className="bg-muted/50 border-border focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {language === 'en' ? 'Subject' : 'الموضوع'}
                      </label>
                      <Input 
                        placeholder={language === 'en' ? 'How can we help?' : 'كيف يمكننا مساعدتك؟'}
                        className="bg-muted/50 border-border focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {language === 'en' ? 'Message' : 'الرسالة'}
                      </label>
                      <Textarea 
                        placeholder={language === 'en' ? 'Your message...' : 'رسالتك...'}
                        rows={5}
                        className="bg-muted/50 border-border focus:border-primary resize-none"
                      />
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="neon-filled" size="lg" className="w-full group">
                        {language === 'en' ? 'Send Message' : 'إرسال الرسالة'}
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </form>
                </div>
              </AnimatedSection>

              {/* Contact Info */}
              <AnimatedSection delay={0.2}>
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                      {language === 'en' ? 'Get in Touch' : 'تواصل معنا'}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      {language === 'en'
                        ? "Whether you have a question about products, orders, or anything else, our team is ready to answer all your questions."
                        : 'سواء كان لديك سؤال حول المنتجات أو الطلبات أو أي شيء آخر، فريقنا جاهز للإجابة على جميع أسئلتك.'}
                    </p>
                  </div>

                  {/* Contact Cards */}
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-start gap-4 p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(info.color)}`}>
                          <info.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {info.label[language]}
                          </div>
                          <div className="text-foreground font-medium">
                            {typeof info.value === 'string' ? info.value : info.value[language]}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                      {language === 'en' ? 'Follow Us' : 'تابعنا'}
                    </h3>
                    <div className="flex gap-4">
                      <motion.a
                        href="https://www.instagram.com/tbostore1/"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300"
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
