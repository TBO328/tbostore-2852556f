import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Image, Video, FileImage, Loader2, Eye, EyeOff, ExternalLink, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'gif';
}

interface PortfolioItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  media_files: MediaFile[];
  display_order: number;
  is_active: boolean;
  category: string | null;
}

const PORTFOLIO_CATEGORIES = [
  { value: 'streamers', labelAr: 'تصاميمنا للستريمرز', labelEn: 'Streamer Designs' },
  { value: 'stores', labelAr: 'تصاميمنا للمتاجر', labelEn: 'Store Designs' },
  { value: 'other', labelAr: 'تصاميمنا الأخرى', labelEn: 'Other Designs' },
];


const PortfolioManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const extraFilesInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    media_url: '',
    media_type: 'image',
    thumbnail_url: '',
    media_files: [] as MediaFile[],
    display_order: 0,
    is_active: true,
    category: 'streamers',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'فشل في جلب الأعمال' : 'Failed to fetch portfolio items', variant: 'destructive' });
    } else {
      setItems((data || []).map(item => ({
        ...item,
        media_files: Array.isArray(item.media_files) ? (item.media_files as unknown as MediaFile[]) : [],
      })));
    }
    setLoading(false);
  };

  const handleOpenDialog = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title_en: item.title_en,
        title_ar: item.title_ar,
        description_en: item.description_en || '',
        description_ar: item.description_ar || '',
        media_url: item.media_url,
        media_type: item.media_type,
        thumbnail_url: item.thumbnail_url || '',
        media_files: item.media_files || [],
        display_order: item.display_order,
        is_active: item.is_active,
        category: item.category || 'streamers',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title_en: '', title_ar: '', description_en: '', description_ar: '',
        media_url: '', media_type: 'image', thumbnail_url: '',
        media_files: [], display_order: items.length, is_active: true,
      });
    }
    setDialogOpen(true);
  };

  // Upload a single file and return its public URL + type
  const uploadFile = async (file: File): Promise<{ url: string; type: MediaFile['type'] } | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    let type: MediaFile['type'] = 'image';
    if (file.type.startsWith('video/')) type = 'video';
    else if (fileExt === 'gif') type = 'gif';

    const { error } = await supabase.storage.from('products').upload(filePath, file);
    if (error) return null;

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
    return { url: urlData.publicUrl, type };
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const result = await uploadFile(file);
    if (result) {
      setFormData(prev => ({ ...prev, thumbnail_url: result.url }));
    } else {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'فشل رفع الصورة المصغرة' : 'Failed to upload thumbnail', variant: 'destructive' });
    }
    setUploadingThumb(false);
  };

  const handleMainMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    if (result) {
      setFormData(prev => ({ ...prev, media_url: result.url, media_type: result.type }));
    } else {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file', variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleExtraFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingExtra(true);

    const uploaded: MediaFile[] = [];
    for (const file of files) {
      const result = await uploadFile(file);
      if (result) uploaded.push(result);
    }

    setFormData(prev => ({ ...prev, media_files: [...prev.media_files, ...uploaded] }));

    if (uploaded.length < files.length) {
      toast({ title: language === 'ar' ? 'تحذير' : 'Warning', description: language === 'ar' ? `تم رفع ${uploaded.length} من ${files.length} ملف` : `Uploaded ${uploaded.length} of ${files.length} files`, variant: 'destructive' });
    }
    setUploadingExtra(false);
    // Reset input so same files can be re-selected
    if (extraFilesInputRef.current) extraFilesInputRef.current.value = '';
  };

  const removeExtraFile = (index: number) => {
    setFormData(prev => ({ ...prev, media_files: prev.media_files.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!formData.title_en.trim() || !formData.title_ar.trim() || !formData.media_url) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'العنوان والملف الرئيسي مطلوبان' : 'Title and main media file are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title_en: formData.title_en.trim(),
        title_ar: formData.title_ar.trim(),
        description_en: formData.description_en.trim() || null,
        description_ar: formData.description_ar.trim() || null,
        media_url: formData.media_url,
        media_type: formData.media_type,
        thumbnail_url: formData.thumbnail_url || null,
        media_files: formData.media_files as unknown as any,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingItem) {
        const { error } = await supabase.from('portfolio_items').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: language === 'ar' ? 'تم التحديث' : 'Updated', description: language === 'ar' ? 'تم تحديث العمل بنجاح' : 'Portfolio item updated successfully' });
      } else {
        const { error } = await supabase.from('portfolio_items').insert([payload]);
        if (error) throw error;
        toast({ title: language === 'ar' ? 'تم الإضافة' : 'Added', description: language === 'ar' ? 'تم إضافة العمل بنجاح' : 'Portfolio item added successfully' });
      }
      await fetchItems();
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'فشل في حفظ العمل' : 'Failed to save portfolio item', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      toast({ title: language === 'ar' ? 'تم الحذف' : 'Deleted' });
      await fetchItems();
    } catch {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleActive = async (item: PortfolioItem) => {
    await supabase.from('portfolio_items').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchItems();
  };

  const getMediaTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4" />;
    if (type === 'gif') return <FileImage className="w-4 h-4" />;
    return <Image className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{language === 'ar' ? 'أعمالنا' : 'Our Works'}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'إدارة معرض الأعمال والتصاميم' : 'Manage portfolio and design showcase'}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة عمل' : 'Add Work'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? (language === 'ar' ? 'تعديل العمل' : 'Edit Work') : (language === 'ar' ? 'إضافة عمل جديد' : 'Add New Work')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">

              {/* ── Thumbnail ── */}
              <div className="space-y-2">
                <Label className="font-semibold">📷 {language === 'ar' ? 'الصورة المصغرة' : 'Thumbnail'}</Label>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تظهر في قائمة الأعمال' : 'Shown in portfolio grid'}</p>
                <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb} className="w-full">
                  {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Image className="w-4 h-4 mr-2" />}
                  {language === 'ar' ? 'رفع صورة مصغرة' : 'Upload Thumbnail'}
                </Button>
                {formData.thumbnail_url && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={formData.thumbnail_url} className="w-full h-36 object-cover" alt="Thumbnail" />
                    <button onClick={() => setFormData(p => ({ ...p, thumbnail_url: '' }))} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Main Media ── */}
              <div className="space-y-2">
                <Label className="font-semibold">🎬 {language === 'ar' ? 'الملف الرئيسي' : 'Main Media File'}</Label>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'أول ملف يظهر في صفحة العمل' : 'First file shown in work detail page'}</p>
                <input ref={fileInputRef} type="file" accept="image/*,video/*,.gif" onChange={handleMainMediaUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                  {language === 'ar' ? 'رفع الملف الرئيسي' : 'Upload Main File'}
                </Button>
                {formData.media_url && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <AspectRatio ratio={16 / 9}>
                      {formData.media_type === 'video' ? (
                        <video src={formData.media_url} className="object-cover w-full h-full" controls />
                      ) : (
                        <img src={formData.media_url} className="object-cover w-full h-full" alt="Preview" />
                      )}
                    </AspectRatio>
                    <button onClick={() => setFormData(p => ({ ...p, media_url: '' }))} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Media Type */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الملف الرئيسي' : 'Main Media Type'}</Label>
                <Select value={formData.media_type} onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">{language === 'ar' ? 'صورة' : 'Image'}</SelectItem>
                    <SelectItem value="video">{language === 'ar' ? 'فيديو' : 'Video'}</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ── Extra Files ── */}
              <div className="space-y-2">
                <Label className="font-semibold">📎 {language === 'ar' ? 'ملفات إضافية' : 'Additional Files'}</Label>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'أرفق قد ما تحتاج من صور وفيديوهات — تظهر كلها في صفحة العمل' : 'Attach as many images/videos as you need — all shown in work detail page'}</p>
                <input
                  ref={extraFilesInputRef}
                  type="file"
                  accept="image/*,video/*,.gif"
                  multiple
                  onChange={handleExtraFilesUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => extraFilesInputRef.current?.click()}
                  disabled={uploadingExtra}
                  className="w-full border-dashed border-2"
                >
                  {uploadingExtra ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />{language === 'ar' ? 'رفع ملفات (يمكن اختيار أكثر من ملف)' : 'Upload Files (select multiple)'}</>
                  )}
                </Button>

                {/* Extra files grid */}
                {formData.media_files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.media_files.map((file, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                        {file.type === 'video' ? (
                          <video src={file.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={file.url} className="w-full h-full object-cover" alt={`File ${index + 1}`} />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => removeExtraFile(index)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {file.type === 'video' ? '▶' : file.type === 'gif' ? 'GIF' : '🖼'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {formData.media_files.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {formData.media_files.length} {language === 'ar' ? 'ملف إضافي' : 'additional file(s)'}
                    {' · '}
                    {language === 'ar' ? 'إجمالي' : 'Total'}: {1 + formData.media_files.length} {language === 'ar' ? 'ملف' : 'file(s)'}
                  </p>
                )}
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input value={formData.title_ar} onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))} dir="rtl" />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea value={formData.description_ar} onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))} rows={3} dir="rtl" />
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 mr-4">
                  <Label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
                  <Input type="number" value={formData.display_order} onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                  <Label>{language === 'ar' ? 'نشط' : 'Active'}</Label>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد أعمال بعد' : 'No portfolio items yet'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_active ? 'opacity-50' : ''}`}>
              <AspectRatio ratio={16 / 9}>
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} className="object-cover w-full h-full" alt={item.title_en} />
                ) : item.media_type === 'video' ? (
                  <video src={item.media_url} className="object-cover w-full h-full" />
                ) : (
                  <img src={item.media_url} className="object-cover w-full h-full" alt={item.title_en} />
                )}
              </AspectRatio>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{language === 'ar' ? item.title_ar : item.title_en}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{language === 'ar' ? item.description_ar : item.description_en}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getMediaTypeIcon(item.media_type)}
                      {item.media_type}
                    </Badge>
                    {(item.media_files?.length || 0) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {1 + (item.media_files?.length || 0)} {language === 'ar' ? 'ملف' : 'files'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="ghost" size="icon" title={language === 'ar' ? 'معاينة الصفحة' : 'Preview Page'} onClick={() => window.open(`/portfolio/${item.id}`, '_blank')}>
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(item)}>
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'ar' ? 'حذف العمل' : 'Delete Work'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' ? 'هل أنت متأكد من حذف هذا العمل؟' : 'Are you sure you want to delete this work?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortfolioManagement;
