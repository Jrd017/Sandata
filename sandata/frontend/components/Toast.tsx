'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterHost() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#FFF8E7',
          color: '#2f195f',
          border: '2px solid #8B7AE6',
          borderRadius: '8px',
          boxShadow: '0 8px 0 rgba(30, 18, 74, 0.18)',
        },
      }}
    />
  );
}
