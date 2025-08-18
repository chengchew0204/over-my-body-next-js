"use client";

import React, { useState } from "react";
import { Product } from "@/lib/cms";
import { useCart } from "./CartContext";

type ProductPanelProps = {
  product: Product;
};

export default function ProductPanel({ product }: ProductPanelProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    
    setIsAdding(true);
    addItem(product, quantity);
    
    // Visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const _handleExternalBuy = () => {
    if (product.buyUrl) {
      window.open(product.buyUrl, '_blank');
    }
  };

  return (
    <aside className="product__panel">
      <h1 className="product__title">{product.title}</h1>
      <div className="product__price">{product.priceText}</div>

      {product.description && (
        <div 
          className="product__desc" 
          dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }}
        />
      )}

      {/* Horizontal Quantity Selector and Add to Cart */}
      <div className="product__cart-section">
        <div className="product__cart-row">
          <div className="quantity-controls-inline">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              className="qty-btn-inline"
              disabled={quantity <= 1}
              type="button"
            >
              −
            </button>
            <span className="qty-display-inline">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="qty-btn-inline"
              disabled={quantity >= 99}
              type="button"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`product__addcart-inline ${isAdding ? "adding" : ""}`}
            disabled={isAdding}
            type="button"
          >
            {isAdding ? "ADDING..." : "ADD TO CART"}
          </button>
        </div>
      </div>

      {product.tags?.length ? (
        <div className="product__tags">
          {product.tags.map((t) => (
            <span key={t} className="product__tag">#{t}</span>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
