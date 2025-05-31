import { ToastProvider } from "../components/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {children}
      </div>
    </ToastProvider>
  );
} 