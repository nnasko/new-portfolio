'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Bell, Pencil, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType: string;
  businessType?: string;
  currentChallenge?: string;
  projectGoal: string;
  targetAudience?: string;
  hasExistingWebsite?: string;
  selectedFeatures: string[];
  selectedAdditionalServices: string[];
  designPreference?: string;
  timeline: string;
  contentReady?: string;
  estimateMin?: number;
  estimateMax?: number;
  breakdown?: Record<string, unknown>[];
  message: string;
  hearAboutUs?: string;
  budget?: string;
  status: string;
  priority: boolean;
  notes?: string;
  followUpDate?: string;
  convertedToClientId?: string;
  finalPrice?: number;
  quotedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  emails: string[];
  address: string;
  createdAt: string;
  invoiceCount?: number;
  totalInvoiced?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  total: number;
  amountPaid?: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE';
  clientId: string | null;
  Client: Client | null;
  createdAt?: string;
  updatedAt?: string;
  lastReminder?: string | null;
  reminderCount?: number;
}

interface InvoicesTabProps {
  invoices: Invoice[];
  showToast: (message: string) => void;
  onSendReminder: (invoice: Invoice) => void;
  onManageInvoice: (invoice: Invoice) => void;
  onRefresh: () => void;
  prefilledInquiry?: Inquiry; // Inquiry data to prefill invoice
}

export function InvoicesTab({ invoices, showToast, onSendReminder, onManageInvoice, onRefresh, prefilledInquiry }: InvoicesTabProps) {
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    invoice: Invoice | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    invoice: null,
    isLoading: false
  });
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'UNPAID':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/20 dark:text-neutral-400';
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setDeleteDialog({
      isOpen: true,
      invoice,
      isLoading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.invoice) return;

    setDeleteDialog(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/invoice/delete/${deleteDialog.invoice.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        showToast('Invoice deleted successfully');
        onRefresh();
        setDeleteDialog({ isOpen: false, invoice: null, isLoading: false });
      } else {
        showToast(result.error || 'Failed to delete invoice');
        setDeleteDialog(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      showToast('Error deleting invoice');
      console.error('Error deleting invoice:', error);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-light">invoice management</h2>
        <div className="flex items-center gap-3">
          {prefilledInquiry && (
            <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded">
              Creating invoice for: {prefilledInquiry.name}
                             {prefilledInquiry.finalPrice ? (
                 <span className="ml-2 font-medium">
                   £{(prefilledInquiry.finalPrice / 100).toLocaleString()}
                 </span>
               ) : prefilledInquiry.estimateMin && prefilledInquiry.estimateMax && (
                 <span className="ml-2 font-medium">
                   £{(prefilledInquiry.estimateMin / 100)} - £{(prefilledInquiry.estimateMax / 100)}
                 </span>
               )}
            </div>
          )}
          <Link
            href={prefilledInquiry 
              ? `/invoice/create?prefill=${encodeURIComponent(JSON.stringify({
                  clientId: prefilledInquiry.convertedToClientId,
                  clientName: prefilledInquiry.name,
                  clientEmail: prefilledInquiry.email,
                  projectType: prefilledInquiry.projectType,
                                     amount: prefilledInquiry.finalPrice ? (prefilledInquiry.finalPrice / 100) : (prefilledInquiry.estimateMin ? (prefilledInquiry.estimateMin / 100) : 0),
                  description: prefilledInquiry.projectGoal,
                  inquiryId: prefilledInquiry.id
                }))}`
              : "/invoice/create"
            }
            target="_blank"
            className="flex items-center gap-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            {prefilledInquiry ? 'create invoice from inquiry' : 'create invoice'}
          </Link>
        </div>
      </div>
      
      <div className="bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                <th className="p-4 font-medium">invoice #</th>
                <th className="p-4 font-medium">client</th>
                <th className="p-4 font-medium">amount</th>
                <th className="p-4 font-medium">paid</th>
                <th className="p-4 font-medium">status</th>
                <th className="p-4 font-medium">due date</th>
                <th className="p-4 font-medium">actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    {invoice.Client ? (
                      <>
                        <div className="font-medium">{invoice.Client.name}</div>
                        <div className="text-sm text-neutral-500">
                          {(invoice.Client.emails && invoice.Client.emails.length > 0 ? invoice.Client.emails[0] : invoice.Client.email) || 'no email'}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-400 italic">unassigned</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{formatCurrency(invoice.total)}</td>
                  <td className="p-4">{formatCurrency(invoice.amountPaid || 0)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 space-x-1 whitespace-nowrap">
                    {invoice.status !== 'PAID' && (
                      <button
                        onClick={() => onSendReminder(invoice)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                        title="send payment reminder"
                      >
                        <Bell size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => onManageInvoice(invoice)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors" 
                      title="manage invoice"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(invoice)}
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" 
                      title="delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, invoice: null, isLoading: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        itemName={deleteDialog.invoice?.invoiceNumber || ''}
        itemType="invoice"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
} 