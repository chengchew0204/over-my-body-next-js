'use client';

import { useEffect } from 'react';

export default function StudioBodyManager() {
  useEffect(() => {
    // Set studio-specific body classes
    document.body.className = 'studio';
    document.body.removeAttribute('data-page');
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.className = '';
    };
  }, []);

  return null; // This component doesn't render anything
}
