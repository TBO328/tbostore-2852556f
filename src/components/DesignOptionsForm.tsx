import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, X, Palette, MessageCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DesignOptionsFormProps {
  onOptionsChange: (options: DesignOptions) => void;
}

export interface DesignOptions {
  hasSpecificDesign: string;
  designImage: string | null;
  colors: string[];
  logoType: string;
  customerNotes: string;
  contactMethod: string;
}

const COLOR_NAMES: Record<string, string> = {
  red: '#FF0000', blue: '#0000FF', green: '#008000', purple: '#800080',
  orange: '#FFA500', pink: '#FFC0CB', black: '#000000', white: '#FFFFFF',
  gold: '#FFD700', silver: '#C0C0C0', cyan: '#00FFFF', navy: '#000080',
  coral: '#FF7F50', teal: '#008080', maroon: '#800000', lime: '#00FF00',
  olive: '#808000', aqua: '#00FFFF', salmon: '#FA8072', indigo: '#4B0082',
  violet: '#EE82EE', turquoise: '#40E0D0', beige: '#F5F5DC', ivory: '#FFFFF0',
  khaki: '#F0E68C', lavender: '#E6E6FA', magenta: '#FF00FF', tan: '#D2B48C',
  chocolate: '#D2691E', crimson: '#DC143C', tomato: '#FF6347', wheat: '#F5DEB3',
  skyblue: '#87CEEB', plum: '#DDA0DD', orchid: '#DA70D6', peru: '#CD853F',
  sienna: '#A0522D', firebrick: '#B22222', darkgreen: '#006400', darkblue: '#00008B',
  أحمر: '#FF0000', أزرق: '#0000FF', أخضر: '#008000', بنفسجي: '#800080',
  برتقالي: '#FFA500', وردي: '#FFC0CB', أسود: '#000000', أبيض: '#FFFFFF',
  ذهبي: '#FFD700', فضي: '#C0C0C0', سماوي: '#00FFFF', زهري: '#FF69B4',
};

const isValidHex = (str: string): boolean => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
const isValidRgb = (str: string): boolean => /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(str);

