"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/cms";
import { useCart } from "./CartContext";
import CartIcon from "./CartIcon";

type ProductItemProps = {
  product: Product;
};

export default function ProductItem({ product }: ProductItemProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    addItem(product, 1);
    
    // Brief visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className="release-item product-item">
      <Link href={`/store/${product.slug}`} className="product-link">
        <div className="release-art">
          <Image
            src={product.coverImage}
            alt={product.title}
            width={300}
            height={300}
          />
        </div>
        <div className="release-info">
          <h3>{product.title}</h3>
          <p>{product.priceText}</p>
        </div>
      </Link>
      
      {/* Cart button overlay */}
      <div className="cart-overlay">
        <CartIcon 
          size={18} 
          className={isAdding ? "adding" : ""} 
          onClick={handleAddToCart}
        />
      </div>
    </div>
  );
}
