import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pencil, Save, Loader2, Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapErrorToUserMessage } from '@/lib/errors';

interface PageContent {
  id: string;
  page_key: string;
  title_en: string | null;
  title_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const pageLabels: Record<string, { en: string; ar: string; description_en: string; description_ar: string }> = {
  hero: { 
    en: 'Hero Section', 
    ar: 'قسم البطل',
    description_en: 'Main banner on homepage',
    description_ar: 'البانر الرئيسي في الصفحة الرئيسية'
  },
  about: { 
    en: 'About Us', 
    ar: 'من نحن',
    description_en: 'About page content',
    description_ar: 'محتوى صفحة من نحن'
  },
  contact: { 
    en: 'Contact Us', 
    ar: 'تواصل معنا',
    description_en: 'Contact information and details',
    description_ar: 'معلومات وتفاصيل التواصل'
  },
  footer: { 
    en: 'Footer', 
    ar: 'التذييل',
    description_en: 'Footer content and links',
    description_ar: 'محتوى وروابط التذييل'
  },
};

const PagesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_key');

      if (error) throw error;
      setPages((data as PageContent[]) || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `page-content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleEdit = (page: PageContent) => {
    setEditingPage(page);
    setImagePreview(page.image_url);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setSaving(true);
    try {
      let imageUrl = editingPage.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('page_content')
        .update({
          title_en: editingPage.title_en,
          title_ar: editingPage.title_ar,
          content_en: editingPage.content_en,
          content_ar: editingPage.content_ar,
          image_url: imageUrl,
        })
        .eq('id', editingPage.id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Page updated!' : 'تم تحديث الصفحة!',
      });

      setDialogOpen(false);
      fetchPages();
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (editingPage) {
      setEditingPage({ ...editingPage, image_url: null });
    }
  };

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
          {language === 'en' ? 'Manage Pages' : 'إدارة الصفحات'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {pages.length} {language === 'en' ? 'pages' : 'صفحة'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => {
          const label = pageLabels[page.page_key] || { 
            en: page.page_key, 
            ar: page.page_key,
            description_en: '',
            description_ar: ''
          };

          return (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  {page.image_url ? (
                    <img 
                      src={page.image_url} 
                      alt="" 
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <FileText className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg">
                    {language === 'en' ? label.en : label.ar}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'en' ? label.description_en : label.description_ar}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'en' ? 'Last updated:' : 'آخر تحديث:'}{' '}
                    {new Date(page.updated_at).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US'
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(page)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'No pages yet' : 'لا توجد صفحات بعد'}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Edit Page Content' : 'تعديل محتوى الصفحة'}
            </DialogTitle>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Title (EN)' : 'العنوان (EN)'}</Label>
                  <Input
                    value={editingPage.title_en || ''}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, title_en: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Title (AR)' : 'العنوان (AR)'}</Label>
                  <Input
                    value={editingPage.title_ar || ''}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, title_ar: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Content (EN)' : 'المحتوى (EN)'}</Label>
                  <Textarea
                    value={editingPage.content_en || ''}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, content_en: e.target.value })
                    }
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Content (AR)' : 'المحتوى (AR)'}</Label>
                  <Textarea
                    value={editingPage.content_ar || ''}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, content_ar: e.target.value })
                    }
                    rows={5}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Image' : 'الصورة'}</Label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Click to upload image' : 'انقر لرفع صورة'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <Button
                variant="neon-filled"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PagesManagement;
