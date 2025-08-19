// Minimal Studio root: no site chrome, no globals.css import.

import StudioBodyManager from '@/components/StudioBodyManager';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body.studio {
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: hidden !important;
          }
          html {
            height: 100% !important;
          }
          body.studio > div {
            height: 100vh !important;
          }
        `
      }} />
      <StudioBodyManager />
      <div style={{ height: '100vh', width: '100vw' }}>
        {children}
      </div>
    </>
  );
}
