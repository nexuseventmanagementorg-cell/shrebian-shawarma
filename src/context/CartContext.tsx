'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, SellingPoint } from '@/types';
import { FIXED_DELIVERY_FEE } from '@/lib/delivery';

export interface CartItem {
  product: Product;
  quantity: number;
  instructions?: string;
}

interface CartContextType {
  items: CartItem[];
  orderType: 'delivery' | 'takeaway';
  setOrderType: (type: 'delivery' | 'takeaway') => void;
  selectedSellingPoint: SellingPoint | null;
  setSelectedSellingPoint: (sp: SellingPoint | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerMobile: string;
  setCustomerMobile: (mobile: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  addToCart: (product: Product, quantity?: number, instructions?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('takeaway');
  const [selectedSellingPoint, setSelectedSellingPoint] = useState<SellingPoint | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Local storage persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shrebian_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedName = localStorage.getItem('shrebian_cust_name');
      const savedMobile = localStorage.getItem('shrebian_cust_mobile');
      if (savedName) setCustomerName(savedName);
      if (savedMobile) setCustomerMobile(savedMobile);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shrebian_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, instructions = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, instructions: instructions || i.instructions }
            : i
        );
      }
      return [...prev, { product, quantity, instructions }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('shrebian_cart');
    } catch {
      // ignore
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.product.sellingPrice * i.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? FIXED_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        setOrderType,
        selectedSellingPoint,
        setSelectedSellingPoint,
        customerName,
        setCustomerName,
        customerMobile,
        setCustomerMobile,
        deliveryAddress,
        setDeliveryAddress,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
