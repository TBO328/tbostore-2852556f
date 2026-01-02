import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  is_active: boolean;
  display_order: number;
}

const PartnersManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `partners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addPartnerMutation = useMutation({
    mutationFn: async (data: { name: string; logo_url: string }) => {
      const maxOrder = partners.length > 0 
        ? Math.max(...partners.map(p => p.display_order)) + 1 
        : 0;

      const { error } = await supabase
        .from('partners')
        .insert({ ...data, display_order: maxOrder });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('تم إضافة الشريك بنجاح');
      resetForm();
    },
    onError: () => {
      toast.error('فشل في إضافة الشريك');
    }
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      const { error } = await supabase
        .from('partners')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('تم تحديث الشريك بنجاح');
      resetForm();
    },
    onError: () => {
      toast.error('فشل في تحديث الشريك');
    }
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('تم حذف الشريك بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف الشريك');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', logo_url: '' });
    setLogoFile(null);
    setEditingPartner(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let logoUrl = formData.logo_url;
      
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      if (!logoUrl) {
        toast.error('يرجى إضافة لوغو الشريك');
        setIsUploading(false);
        return;
      }

      if (editingPartner) {
        await updatePartnerMutation.mutateAsync({
          id: editingPartner.id,
          data: { name: formData.name, logo_url: logoUrl }
        });
      } else {
        await addPartnerMutation.mutateAsync({ name: formData.name, logo_url: logoUrl });
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, logo_url: partner.logo_url });
    setIsDialogOpen(true);
  };

  const toggleActive = async (partner: Partner) => {
    await updatePartnerMutation.mutateAsync({
      id: partner.id,
      data: { is_active: !partner.is_active }
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة الشركاء</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة شريك
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? 'تعديل الشريك' : 'إضافة شريك جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الشريك</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">لوغو الشريك</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
                {(formData.logo_url || logoFile) && (
                  <div className="mt-2 p-4 bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : formData.logo_url}
                      alt="Preview"
                      className="max-h-16 object-contain"
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'جاري الحفظ...' : (editingPartner ? 'تحديث' : 'إضافة')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد شركاء بعد. أضف شريكك الأول!
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <div className="w-16 h-12 bg-background rounded flex items-center justify-center">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-h-10 max-w-14 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{partner.name}</p>
                </div>
                <Switch
                  checked={partner.is_active}
                  onCheckedChange={() => toggleActive(partner)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(partner)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deletePartnerMutation.mutate(partner.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnersManagement;
