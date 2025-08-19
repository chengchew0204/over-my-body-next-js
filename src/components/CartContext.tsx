"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart, addToCart, removeFromCart, updateQuantity, clearCart, getCart } from "@/lib/cart";
import { Product } from "@/lib/sanity-cms";
import CartDrawer from "./CartDrawer";

type CartContextType = {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearAllItems: () => void;
  itemCount: number;
  isLoading: boolean;
  isInCart: (productId: string) => boolean;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getCart());
    setIsLoading(false);
  }, []);

  const addItem = (product: Product, quantity: number = 1) => {
    const updatedCart = addToCart(product, quantity);
    setCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    const updatedCart = updateQuantity(productId, quantity);
    setCart(updatedCart);
  };

  const clearAllItems = () => {
    const updatedCart = clearCart();
    setCart(updatedCart);
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const isInCart = (productId: string) => {
    return cart.items.some(item => item.product.id === productId);
  };

  const openCartDrawer = () => {
    setIsCartDrawerOpen(true);
  };

  const closeCartDrawer = () => {
    setIsCartDrawerOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearAllItems,
        itemCount,
        isLoading,
        isInCart,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={closeCartDrawer}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
