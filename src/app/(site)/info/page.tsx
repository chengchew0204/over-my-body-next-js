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
      <p className="">Pioneering the scene since 2020, the avant-garde powerhouse Over My Body, hailing from Taipei, has relentlessly mesmerized audiences with its unparalleled fusion of sound, visuals, and immersive events. With an unwavering commitment to pushing boundaries, the label has unleashed groundbreaking music from global artists like personalbrand (UK), Capiuz (IT), Lujiachi(TW), WRACK (JP), SABIWA (DE), Max Dahlhaus (DE), and a plethora of
      other talents, all while fiercely reshaping the very fabric of Experimental music.</p>
    </>
  );
}
