"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0);

  return (
    <div className="product__media">
      <div className="product__hero">
        <Image
          src={images[index]}
          alt={title}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="product__heroimg"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="product__gallery">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className="product__thumb"
              onClick={() => setIndex(i)}
              style={{ border: "none", padding: 0, cursor: "pointer", opacity: i === index ? 1 : 0.6 }}
            >
              <Image
                src={src}
                alt={`${title} image ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="product__thumbimg"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

