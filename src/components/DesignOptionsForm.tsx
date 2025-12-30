import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DesignOptionsFormProps {
  onOptionsChange: (options: DesignOptions) => void;
}

export interface DesignOptions {
  hasLogo: string;
  color: string;
  position: string;
  contactMethod: string;
}

const DesignOptionsForm: React.FC<DesignOptionsFormProps> = ({ onOptionsChange }) => {
  const { language } = useLanguage();
  const [options, setOptions] = useState<DesignOptions>({
    hasLogo: '',
    color: '',
    position: '',
    contactMethod: '',
  });

  const handleChange = (field: keyof DesignOptions, value: string) => {
    const newOptions = { ...options, [field]: value };
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const logoOptions = [
    { value: 'yes', labelAr: 'نعم', labelEn: 'Yes' },
    { value: 'no', labelAr: 'لا', labelEn: 'No' },
    { value: 'need_design', labelAr: 'أحتاج تصميم شعار', labelEn: 'Need logo design' },
  ];

  const colorOptions = [
    { value: 'red', labelAr: 'أحمر', labelEn: 'Red' },
    { value: 'blue', labelAr: 'أزرق', labelEn: 'Blue' },
    { value: 'green', labelAr: 'أخضر', labelEn: 'Green' },
    { value: 'purple', labelAr: 'بنفسجي', labelEn: 'Purple' },
    { value: 'orange', labelAr: 'برتقالي', labelEn: 'Orange' },
    { value: 'pink', labelAr: 'وردي', labelEn: 'Pink' },
    { value: 'black', labelAr: 'أسود', labelEn: 'Black' },
    { value: 'white', labelAr: 'أبيض', labelEn: 'White' },
    { value: 'custom', labelAr: 'لون مخصص', labelEn: 'Custom color' },
  ];

  const positionOptions = [
    { value: 'center', labelAr: 'في المنتصف', labelEn: 'Center' },
    { value: 'top', labelAr: 'في الأعلى', labelEn: 'Top' },
    { value: 'bottom', labelAr: 'في الأسفل', labelEn: 'Bottom' },
    { value: 'left', labelAr: 'على اليسار', labelEn: 'Left' },
    { value: 'right', labelAr: 'على اليمين', labelEn: 'Right' },
    { value: 'custom', labelAr: 'موقع مخصص', labelEn: 'Custom position' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl bg-card/50 border border-border"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          {language === 'ar' ? 'بحاجة إلى مساعدة' : 'Need help'} 🎨 ?
        </p>
        <a
          href="https://wa.me/966500000000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          {language === 'ar' ? 'تواصل مع الدعم الفني عبر الواتساب' : 'Contact support via WhatsApp'}
        </a>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Has Logo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">
              {language === 'ar' ? 'هل لديك شعار؟' : 'Do you have a logo?'}
              <span className="text-destructive mr-1">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'اختر' : 'Select'}
            </span>
          </div>
          <Select value={options.hasLogo} onValueChange={(v) => handleChange('hasLogo', v)}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {logoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">
              {language === 'ar' ? 'اللون' : 'Color'}
              <span className="text-destructive mr-1">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'اختر' : 'Select'}
            </span>
          </div>
          <Select value={options.color} onValueChange={(v) => handleChange('color', v)}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {colorOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">
              {language === 'ar' ? 'موقع التركيب؟' : 'Installation position?'}
              <span className="text-destructive mr-1">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'اختر' : 'Select'}
            </span>
          </div>
          <Select value={options.position} onValueChange={(v) => handleChange('position', v)}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {positionOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact Method */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">
              {language === 'ar' ? 'وسيلة التواصل' : 'Contact method'}
              <span className="text-destructive mr-1">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مثال: msh1lm' : 'Example: msh1lm'}
            </span>
          </div>
          <Input
            value={options.contactMethod}
            onChange={(e) => handleChange('contactMethod', e.target.value)}
            placeholder={language === 'ar' ? 'Discord: msh1lm' : 'Discord: msh1lm'}
            className="w-full bg-background border-border"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DesignOptionsForm;
