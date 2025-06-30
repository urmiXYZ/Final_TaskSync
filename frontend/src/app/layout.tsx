'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* For fonts or global styles */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&family=Zilla+Slab&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <DndProvider backend={HTML5Backend}>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </DndProvider>
      </body>
    </html>
  );
}
