'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Mail } from 'lucide-react';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';

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

interface ClientsTabProps {
  clients: Client[];
  onRefresh: () => void;
  showToast: (message: string) => void;
}

export function ClientsTab({ clients, onRefresh, showToast }: ClientsTabProps) {
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    emails: [''],
    address: ''
  });
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    client: Client | null;
    isLoading: boolean;
    cascadeInfo: { invoiceCount: number; legalDocumentCount: number } | null;
  }>({
    isOpen: false,
    client: null,
    isLoading: false,
    cascadeInfo: null
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setClientFormData({ name: '', emails: [''], address: '' });
    setShowClientForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      emails: client.emails && client.emails.length > 0 ? client.emails : [client.email || ''],
      address: client.address
    });
    setShowClientForm(true);
  };

  const handleDeleteClick = async (client: Client) => {
    try {
      // Get cascade information before showing dialog
      const [invoicesRes, legalDocsRes] = await Promise.all([
        fetch('/api/invoice/list'),
        fetch('/api/legal/list')
      ]);
      
      const [invoicesData, legalDocsData] = await Promise.all([
        invoicesRes.json(),
        legalDocsRes.json()
      ]);
      
      const invoiceCount = (invoicesData.invoices || []).filter((inv: { clientId: string }) => inv.clientId === client.id).length;
      const legalDocumentCount = (legalDocsData.documents || []).filter((doc: { clientId: string }) => doc.clientId === client.id).length;
      
      setDeleteDialog({
        isOpen: true,
        client,
        isLoading: false,
        cascadeInfo: { invoiceCount, legalDocumentCount }
      });
    } catch (error) {
      console.error('Error fetching cascade info:', error);
      // Still show dialog but without cascade info
      setDeleteDialog({
        isOpen: true,
        client,
        isLoading: false,
        cascadeInfo: null
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.client) return;

    setDeleteDialog(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/clients/delete/${deleteDialog.client.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        const { deletedCounts } = result;
        let message = 'Client deleted successfully';
        if (deletedCounts?.invoices > 0 || deletedCounts?.legalDocuments > 0) {
          const parts = [];
          if (deletedCounts.invoices > 0) parts.push(`${deletedCounts.invoices} invoice${deletedCounts.invoices !== 1 ? 's' : ''}`);
          if (deletedCounts.legalDocuments > 0) parts.push(`${deletedCounts.legalDocuments} legal document${deletedCounts.legalDocuments !== 1 ? 's' : ''}`);
          message += ` (also deleted ${parts.join(' and ')})`;
        }
        showToast(message);
        onRefresh();
        setDeleteDialog({ isOpen: false, client: null, isLoading: false, cascadeInfo: null });
      } else {
        showToast(result.error || 'Failed to delete client');
        setDeleteDialog(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      showToast('Error deleting client');
      console.error('Error deleting client:', error);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingClient ? `/api/clients/update/${editingClient.id}` : '/api/clients/create';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientFormData.name,
          emails: clientFormData.emails.filter(email => email.trim()),
          address: clientFormData.address,
        }),
      });

      const result = await response.json();
      if (result.success) {
        showToast(editingClient ? 'Client updated successfully' : 'Client created successfully');
        setShowClientForm(false);
        onRefresh();
      } else {
        showToast(result.error || 'Failed to save client');
      }
    } catch (error) {
      showToast('Error saving client');
      console.error('Error saving client:', error);
    }
  };

  const addEmailField = () => {
    setClientFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    if (clientFormData.emails.length > 1) {
      setClientFormData(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEmailField = (index: number, value: string) => {
    setClientFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light">client management</h2>
          <button
            onClick={handleAddClient}
            className="flex items-center gap-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            add client
          </button>
        </div>
        
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 p-6 rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">{client.name}</h3>
                  <div className="space-y-1 mb-3">
                    {(client.emails && client.emails.length > 0 ? client.emails : [client.email]).filter(Boolean).map((email, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Mail size={14} />
                        <a href={`mailto:${email}`} className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line mb-3">
                    {client.address}
                  </p>
                  {client.invoiceCount !== undefined && (
                    <div className="flex gap-4 text-sm">
                      <span className="text-neutral-500">
                        {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                      </span>
                      {client.totalInvoiced !== undefined && (
                        <span className="text-neutral-500">
                          {formatCurrency(client.totalInvoiced)} total
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClient(client)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors" 
                    title="edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(client)}
                    className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" 
                    title="delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Form Modal */}
      <AnimatePresence>
        {showClientForm && (
          <motion.div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowClientForm(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">
                  {editingClient ? 'edit client' : 'add client'}
                </h2>
                <button
                  onClick={() => setShowClientForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    client name
                  </label>
                  <input
                    type="text"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    email addresses
                  </label>
                  {clientFormData.emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailField(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                        placeholder="client@example.com"
                        required={index === 0}
                      />
                      {clientFormData.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded"
                  >
                    + add another email
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    address
                  </label>
                  <textarea
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors h-20 resize-none rounded"
                    placeholder="123 Main Street&#10;City, Postcode&#10;Country"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="submit"
                    className="flex-1 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    {editingClient ? 'update client' : 'create client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientForm(false)}
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, client: null, isLoading: false, cascadeInfo: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        description="Are you sure you want to delete this client? This will also delete all associated invoices and legal documents."
        itemName={deleteDialog.client?.name || ''}
        itemType="client"
        isLoading={deleteDialog.isLoading}
        cascadeInfo={deleteDialog.cascadeInfo || undefined}
      />
    </>
  );
} 