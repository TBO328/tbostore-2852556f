import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, X, Palette, MessageCircle, ClipboardList } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CustomQuestion } from '@/components/admin/CustomQuestionsBuilder';

interface Props {
  questions: CustomQuestion[];
  onAnswersChange: (answers: Record<string, unknown>) => void;
}

// Color utilities
const COLOR_NAMES: Record<string, string> = {
  red: '#FF0000', blue: '#0000FF', green: '#008000', purple: '#800080',
  orange: '#FFA500', pink: '#FFC0CB', black: '#000000', white: '#FFFFFF',
  gold: '#FFD700', silver: '#C0C0C0', cyan: '#00FFFF', navy: '#000080',
  coral: '#FF7F50', teal: '#008080', maroon: '#800000', lime: '#00FF00',
  أحمر: '#FF0000', أزرق: '#0000FF', أخضر: '#008000', بنفسجي: '#800080',
  برتقالي: '#FFA500', وردي: '#FFC0CB', أسود: '#000000', أبيض: '#FFFFFF',
  ذهبي: '#FFD700', فضي: '#C0C0C0',
};

const isValidHex = (s: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s);
const rgbToHex = (rgb: string): string | null => {
  const m = rgb.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!m) return null;
  const [, r, g, b] = m.map(Number);
  if (r > 255 || g > 255 || b > 255) return null;
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const DynamicQuestionsForm: React.FC<Props> = ({ questions, onAnswersChange }) => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [colorInputs, setColorInputs] = useState<Record<string, string>>({});
  const [colorErrors, setColorErrors] = useState<Record<string, string>>({});

  const update = (id: string, value: unknown) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    onAnswersChange(next);
  };

  // Color helpers
  const addColor = (qId: string, hex: string) => {
    const current = (answers[qId] as string[]) || [];
    const upper = hex.toUpperCase();
    if (!current.includes(upper)) {
      update(qId, [...current, upper]);
    }
  };

  const removeColor = (qId: string, hex: string) => {
    const current = (answers[qId] as string[]) || [];
    update(qId, current.filter(c => c !== hex));
  };

  const handleCustomColor = (qId: string) => {
    const raw = (colorInputs[qId] || '').trim();
    if (!raw) return;
    let hex: string | null = null;
    const lower = raw.toLowerCase();
    if (COLOR_NAMES[lower] || COLOR_NAMES[raw]) {
      hex = COLOR_NAMES[lower] || COLOR_NAMES[raw];
    } else if (raw.startsWith('#') && isValidHex(raw)) {
      hex = raw.length === 4
        ? '#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3]
        : raw;
    } else if (lower.startsWith('rgb')) {
      hex = rgbToHex(raw);
    } else if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(raw)) {
      const w = '#' + raw;
      hex = isValidHex(w) ? (w.length === 4 ? '#' + w[1] + w[1] + w[2] + w[2] + w[3] + w[3] : w) : null;
    }
    if (hex) {
      addColor(qId, hex.toUpperCase());
      setColorInputs(p => ({ ...p, [qId]: '' }));
      setColorErrors(p => ({ ...p, [qId]: '' }));
    } else {
      setColorErrors(p => ({
        ...p,
        [qId]: language === 'ar' ? 'صيغة لون غير صحيحة' : 'Invalid color format',
      }));
    }
  };

  const renderQuestion = (q: CustomQuestion) => {
    const label = language === 'ar' ? q.question_ar : q.question_en;

    switch (q.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              value={(answers[q.id] as string) || ''}
              onChange={e => update(q.id, e.target.value)}
              className="bg-background border-border min-h-[70px]"
            />
          </div>
        );

      case 'yes_no':
        return (
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={(answers[q.id] as string) || ''}
              onValueChange={v => update(q.id, v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                <Label htmlFor={`${q.id}-yes`} className="cursor-pointer">
                  {language === 'ar' ? 'نعم' : 'Yes'}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`${q.id}-no`} />
                <Label htmlFor={`${q.id}-no`} className="cursor-pointer">
                  {language === 'ar' ? 'لا' : 'No'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'choices':
        return (
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={(answers[q.id] as string) || ''}
              onValueChange={v => update(q.id, v)}
              className="flex flex-wrap gap-3"
            >
              {(q.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.label_en} id={`${q.id}-opt-${i}`} />
                  <Label htmlFor={`${q.id}-opt-${i}`} className="cursor-pointer">
                    {language === 'ar' ? opt.label_ar : opt.label_en}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'colors': {
        const colors = (answers[q.id] as string[]) || [];
        const nativeRef = React.createRef<HTMLInputElement>();
        return (
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map(c => {
                  const name = Object.entries(COLOR_NAMES).find(([, v]) => v === c)?.[0];
                  return (
                    <motion.div key={c} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
                      <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                      <span className="text-sm text-foreground">{name || c}</span>
                      <button type="button" onClick={() => removeColor(q.id, c)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 items-start">
              <label className="relative shrink-0 cursor-pointer">
                <input ref={nativeRef} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={() => {}} onBlur={() => nativeRef.current && addColor(q.id, nativeRef.current.value.toUpperCase())} />
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted hover:border-primary/50 transition-colors">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                </div>
              </label>
              <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                  <Input
                    value={colorInputs[q.id] || ''}
                    onChange={e => { setColorInputs(p => ({ ...p, [q.id]: e.target.value })); setColorErrors(p => ({ ...p, [q.id]: '' })); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCustomColor(q.id))}
                    placeholder={language === 'ar' ? '#FF5733 أو navy' : '#FF5733 or navy'}
                    className="bg-background border-border font-mono text-sm" dir="ltr"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleCustomColor(q.id)} className="shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {colorErrors[q.id] && <p className="text-xs text-destructive">{colorErrors[q.id]}</p>}
              </div>
            </div>
          </div>
        );
      }

      case 'image_upload':
        return (
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            {answers[q.id] ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                <img src={answers[q.id] as string} alt="" className="w-full h-full object-contain bg-muted" />
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2"
                  onClick={() => update(q.id, null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'ارفق صورة' : 'Upload image'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => update(q.id, reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {label} {q.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <Input
                value={(answers[q.id] as string) || ''}
                onChange={e => update(q.id, e.target.value)}
                placeholder={language === 'ar' ? 'Discord: ja2b' : 'Discord: ja2b'}
                className="bg-background border-border"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl bg-card/50 border border-border"
    >
      <div className="text-center space-y-1">
        <h3 className="font-display font-semibold text-lg text-foreground flex items-center justify-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
        </h3>
      </div>
      <div className="space-y-5">
        {questions.map(q => (
          <div key={q.id}>{renderQuestion(q)}</div>
        ))}
      </div>
    </motion.div>
  );
};

export default DynamicQuestionsForm;
