import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Info',
  description: 'Contact information, artist submissions, and the story behind our Taiwan-based experimental music collective.',
};

/**
 * Info page component - displays contact and submission information
 * Content migrated from original info.html partial
 */
export default function InfoPage() {
  return (
    <>
      <h1>INFO</h1>
      <p className="lead">Contact information, artist submissions, and the story behind our Taiwan-based experimental music collective.</p>
    </>
  );
}
