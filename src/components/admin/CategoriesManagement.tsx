import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, GripVertical, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  value: string;
  label_en: string;
  label_ar: string;
  display_order: number;
  is_active: boolean;
}

const CategoriesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    value: '',
    label_en: '',
    label_ar: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: language === 'en' ? 'Error loading categories' : 'خطأ في تحميل الفئات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      value: '',
      label_en: '',
      label_ar: '',
      is_active: true
    });
    setSelectedCategory(null);
  };

  const handleAdd = async () => {
    if (!formData.value || !formData.label_en || !formData.label_ar) {
      toast({
        title: language === 'en' ? 'Please fill all fields' : 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('categories').insert({
        value: formData.value.replace(/\s/g, ''),
        label_en: formData.label_en,
        label_ar: formData.label_ar,
        display_order: categories.length + 1,
        is_active: formData.is_active
      });

      if (error) throw error;

      toast({ title: language === 'en' ? 'Category added!' : 'تمت إضافة الفئة!' });
      setAddDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: language === 'en' ? 'Error adding category' : 'خطأ في إضافة الفئة',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          value: formData.value.replace(/\s/g, ''),
          label_en: formData.label_en,
          label_ar: formData.label_ar,
          is_active: formData.is_active
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast({ title: language === 'en' ? 'Category updated!' : 'تم تحديث الفئة!' });
      setEditDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: language === 'en' ? 'Error updating category' : 'خطأ في تحديث الفئة',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast({ title: language === 'en' ? 'Category deleted!' : 'تم حذف الفئة!' });
      setDeleteDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: language === 'en' ? 'Error deleting category' : 'خطأ في حذف الفئة',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      value: category.value,
      label_en: category.label_en,
      label_ar: category.label_ar,
      is_active: category.is_active
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {language === 'en' ? 'Manage Categories' : 'إدارة الفئات'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? 'Add, edit, or remove product categories' 
              : 'إضافة، تعديل، أو حذف فئات المنتجات'}
          </p>
        </div>
        
        {/* Add Category Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="neon-filled">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Category' : 'إضافة فئة'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Add New Category' : 'إضافة فئة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? 'Create a new category for your products' 
                  : 'أنشئ فئة جديدة لمنتجاتك'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Category ID (English, no spaces)' : 'معرف الفئة (إنجليزي، بدون مسافات)'}</Label>
                <Input 
                  value={formData.value} 
                  onChange={e => setFormData({ ...formData, value: e.target.value.replace(/\s/g, '') })} 
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Category Name (EN)' : 'اسم الفئة (إنجليزي)'}</Label>
                <Input 
                  value={formData.label_en} 
                  onChange={e => setFormData({ ...formData, label_en: e.target.value })} 
                  placeholder="Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Category Name (AR)' : 'اسم الفئة (عربي)'}</Label>
                <Input 
                  value={formData.label_ar} 
                  onChange={e => setFormData({ ...formData, label_ar: e.target.value })} 
                  placeholder="إلكترونيات"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} 
                />
                <Label>{language === 'en' ? 'Active' : 'مفعّلة'}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'en' ? 'Add Category' : 'إضافة الفئة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'No categories yet. Add your first category.' : 'لا توجد فئات بعد. أضف أول فئة.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  category.is_active 
                    ? 'bg-card border-border' 
                    : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                <div className="text-muted-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">ID</span>
                    <span className="font-mono text-sm text-foreground">{category.value}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">English</span>
                    <span className="font-medium text-foreground">{category.label_en}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">العربية</span>
                    <span className="font-medium text-foreground" dir="rtl">{category.label_ar}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={category.is_active} 
                    onCheckedChange={() => toggleActive(category)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Edit Category' : 'تعديل الفئة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Category ID' : 'معرف الفئة'}</Label>
              <Input 
                value={formData.value} 
                onChange={e => setFormData({ ...formData, value: e.target.value.replace(/\s/g, '') })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Category Name (EN)' : 'اسم الفئة (إنجليزي)'}</Label>
              <Input 
                value={formData.label_en} 
                onChange={e => setFormData({ ...formData, label_en: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Category Name (AR)' : 'اسم الفئة (عربي)'}</Label>
              <Input 
                value={formData.label_ar} 
                onChange={e => setFormData({ ...formData, label_ar: e.target.value })} 
                dir="rtl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} 
              />
              <Label>{language === 'en' ? 'Active' : 'مفعّلة'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {language === 'en' ? 'Delete Category' : 'حذف الفئة'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Are you sure you want to delete "${selectedCategory?.label_en}"? This action cannot be undone.`
                : `هل أنت متأكد من حذف "${selectedCategory?.label_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Delete' : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;
