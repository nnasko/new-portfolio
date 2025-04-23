'use client';

import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Bell, Pencil } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  clientId: string | null;
  Client: Client | null;
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
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [isAssignClientDialogOpen, setIsAssignClientDialogOpen] = useState(false);
  const [selectedInvoiceForAssignment, setSelectedInvoiceForAssignment] = useState<Invoice | null>(null);
  const [assignmentClientId, setAssignmentClientId] = useState<string | null>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // State for Delete Invoice Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoice/list');
      const data = await response.json();
      setInvoices(data.invoices || []);
      setStats(data.stats || { /* default stats */ });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const response = await fetch('/api/clients/list');
      if (!response.ok) throw new Error('failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      setClientsError(message);
      console.error("Fetch clients error:", message);
    } finally {
      setClientsLoading(false);
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
        fetchInvoices();
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
        setReminderMessage('payment reminder sent successfully');
        setReminderDialog(true);
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

  const openAssignClientDialog = (invoice: Invoice) => {
    setSelectedInvoiceForAssignment(invoice);
    setAssignmentClientId(invoice.clientId || '');
    setAssignmentError(null);
    setIsAssigning(false);
    setIsAssignClientDialogOpen(true);
  };

  const handleAssignClientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForAssignment) return;

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      const response = await fetch('/api/invoice/update-client', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForAssignment.id,
          clientId: assignmentClientId === '' ? null : assignmentClientId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'failed to assign client');
      }

      setIsAssignClientDialogOpen(false);
      await fetchInvoices();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      setAssignmentError(message);
      console.error("Assign client error:", message);
    } finally {
      setIsAssigning(false);
    }
  };

  // --- Delete Invoice Handlers ---
  const openDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteError(null); // Clear previous errors
    setIsDeleting(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteInvoiceConfirm = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/invoice/delete/${invoiceToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'failed to delete invoice');
      }

      // Success
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      await fetchInvoices(); // Refresh invoice list

    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error during deletion';
      setDeleteError(message);
      console.error("Delete invoice error:", message);
    } finally {
      setIsDeleting(false);
    }
  };
  // --- End Delete Invoice Handlers ---

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen lowercase">loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light lowercase">invoices</h1>
          <div className="flex space-x-2">
            <Link 
              href="/invoice/clients"
              className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
            >
              manage clients
            </Link>
            <Link 
              href="/invoice/create"
              className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
            >
              create invoice
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-100 dark:bg-neutral-800 p-6"
          >
            <h3 className="text-sm text-neutral-500 mb-2 lowercase">total invoiced</h3>
            <p className="text-2xl font-light">{formatCurrency(stats.totalInvoiced)}</p>
            <p className="text-sm text-neutral-500 mt-2 lowercase">{stats.invoiceCount} invoices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-100 dark:bg-neutral-800 p-6"
          >
            <h3 className="text-sm text-neutral-500 mb-2 lowercase">total paid</h3>
            <p className="text-2xl font-light">{formatCurrency(stats.totalPaid)}</p>
            <p className="text-sm text-neutral-500 mt-2 lowercase">{stats.paidCount} invoices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-100 dark:bg-neutral-800 p-6"
          >
            <h3 className="text-sm text-neutral-500 mb-2 lowercase">total unpaid</h3>
            <p className="text-2xl font-light">{formatCurrency(stats.totalUnpaid)}</p>
            <p className="text-sm text-neutral-500 mt-2 lowercase">{stats.invoiceCount - stats.paidCount - stats.overdueCount} invoices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-100 dark:bg-neutral-800 p-6"
          >
            <h3 className="text-sm text-neutral-500 mb-2 lowercase">total overdue</h3>
            <p className="text-2xl font-light">{formatCurrency(stats.totalOverdue)}</p>
            <p className="text-sm text-neutral-500 mt-2 lowercase">{stats.overdueCount} invoices</p>
          </motion.div>
        </div>

        {/* Invoice List */}
        <div className="bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-500 lowercase">
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
                    <td className="p-4 font-mono lowercase">{invoice.invoiceNumber}</td>
                    <td className="p-4">
                      {invoice.Client ? (
                        <>
                          <div className="lowercase">{invoice.Client.name}</div>
                          <div className="text-sm text-neutral-500 lowercase">{invoice.Client.email}</div>
                        </>
                      ) : (
                        <span className="text-sm text-neutral-400 italic lowercase">unassigned</span>
                      )}
                    </td>
                    <td className="p-4">{format(new Date(invoice.date), 'PP').toLowerCase()}</td>
                    <td className="p-4">{format(new Date(invoice.dueDate), 'PP').toLowerCase()}</td>
                    <td className="p-4">{formatCurrency(invoice.total)}</td>
                    <td className="p-4">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as 'PAID' | 'UNPAID' | 'OVERDUE')}
                        className="bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 p-1 text-sm lowercase"
                      >
                        <option value="PAID" className="bg-neutral-100 dark:bg-neutral-800">paid</option>
                        <option value="UNPAID" className="bg-neutral-100 dark:bg-neutral-800">unpaid</option>
                        <option value="OVERDUE" className="bg-neutral-100 dark:bg-neutral-800">overdue</option>
                      </select>
                    </td>
                    <td className="p-4 space-x-1 whitespace-nowrap align-middle">
                      {invoice.status !== 'PAID' && (
                        <button
                          onClick={() => sendReminder(invoice.id)}
                          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5"
                          title="send payment reminder"
                        >
                          <Bell size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => openAssignClientDialog(invoice)}
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5"
                        title={invoice.clientId ? 'change assigned client' : 'assign client to this invoice'}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(invoice)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 p-1.5"
                        title="delete this invoice"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">reminder sent</DialogTitle>
            <DialogDescription className="lowercase">
              {reminderMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignClientDialogOpen} onOpenChange={setIsAssignClientDialogOpen}>
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">{selectedInvoiceForAssignment?.clientId ? 'change' : 'assign'} client for invoice {selectedInvoiceForAssignment?.invoiceNumber}</DialogTitle>
            <DialogDescription className="lowercase pt-1">
              select a client from the list below or choose &apos;unassign&apos;.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignClientSubmit} className="space-y-4 pt-4">
            {clientsLoading && <p className="text-neutral-500 lowercase p-2">loading clients...</p>}
            {clientsError && <p className="text-red-500 lowercase p-2">error loading clients: {clientsError}</p>}
            {!clientsLoading && !clientsError && (
              <select
                value={assignmentClientId || ''}
                onChange={(e) => setAssignmentClientId(e.target.value || null)}
                className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                disabled={clients.length === 0 || isAssigning}
              >
                <option value="" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 italic"> -- unassign -- </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-neutral-100 dark:bg-neutral-800 lowercase">
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            )}
            {assignmentError && (
              <p className="text-red-500 text-sm lowercase">error: {assignmentError}</p>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase disabled:opacity-50"
                disabled={clientsLoading || isAssigning || clientsError !== null}
              >
                {isAssigning ? 'assigning...' : 'assign client'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">confirm deletion</DialogTitle>
             <DialogDescription className="lowercase pt-1">
                are you sure you want to delete invoice <span className="font-medium text-neutral-800 dark:text-neutral-200">{invoiceToDelete?.invoiceNumber}</span>?
                this action cannot be undone.
             </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
              {deleteError && (
                  <p className="text-red-500 text-sm lowercase">error: {deleteError}</p>
              )}
              <div className="flex justify-end space-x-2">
                  <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors lowercase"
                      disabled={isDeleting}
                  >
                      cancel
                  </button>
                  <button
                      type="button"
                      onClick={handleDeleteInvoiceConfirm}
                      className="border border-red-500 bg-red-500 text-white dark:border-red-600 dark:bg-red-600 dark:hover:bg-red-700 px-4 py-2 text-sm hover:bg-red-600 transition-colors lowercase disabled:opacity-50"
                      disabled={isDeleting}
                  >
                      {isDeleting ? 'deleting...' : 'confirm delete'}
                  </button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 