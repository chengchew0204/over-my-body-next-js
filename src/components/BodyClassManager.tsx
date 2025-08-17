'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client component to manage body classes based on current route
 * Replaces the original JavaScript router's body class switching functionality
 */
export default function BodyClassManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Determine route from pathname
    let route = 'home';
    if (pathname === '/releases') route = 'release';
    else if (pathname === '/store') route = 'store';
    else if (pathname === '/info') route = 'info';

    // Update body classes to match original behavior
    document.body.className = `bg-${route}`;
    document.body.setAttribute('data-page', route);
  }, [pathname]);

  return null; // This component only manages side effects
}
