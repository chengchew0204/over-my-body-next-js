// src/lib/cart.ts
// Simple cart management with localStorage
"use client";

import { Product } from "./cms";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

// Cart storage key
const CART_STORAGE_KEY = "overmybody-cart";

// Parse price text to number (simple implementation)
export function parsePrice(priceText: string): number {
  // Extract first number from price text like "$28.4" or "$30"
  const match = priceText.match(/[\d.,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(",", "."));
}

// Get cart from localStorage
export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], total: 0 };
  }
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return { items: [], total: 0 };
    
    const cart = JSON.parse(stored) as Cart;
    return cart;
  } catch {
    return { items: [], total: 0 };
  }
}

// Save cart to localStorage
export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Failed to save cart:", error);
  }
}

// Calculate cart total
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = parsePrice(item.product.priceText);
    return sum + (price * item.quantity);
  }, 0);
}

// Add item to cart
export function addToCart(product: Product, quantity: number = 1): Cart {
  const cart = getCart();
  const existingIndex = cart.items.findIndex(item => item.product.id === product.id);
  
  if (existingIndex >= 0) {
    // Update existing item
    cart.items[existingIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ product, quantity });
  }
  
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

// Remove item from cart
export function removeFromCart(productId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.product.id !== productId);
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

// Update item quantity
export function updateQuantity(productId: string, quantity: number): Cart {
  const cart = getCart();
  const item = cart.items.find(item => item.product.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
  }
  
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

// Clear cart
export function clearCart(): Cart {
  const emptyCart = { items: [], total: 0 };
  saveCart(emptyCart);
  return emptyCart;
}

// Get cart item count
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
