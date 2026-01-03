import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Save, Loader2, X,
  Home, ShoppingBag, Heart, User, Settings, Phone, Mail, MapPin,
  Star, Package, Truck, CreditCard, Shield, Clock, Check, AlertCircle,
  ChevronRight, ChevronLeft, Menu, Plus, Minus, Trash2, Pencil, Eye,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageCircle,
  Bell, Gift, Percent, Tag, Bookmark, Share2, Download, Upload,
  Camera, Image, Video, Music, FileText, Folder, Archive, Link,
  Globe, Wifi, Zap, Battery, Sun, Moon, Cloud, Umbrella,
  Car, Plane, Train, Bus, Bike, Ship, Rocket, Compass,
  Coffee, Pizza, Apple, Cake, Utensils, Wine, Beer, IceCream,
  Book, GraduationCap, Award, Trophy, Medal, Target, Flag, Lightbulb,
  Palette, Brush, Scissors, Ruler, Hammer, Wrench, Key, Lock,
  Headphones, Speaker, Mic, Radio, Tv, Monitor, Smartphone, Tablet,
  Watch, Glasses, Shirt, Footprints, Diamond, Crown, Gem, Flower2,
  TreePine, Mountain, Waves, Flame, Snowflake, Wind, Droplet, Leaf,
  Activity, Thermometer, Pill, Stethoscope, Syringe, Dna, Brain, Bone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { LucideIcon } from 'lucide-react';

interface IconConfig {
  id: string;
  location: string;
  location_ar: string;
  icon_name: string;
}

const allIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Home', icon: Home },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Heart', icon: Heart },
  { name: 'User', icon: User },
  { name: 'Settings', icon: Settings },
  { name: 'Phone', icon: Phone },
  { name: 'Mail', icon: Mail },
  { name: 'MapPin', icon: MapPin },
  { name: 'Star', icon: Star },
  { name: 'Package', icon: Package },
  { name: 'Truck', icon: Truck },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Shield', icon: Shield },
  { name: 'Clock', icon: Clock },
  { name: 'Check', icon: Check },
  { name: 'AlertCircle', icon: AlertCircle },
  { name: 'ChevronRight', icon: ChevronRight },
  { name: 'ChevronLeft', icon: ChevronLeft },
  { name: 'Menu', icon: Menu },
  { name: 'Plus', icon: Plus },
  { name: 'Minus', icon: Minus },
  { name: 'Trash2', icon: Trash2 },
  { name: 'Pencil', icon: Pencil },
  { name: 'Eye', icon: Eye },
  { name: 'Facebook', icon: Facebook },
  { name: 'Twitter', icon: Twitter },
  { name: 'Instagram', icon: Instagram },
  { name: 'Youtube', icon: Youtube },
  { name: 'Linkedin', icon: Linkedin },
  { name: 'Send', icon: Send },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Bell', icon: Bell },
  { name: 'Gift', icon: Gift },
  { name: 'Percent', icon: Percent },
  { name: 'Tag', icon: Tag },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Share2', icon: Share2 },
  { name: 'Download', icon: Download },
  { name: 'Upload', icon: Upload },
  { name: 'Camera', icon: Camera },
  { name: 'Image', icon: Image },
  { name: 'Video', icon: Video },
  { name: 'Music', icon: Music },
  { name: 'FileText', icon: FileText },
  { name: 'Folder', icon: Folder },
  { name: 'Archive', icon: Archive },
  { name: 'Link', icon: Link },
  { name: 'Globe', icon: Globe },
  { name: 'Wifi', icon: Wifi },
  { name: 'Zap', icon: Zap },
  { name: 'Battery', icon: Battery },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Cloud', icon: Cloud },
  { name: 'Umbrella', icon: Umbrella },
  { name: 'Car', icon: Car },
  { name: 'Plane', icon: Plane },
  { name: 'Train', icon: Train },
  { name: 'Bus', icon: Bus },
  { name: 'Bike', icon: Bike },
  { name: 'Ship', icon: Ship },
  { name: 'Rocket', icon: Rocket },
  { name: 'Compass', icon: Compass },
  { name: 'Coffee', icon: Coffee },
  { name: 'Pizza', icon: Pizza },
  { name: 'Apple', icon: Apple },
  { name: 'Cake', icon: Cake },
  { name: 'Utensils', icon: Utensils },
  { name: 'Wine', icon: Wine },
  { name: 'Beer', icon: Beer },
  { name: 'IceCream', icon: IceCream },
  { name: 'Book', icon: Book },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Award', icon: Award },
  { name: 'Trophy', icon: Trophy },
  { name: 'Medal', icon: Medal },
  { name: 'Target', icon: Target },
  { name: 'Flag', icon: Flag },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Palette', icon: Palette },
  { name: 'Brush', icon: Brush },
  { name: 'Scissors', icon: Scissors },
  { name: 'Ruler', icon: Ruler },
  { name: 'Hammer', icon: Hammer },
  { name: 'Wrench', icon: Wrench },
  { name: 'Key', icon: Key },
  { name: 'Lock', icon: Lock },
  { name: 'Headphones', icon: Headphones },
  { name: 'Speaker', icon: Speaker },
  { name: 'Mic', icon: Mic },
  { name: 'Radio', icon: Radio },
  { name: 'Tv', icon: Tv },
  { name: 'Monitor', icon: Monitor },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', icon: Tablet },
  { name: 'Watch', icon: Watch },
  { name: 'Glasses', icon: Glasses },
  { name: 'Shirt', icon: Shirt },
  { name: 'Footprints', icon: Footprints },
  { name: 'Diamond', icon: Diamond },
  { name: 'Crown', icon: Crown },
  { name: 'Gem', icon: Gem },
  { name: 'Flower2', icon: Flower2 },
  { name: 'TreePine', icon: TreePine },
  { name: 'Mountain', icon: Mountain },
  { name: 'Waves', icon: Waves },
  { name: 'Flame', icon: Flame },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Wind', icon: Wind },
  { name: 'Droplet', icon: Droplet },
  { name: 'Leaf', icon: Leaf },
  { name: 'Activity', icon: Activity },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Pill', icon: Pill },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Syringe', icon: Syringe },
  { name: 'Dna', icon: Dna },
  { name: 'Brain', icon: Brain },
  { name: 'Bone', icon: Bone },
];

