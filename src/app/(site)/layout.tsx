// Site-only root layout. It owns the global styles and the fixed-corner UI.

import '../globals.css'; // import global CSS for the site only

import Navigation from '@/components/Navigation';
import BodyClassManager from '@/components/BodyClassManager';
import SiteBodyManager from '@/components/SiteBodyManager';
import { CartProvider } from '@/components/CartContext';
import CartBall from '@/components/CartBall';
import Link from 'next/link';
import Image from 'next/image';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteBodyManager />
      <CartProvider>
        {/* Persistent corners (do not re-render across route changes) */}
        
        {/* Top-Left Corner - Logo */}
        <div className="corner corner--tl">
          <div className="corner-block top-left">
            <Link href="/" className="logo-link">
              <Image src="/asset/top-left-logo.svg" alt="Logo" className="logo-graphic" width={120} height={40} priority />
            </Link>
          </div>
        </div>

        {/* Top-Right Corner - Title */}
        <div className="corner corner--tr">
          <div className="corner-block top-right">
            <Image src="/asset/chinese-title.svg" alt="跨我身體" className="chinese-title" width={200} height={60} priority />
            <Image src="/asset/english-subtitle.svg" alt="OVER MY BODY" className="english-subtitle" width={150} height={20} priority />
          </div>
        </div>

        {/* Bottom-Left Corner - Navigation */}
        <div className="corner corner--bl">
          <div className="corner-block bottom-left">
            <Navigation />
          </div>
        </div>

        {/* Bottom-Right Corner - Meta info */}
        <div className="corner corner--br">
          <div className="corner-block bottom-right">
            <div className="meta-text">Taiwan-based label<br/>focusing on avant-garde sounds.</div>
            <Image src="/asset/bottom-right-icons.svg" alt="Icons" className="bottom-icons" width={80} height={40} />
          </div>
        </div>

        {/* Cart Ball - Fixed position */}
        <CartBall />

        {/* Main visual background */}
        <div className="main-visual">
          <Image src="/asset/homepage-bg-56586a.png" alt="Main Visual" className="main-visual-image" priority fill sizes="100vw" style={{objectFit: 'cover'}} />
        </div>

        {/* Center content outlet */}
        <main className="content container">
          <section className="panel">
            {children}
          </section>
        </main>

        {/* Client-side route management */}
        <BodyClassManager />
      </CartProvider>
    </>
  );
}
