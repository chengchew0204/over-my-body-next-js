'use client';

import { useEffect } from 'react';

export default function SiteBodyManager() {
  useEffect(() => {
    // Set site-specific body classes
    document.body.className = 'bg-home';
    document.body.setAttribute('data-page', 'home');
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.className = '';
      document.body.removeAttribute('data-page');
    };
  }, []);

  return null; // This component doesn't render anything
}
