import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image, Save, Trash2, Undo, MousePointer, Palette, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useVisualEditor } from '@/contexts/VisualEditorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditableElement {
  element: HTMLElement;
  type: 'text' | 'image' | 'button' | 'other';
  bounds: DOMRect;
}

const VisualEditorOverlay: React.FC = () => {
  const { isEditMode, disableEditMode, selectedElement, setSelectedElement, hoveredElement, setHoveredElement } = useVisualEditor();
  const [editValue, setEditValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<{ element: HTMLElement; original: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    
    // Ignore overlay elements
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
    
    // Ignore overlay elements
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
      document.body.style.cursor = 'crosshair';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [isEditMode, handleMouseMove, handleClick]);

  const handleSaveText = () => {
    if (!selectedElement) return;
    
    setHistory(prev => [...prev, { element: selectedElement.element, original: selectedElement.originalContent }]);
    selectedElement.element.innerText = editValue;
    toast.success('تم تحديث النص بنجاح');
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
      setHistory(prev => [...prev, { element: selectedElement.element, original: selectedElement.originalContent }]);
      (selectedElement.element as HTMLImageElement).src = newUrl;
      setImageUrl(newUrl);
      toast.success('تم تحديث الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
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
    
    setHistory(prev => prev.slice(0, -1));
    setSelectedElement(null);
    toast.success('تم التراجع عن التغيير');
  };

  const handleClose = () => {
    disableEditMode();
    setSelectedElement(null);
    setHistory([]);
  };

  if (!isEditMode) return null;

  return (
    <>
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
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <MousePointer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">وضع التحرير المرئي</span>
            </div>
            <span className="text-sm text-muted-foreground">اضغط على أي عنصر لتعديله</span>
          </div>
          
          <div className="flex items-center gap-2">
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
                  حفظ التغييرات
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
                  <Image className="w-4 h-4 ml-2" />
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
