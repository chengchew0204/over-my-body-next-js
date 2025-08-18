"use client";

import React, { useState } from "react";
import { useCart } from "./CartContext";

export default function CartBall() {
  const { cart, itemCount, isLoading } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading || itemCount === 0) {
    return null; // Don't show if empty or loading
  }

  const formatPrice = (price: string) => {
    // Extract number from price text like "$28.4" -> "28.4"
    const match = price.match(/[\d.,]+/);
    return match ? `$${match[0]}` : price;
  };

  return (
    <div 
      className="cart-ball-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover tooltip */}
      {isHovered && (
        <div className="cart-tooltip">
          <div className="cart-tooltip-header">
            Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </div>
          <div className="cart-tooltip-items">
            {cart.items.map((item, index) => (
              <div key={item.product.id} className="cart-tooltip-item">
                <span className="item-name">{item.product.title}</span>
                <span className="item-details">
                  {item.quantity}x {formatPrice(item.product.priceText)}
                </span>
              </div>
            ))}
          </div>
          <div className="cart-tooltip-total">
            Total: ${cart.total.toFixed(2)}
          </div>
        </div>
      )}
      
      {/* Cart ball */}
      <div className="cart-ball">
        <span className="cart-ball-count">{itemCount}</span>
      </div>
    </div>
  );
}
