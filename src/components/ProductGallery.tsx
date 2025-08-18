'use client';

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 1) {
    return (
      <div className="product__hero">
        <Image
          src={images[0]}
          alt={title}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="product__heroimg"
          priority
        />
      </div>
    );
  }

  return (
    <div className="product__gallery-container">
      {/* Main image display */}
      <div className="product__hero">
        <Image
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="product__heroimg"
          priority={currentIndex === 0}
        />
      </div>

      {/* Simple dot indicators */}
      {images.length > 1 && (
        <div className="product__dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`product__dot ${index === currentIndex ? 'product__dot--active' : ''}`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
