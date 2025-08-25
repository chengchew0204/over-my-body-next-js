'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './StudioNavigation.module.css';

export default function StudioNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <div className={styles.navLinks}>
            <div className={styles.linkList}>
              <Link
                href="/studio"
                className={`${styles.link} ${
                  pathname === '/studio' || pathname.startsWith('/studio/desk')
                    ? styles.linkActive
                    : styles.linkInactive
                }`}
              >
                Content Management
              </Link>
              
              <Link
                href="/studio/upload"
                className={`${styles.link} ${
                  isActive('/studio/upload')
                    ? styles.linkActive
                    : styles.linkInactive
                }`}
              >
                Track Upload
              </Link>
            </div>
          </div>
          
          <div className={styles.navActions}>
            <Link
              href="/"
              className={styles.actionLink}
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
