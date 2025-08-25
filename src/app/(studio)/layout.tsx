import { Inter } from 'next/font/google';
import StudioNavigation from '@/components/StudioNavigation';
import './studio-fix.css';

const inter = Inter({ subsets: ['latin'] });

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StudioNavigation />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}