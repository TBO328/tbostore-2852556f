import React, { createContext, useContext, useState, useCallback } from 'react';

interface SelectedElement {
  element: HTMLElement;
  type: 'text' | 'image' | 'button' | 'other';
  originalContent: string;
  xpath: string;
  pageKey?: string;
}

interface VisualEditorContextType {
  isEditMode: boolean;
  enableEditMode: () => void;
  disableEditMode: () => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  hoveredElement: HTMLElement | null;
  setHoveredElement: (element: HTMLElement | null) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | undefined>(undefined);

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (!context) {
    throw new Error('useVisualEditor must be used within a VisualEditorProvider');
  }
  return context;
};

export const VisualEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  const enableEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedElement(null);
    setHoveredElement(null);
  }, []);

  return (
    <VisualEditorContext.Provider
      value={{
        isEditMode,
        enableEditMode,
        disableEditMode,
        selectedElement,
        setSelectedElement,
        hoveredElement,
        setHoveredElement,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
};
