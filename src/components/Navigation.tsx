'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation component for the bottom-left corner
 * Handles active state highlighting based on current route
 */
export default function Navigation() {
  const pathname = usePathname();

  const getRouteFromPath = (path: string): string => {
    if (path === '/') return 'home';
    return path.slice(1); // Remove leading slash
  };

  const currentRoute = getRouteFromPath(pathname);

  const navItems = [
    { route: 'home', label: 'HOME', href: '/' },
    { route: 'release', label: 'RELEASE', href: '/releases' },
    { route: 'store', label: 'STORE', href: '/store' },
    { route: 'info', label: 'INFO', href: '/info' },
  ];

  return (
    <nav className="corner-nav">
      {navItems.map(({ route, label, href }) => (
        <Link
          key={route}
          href={href}
          data-route={route}
          aria-current={currentRoute === route ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
