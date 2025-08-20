
import './globals.scss';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

const roboto = Roboto();

export const metadata: Metadata = {
  title: 'Coop multiplayer techno-demo',
  description: 'yes',
  icons: { icon: '/favicon.png' }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  );
}
