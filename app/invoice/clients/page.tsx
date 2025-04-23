'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
// Import Dialog components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// Import X icon
import { X } from 'lucide-react';

// Updated Client interface to include stats from API
interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: string; // Assuming createdAt is returned as string
  invoiceCount: number; // Added
  totalInvoiced: number; // Added
  // Prisma might also return _count object, adjust if necessary based on API response
}

interface NewClientData {
  name: string;
  email: string;
  address: string;
}

// Helper function to format currency (can be moved to a utils file)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<NewClientData>({ name: '', email: '', address: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // State for Delete Client Dialog
  const [isClientDeleteDialogOpen, setIsClientDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [clientDeleteError, setClientDeleteError] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clients/list');
      if (!response.ok) {
        throw new Error('failed to fetch clients');
      }
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'an unknown error occurred');
      console.error("Fetch clients error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle input changes for the new client form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
    setFormError(null); // Clear form error on input change
  };

  // Handle form submission to create a new client
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newClient.name || !newClient.email || !newClient.address) {
        setFormError('please fill in all fields.');
        return;
    }

    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'failed to create client');
      }

      // Success: Clear form, refresh client list
      setNewClient({ name: '', email: '', address: '' });
      await fetchClients(); // Re-fetch clients to show the new one

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'an unknown error occurred');
      console.error("Create client error:", err);
    }
  };

  // --- Delete Client Handlers ---
  const openDeleteClientDialog = (client: Client) => {
    setClientToDelete(client);
    setClientDeleteError(null);
    setIsDeletingClient(false);
    setIsClientDeleteDialogOpen(true);
  };

  const handleDeleteClientConfirm = async () => {
    if (!clientToDelete) return;

    setIsDeletingClient(true);
    setClientDeleteError(null);

    try {
      const response = await fetch(`/api/clients/delete/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Use the specific error from the API if available
        throw new Error(result.error || 'failed to delete client');
      }

      // Success
      setIsClientDeleteDialogOpen(false);
      setClientToDelete(null);
      await fetchClients(); // Refresh client list

    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error during deletion';
      setClientDeleteError(message);
      console.error("Delete client error:", message);
    } finally {
      setIsDeletingClient(false);
    }
  };
  // --- End Delete Client Handlers ---

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light lowercase">manage clients</h1>
        <Link 
          href="/invoice"
          className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
        >
          back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Client List & Stats */}
        <div className="md:col-span-2 space-y-4">
          {/* Display Total Clients Stat */}
          <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
             <h2 className="text-lg font-light lowercase">existing clients</h2>
             {!isLoading && !error && (
                 <span className="text-sm text-neutral-500 lowercase">
                     total: {clients.length}
                 </span>
             )}
          </div>
          {isLoading && <p className="text-neutral-500 lowercase">loading clients...</p>}
          {error && <p className="text-red-500 lowercase">error loading clients: {error}</p>}
          {!isLoading && !error && clients.length === 0 && (
            <p className="text-neutral-500 lowercase">no clients found.</p>
          )}
          {!isLoading && !error && clients.length > 0 && (
             <ul className="space-y-4">
               {clients.map((client) => (
                 <li key={client.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-4 flex justify-between items-start">
                   {/* Client details */}
                   <div className="space-y-1">
                     <p className="font-medium text-neutral-800 dark:text-neutral-200 lowercase">{client.name}</p>
                     <p className="text-sm text-neutral-600 dark:text-neutral-400 lowercase">{client.email}</p>
                     <p className="text-sm text-neutral-500 dark:text-neutral-500 lowercase">{client.address}</p>
                     {/* Display Client Stats */}
                     <div className="flex space-x-4 pt-1">
                         <span className="text-xs text-neutral-400 lowercase">
                             {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                         </span>
                         <span className="text-xs text-neutral-400 lowercase">
                             {formatCurrency(client.totalInvoiced)} total
                         </span>
                     </div>
                   </div>
                   {/* Delete button */}
                   <button
                      onClick={() => openDeleteClientDialog(client)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 p-1 ml-2 flex-shrink-0"
                      title="delete this client"
                      aria-label={`delete client ${client.name}`}
                    >
                      <X size={16} />
                   </button>
                 </li>
               ))}
             </ul>
          )}
        </div>

        {/* Add New Client Form */}
        <div className="md:col-span-1 space-y-4">
           <h2 className="text-lg font-light border-b pb-2 lowercase border-neutral-200 dark:border-neutral-800">add new client</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <input
               type="text"
               name="name"
               placeholder="client name"
               value={newClient.name}
               onChange={handleInputChange}
               className="w-full p-2 bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
               required
             />
             <input
               type="email"
               name="email"
               placeholder="client email"
               value={newClient.email}
               onChange={handleInputChange}
               className="w-full p-2 bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
               required
             />
            <textarea
               name="address"
               placeholder="client address"
               value={newClient.address}
               onChange={handleInputChange}
               className="w-full p-2 bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
               rows={3}
               required
            />
            {formError && (
                <p className="text-red-500 text-sm lowercase">error: {formError}</p>
            )}
            <button
              type="submit"
              className="w-full border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
            >
              add client
            </button>
           </form>
        </div>
      </div>

      {/* Delete Client Confirmation Dialog */}
      <Dialog open={isClientDeleteDialogOpen} onOpenChange={setIsClientDeleteDialogOpen}>
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">confirm client deletion</DialogTitle>
             <DialogDescription className="lowercase pt-1">
                are you sure you want to delete client <span className="font-medium text-neutral-800 dark:text-neutral-200">{clientToDelete?.name}</span>?
                this action cannot be undone. clients with assigned invoices cannot be deleted.
             </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
              {clientDeleteError && (
                  <p className="text-red-500 text-sm lowercase">error: {clientDeleteError}</p>
              )}
              <div className="flex justify-end space-x-2">
                  <button
                      type="button"
                      onClick={() => setIsClientDeleteDialogOpen(false)}
                      className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors lowercase"
                      disabled={isDeletingClient}
                  >
                      cancel
                  </button>
                  <button
                      type="button"
                      onClick={handleDeleteClientConfirm}
                      className="border border-red-500 bg-red-500 text-white dark:border-red-600 dark:bg-red-600 dark:hover:bg-red-700 px-4 py-2 text-sm hover:bg-red-600 transition-colors lowercase disabled:opacity-50"
                      disabled={isDeletingClient}
                  >
                      {isDeletingClient ? 'deleting...' : 'confirm delete'}
                  </button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
} 