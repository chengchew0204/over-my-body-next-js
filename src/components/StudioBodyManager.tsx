'use client';

import { useEffect } from 'react';

export default function StudioBodyManager() {
  useEffect(() => {
    // Set studio-specific body classes and styles
    document.body.className = 'studio';
    document.body.removeAttribute('data-page');
    
    // Ensure the studio takes full viewport height
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#fff';
    document.body.style.overflow = 'hidden';
    
    // Also ensure html element takes full height
    document.documentElement.style.height = '100%';
    
    // Cleanup function to remove classes and styles when component unmounts
    return () => {
      document.body.className = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.background = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  return null; // This component doesn't render anything
}
