"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "./CartContext";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeItem, updateItemQuantity, clearAllItems } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    // For now, we'll redirect to external checkout
    // In the future, this could be a custom checkout process
    if (cart.items.length === 0) return;
    
    // Simple approach: redirect to the first item's buyUrl
    // Or implement a custom checkout flow
    const firstItem = cart.items[0];
    if (firstItem.product.buyUrl) {
      window.open(firstItem.product.buyUrl, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={onClose} />
      
      {/* Drawer */}
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Cart ({cart.items.length})</h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>
        
        <div className="cart-content">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="cart-item">
                    <div className="cart-item-image">
                      <Image
                        src={item.product.coverImage}
                        alt={item.product.title}
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.product.title}</h4>
                      <p className="cart-item-price">{item.product.priceText}</p>
                      <div className="cart-item-controls">
                        <button 
                          onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button 
                          onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeItem(item.product.id)}
                          className="remove-btn"
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: ${cart.total.toFixed(2)}</strong>
                </div>
                <div className="cart-actions">
                  <button 
                    onClick={clearAllItems}
                    className="cart-clear"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={handleCheckout}
                    className="cart-checkout"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
