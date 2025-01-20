"use client";

import { LayoutWrapper } from './LayoutWrapper';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
