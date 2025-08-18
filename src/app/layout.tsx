import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import BodyClassManager from "@/components/BodyClassManager";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "跨我身體 OVER MY BODY",
  description: "Taiwan-based label focusing on avant-garde sounds and experimental compositions.",
  openGraph: {
    title: "跨我身體 OVER MY BODY",
    description: "Taiwan-based label focusing on avant-garde sounds and experimental compositions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-home" data-page="home">
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
      </body>
    </html>
  );
}