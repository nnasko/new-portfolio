import { InvoiceForm } from '@/app/components/InvoiceForm';
import Link from 'next/link';

export default function CreateInvoicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light lowercase">create invoice</h1>
        <Link 
          href="/invoice"
          className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
        >
          back to dashboard
        </Link>
      </div>
      <InvoiceForm />
    </div>
  );
} 