export const getIconByName = (name: string): LucideIcon => {
  const found = allIcons.find(i => i.name === name);
  return found?.icon || Star;
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
        setIcons(metadata.icons || getDefaultIcons());
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

  const getDefaultIcons = (): IconConfig[] => [
    { id: '1', location: 'Navbar - Home', location_ar: 'شريط التنقل - الرئيسية', icon_name: 'Home' },
    { id: '2', location: 'Navbar - Cart', location_ar: 'شريط التنقل - السلة', icon_name: 'ShoppingBag' },
    { id: '3', location: 'Navbar - Favorites', location_ar: 'شريط التنقل - المفضلة', icon_name: 'Heart' },
    { id: '4', location: 'Navbar - Profile', location_ar: 'شريط التنقل - الملف الشخصي', icon_name: 'User' },
    { id: '5', location: 'Footer - Phone', location_ar: 'التذييل - الهاتف', icon_name: 'Phone' },
    { id: '6', location: 'Footer - Email', location_ar: 'التذييل - البريد', icon_name: 'Mail' },
    { id: '7', location: 'Footer - Location', location_ar: 'التذييل - الموقع', icon_name: 'MapPin' },
    { id: '8', location: 'Product - Rating', location_ar: 'المنتج - التقييم', icon_name: 'Star' },
    { id: '9', location: 'Checkout - Delivery', location_ar: 'الدفع - التوصيل', icon_name: 'Truck' },
    { id: '10', location: 'Checkout - Payment', location_ar: 'الدفع - الدفع', icon_name: 'CreditCard' },
  ];

  useEffect(() => {
    fetchIcons();
  }, []);

  const handleEdit = (icon: IconConfig) => {
    setEditingIcon(icon);
    setDialogOpen(true);
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

      if (checkError && checkError.code === 'PGRST116') {
        const { error } = await supabase
          .from('page_content')
          .insert([{
            page_key: 'icons',
            metadata: JSON.parse(JSON.stringify({ icons: updatedIcons }))
          }]);
        if (error) throw error;
      } else if (existingData) {
        const { error } = await supabase
          .from('page_content')
          .update({ metadata: JSON.parse(JSON.stringify({ icons: updatedIcons })) })
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

  const filteredIcons = allIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {language === 'en' ? 'Manage Icons' : 'إدارة الأيقونات'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {icons.length} {language === 'en' ? 'icons' : 'أيقونة'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {icons.map((icon) => {
          const IconComponent = getIconByName(icon.icon_name);
          return (
            <motion.div
              key={icon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => handleEdit(icon)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm">
                    {language === 'en' ? icon.location : icon.location_ar}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {icon.icon_name}
                  </p>
                </div>
                <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
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
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? editingIcon.location : editingIcon.location_ar}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Current:' : 'الحالية:'} {editingIcon.icon_name}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IconsManagement;
