import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  IconConfig, 
  getIconByName, 
  allIconsList, 
  getDefaultIcons 
} from '@/hooks/useIcons';

// Section preview images - using placeholder descriptions
const sectionPreviews: Record<string, { description_en: string; description_ar: string }> = {
  'Navbar': { 
    description_en: 'Top navigation bar with logo, menu links, search, cart, and user profile icons',
    description_ar: 'شريط التنقل العلوي مع الشعار وروابط القائمة والبحث والسلة وأيقونات الملف الشخصي'
  },
  'Hero': { 
    description_en: 'Main landing section with premium badge and call-to-action buttons',
    description_ar: 'القسم الرئيسي مع شارة الجودة وأزرار الإجراء'
  },
  'Product Card': { 
    description_en: 'Product display cards with cart, favorites, view, and rating icons',
    description_ar: 'بطاقات عرض المنتجات مع أيقونات السلة والمفضلة والعرض والتقييم'
  },
  'Cart': { 
    description_en: 'Shopping cart page with quantity controls, delete, payment, and checkout icons',
    description_ar: 'صفحة سلة التسوق مع أزرار الكمية والحذف والدفع وإتمام الطلب'
  },
  'About': { 
    description_en: 'About section with feature icons: security, delivery, support, and quality',
    description_ar: 'قسم من نحن مع أيقونات المميزات: الأمان والتوصيل والدعم والجودة'
  },
  'Contact': { 
    description_en: 'Contact page with email, phone, location, hours, and social media icons',
    description_ar: 'صفحة التواصل مع أيقونات البريد والهاتف والموقع وساعات العمل ووسائل التواصل'
  },
  'Footer': { 
    description_en: 'Page footer with contact info and social media icons',
    description_ar: 'تذييل الصفحة مع معلومات التواصل وأيقونات وسائل التواصل'
  },
  'Reviews': { 
    description_en: 'Customer reviews section with rating stars and quote icons',
    description_ar: 'قسم تقييمات العملاء مع نجوم التقييم وأيقونات الاقتباس'
  },
  'Authentication': { 
    description_en: 'Login, logout, and registration pages with user authentication icons',
    description_ar: 'صفحات الدخول والخروج والتسجيل مع أيقونات المصادقة'
  },
};

const IconsManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [icons, setIcons] = useState<IconConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<IconConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Navbar']));

  const fetchIcons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'icons')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.metadata) {
        const metadata = data.metadata as { icons?: IconConfig[] };
        if (metadata.icons && metadata.icons.length > 0) {
          // Merge saved icons with defaults
          const savedIconsMap = new Map(metadata.icons.map(i => [i.id, i]));
          const mergedIcons = getDefaultIcons().map(defaultIcon => {
            const savedIcon = savedIconsMap.get(defaultIcon.id);
            return savedIcon ? { ...defaultIcon, icon_name: savedIcon.icon_name } : defaultIcon;
          });
          setIcons(mergedIcons);
        } else {
          setIcons(getDefaultIcons());
        }
      } else {
        setIcons(getDefaultIcons());
      }
    } catch (error) {
      console.error('Error fetching icons:', error);
      setIcons(getDefaultIcons());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const handleEdit = (icon: IconConfig) => {
    setEditingIcon(icon);
    setDialogOpen(true);
    setSearchTerm('');
  };

  const handleSelectIcon = async (iconName: string) => {
    if (!editingIcon) return;

    setSaving(true);
    try {
      const updatedIcons = icons.map(i =>
        i.id === editingIcon.id ? { ...i, icon_name: iconName } : i
      );

      const { error: checkError, data: existingData } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_key', 'icons')
        .single();

      const metadataPayload = JSON.parse(JSON.stringify({ icons: updatedIcons }));

      if (checkError && checkError.code === 'PGRST116') {
        const { error } = await supabase
          .from('page_content')
          .insert([{
            page_key: 'icons',
            metadata: metadataPayload
          }]);
        if (error) throw error;
      } else if (existingData) {
        const { error } = await supabase
          .from('page_content')
          .update({ 
            metadata: metadataPayload,
            updated_at: new Date().toISOString()
          })
          .eq('page_key', 'icons');
        if (error) throw error;
      }

      setIcons(updatedIcons);
      toast({
        title: language === 'en' ? 'Icon updated!' : 'تم تحديث الأيقونة!',
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating icon:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const filteredIcons = allIconsList.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group icons by section
  const groupedIcons = icons.reduce((acc, icon) => {
    const section = icon.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(icon);
    return acc;
  }, {} as Record<string, IconConfig[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'en' ? 'Manage Store Icons' : 'إدارة أيقونات المتجر'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {icons.length} {language === 'en' ? 'icons' : 'أيقونة'}
        </span>
      </div>

      <p className="text-muted-foreground mb-6">
        {language === 'en' 
          ? 'Click on any icon to change it. Changes will be applied immediately across the store.'
          : 'اضغط على أي أيقونة لتغييرها. سيتم تطبيق التغييرات فوراً في جميع أنحاء المتجر.'}
      </p>

      {/* Sections */}
      <div className="space-y-4">
        {Object.entries(groupedIcons).map(([section, sectionIcons]) => {
          const isExpanded = expandedSections.has(section);
          const sectionInfo = sectionPreviews[section];
          const sectionAr = sectionIcons[0]?.section_ar || section;

          return (
            <div key={section} className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="font-bold text-foreground text-lg">
                      {language === 'en' ? section : sectionAr}
                    </h3>
                  </div>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {sectionIcons.length} {language === 'en' ? 'icons' : 'أيقونة'}
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {sectionIcons.slice(0, 5).map((icon) => {
                    const IconComponent = getIconByName(icon.icon_name);
                    return (
                      <div
                        key={icon.id}
                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                      >
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                    );
                  })}
                  {sectionIcons.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{sectionIcons.length - 5}
                    </div>
                  )}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-border">
                  {/* Section Description */}
                  {sectionInfo && (
                    <div className="mt-4 mb-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        📍 {language === 'en' ? sectionInfo.description_en : sectionInfo.description_ar}
                      </p>
                    </div>
                  )}

                  {/* Icons Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                    {sectionIcons.map((icon) => {
                      const IconComponent = getIconByName(icon.icon_name);
                      return (
                        <motion.div
                          key={icon.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer group"
                          onClick={() => handleEdit(icon)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm truncate">
                                {language === 'en' ? icon.location : icon.location_ar}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {icon.icon_name}
                              </p>
                            </div>
                            <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Icon Picker Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Choose Icon' : 'اختر أيقونة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editingIcon && (
              <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  {React.createElement(getIconByName(editingIcon.icon_name), { className: 'w-6 h-6 text-primary' })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {language === 'en' ? editingIcon.location : editingIcon.location_ar}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? editingIcon.section : editingIcon.section_ar} • {language === 'en' ? 'Current:' : 'الحالية:'} {editingIcon.icon_name}
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search icons...' : 'ابحث عن أيقونة...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-1">
                {filteredIcons.map((iconItem) => {
                  const IconComp = iconItem.icon;
                  const isSelected = editingIcon?.icon_name === iconItem.name;
                  return (
                    <button
                      key={iconItem.name}
                      onClick={() => handleSelectIcon(iconItem.name)}
                      disabled={saving}
                      className={`p-3 rounded-xl border transition-all hover:scale-110 ${
                        isSelected
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                      }`}
                      title={iconItem.name}
                    >
                      <IconComp className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground text-center">
              {filteredIcons.length} {language === 'en' ? 'icons available' : 'أيقونة متاحة'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IconsManagement;
