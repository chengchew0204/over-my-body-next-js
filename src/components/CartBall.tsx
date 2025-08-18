"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";

export default function CartBall() {
  const { cart, itemCount, isLoading, updateItemQuantity, removeItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: string) => {
    // Extract number from price text like "$28.4" -> "28.4"
    const match = price.match(/[\d.,]+/);
    return match ? `$${match[0]}` : price;
  };

  const handleCartClick = () => {
    setIsDrawerOpen(true);
    setIsHovered(false);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Use a longer delay to prevent accidental closing
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 500); // 500ms delay for better user experience
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Don't render if loading or empty cart
  if (isLoading || itemCount === 0) {
    return null;
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="cart-ball-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Font Awesome Cart Icon */}
        <div className="cart-ball" onClick={handleCartClick}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 640 640"
            className="cart-icon-svg"
          >
            <path d="M16 64C7.2 64 0 71.2 0 80C0 88.8 7.2 96 16 96L61.3 96C69 96 75.7 101.5 77 109.1L127.9 388.8C134.1 423 163.9 447.9 198.7 447.9L464 448C472.8 448 480 440.8 480 432C480 423.2 472.8 416 464 416L198.7 416C179.4 416 162.8 402.2 159.3 383.2L153.6 352L466.6 352C500.5 352 529.9 328.3 537 295.1L569.4 144.4C574.8 119.5 555.8 96 530.3 96L106.6 96C99.9 77.1 81.9 64 61.3 64L16 64zM113 128L530.3 128C535.4 128 539.2 132.7 538.1 137.7L505.8 288.4C501.8 306.8 485.6 320 466.7 320L147.9 320L113 128zM188 524C188 513 197 504 208 504C219 504 228 513 228 524C228 535 219 544 208 544C197 544 188 535 188 524zM260 524C260 495.3 236.7 472 208 472C179.3 472 156 495.3 156 524C156 552.7 179.3 576 208 576C236.7 576 260 552.7 260 524zM432 504C443 504 452 513 452 524C452 535 443 544 432 544C421 544 412 535 412 524C412 513 421 504 432 504zM432 576C460.7 576 484 552.7 484 524C484 495.3 460.7 472 432 472C403.3 472 380 495.3 380 524C380 552.7 403.3 576 432 576z"/>
          </svg>
          <span className="cart-ball-count">{itemCount}</span>
        </div>

        {/* Hover tooltip with editing capabilities - positioned to allow interaction */}
        {isHovered && (
          <div 
            className="cart-tooltip"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="cart-tooltip-header">
              Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </div>
            <div className="cart-tooltip-items">
              {cart.items.map((item) => (
                <div key={item.product.id} className="cart-tooltip-item">
                  <div className="item-info">
                    <span className="item-name">{item.product.title}</span>
                    <span className="item-price">{formatPrice(item.product.priceText)} each</span>
                  </div>
                  <div className="item-controls">
                    <button 
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      className="tooltip-qty-btn"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="tooltip-qty">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="tooltip-qty-btn"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="tooltip-remove-btn"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-tooltip-footer">
              <div className="cart-tooltip-total">
                Total: ${cart.total.toFixed(2)}
              </div>
              <button 
                onClick={handleCartClick}
                className="view-cart-btn"
              >
                View Cart
              </button>
            </div>
          </div>
        )}
      </div>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
