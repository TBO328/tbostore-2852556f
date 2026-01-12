import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Upload, Image, Package, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mapErrorToUserMessage } from '@/lib/errors';
import sarSymbol from '@/assets/sar-symbol.png';

interface StreamerPackage {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  category: string;
  category_ar: string;
  created_at: string;
  updated_at: string;
}

interface PackageCategory {
  id: string;
  value: string;
  title_en: string;
  title_ar: string;
}

const PackagesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();
  const { toast } = useToast();

  const [packages, setPackages] = useState<StreamerPackage[]>([]);
  const [packageCategories, setPackageCategories] = useState<PackageCategory[]>([
    { id: '1', value: 'streamers', title_en: 'Streamer Packages', title_ar: 'باقات الستريمرز' }
  ]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<StreamerPackage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('packages');

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    price: '',
    image_url: '',
    display_order: '',
    is_active: true,
    category: 'streamers',
    category_ar: 'باقات الستريمرز'
  });

  const [categoryForm, setCategoryForm] = useState({
    value: '',
    title_en: '',
    title_ar: ''
  });

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  const formatPriceWithSymbol = (price: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center gap-1 font-display">
          {price.toFixed(2)}
          <img src={sarSymbol} alt="SAR" className="inline-block h-4 w-4" style={{ filter: symbolFilter }} />
        </span>
      );
    }
    return <span className="font-display">{formatPrice(price)}</span>;
  };

  useEffect(() => {
    fetchPackages();
    loadCategories();
  }, []);

  const loadCategories = () => {
    const saved = localStorage.getItem('tbo_package_categories');
    if (saved) {
      try {
        setPackageCategories(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading package categories:', e);
      }
    }
  };

  const saveCategories = (cats: PackageCategory[]) => {
    localStorage.setItem('tbo_package_categories', JSON.stringify(cats));
    setPackageCategories(cats);
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('streamer_packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `package-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);

    try {
      let imageUrl = form.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      const packageData = {
        name_en: form.name_en,
        name_ar: form.name_ar,
        price: parseFloat(form.price) || 0,
        image_url: imageUrl || null,
        display_order: parseInt(form.display_order) || 0,
        is_active: form.is_active,
        category: form.category,
        category_ar: form.category_ar
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('streamer_packages')
          .update(packageData)
          .eq('id', editingPackage.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Package updated!' : 'تم تحديث الباقة!' });
      } else {
        const { error } = await supabase
          .from('streamer_packages')
          .insert(packageData);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Package created!' : 'تم إنشاء الباقة!' });
      }

      setDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCategory = () => {
    if (!categoryForm.value || !categoryForm.title_en || !categoryForm.title_ar) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Please fill all fields' : 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    const newCategory: PackageCategory = {
      id: Date.now().toString(),
      value: categoryForm.value.toLowerCase().replace(/\s+/g, '-'),
      title_en: categoryForm.title_en,
      title_ar: categoryForm.title_ar
    };

    saveCategories([...packageCategories, newCategory]);
    setCategoryDialogOpen(false);
    setCategoryForm({ value: '', title_en: '', title_ar: '' });
    toast({ title: language === 'en' ? 'Category added!' : 'تمت إضافة النوع!' });
  };

  const deleteCategory = (id: string) => {
    if (id === '1') return; // Don't delete default category
    saveCategories(packageCategories.filter(c => c.id !== id));
    toast({ title: language === 'en' ? 'Category deleted' : 'تم حذف النوع' });
  };

  const resetForm = () => {
    setEditingPackage(null);
    setForm({
      name_en: '',
      name_ar: '',
      price: '',
      image_url: '',
      display_order: '',
      is_active: true,
      category: 'streamers',
      category_ar: 'باقات الستريمرز'
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const editPackage = (pkg: StreamerPackage) => {
    setEditingPackage(pkg);
    setForm({
      name_en: pkg.name_en,
      name_ar: pkg.name_ar,
      price: pkg.price.toString(),
      image_url: pkg.image_url || '',
      display_order: pkg.display_order.toString(),
      is_active: pkg.is_active,
      category: pkg.category || 'streamers',
      category_ar: pkg.category_ar || 'باقات الستريمرز'
    });
    setImagePreview(pkg.image_url || null);
    setImageFile(null);
    setDialogOpen(true);
  };

  const deletePackage = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this package?' : 'حذف هذه الباقة؟')) return;
    
    const { error } = await supabase
      .from('streamer_packages')
      .delete()
      .eq('id', id);

    if (error) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } else {
      toast({ title: language === 'en' ? 'Package deleted' : 'تم حذف الباقة' });
      fetchPackages();
    }
  };

  // Group packages by category
  const groupedPackages = packages.reduce((acc, pkg) => {
    const cat = pkg.category || 'streamers';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pkg);
    return acc;
  }, {} as Record<string, StreamerPackage[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="packages" className="font-display">
              {language === 'en' ? 'Packages' : 'الباقات'}
            </TabsTrigger>
            <TabsTrigger value="categories" className="font-display">
              {language === 'en' ? 'Package Types' : 'أنواع الباقات'}
            </TabsTrigger>
          </TabsList>

          {selectedTab === 'packages' && (
            <Dialog open={dialogOpen} onOpenChange={open => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="neon-filled">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Add Package' : 'إضافة باقة'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editingPackage 
                      ? (language === 'en' ? 'Edit Package' : 'تعديل الباقة') 
                      : (language === 'en' ? 'Add Package' : 'إضافة باقة')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label className="font-display">{language === 'en' ? 'Package Type' : 'نوع الباقة'}</Label>
                    <Select 
                      value={form.category} 
                      onValueChange={(value) => {
                        const cat = packageCategories.find(c => c.value === value);
                        setForm({ 
                          ...form, 
                          category: value,
                          category_ar: cat?.title_ar || value
                        });
                      }}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {packageCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.value} className="font-display">
                            {language === 'ar' ? cat.title_ar : cat.title_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-display">Name (EN)</Label>
                      <Input 
                        value={form.name_en} 
                        onChange={e => setForm({ ...form, name_en: e.target.value })} 
                        required 
                        className="font-display"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-display">الاسم (عربي)</Label>
                      <Input 
                        value={form.name_ar} 
                        onChange={e => setForm({ ...form, name_ar: e.target.value })} 
                        required 
                        dir="rtl"
                        className="font-display"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-display">{language === 'en' ? 'Price (SAR)' : 'السعر (ريال)'}</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={form.price} 
                        onChange={e => setForm({ ...form, price: e.target.value })} 
                        placeholder="0 = Contact Us"
                        className="font-display"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-display">{language === 'en' ? 'Display Order' : 'ترتيب العرض'}</Label>
                      <Input 
                        type="number" 
                        value={form.display_order} 
                        onChange={e => setForm({ ...form, display_order: e.target.value })}
                        className="font-display"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="font-display">{language === 'en' ? 'Package Image' : 'صورة الباقة'}</Label>
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-muted" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setForm({ ...form, image_url: '' });
                          }}
                        >
                          {language === 'en' ? 'Remove' : 'إزالة'}
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground font-display">
                          {language === 'en' ? 'Click to upload image' : 'انقر لرفع صورة'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={form.is_active} 
                      onCheckedChange={checked => setForm({ ...form, is_active: checked })} 
                    />
                    <Label className="font-display">{language === 'en' ? 'Active' : 'مفعل'}</Label>
                  </div>

                  <Button type="submit" variant="neon-filled" className="w-full font-display" disabled={uploadingImage}>
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Uploading...' : 'جاري الرفع...'}
                      </>
                    ) : (
                      editingPackage 
                        ? (language === 'en' ? 'Update' : 'تحديث') 
                        : (language === 'en' ? 'Create' : 'إنشاء')
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {selectedTab === 'categories' && (
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon-filled">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Add Type' : 'إضافة نوع'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {language === 'en' ? 'Add Package Type' : 'إضافة نوع باقات'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-display">ID</Label>
                    <Input 
                      value={categoryForm.value} 
                      onChange={e => setCategoryForm({ ...categoryForm, value: e.target.value })} 
                      placeholder="e.g., gaming"
                      className="font-display"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">Title (EN)</Label>
                    <Input 
                      value={categoryForm.title_en} 
                      onChange={e => setCategoryForm({ ...categoryForm, title_en: e.target.value })} 
                      placeholder="e.g., Gaming Packages"
                      className="font-display"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display">العنوان (عربي)</Label>
                    <Input 
                      value={categoryForm.title_ar} 
                      onChange={e => setCategoryForm({ ...categoryForm, title_ar: e.target.value })} 
                      placeholder="مثال: باقات الألعاب"
                      dir="rtl"
                      className="font-display"
                    />
                  </div>
                  <Button onClick={handleAddCategory} variant="neon-filled" className="w-full font-display">
                    {language === 'en' ? 'Add Type' : 'إضافة النوع'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="packages">
          {/* Grouped Packages */}
          {Object.entries(groupedPackages).map(([category, pkgs]) => {
            const catInfo = packageCategories.find(c => c.value === category);
            return (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {language === 'ar' ? (catInfo?.title_ar || category) : (catInfo?.title_en || category)}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pkgs.map(pkg => (
                    <motion.div 
                      key={pkg.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {pkg.image_url ? (
                          <img src={pkg.image_url} alt={pkg.name_en} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {!pkg.is_active && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-destructive font-display font-medium">
                              {language === 'en' ? 'Inactive' : 'غير مفعل'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-foreground truncate">
                          {language === 'ar' ? pkg.name_ar : pkg.name_en}
                        </h3>
                        <p className="text-sm text-muted-foreground font-display">
                          {language === 'en' ? 'Order:' : 'الترتيب:'} {pkg.display_order}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-primary font-bold">
                            {pkg.price === 0 
                              ? (language === 'en' ? 'Contact Us' : 'تواصل معنا')
                              : formatPriceWithSymbol(Number(pkg.price))
                            }
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => editPackage(pkg)} 
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deletePackage(pkg.id)} 
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {packages.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-display">
                {language === 'en' ? 'No packages yet' : 'لا توجد باقات بعد'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packageCategories.map(cat => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-foreground">
                      {language === 'ar' ? cat.title_ar : cat.title_en}
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono">{cat.value}</p>
                  </div>
                  {cat.id !== '1' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteCategory(cat.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PackagesManagement;
