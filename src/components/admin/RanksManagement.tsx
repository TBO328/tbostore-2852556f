import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown, Star, Diamond, User, Shield, Percent, Save, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Rank {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  discount_percent: number;
  badge_color: string;
  icon: string;
  properties: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const availableProperties = [
  { id: 'priority_support', label_en: 'Priority Support', label_ar: 'دعم أولوي' },
  { id: 'early_access', label_en: 'Early Access to New Products', label_ar: 'وصول مبكر للمنتجات الجديدة' },
  { id: 'free_shipping', label_en: 'Free Shipping', label_ar: 'شحن مجاني' },
  { id: 'exclusive_offers', label_en: 'Exclusive Offers', label_ar: 'عروض حصرية' },
  { id: 'double_points', label_en: 'Double Loyalty Points', label_ar: 'نقاط ولاء مضاعفة' },
  { id: 'gift_on_birthday', label_en: 'Birthday Gift', label_ar: 'هدية عيد الميلاد' },
  { id: 'dedicated_manager', label_en: 'Dedicated Account Manager', label_ar: 'مدير حساب مخصص' },
  { id: 'extended_returns', label_en: 'Extended Return Period', label_ar: 'فترة إرجاع ممتدة' },
];

const iconOptions = [
  { value: 'user', label: 'User', icon: User },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'diamond', label: 'Diamond', icon: Diamond },
  { value: 'shield', label: 'Shield', icon: Shield },
];

