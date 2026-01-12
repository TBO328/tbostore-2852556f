import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  value: string;
  label_en: string;
  label_ar: string;
  display_order: number;
  is_active: boolean;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to defaults
      setCategories([
        { id: '1', value: 'Subscriptions', label_en: 'Subscriptions', label_ar: 'اشتراكات', display_order: 1, is_active: true },
        { id: '2', value: 'Designs', label_en: 'Designs', label_ar: 'تصاميم', display_order: 2, is_active: true },
        { id: '3', value: 'Engagement', label_en: 'Engagement', label_ar: 'تفاعل', display_order: 3, is_active: true },
        { id: '4', value: 'Discord', label_en: 'Discord', label_ar: 'ديسكورد', display_order: 4, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories };
};

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const { error } = await supabase
      .from('categories')
      .insert(category);
    if (error) throw error;
    await fetchCategories();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};
