import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CustomQuestion {
  id: string;
  question_ar: string;
  question_en: string;
  type: 'text' | 'choices' | 'colors' | 'image_upload' | 'contact' | 'yes_no';
  required: boolean;
  options?: { label_ar: string; label_en: string }[];
}

interface Props {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  questions: CustomQuestion[];
  onQuestionsChange: (questions: CustomQuestion[]) => void;
}

const FIELD_TYPES = [
  { value: 'text', labelEn: 'Free Text', labelAr: 'نص حر' },
  { value: 'choices', labelEn: 'Multiple Choice', labelAr: 'خيارات متعددة' },
  { value: 'colors', labelEn: 'Color Picker', labelAr: 'اختيار ألوان' },
  { value: 'image_upload', labelEn: 'Image Upload', labelAr: 'رفع صورة' },
  { value: 'contact', labelEn: 'Contact Method', labelAr: 'وسيلة تواصل' },
  { value: 'yes_no', labelEn: 'Yes / No', labelAr: 'نعم / لا' },
];

const CustomQuestionsBuilder: React.FC<Props> = ({ enabled, onEnabledChange, questions, onQuestionsChange }) => {
  const { language } = useLanguage();

  const addQuestion = () => {
    onQuestionsChange([
      ...questions,
      {
        id: crypto.randomUUID(),
        question_ar: '',
        question_en: '',
        type: 'text',
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    onQuestionsChange(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const q = questions.find(q => q.id === questionId);
    if (!q) return;
    updateQuestion(questionId, {
      options: [...(q.options || []), { label_ar: '', label_en: '' }],
    });
  };

  const updateOption = (questionId: string, idx: number, field: 'label_ar' | 'label_en', value: string) => {
    const q = questions.find(q => q.id === questionId);
    if (!q || !q.options) return;
    const newOpts = q.options.map((o, i) => (i === idx ? { ...o, [field]: value } : o));
    updateQuestion(questionId, { options: newOpts });
  };

  const removeOption = (questionId: string, idx: number) => {
    const q = questions.find(q => q.id === questionId);
    if (!q || !q.options) return;
    updateQuestion(questionId, { options: q.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border bg-card/50">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        <Label className="font-medium">
          {language === 'en' ? 'Custom Questions Form' : 'نموذج أسئلة مخصصة'}
        </Label>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-muted-foreground mt-2">
                  {qIndex + 1}.
                </span>
                <div className="flex-1 space-y-3">
                  {/* Question text */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'en' ? 'Question (EN)' : 'السؤال (EN)'}</Label>
                      <Input
                        value={q.question_en}
                        onChange={e => updateQuestion(q.id, { question_en: e.target.value })}
                        placeholder="e.g. Do you have a specific design?"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{language === 'en' ? 'Question (AR)' : 'السؤال (عربي)'}</Label>
                      <Input
                        value={q.question_ar}
                        onChange={e => updateQuestion(q.id, { question_ar: e.target.value })}
                        placeholder="مثال: هل عندك شكل معين؟"
                        dir="rtl"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Type & Required */}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">{language === 'en' ? 'Field Type' : 'نوع الحقل'}</Label>
                      <Select value={q.type} onValueChange={(v) => updateQuestion(q.id, { type: v as CustomQuestion['type'] })}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(ft => (
                            <SelectItem key={ft.value} value={ft.value}>
                              {language === 'en' ? ft.labelEn : ft.labelAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                      <Switch
                        checked={q.required}
                        onCheckedChange={checked => updateQuestion(q.id, { required: checked })}
                      />
                      <Label className="text-xs">{language === 'en' ? 'Required' : 'مطلوب'}</Label>
                    </div>
                  </div>

                  {/* Options for choices type */}
                  {q.type === 'choices' && (
                    <div className="space-y-2 pl-2 border-l-2 border-primary/30">
                      <Label className="text-xs font-medium">{language === 'en' ? 'Options' : 'الخيارات'}</Label>
                      {(q.options || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            value={opt.label_en}
                            onChange={e => updateOption(q.id, idx, 'label_en', e.target.value)}
                            placeholder="Option (EN)"
                            className="text-sm flex-1"
                          />
                          <Input
                            value={opt.label_ar}
                            onChange={e => updateOption(q.id, idx, 'label_ar', e.target.value)}
                            placeholder="الخيار (عربي)"
                            dir="rtl"
                            className="text-sm flex-1"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(q.id, idx)} className="shrink-0 h-8 w-8">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(q.id)}>
                        <Plus className="w-3 h-3 mr-1" />
                        {language === 'en' ? 'Add Option' : 'إضافة خيار'}
                      </Button>
                    </div>
                  )}
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="shrink-0 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Add Question' : 'إضافة سؤال'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomQuestionsBuilder;
