import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image, Save, Undo, MousePointer, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useVisualEditor } from '@/contexts/VisualEditorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryItem {
  element: HTMLElement;
  original: string;
  pageKey: string;
  contentField: 'text' | 'image';
}

interface PendingChange {
  pageKey: string;
  field: string;
  value: string;
}

const VisualEditorOverlay: React.FC = () => {
  const { isEditMode, disableEditMode, selectedElement, setSelectedElement, hoveredElement, setHoveredElement } = useVisualEditor();
  const [editValue, setEditValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Detect page key from element or URL
  const detectPageKey = (element: HTMLElement): string => {
    // Check for data-page-key attribute on parent elements
    let current: HTMLElement | null = element;
    while (current) {
      const pageKey = current.getAttribute('data-page-key');
      if (pageKey) return pageKey;
      current = current.parentElement;
    }

    // Fallback to URL-based detection
    const pathname = window.location.pathname;
    const pathMap: Record<string, string> = {
      '/': 'hero',
      '/about': 'about',
      '/products': 'products',
      '/cart': 'cart',
      '/contact': 'contact',
      '/reviews': 'reviews',
      '/policies': 'policies',
      '/favorites': 'favorites',
      '/profile': 'profile',
    };

    return pathMap[pathname] || 'hero';
  };

  // Detect if text is Arabic
  const isArabicText = (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text);
  };

  const getElementType = (element: HTMLElement): 'text' | 'image' | 'button' | 'other' => {
    if (element.tagName === 'IMG') return 'image';
    if (element.tagName === 'BUTTON' || element.closest('button')) return 'button';
    if (element.innerText && element.children.length === 0) return 'text';
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'LABEL'].includes(element.tagName)) return 'text';
    return 'other';
  };

  const getXPath = (element: HTMLElement): string => {
    const parts: string[] = [];
    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      let index = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      current = current.parentElement;
    }
    return '/' + parts.join('/');
  };

  // Custom cursor tracking
  useEffect(() => {
    if (!isEditMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setIsCursorVisible(true);
    };

    const handleMouseLeave = () => {
      setIsCursorVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEditMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    
    if (overlayRef.current?.contains(target)) return;
    if (target.closest('[data-visual-editor-toolbar]')) return;
    
    const type = getElementType(target);
    if (type !== 'other') {
      setHoveredElement(target);
    } else {
      setHoveredElement(null);
    }
  }, [isEditMode, setHoveredElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;
    
    const target = e.target as HTMLElement;
    
    if (overlayRef.current?.contains(target)) return;
    if (target.closest('[data-visual-editor-toolbar]')) return;
    
    const type = getElementType(target);
    if (type !== 'other') {
      e.preventDefault();
      e.stopPropagation();
      
      const originalContent = type === 'image' 
        ? (target as HTMLImageElement).src 
        : target.innerText;
      
      setSelectedElement({
        element: target,
        type,
        originalContent,
        xpath: getXPath(target),
      });
      
      if (type === 'image') {
        setImageUrl((target as HTMLImageElement).src);
      } else {
        setEditValue(target.innerText);
      }
    }
  }, [isEditMode, setSelectedElement]);

  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
      document.body.style.cursor = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [isEditMode, handleMouseMove, handleClick]);

  const handleSaveText = () => {
    if (!selectedElement) return;
    
    const pageKey = detectPageKey(selectedElement.element);
    const isArabic = isArabicText(editValue);
    
    setHistory(prev => [...prev, { 
      element: selectedElement.element, 
      original: selectedElement.originalContent,
      pageKey,
      contentField: 'text'
    }]);
    
    // Apply change to DOM immediately
    selectedElement.element.innerText = editValue;
    
    // Add to pending changes
    setPendingChanges(prev => [...prev, {
      pageKey,
      field: isArabic ? 'content_ar' : 'content_en',
      value: editValue,
    }]);
    
    toast.success('تم تحديث النص - اضغط "حفظ للجميع" لحفظ التغييرات');
    setSelectedElement(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `visual-editor/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      const newUrl = publicData.publicUrl;
      const pageKey = detectPageKey(selectedElement.element);
      
      setHistory(prev => [...prev, { 
        element: selectedElement.element, 
        original: selectedElement.originalContent,
        pageKey,
        contentField: 'image'
      }]);
      
      // Apply change to DOM immediately
      (selectedElement.element as HTMLImageElement).src = newUrl;
      setImageUrl(newUrl);
      
      // Add to pending changes
      setPendingChanges(prev => [...prev, {
        pageKey,
        field: 'image_url',
        value: newUrl,
      }]);
      
      toast.success('تم تحديث الصورة - اضغط "حفظ للجميع" لحفظ التغييرات');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  // Save all pending changes to database
  const handleSaveAllToDatabase = async () => {
    if (pendingChanges.length === 0) {
      toast.info('لا توجد تغييرات للحفظ');
      return;
    }

    setIsSaving(true);
    try {
      // Group changes by page key
      const changesByPage = new Map<string, Record<string, string>>();
      
      pendingChanges.forEach(change => {
        const existing = changesByPage.get(change.pageKey) || {};
        existing[change.field] = change.value;
        changesByPage.set(change.pageKey, existing);
      });

      // Save each page's changes
      for (const [pageKey, updates] of changesByPage) {
        // Check if page exists
        const { data: existingPage } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_key', pageKey)
          .single();

        if (existingPage) {
          // Update existing
          const { error } = await supabase
            .from('page_content')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('page_key', pageKey);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('page_content')
            .insert({
              page_key: pageKey,
              ...updates,
            });

          if (error) throw error;
        }
      }

      setPendingChanges([]);
      setHistory([]);
      toast.success('تم حفظ جميع التغييرات بنجاح! التغييرات مرئية للجميع الآن');
    } catch (error) {
      console.error('Error saving to database:', error);
      toast.error('فشل في حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const last = history[history.length - 1];
    if (last.element.tagName === 'IMG') {
      (last.element as HTMLImageElement).src = last.original;
    } else {
      last.element.innerText = last.original;
    }
    
    // Remove corresponding pending change
    setPendingChanges(prev => prev.slice(0, -1));
    setHistory(prev => prev.slice(0, -1));
    setSelectedElement(null);
    toast.success('تم التراجع عن التغيير');
  };

  const handleClose = () => {
    if (pendingChanges.length > 0) {
      const confirmClose = window.confirm('لديك تغييرات غير محفوظة. هل تريد الإغلاق بدون حفظ؟');
      if (!confirmClose) return;
    }
    disableEditMode();
    setSelectedElement(null);
    setHistory([]);
    setPendingChanges([]);
  };

  if (!isEditMode) return null;

  return (
    <>
      {/* Custom Cursor */}
      {isCursorVisible && (
        <div
          className="fixed pointer-events-none z-[100000]"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer circle */}
          <div className="w-6 h-6 rounded-full border-2 border-[#2dd4bf] flex items-center justify-center bg-transparent">
            {/* Inner dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
          </div>
        </div>
      )}

      {/* Hover Highlight */}
      <AnimatePresence>
        {hoveredElement && !selectedElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[9998] border-2 border-dashed border-primary rounded-lg"
            style={{
              top: hoveredElement.getBoundingClientRect().top - 2,
              left: hoveredElement.getBoundingClientRect().left - 2,
              width: hoveredElement.getBoundingClientRect().width + 4,
              height: hoveredElement.getBoundingClientRect().height + 4,
            }}
          />
        )}
      </AnimatePresence>

      {/* Selection Highlight */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed pointer-events-none z-[9998] border-2 border-primary rounded-lg shadow-lg shadow-primary/30"
            style={{
              top: selectedElement.element.getBoundingClientRect().top - 4,
              left: selectedElement.element.getBoundingClientRect().left - 4,
              width: selectedElement.element.getBoundingClientRect().width + 8,
              height: selectedElement.element.getBoundingClientRect().height + 8,
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Toolbar */}
      <motion.div
        ref={overlayRef}
        data-visual-editor-toolbar
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[9999] bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl"
        style={{ cursor: 'default' }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <MousePointer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">وضع التحرير المرئي</span>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-muted rounded-full p-1">
              {[
                { path: '/', label: 'الرئيسية' },
                { path: '/products', label: 'المنتجات' },
                { path: '/about', label: 'من نحن' },
                { path: '/contact', label: 'اتصل بنا' },
                { path: '/reviews', label: 'التقييمات' },
                { path: '/policies', label: 'السياسات' },
              ].map((page) => (
                <button
                  key={page.path}
                  onClick={() => {
                    window.location.href = page.path;
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    window.location.pathname === page.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {pendingChanges.length > 0 && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveAllToDatabase}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 ml-2" />
                {isSaving ? 'جاري الحفظ...' : `حفظ للجميع (${pendingChanges.length})`}
              </Button>
            )}
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleUndo}>
                <Undo className="w-4 h-4 ml-2" />
                تراجع ({history.length})
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleClose}>
              <X className="w-4 h-4 ml-2" />
              إنهاء التحرير
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            data-visual-editor-toolbar
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 left-4 z-[9999] w-80 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4"
            style={{ cursor: 'default' }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              {selectedElement.type === 'text' ? (
                <Type className="w-5 h-5 text-primary" />
              ) : (
                <Image className="w-5 h-5 text-primary" />
              )}
              <h3 className="font-semibold text-foreground">
                {selectedElement.type === 'text' ? 'تعديل النص' : 'تعديل الصورة'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="mr-auto h-8 w-8"
                onClick={() => setSelectedElement(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedElement.type === 'text' ? (
              <div className="space-y-3">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[100px] resize-none"
                  placeholder="أدخل النص الجديد..."
                  dir="auto"
                />
                <Button onClick={handleSaveText} className="w-full">
                  <Save className="w-4 h-4 ml-2" />
                  تطبيق التغييرات
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {isUploading ? 'جاري الرفع...' : 'اختر صورة جديدة'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisualEditorOverlay;
