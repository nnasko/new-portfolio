'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  total: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
}

interface DashboardStats {
  totalInvoiced: number;
  totalPaid: number;
  totalUnpaid: number;
  totalOverdue: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
}

export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoiced: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalOverdue: 0,
    invoiceCount: 0,
    paidCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoice/list');
      const data = await response.json();
      setInvoices(data.invoices);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId: string, status: 'PAID' | 'UNPAID' | 'OVERDUE') => {
    try {
      const response = await fetch('/api/invoice/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId, status }),
      });

      if (response.ok) {
        fetchInvoices(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const sendReminder = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/invoice/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (response.ok) {
        alert('Reminder sent successfully');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg"
        >
          <h3 className="text-sm text-neutral-500 mb-2">total invoiced</h3>
          <p className="text-2xl font-light">{formatCurrency(stats.totalInvoiced)}</p>
          <p className="text-sm text-neutral-500 mt-2">{stats.invoiceCount} invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg"
        >
          <h3 className="text-sm text-neutral-500 mb-2">total paid</h3>
          <p className="text-2xl font-light">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-sm text-neutral-500 mt-2">{stats.paidCount} invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg"
        >
          <h3 className="text-sm text-neutral-500 mb-2">total unpaid</h3>
          <p className="text-2xl font-light">{formatCurrency(stats.totalUnpaid)}</p>
          <p className="text-sm text-neutral-500 mt-2">{stats.invoiceCount - stats.paidCount - stats.overdueCount} invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg"
        >
          <h3 className="text-sm text-neutral-500 mb-2">total overdue</h3>
          <p className="text-2xl font-light">{formatCurrency(stats.totalOverdue)}</p>
          <p className="text-sm text-neutral-500 mt-2">{stats.overdueCount} invoices</p>
        </motion.div>
      </div>

      {/* Invoice List */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="p-4">invoice #</th>
                <th className="p-4">client</th>
                <th className="p-4">date</th>
                <th className="p-4">due date</th>
                <th className="p-4">amount</th>
                <th className="p-4">status</th>
                <th className="p-4">actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-4 font-mono">{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    <div>{invoice.clientName}</div>
                    <div className="text-sm text-neutral-500">{invoice.clientEmail}</div>
                  </td>
                  <td className="p-4">{format(new Date(invoice.date), 'PP')}</td>
                  <td className="p-4">{format(new Date(invoice.dueDate), 'PP')}</td>
                  <td className="p-4">{formatCurrency(invoice.total)}</td>
                  <td className="p-4">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value as 'PAID' | 'UNPAID' | 'OVERDUE')}
                      className="bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-0"
                    >
                      <option value="PAID">paid</option>
                      <option value="UNPAID">unpaid</option>
                      <option value="OVERDUE">overdue</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {invoice.status !== 'PAID' && (
                      <button
                        onClick={() => sendReminder(invoice.id)}
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      >
                        send reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 