const rgbToHex = (rgb: string): string | null => {
  const match = rgb.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!match) return null;
  const [, r, g, b] = match.map(Number);
  if (r > 255 || g > 255 || b > 255) return null;
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const DesignOptionsForm: React.FC<DesignOptionsFormProps> = ({ onOptionsChange }) => {
  const { language } = useLanguage();
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorError, setCustomColorError] = useState('');
  const [options, setOptions] = useState<DesignOptions>({
    hasSpecificDesign: '',
    designImage: null,
    colors: [],
    logoType: '',
    customerNotes: '',
    contactMethod: '',
  });
  const handleChange = (field: keyof DesignOptions, value: unknown) => {
    const newOptions = { ...options, [field]: value };
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('designImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addColor = (color: string) => {
    const normalized = color.toUpperCase();
    if (!options.colors.includes(normalized)) {
      handleChange('colors', [...options.colors, normalized]);
    }
  };

  const removeColor = (color: string) => {
    handleChange('colors', options.colors.filter(c => c !== color));
  };

  const handleCustomColorAdd = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    
    let hexColor: string | null = null;
    
    // Check HEX
    if (trimmed.startsWith('#')) {
      if (isValidHex(trimmed)) {
        hexColor = trimmed.length === 4
          ? '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3]
          : trimmed;
      }
    } else if (trimmed.toLowerCase().startsWith('rgb')) {
      hexColor = rgbToHex(trimmed);
    } else if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(trimmed)) {
      const withHash = '#' + trimmed;
      if (isValidHex(withHash)) {
        hexColor = withHash.length === 4
          ? '#' + withHash[1] + withHash[1] + withHash[2] + withHash[2] + withHash[3] + withHash[3]
          : withHash;
      }
    }

    if (hexColor) {
      addColor(hexColor.toUpperCase());
      setCustomColorInput('');
      setCustomColorError('');
    } else {
      setCustomColorError(language === 'ar' ? 'صيغة لون غير صحيحة' : 'Invalid color format');
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    addColor(e.target.value.toUpperCase());
  };

  const logoTypeOptions = [
    { value: 'streamer', labelAr: 'ستريمر', labelEn: 'Streamer' },
    { value: 'store', labelAr: 'متجر', labelEn: 'Store' },
    { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl bg-card/50 border border-border"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="font-display font-semibold text-lg text-foreground flex items-center justify-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          {language === 'ar' ? 'خيارات التصميم' : 'Design Options'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'حدد تفاصيل التصميم المطلوب' : 'Specify your design requirements'}
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Has Specific Design */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {language === 'ar' ? 'هل عندك شكل معين؟' : 'Do you have a specific design?'}
            <span className="text-destructive mr-1">*</span>
          </Label>
          <RadioGroup
            value={options.hasSpecificDesign}
            onValueChange={(v) => handleChange('hasSpecificDesign', v)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id="design-yes" />
              <Label htmlFor="design-yes" className="cursor-pointer">
                {language === 'ar' ? 'نعم' : 'Yes'}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id="design-no" />
              <Label htmlFor="design-no" className="cursor-pointer">
                {language === 'ar' ? 'لا' : 'No'}
              </Label>
            </div>
          </RadioGroup>

          {/* Image Upload - shown only when "yes" */}
          <AnimatePresence>
            {options.hasSpecificDesign === 'yes' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {options.designImage ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                    <img src={options.designImage} alt="Design" className="w-full h-full object-contain bg-muted" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleChange('designImage', null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'ارفق صورة التصميم' : 'Upload your design image'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Colors */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {language === 'ar' ? 'اللون أو الألوان المطلوبة' : 'Desired color(s)'}
            <span className="text-destructive mr-1">*</span>
          </Label>

          {/* Selected Colors */}
          {options.colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.colors.map((color) => {
                const colorInfo = AVAILABLE_COLORS.find(c => c.value === color);
                return (
                  <motion.div
                    key={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-foreground">
                      {colorInfo ? (language === 'ar' ? colorInfo.labelAr : colorInfo.labelEn) : color}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Color Picker Grid */}
          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => addColor(color.value)}
                className={`group relative w-full aspect-square rounded-lg border-2 transition-all ${
                  options.colors.includes(color.value)
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-border hover:border-primary/50 hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={language === 'ar' ? color.labelAr : color.labelEn}
              >
                {options.colors.includes(color.value) && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full bg-background/80 flex items-center justify-center">
                      <span className="text-foreground text-xs">✓</span>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="flex gap-2 items-start">
            {/* Native Color Picker */}
            <label className="relative shrink-0 cursor-pointer" title={language === 'ar' ? 'اختر من لوحة الألوان' : 'Pick from color palette'}>
              <input
                type="color"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleNativeColorPick}
              />
              <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted hover:border-primary/50 transition-colors">
                <Palette className="w-4 h-4 text-muted-foreground" />
              </div>
            </label>

            {/* HEX / RGB Input */}
            <div className="flex-1 space-y-1">
              <div className="flex gap-2">
                <Input
                  value={customColorInput}
                  onChange={(e) => {
                    setCustomColorInput(e.target.value);
                    setCustomColorError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomColorAdd())}
                  placeholder={language === 'ar' ? '#FF5733 أو rgb(255,87,51)' : '#FF5733 or rgb(255,87,51)'}
                  className="bg-background border-border font-mono text-sm"
                  dir="ltr"
                  maxLength={30}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCustomColorAdd}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {customColorError && (
                <p className="text-xs text-destructive">{customColorError}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {language === 'ar' ? 'يمكنك اختيار من الألوان الجاهزة، أو من لوحة الألوان، أو إدخال كود HEX أو RGB' : 'Pick from preset colors, color palette, or enter HEX/RGB code'}
          </p>
        </div>

        {/* 3. Logo Type */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            {language === 'ar' ? 'نوع الشعار' : 'Logo type'}
            <span className="text-destructive mr-1">*</span>
          </Label>
          <Select value={options.logoType} onValueChange={(v) => handleChange('logoType', v)}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder={language === 'ar' ? 'اختر نوع الشعار' : 'Select logo type'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {logoTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Customer Notes */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            {language === 'ar' ? 'ملاحظات العميل' : 'Customer notes'}
          </Label>
          <Textarea
            value={options.customerNotes}
            onChange={(e) => handleChange('customerNotes', e.target.value)}
            placeholder={language === 'ar' ? 'اكتب أي شيء تحتاجه زيادة...' : 'Write any additional requirements...'}
            className="w-full bg-background border-border min-h-[80px]"
          />
        </div>

        {/* 5. Contact Method */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            {language === 'ar' ? 'وسيلة التواصل' : 'Contact method'}
            <span className="text-destructive mr-1">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <Input
              value={options.contactMethod}
              onChange={(e) => handleChange('contactMethod', e.target.value)}
              placeholder={language === 'ar' ? 'Discord: ja2b' : 'Discord: ja2b'}
              className="w-full bg-background border-border"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {language === 'ar' ? 'مثال: Discord: ja2b' : 'Example: Discord: ja2b'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DesignOptionsForm;
