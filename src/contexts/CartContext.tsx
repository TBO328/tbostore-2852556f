import React, { createContext, useContext, useState, ReactNode, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CartItemCustomization {
  hasLogo?: boolean;
  logoFile?: string; // Base64 or URL
  selectedColor?: string;
  customHexColor?: string;
  installLocation?: string;
  contactMethod?: string;
  selectedFeatures?: string[];
}

export interface CartItem {
  id: number | string;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  quantity: number;
  customization?: CartItemCustomization;
  activationEmail?: string;
  requiresEmail?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  cartIconRef: React.RefObject<HTMLDivElement>;
  triggerFlyAnimation: (startPosition: { x: number; y: number }, image: string) => void;
  flyingItem: { x: number; y: number; image: string } | null;
  isShaking: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [flyingItem, setFlyingItem] = useState<{ x: number; y: number; image: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load cart from DB when user logs in
  useEffect(() => {
    if (!userId) return;
    const loadCart = async () => {
      const { data } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', userId);
      if (data && data.length > 0) {
        const dbItems: CartItem[] = data.map(item => ({
          id: item.product_id,
          name: item.product_name,
          nameAr: item.product_name_ar,
          price: Number(item.product_price),
          image: item.product_image || '',
          quantity: item.quantity,
          customization: item.customization as CartItemCustomization | undefined,
        }));
        setItems(dbItems);
      }
    };
    loadCart();
  }, [userId]);

  // Sync cart to DB (debounced)
  const syncCartToDB = useCallback((cartItems: CartItem[], uid: string) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      // Delete all and re-insert
      await supabase.from('user_carts').delete().eq('user_id', uid);
      if (cartItems.length > 0) {
        const rows = cartItems.map(item => ({
          user_id: uid,
          product_id: String(item.id),
          product_name: item.name,
          product_name_ar: item.nameAr,
          product_price: item.price,
          product_image: item.image,
          quantity: item.quantity,
          customization: item.customization as any,
        }));
        await supabase.from('user_carts').insert(rows);
      }
    }, 1000);
  }, []);

  // Watch items changes and sync
  useEffect(() => {
    if (userId) {
      syncCartToDB(items, userId);
    }
  }, [items, userId, syncCartToDB]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number | string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const triggerFlyAnimation = useCallback((startPosition: { x: number; y: number }, image: string) => {
    setFlyingItem({ ...startPosition, image });
    // Trigger shake after flying animation reaches the cart
    setTimeout(() => {
      setFlyingItem(null);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 800);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      cartIconRef,
      triggerFlyAnimation,
      flyingItem,
      isShaking
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
