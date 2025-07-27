'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { PaymentForm } from '@/app/components/PaymentForm';
import { useToast } from '@/app/components/Toast';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  total: number;
  amountPaid: number;
  notes?: string;
  paidDate?: string;
  paymentMethod?: string;
  client: {
    name: string;
    email: string;
    address: string;
  };
  items: InvoiceItem[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'OVERDUE':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'UNPAID':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'CANCELLED':
      return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    default:
      return 'text-neutral-600 bg-neutral-50 border-neutral-200';
  }
}

export default function InvoiceViewPage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoice/${invoiceNumber}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch invoice');
        }

        setInvoice(data.data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber]);

  const handlePaymentSuccess = () => {
    showToast('Payment successful! The invoice will be updated shortly.');
    // Optionally refresh the invoice data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    showToast(`Payment failed: ${error}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="text-neutral-600 dark:text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          loading invoice...
        </motion.div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Invoice Not Found</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {error || 'The requested invoice could not be found.'}
          </p>
        </motion.div>
      </div>
    );
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'UNPAID';
  const remainingAmount = invoice.total - invoice.amountPaid;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <DocumentIcon className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            <h1 className="text-3xl font-light">invoice {invoice.invoiceNumber.toLowerCase()}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
              {invoice.status.toLowerCase()}
            </div>
            {isOverdue && (
              <div className="flex items-center gap-2 text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">overdue</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Invoice Details */}
          <motion.div
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-6">invoice details</h2>
            
            {/* Client Info */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">billed to:</h3>
              <div className="text-neutral-600 dark:text-neutral-400">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
                <p className="whitespace-pre-line">{invoice.client.address}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">invoice date:</p>
                <p className="font-medium">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">due date:</p>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">services:</h3>
              <div className="space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">total:</span>
                <span className="text-2xl font-bold">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between items-center mt-2 text-green-600">
                    <span>amount paid:</span>
                    <span>-{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">remaining:</span>
                    <span className="text-xl font-bold">{formatCurrency(remainingAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {invoice.notes && (
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <h4 className="font-medium mb-2">notes:</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                  {invoice.notes}
                </p>
              </div>
            )}
          </motion.div>

          {/* Payment Section */}
          <motion.div
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {invoice.status === 'PAID' ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">payment received</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  this invoice has been paid in full
                </p>
                {invoice.paidDate && (
                  <p className="text-sm text-neutral-500">
                    paid on {formatDate(invoice.paidDate)}
                    {invoice.paymentMethod && ` via ${invoice.paymentMethod}`}
                  </p>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6">payment options</h2>
                
                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-700'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                    }`}
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">bank transfer</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      paymentMethod === 'card'
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-700'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                    }`}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">card payment</span>
                  </button>
                </div>

                {/* Payment Content */}
                {paymentMethod === 'bank' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">bank transfer details:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">bank:</span>
                          <span className="font-medium">{process.env.NEXT_PUBLIC_BANK_NAME || 'Bank Name'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">account name:</span>
                          <span className="font-medium">{process.env.NEXT_PUBLIC_ACCOUNT_NAME || 'Account Name'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">account number:</span>
                          <span className="font-medium font-mono">{process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || '00000000'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">sort code:</span>
                          <span className="font-medium font-mono">{process.env.NEXT_PUBLIC_SORT_CODE || '00-00-00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">reference:</span>
                          <span className="font-medium font-mono">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <span className="text-neutral-600 dark:text-neutral-400">amount:</span>
                          <span className="font-bold text-lg">{formatCurrency(remainingAmount)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-neutral-500 dark:text-neutral-500">
                      <p>• please include the invoice number as your payment reference</p>
                      <p>• payments typically take 1-2 business days to process</p>
                      <p>• you&apos;ll receive confirmation once payment is received</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PaymentForm
                      amount={remainingAmount}
                      currency="gbp"
                      type="invoice"
                      invoiceId={invoice.id}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 