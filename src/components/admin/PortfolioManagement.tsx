import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Image, Video, FileImage, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react';
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

interface PortfolioItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    media_url: '',
    media_type: 'image',
    thumbnail_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching portfolio items:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في جلب الأعمال' : 'Failed to fetch portfolio items',
        variant: 'destructive',
      });
    } else {
      setItems(data || []);
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
        display_order: item.display_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        media_url: '',
        media_type: 'image',
        thumbnail_url: '',
        display_order: items.length,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    // Determine media type
    let mediaType = 'image';
    if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else if (fileExt === 'gif') {
      mediaType = 'gif';
    }

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file',
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
    
    setFormData(prev => ({
      ...prev,
      media_url: urlData.publicUrl,
      media_type: mediaType,
    }));
    
    setUploading(false);
  };

  const handleSave = async () => {
    if (!formData.title_en.trim() || !formData.title_ar.trim() || !formData.media_url) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'العنوان والملف مطلوبان' : 'Title and media file are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({
            title_en: formData.title_en.trim(),
            title_ar: formData.title_ar.trim(),
            description_en: formData.description_en.trim() || null,
            description_ar: formData.description_ar.trim() || null,
            media_url: formData.media_url,
            media_type: formData.media_type,
            thumbnail_url: formData.thumbnail_url || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم التحديث' : 'Updated',
          description: language === 'ar' ? 'تم تحديث العمل بنجاح' : 'Portfolio item updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('portfolio_items')
          .insert([{
            title_en: formData.title_en.trim(),
            title_ar: formData.title_ar.trim(),
            description_en: formData.description_en.trim() || null,
            description_ar: formData.description_ar.trim() || null,
            media_url: formData.media_url,
            media_type: formData.media_type,
            thumbnail_url: formData.thumbnail_url || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          }]);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم الإضافة' : 'Added',
          description: language === 'ar' ? 'تم إضافة العمل بنجاح' : 'Portfolio item added successfully',
        });
      }

      await fetchItems();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ العمل' : 'Failed to save portfolio item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف العمل بنجاح' : 'Portfolio item deleted successfully',
      });

      await fetchItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف العمل' : 'Failed to delete portfolio item',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleActive = async (item: PortfolioItem) => {
    const { error } = await supabase
      .from('portfolio_items')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);

    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الحالة' : 'Failed to update status',
        variant: 'destructive',
      });
    } else {
      fetchItems();
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'gif':
        return <FileImage className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'ar' ? 'أعمالنا' : 'Our Works'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة معرض الأعمال والتصاميم' : 'Manage portfolio and design showcase'}
          </p>
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
                {editingItem 
                  ? (language === 'ar' ? 'تعديل العمل' : 'Edit Work')
                  : (language === 'ar' ? 'إضافة عمل جديد' : 'Add New Work')
                }
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Media Upload */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الملف (صورة/فيديو/GIF)' : 'Media (Image/Video/GIF)'}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Image className="w-4 h-4 mr-2" />
                    )}
                    {language === 'ar' ? 'رفع ملف' : 'Upload File'}
                  </Button>
                </div>
                {formData.media_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <AspectRatio ratio={16 / 9}>
                      {formData.media_type === 'video' ? (
                        <video src={formData.media_url} className="object-cover w-full h-full" controls />
                      ) : (
                        <img src={formData.media_url} className="object-cover w-full h-full" alt="Preview" />
                      )}
                    </AspectRatio>
                  </div>
                )}
              </div>

              {/* Media Type */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الملف' : 'Media Type'}</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">{language === 'ar' ? 'صورة' : 'Image'}</SelectItem>
                    <SelectItem value="video">{language === 'ar' ? 'فيديو' : 'Video'}</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 mr-4">
                  <Label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>{language === 'ar' ? 'نشط' : 'Active'}</Label>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
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
          <p className="text-muted-foreground">
            {language === 'ar' ? 'لا توجد أعمال بعد' : 'No portfolio items yet'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_active ? 'opacity-50' : ''}`}>
              <AspectRatio ratio={16 / 9}>
                {item.media_type === 'video' ? (
                  <video src={item.media_url} className="object-cover w-full h-full" />
                ) : (
                  <img src={item.media_url} className="object-cover w-full h-full" alt={item.title_en} />
                )}
              </AspectRatio>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold truncate">
                      {language === 'ar' ? item.title_ar : item.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {language === 'ar' ? item.description_ar : item.description_en}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getMediaTypeIcon(item.media_type)}
                    {item.media_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(item)}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
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
            <AlertDialogTitle>
              {language === 'ar' ? 'حذف العمل' : 'Delete Work'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this work? This action cannot be undone.'
              }
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
