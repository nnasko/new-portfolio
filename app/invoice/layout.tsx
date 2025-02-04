import { ReactNode } from 'react';

export default function InvoiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {children}
    </div>
  );
} 