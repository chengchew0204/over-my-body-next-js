// Minimal Studio root: no site chrome, no globals.css import.

import StudioBodyManager from '@/components/StudioBodyManager';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StudioBodyManager />
      {children}
    </>
  );
}
