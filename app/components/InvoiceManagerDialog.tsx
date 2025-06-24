"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string; // Still exists in schema
  emails: string[]; // New array field
  address: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  total: number;
  amountPaid?: number; // May not exist in current schema
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE';
  clientId: string | null;
  Client: Client | null;
  reminderCount?: number;
}

interface InvoiceManagerDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function InvoiceManagerDialog({ invoice, isOpen, onClose, onUpdate }: InvoiceManagerDialogProps) {
  const [status, setStatus] = useState<string>('UNPAID');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      setStatus(invoice.status);
      setAmountPaid(invoice.amountPaid || 0);
      setError(null);
      setSuccessMessage(null);
      
      // Set available emails for selection
      if (invoice.Client) {
        const clientEmails = invoice.Client.emails && invoice.Client.emails.length > 0 
          ? invoice.Client.emails 
          : (invoice.Client.email ? [invoice.Client.email] : []);
        setSelectedEmails(clientEmails);
      }
    }
  }, [invoice]);

  // Automatically determine status based on amount paid
  useEffect(() => {
    if (invoice && amountPaid >= invoice.total) {
      setStatus('PAID');
    } else if (invoice && amountPaid > 0) {
      setStatus('PARTIALLY_PAID');
    } else if (invoice) {
      setStatus(invoice.status === 'OVERDUE' ? 'OVERDUE' : 'UNPAID');
    }
  }, [amountPaid, invoice?.total, invoice?.status]);

  // Early return after all hooks are called
  if (!invoice) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">
              no invoice selected
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-neutral-500 lowercase">please select an invoice to manage.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const clientEmails = invoice.Client?.emails && invoice.Client.emails.length > 0 
    ? invoice.Client.emails 
    : (invoice.Client?.email ? [invoice.Client.email] : []);
  const remainingBalance = invoice.total - amountPaid;

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/invoice/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          status,
          amountPaid: amountPaid,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage('Invoice updated successfully');
        onUpdate();
      } else {
        setError(result.error || 'Failed to update invoice');
      }
    } catch (err) {
      setError('Error updating invoice');
      console.error('Error updating invoice:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReminder = async () => {
    if (selectedEmails.length === 0) {
      setError('Please select at least one email address');
      return;
    }

    setIsSendingReminder(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/invoice/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          selectedEmails,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(`Reminder sent to ${result.sentTo.length} email address(es)`);
        onUpdate();
      } else {
        setError(result.error || 'Failed to send reminder');
      }
    } catch (err) {
      setError('Error sending reminder'); 
      console.error('Error sending reminder:', err);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleEmailToggle = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="lowercase">
            manage invoice {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-3 text-sm lowercase flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 p-3 text-sm lowercase flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Invoice Details */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 space-y-3">
            <h3 className="text-sm font-medium lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">
              invoice details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">client:</span>
                <span className="ml-2">{invoice.Client?.name || 'unassigned'}</span>
              </div>
              <div>
                <span className="text-neutral-500">total:</span>
                <span className="ml-2">£{invoice.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-neutral-500">due date:</span>
                <span className="ml-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-neutral-500">reminders sent:</span>
                <span className="ml-2">{invoice.reminderCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">
              payment status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-neutral-500 lowercase">
                  amount paid (£)
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  min="0"
                  max={invoice.total}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-neutral-500 lowercase">
                  status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                >
                  <option value="UNPAID">unpaid</option>
                  <option value="PARTIALLY_PAID">partially paid</option>
                  <option value="PAID">paid</option>
                  <option value="OVERDUE">overdue</option>
                </select>
              </div>
            </div>

            {remainingBalance > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm">
                <span className="text-yellow-800 dark:text-yellow-300 lowercase">
                  remaining balance: £{remainingBalance.toFixed(2)}
                </span>
              </div>
            )}

            <Button 
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="w-full bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-200 dark:hover:bg-neutral-300 text-white dark:text-neutral-800 lowercase"
            >
              {isUpdating ? 'updating...' : 'update invoice'}
            </Button>
          </div>

          {/* Email Reminder Section */}
          {invoice.status !== 'PAID' && clientEmails.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium lowercase border-b pb-2 border-neutral-200 dark:border-neutral-700">
                send reminder
              </h3>

              <div className="space-y-2">
                <label className="block text-sm text-neutral-500 lowercase">
                  select email addresses to send reminder to:
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {clientEmails.map((email, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email)}
                        onChange={() => handleEmailToggle(email)}
                        className="w-4 h-4"
                      />
                      <Mail className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm lowercase">{email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSendReminder}
                disabled={isSendingReminder || selectedEmails.length === 0}
                variant="outline"
                className="w-full border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 lowercase"
              >
                {isSendingReminder ? 'sending...' : `send reminder to ${selectedEmails.length} email(s)`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 