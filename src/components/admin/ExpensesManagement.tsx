import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Receipt, FileDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import sarSymbol from '@/assets/sar-symbol.png';

interface Expense {
  id: string;
  description_en: string;
  description_ar: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

interface ExpensesManagementProps {
  language: 'en' | 'ar';
  totalRevenue: number;
}

const ExpensesManagement: React.FC<ExpensesManagementProps> = ({ language, totalRevenue }) => {
  const { toast } = useToast();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    description_en: '',
    description_ar: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  const formatPriceWithSymbol = (price: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center gap-1">
          {price.toFixed(2)}
          <img src={sarSymbol} alt="SAR" className="inline-block h-4 w-4" style={{ filter: symbolFilter }} />
        </span>
      );
    }
    return <span>{formatPrice(price)}</span>;
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const expenseData = {
        description_en: form.description_en,
        description_ar: form.description_ar,
        amount: parseFloat(form.amount),
        expense_date: form.expense_date
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Expense updated!' : 'تم تحديث المصروف!' });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Expense added!' : 'تم إضافة المصروف!' });
      }

      setDialogOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({ title: language === 'en' ? 'Error' : 'خطأ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setForm({
      description_en: '',
      description_ar: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      description_en: expense.description_en,
      description_ar: expense.description_ar,
      amount: expense.amount.toString(),
      expense_date: expense.expense_date
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this expense?' : 'حذف هذا المصروف؟')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Expense deleted' : 'تم حذف المصروف' });
      fetchExpenses();
    } catch (error) {
      toast({ title: language === 'en' ? 'Error' : 'خطأ', variant: 'destructive' });
    }
  };

  const exportToPDF = () => {
    // Create printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>${language === 'en' ? 'Financial Report' : 'التقرير المالي'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; color: #333; }
          .summary { display: flex; justify-content: space-around; margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 10px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 14px; color: #666; }
          .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .revenue { color: #22c55e; }
          .expense { color: #ef4444; }
          .profit { color: ${netProfit >= 0 ? '#22c55e' : '#ef4444'}; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { padding: 12px; text-align: ${language === 'ar' ? 'right' : 'left'}; border-bottom: 1px solid #ddd; }
          th { background: #333; color: white; }
          .date { color: #666; font-size: 12px; text-align: center; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>${language === 'en' ? 'Financial Report' : 'التقرير المالي'}</h1>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">${language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}</div>
            <div class="summary-value revenue">${totalRevenue.toFixed(2)} ${currency}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">${language === 'en' ? 'Total Expenses' : 'إجمالي المصروفات'}</div>
            <div class="summary-value expense">${totalExpenses.toFixed(2)} ${currency}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">${language === 'en' ? 'Net Profit' : 'صافي الربح'}</div>
            <div class="summary-value profit">${netProfit.toFixed(2)} ${currency}</div>
          </div>
        </div>
        <h3>${language === 'en' ? 'Expenses List' : 'قائمة المصروفات'}</h3>
        <table>
          <thead>
            <tr>
              <th>${language === 'en' ? 'Date' : 'التاريخ'}</th>
              <th>${language === 'en' ? 'Description' : 'الوصف'}</th>
              <th>${language === 'en' ? 'Amount' : 'المبلغ'}</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr>
                <td>${new Date(exp.expense_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                <td>${language === 'ar' ? exp.description_ar : exp.description_en}</td>
                <td>${Number(exp.amount).toFixed(2)} ${currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="date">${language === 'en' ? 'Generated on' : 'تم الإنشاء في'}: ${new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'en' ? 'Expenses & Profits' : 'المصروفات والأرباح'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF} className="gap-2">
            <FileDown className="w-4 h-4" />
            {language === 'en' ? 'Export PDF' : 'تصدير PDF'}
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'en' ? 'Add Payment' : 'إضافة دفع'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}
          </div>
          <div className="text-2xl font-bold text-green-500">
            {formatPriceWithSymbol(totalRevenue)}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Total Expenses' : 'إجمالي المصروفات'}
          </div>
          <div className="text-2xl font-bold text-red-500">
            {formatPriceWithSymbol(totalExpenses)}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">
            {language === 'en' ? 'Net Profit' : 'صافي الربح'}
          </div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPriceWithSymbol(netProfit)}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {language === 'ar' ? expense.description_ar : expense.description_en}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(expense.expense_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-red-500">
                  -{formatPriceWithSymbol(Number(expense.amount))}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {expenses.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No expenses recorded' : 'لا توجد مصروفات مسجلة'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense 
                ? (language === 'en' ? 'Edit Expense' : 'تعديل المصروف')
                : (language === 'en' ? 'Add Payment' : 'إضافة دفع')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description (English)' : 'الوصف (إنجليزي)'}</Label>
              <Input
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                placeholder="e.g., Server hosting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description (Arabic)' : 'الوصف (عربي)'}</Label>
              <Input
                value={form.description_ar}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                placeholder="مثال: استضافة الخادم"
                dir="rtl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Amount' : 'المبلغ'}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Date' : 'التاريخ'}</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {language === 'en' ? 'Save' : 'حفظ'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpensesManagement;
