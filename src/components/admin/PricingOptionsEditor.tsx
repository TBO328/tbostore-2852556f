import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PricingOption {
  id: string;
  label_en: string;
  label_ar: string;
  price: number;
}

interface PricingOptionsEditorProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  options: PricingOption[];
  onOptionsChange: (options: PricingOption[]) => void;
}

const PricingOptionsEditor: React.FC<PricingOptionsEditorProps> = ({
  enabled,
  onEnabledChange,
  options,
  onOptionsChange,
}) => {
  const { language } = useLanguage();

  const addOption = () => {
    const newOption: PricingOption = {
      id: Date.now().toString(),
      label_en: '',
      label_ar: '',
      price: 0,
    };
    onOptionsChange([...options, newOption]);
  };

  const updateOption = (id: string, field: keyof PricingOption, value: string | number) => {
    onOptionsChange(
      options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  };

  const removeOption = (id: string) => {
    onOptionsChange(options.filter((opt) => opt.id !== id));
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold">
            {language === 'en' ? 'Variable Pricing' : 'أسعار متعددة'}
          </Label>
          <p className="text-xs text-muted-foreground">
            {language === 'en'
              ? 'Enable to add different pricing options (e.g., 1 month, 6 months, 1 year)'
              : 'فعّل لإضافة خيارات أسعار مختلفة (مثل: شهر، 6 أشهر، سنة)'}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && (
        <div className="space-y-4 pt-4 border-t border-border">
          {options.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">
                {language === 'en'
                  ? 'No pricing options yet. Add your first option below.'
                  : 'لا توجد خيارات أسعار بعد. أضف خيارك الأول أدناه.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center h-10 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="w-6 text-center text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {language === 'en' ? 'Option (EN)' : 'الخيار (إنجليزي)'}
                      </Label>
                      <Input
                        value={option.label_en}
                        onChange={(e) =>
                          updateOption(option.id, 'label_en', e.target.value)
                        }
                        placeholder={language === 'en' ? '1 Month' : '1 Month'}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {language === 'en' ? 'Option (AR)' : 'الخيار (عربي)'}
                      </Label>
                      <Input
                        value={option.label_ar}
                        onChange={(e) =>
                          updateOption(option.id, 'label_ar', e.target.value)
                        }
                        placeholder="شهر واحد"
                        dir="rtl"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {language === 'en' ? 'Price (SAR)' : 'السعر (ريال)'}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={option.price}
                        onChange={(e) =>
                          updateOption(option.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Add Pricing Option' : 'إضافة خيار سعر'}
          </Button>

          {options.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {language === 'en'
                ? 'The base price above will be used as the default/display price'
                : 'السعر الأساسي أعلاه سيُستخدم كسعر افتراضي/للعرض'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingOptionsEditor;
