import './globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Correct comment syntax inside JSX */}
        {/* For fonts or global styles */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&family=Zilla+Slab&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
