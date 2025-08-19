"use client";

import React from "react";
import { Product } from "@/lib/sanity-cms";
import ProductItem from "@/components/ProductItem";

type StoreGridProps = {
  products: Product[];
};

export default function StoreGrid({ products }: StoreGridProps) {
  return (
    <div className="release-grid">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
