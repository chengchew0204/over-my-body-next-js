'use client';

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter out empty or null image URLs
  const validImages = images.filter(img => img && img.trim() !== '');
  
  if (validImages.length === 0) {
    return null; // Don't render anything if no valid images
  }

  if (validImages.length === 1) {
    return (
      <div className="product__hero">
        <Image
          src={validImages[0]}
          alt={title}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="product__heroimg"
          priority
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="product__gallery-container">
      {/* Main image display with navigation arrows */}
      <div className="product__hero">
        <Image
          src={validImages[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="product__heroimg"
          priority={currentIndex === 0}
        />
        
        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="product__nav product__nav--prev"
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          onClick={goToNext}
          className="product__nav product__nav--next"
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      {/* Thumbnail navigation */}
      <div className="product__thumbs">
        {validImages.map((src, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`product__thumb ${index === currentIndex ? 'product__thumb--active' : ''}`}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={src}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="product__thumbimg"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