const colorOptions = [
  { value: '#808080', label: 'Gray' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#C0C0C0', label: 'Silver' },
  { value: '#E5E4E2', label: 'Platinum' },
  { value: '#B87333', label: 'Bronze' },
  { value: '#00BFFF', label: 'Blue' },
  { value: '#FF69B4', label: 'Pink' },
  { value: '#9400D3', label: 'Purple' },
];

const RanksManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rankToDelete, setRankToDelete] = useState<Rank | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    discount_percent: 0,
    badge_color: '#FFD700',
    icon: 'crown',
    properties: [] as string[],
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ranks')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching ranks:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في جلب الرتب' : 'Failed to fetch ranks',
        variant: 'destructive',
      });
    } else {
      setRanks((data || []).map(rank => ({
        ...rank,
        properties: Array.isArray(rank.properties) ? rank.properties as string[] : [],
      })));
    }
    setLoading(false);
  };

  const handleSelectRank = (rank: Rank) => {
    setSelectedRank(rank);
    setFormData({
      name_en: rank.name_en,
      name_ar: rank.name_ar,
      description_en: rank.description_en || '',
      description_ar: rank.description_ar || '',
      discount_percent: rank.discount_percent,
      badge_color: rank.badge_color,
      icon: rank.icon,
      properties: rank.properties,
      display_order: rank.display_order,
      is_active: rank.is_active,
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedRank(null);
    setFormData({
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      discount_percent: 0,
      badge_color: '#FFD700',
      icon: 'crown',
      properties: [],
      display_order: ranks.length,
      is_active: true,
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name_en.trim() || !formData.name_ar.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الاسم مطلوب' : 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      if (isCreating) {
        const { error } = await supabase.from('ranks').insert([{
          name_en: formData.name_en.trim(),
          name_ar: formData.name_ar.trim(),
          description_en: formData.description_en.trim() || null,
          description_ar: formData.description_ar.trim() || null,
          discount_percent: formData.discount_percent,
          badge_color: formData.badge_color,
          icon: formData.icon,
          properties: formData.properties,
          display_order: formData.display_order,
          is_active: formData.is_active,
        }]);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم الإنشاء' : 'Created',
          description: language === 'ar' ? 'تم إنشاء الرتبة بنجاح' : 'Rank created successfully',
        });
      } else if (selectedRank) {
        const { error } = await supabase.from('ranks').update({
          name_en: formData.name_en.trim(),
          name_ar: formData.name_ar.trim(),
          description_en: formData.description_en.trim() || null,
          description_ar: formData.description_ar.trim() || null,
          discount_percent: formData.discount_percent,
          badge_color: formData.badge_color,
          icon: formData.icon,
          properties: formData.properties,
          display_order: formData.display_order,
          is_active: formData.is_active,
        }).eq('id', selectedRank.id);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم الحفظ' : 'Saved',
          description: language === 'ar' ? 'تم تحديث الرتبة بنجاح' : 'Rank updated successfully',
        });
      }

      await fetchRanks();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedRank(null);
    } catch (error) {
      console.error('Error saving rank:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الرتبة' : 'Failed to save rank',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!rankToDelete) return;

    try {
      const { error } = await supabase.from('ranks').delete().eq('id', rankToDelete.id);
      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الرتبة بنجاح' : 'Rank deleted successfully',
      });

      await fetchRanks();
      setSelectedRank(null);
    } catch (error) {
      console.error('Error deleting rank:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف الرتبة' : 'Failed to delete rank',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setRankToDelete(null);
    }
  };

  const toggleProperty = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.includes(propertyId)
        ? prev.properties.filter(p => p !== propertyId)
        : [...prev.properties, propertyId],
    }));
  };

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(o => o.value === iconName);
    return option ? option.icon : Crown;
  };

  // Detail View
  if (selectedRank || isCreating) {
    const IconComponent = getIconComponent(formData.icon);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedRank(null);
              setIsCreating(false);
              setIsEditing(false);
            }}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ar' ? 'رجوع للقائمة' : 'Back to List'}
          </Button>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  if (isCreating) {
                    setIsCreating(false);
                    setSelectedRank(null);
                  } else {
                    setIsEditing(false);
                    if (selectedRank) handleSelectRank(selectedRank);
                  }
                }}>
                  <X className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setRankToDelete(selectedRank);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'حذف' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Rank Preview Card */}
        <Card className="border-2" style={{ borderColor: formData.badge_color }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: formData.badge_color + '20', color: formData.badge_color }}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>{language === 'ar' ? formData.name_ar : formData.name_en}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? formData.description_ar : formData.description_en}
                </p>
              </div>
              <Badge 
                className="ml-auto text-white"
                style={{ backgroundColor: formData.badge_color }}
              >
                <Percent className="w-3 h-3 mr-1" />
                {formData.discount_percent}% {language === 'ar' ? 'خصم' : 'Discount'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    disabled={!isEditing}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                    disabled={!isEditing}
                    rows={2}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نسبة الخصم الدائم %' : 'Permanent Discount %'}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.discount_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'لون الشارة' : 'Badge Color'}</Label>
                  <Select
                    value={formData.badge_color}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, badge_color: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: option.value }} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{language === 'ar' ? 'مفعّل' : 'Active'}</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الخصائص والمميزات' : 'Properties & Features'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => isEditing && toggleProperty(property.id)}
                    className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      formData.properties.includes(property.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${!isEditing ? 'opacity-70 cursor-default' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {language === 'ar' ? property.label_ar : property.label_en}
                      </span>
                      <Switch
                        checked={formData.properties.includes(property.id)}
                        onCheckedChange={() => isEditing && toggleProperty(property.id)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'ar' 
                  ? 'سيتم حذف هذه الرتبة نهائياً. المستخدمون الذين لديهم هذه الرتبة سيفقدونها.'
                  : 'This rank will be permanently deleted. Users with this rank will lose it.'}
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
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{language === 'ar' ? 'إدارة الرتب' : 'Ranks Management'}</h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إنشاء وتعديل رتب العملاء مع الخصومات الدائمة' : 'Create and edit customer ranks with permanent discounts'}
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'إضافة رتبة' : 'Add Rank'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : ranks.length === 0 ? (
        <Card className="py-12 text-center">
          <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'لا توجد رتب بعد' : 'No ranks yet'}
          </p>
          <Button className="mt-4" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إنشاء أول رتبة' : 'Create First Rank'}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ranks.map((rank) => {
            const IconComponent = getIconComponent(rank.icon);
            return (
              <Card
                key={rank.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelectRank(rank)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: rank.badge_color + '20', color: rank.badge_color }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {language === 'ar' ? rank.name_ar : rank.name_en}
                      </h3>
                      {!rank.is_active && (
                        <Badge variant="secondary">{language === 'ar' ? 'معطل' : 'Inactive'}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {language === 'ar' ? rank.description_ar : rank.description_en}
                    </p>
                  </div>
                  <Badge 
                    className="shrink-0 text-white"
                    style={{ backgroundColor: rank.badge_color }}
                  >
                    <Percent className="w-3 h-3 mr-1" />
                    {rank.discount_percent}%
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RanksManagement;
