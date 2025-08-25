'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ScrollingTitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const ScrollingTitle: React.FC<ScrollingTitleProps> = ({ text, className = '', style = {} }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const shouldScrollText = textWidth > containerWidth;
        setShouldScroll(shouldScrollText);
        
        if (shouldScrollText) {
          // 計算需要滾動的距離：文字寬度 - 容器寬度 + 一些緩衝空間
          setScrollDistance(-(textWidth - containerWidth + 20));
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  if (!shouldScroll) {
    return (
      <div ref={containerRef} className={className} style={{ overflow: 'hidden', ...style }}>
        <div ref={textRef} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.div
        ref={textRef}
        style={{ whiteSpace: 'nowrap' }}
        animate={{
          x: [0, scrollDistance, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 3
        }}
      >
        {text}
      </motion.div>
    </div>
  );
};

export default ScrollingTitle;
