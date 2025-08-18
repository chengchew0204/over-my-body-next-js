"use client";

import React, { useState } from "react";

type QuantitySelectorProps = {
  onAddToCart: (quantity: number) => void;
  isAdding: boolean;
};

export default function QuantitySelector({ onAddToCart, isAdding }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
    setIsVisible(false);
    setQuantity(1); // Reset to 1 after adding
  };

  const handleCartIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    if (!isVisible) {
      setIsVisible(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="quantity-selector-container">
      {/* Quantity selector popup */}
      {isVisible && (
        <div className="quantity-popup">
          <div className="quantity-controls">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              className="qty-btn"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="qty-display">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="qty-btn"
              disabled={quantity >= 99}
            >
              +
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="add-btn"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="cancel-btn"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Cart icon trigger */}
      <button
        onClick={handleCartIconClick}
        className={`cart-trigger ${isAdding ? "adding" : ""}`}
        aria-label="Add to cart"
        type="button"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
            fill="currentColor"
          />
          <path
            d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
            fill="currentColor"
          />
          <path
            d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}
