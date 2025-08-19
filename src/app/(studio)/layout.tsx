// Minimal Studio root: no site chrome, no globals.css import.

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.body.className = 'studio';
            document.body.removeAttribute('data-page');
          `,
        }}
      />
      {children}
    </>
  );
}
