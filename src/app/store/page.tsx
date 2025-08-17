import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Store',
  description: 'Physical releases, digital downloads, and exclusive merchandise from the OVER MY BODY collective.',
};

/**
 * Store page component - displays merchandise and physical releases
 * Content migrated from original store.html partial
 */
export default function StorePage() {
  return (
    <>
      <h1>STORE</h1>
      <p className="lead">Physical releases, digital downloads, and exclusive merchandise from the OVER MY BODY collective.</p>
    </>
  );
}
