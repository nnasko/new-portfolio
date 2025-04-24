'use client';

import { useEffect, useState, FormEvent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, isAfter } from 'date-fns';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Bell, Pencil, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

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
  createdAt?: string;
  updatedAt?: string;
  lastReminder?: string | null;
  reminderCount?: number;
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

  // --- Calculate Advanced Analytics ---
  const advancedAnalytics = useMemo(() => {
    if (!invoices.length) {
      return {
        recentActivity: [],
        paymentRate: 0,
        avgDaysToPayment: 0,
        upcomingDue: [],
        statusCounts: { paid: 0, unpaid: 0, overdue: 0 }
      };
    }

    // Sort invoices by updatedAt (assuming this field exists) or date for recent activity
    const sortedByRecent = [...invoices].sort((a, b) => 
      new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime()
    ).slice(0, 5); // Get 5 most recent

    // Calculate payment rate
    const paymentRate = stats.paidCount / stats.invoiceCount * 100;

    // Find upcoming due invoices (due in the next 7 days)
    const today = new Date();
    const nextWeek = subDays(today, -7); // Add 7 days
    const upcomingDue = invoices.filter(invoice => 
      invoice.status !== 'PAID' &&
      isAfter(new Date(invoice.dueDate), today) && 
      !isAfter(new Date(invoice.dueDate), nextWeek)
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Status counts for chart
    const statusCounts = {
      paid: stats.paidCount,
      unpaid: stats.invoiceCount - stats.paidCount - stats.overdueCount,
      overdue: stats.overdueCount
    };

    return {
      recentActivity: sortedByRecent,
      paymentRate,
      upcomingDue: upcomingDue.slice(0, 3), // Show top 3
      statusCounts
    };
  }, [invoices, stats]);

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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Key Metrics Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-100 dark:bg-neutral-800 p-6 flex items-center"
              >
                <div className="mr-4 p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1 lowercase">paid invoices</h3>
                  <p className="text-2xl font-light">{formatCurrency(stats.totalPaid)}</p>
                  <p className="text-sm text-neutral-500 lowercase">{stats.paidCount} invoices</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-100 dark:bg-neutral-800 p-6 flex items-center"
              >
                <div className="mr-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1 lowercase">awaiting payment</h3>
                  <p className="text-2xl font-light">{formatCurrency(stats.totalUnpaid)}</p>
                  <p className="text-sm text-neutral-500 lowercase">{stats.invoiceCount - stats.paidCount - stats.overdueCount} invoices</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-100 dark:bg-neutral-800 p-6 flex items-center"
              >
                <div className="mr-4 p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1 lowercase">overdue</h3>
                  <p className="text-2xl font-light">{formatCurrency(stats.totalOverdue)}</p>
                  <p className="text-sm text-neutral-500 lowercase">{stats.overdueCount} invoices</p>
                </div>
              </motion.div>
            </div>

            {/* Status Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6"
            >
              <h3 className="text-lg font-light mb-4 lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">payment status</h3>
              
              <div className="h-8 w-full flex rounded-sm overflow-hidden">
                {/* Payment Status bar chart - simple visualization */}
                {stats.invoiceCount > 0 && (
                  <>
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${(stats.paidCount / stats.invoiceCount) * 100}%` }}
                      title={`Paid: ${stats.paidCount} invoices`}
                    />
                    <div 
                      className="bg-blue-500 h-full" 
                      style={{ width: `${((stats.invoiceCount - stats.paidCount - stats.overdueCount) / stats.invoiceCount) * 100}%` }}
                      title={`Unpaid: ${stats.invoiceCount - stats.paidCount - stats.overdueCount} invoices`}
                    />
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${(stats.overdueCount / stats.invoiceCount) * 100}%` }}
                      title={`Overdue: ${stats.overdueCount} invoices`}
                    />
                  </>
                )}
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>
                  <span className="text-neutral-500 lowercase">paid ({stats.paidCount})</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 mr-2"></span>
                  <span className="text-neutral-500 lowercase">unpaid ({stats.invoiceCount - stats.paidCount - stats.overdueCount})</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 mr-2"></span>
                  <span className="text-neutral-500 lowercase">overdue ({stats.overdueCount})</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6"
            >
              <h3 className="text-lg font-light mb-4 lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">overview</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500 lowercase">total invoiced</p>
                  <p className="text-xl font-light">{formatCurrency(stats.totalInvoiced)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500 lowercase">collection rate</p>
                  <p className="text-xl font-light">{(stats.totalPaid / stats.totalInvoiced * 100 || 0).toFixed(1)}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500 lowercase">invoices</p>
                  <p className="text-xl font-light">{stats.invoiceCount} total</p>
                </div>
              </div>
            </motion.div>
            
            {/* Upcoming Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6"
            >
              <h3 className="text-lg font-light mb-4 lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">
                upcoming due
              </h3>
              
              {advancedAnalytics.upcomingDue.length > 0 ? (
                <ul className="space-y-4">
                  {advancedAnalytics.upcomingDue.map(invoice => (
                    <li key={invoice.id} className="flex items-start text-sm">
                      <Calendar size={16} className="mt-0.5 mr-2 text-neutral-400" />
                      <div>
                        <p className="font-medium lowercase">
                          {invoice.invoiceNumber}
                          {invoice.Client && ` - ${invoice.Client.name}`}
                        </p>
                        <div className="flex items-center">
                          <p className="text-neutral-500 lowercase">
                            {formatCurrency(invoice.total)} due {format(new Date(invoice.dueDate), 'PP').toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 lowercase">no upcoming payments due</p>
              )}
            </motion.div>
          </div>
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