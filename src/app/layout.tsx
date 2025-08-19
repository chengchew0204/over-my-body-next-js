// Minimal global root: do not import globals.css here.

export const metadata = {
  title: 'OVER MY BODY',
  description: 'A Taiwan-based experimental music label',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}