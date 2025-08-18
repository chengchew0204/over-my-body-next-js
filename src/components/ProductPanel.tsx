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

  const handleExternalBuy = () => {
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

      {/* Quantity Selector and Add to Cart */}
      <div className="product__cart-section">
        <div className="product__quantity-selector">
          <label htmlFor="quantity" className="quantity-label">Quantity:</label>
          <div className="quantity-controls-product">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              className="qty-btn-product"
              disabled={quantity <= 1}
              type="button"
            >
              −
            </button>
            <input 
              id="quantity"
              type="number" 
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="qty-input"
              min="1"
              max="99"
            />
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="qty-btn-product"
              disabled={quantity >= 99}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="product__buttons">
          <button
            onClick={handleAddToCart}
            className={`product__addcart ${isAdding ? "adding" : ""}`}
            disabled={isAdding}
            type="button"
          >
            {isAdding ? "Adding..." : "ADD TO CART"}
          </button>
          
          {product.buyUrl && (
            <button
              onClick={handleExternalBuy}
              className="product__buybtn"
              type="button"
            >
              BUY EXTERNAL
            </button>
          )}
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
