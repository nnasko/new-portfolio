'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
// Import Dialog components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// Import icons
import { Users, DollarSign, Award, BarChart2, UserPlus, Mail, MapPin, AlertCircle, Search, Trash2 } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculate analytics
  const clientAnalytics = useMemo(() => {
    if (!clients.length) {
      return {
        totalClients: 0,
        totalInvoiced: 0,
        totalInvoiceCount: 0,
        averageInvoiceValue: 0,
        topClientsByValue: [],
        topClientsByCount: []
      };
    }

    const totalInvoiced = clients.reduce((sum, client) => sum + client.totalInvoiced, 0);
    const totalInvoiceCount = clients.reduce((sum, client) => sum + client.invoiceCount, 0);
    
    // Sort clients by total invoiced value (descending)
    const topClientsByValue = [...clients]
      .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
      .slice(0, 3);
    
    // Sort clients by invoice count (descending)
    const topClientsByCount = [...clients]
      .sort((a, b) => b.invoiceCount - a.invoiceCount)
      .slice(0, 3);
    
    return {
      totalClients: clients.length,
      totalInvoiced,
      totalInvoiceCount,
      averageInvoiceValue: totalInvoiceCount ? totalInvoiced / totalInvoiceCount : 0,
      topClientsByValue,
      topClientsByCount
    };
  }, [clients]);

  // Filtered clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(lowercaseSearch) ||
      client.email.toLowerCase().includes(lowercaseSearch) ||
      client.address.toLowerCase().includes(lowercaseSearch)
    );
  }, [clients, searchTerm]);

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
    setIsSubmitting(true);
    
    if (!newClient.name || !newClient.email || !newClient.address) {
        setFormError('please fill in all fields.');
        setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false);
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

      {/* Analytics Cards */}
      {!isLoading && !error && clients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light border-b pb-2 mb-6 lowercase border-neutral-200 dark:border-neutral-800">
            client analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1 lowercase">clients</h3>
                  <p className="text-2xl font-light">{clientAnalytics.totalClients}</p>
                  <p className="text-sm text-neutral-500 mt-1 lowercase">total clients</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1 lowercase">total value</h3>
                  <p className="text-2xl font-light">{formatCurrency(clientAnalytics.totalInvoiced)}</p>
                  <p className="text-sm text-neutral-500 mt-1 lowercase">
                    across {clientAnalytics.totalInvoiceCount} invoice{clientAnalytics.totalInvoiceCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mt-1">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-2 lowercase">top by value</h3>
                  {clientAnalytics.topClientsByValue.length > 0 ? (
                    <div className="space-y-2">
                      {clientAnalytics.topClientsByValue.map((client, index) => (
                        <div key={client.id} className="text-sm">
                          <span className="lowercase font-medium mr-1">{index + 1}.</span>
                          <span className="lowercase">{client.name}</span>
                          <span className="text-neutral-500 ml-1">
                            {formatCurrency(client.totalInvoiced)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 lowercase">no data available</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full mt-1">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-2 lowercase">top by volume</h3>
                  {clientAnalytics.topClientsByCount.length > 0 ? (
                    <div className="space-y-2">
                      {clientAnalytics.topClientsByCount.map((client, index) => (
                        <div key={client.id} className="text-sm">
                          <span className="lowercase font-medium mr-1">{index + 1}.</span>
                          <span className="lowercase">{client.name}</span>
                          <span className="text-neutral-500 ml-1">
                            {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 lowercase">no data available</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client List & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Client List Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium lowercase">clients</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm bg-transparent border border-neutral-300 dark:border-neutral-600 rounded-sm focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 lowercase w-56"
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-24 rounded-sm"></div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-4 rounded-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300 lowercase">{error}</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 lowercase">no clients found.</p>
                <p className="text-sm text-neutral-400 lowercase mt-1">add your first client using the form.</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 lowercase">no clients match your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <motion.div 
                    key={client.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <h3 className="font-medium text-neutral-800 dark:text-neutral-200 lowercase">{client.name}</h3>
                          {client.invoiceCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full lowercase">
                              {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 lowercase">
                          <Mail className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {client.email}
                        </div>
                        
                        <div className="flex items-start text-sm text-neutral-500 dark:text-neutral-500 lowercase">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 opacity-70" />
                          <span className="whitespace-pre-line">{client.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end">
                        <button
                          onClick={() => openDeleteClientDialog(client)}
                          className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                          title="Delete client"
                          aria-label={`Delete client ${client.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="text-right mt-auto">
                          <p className="text-sm font-medium lowercase">
                            {formatCurrency(client.totalInvoiced)}
                          </p>
                          <p className="text-xs text-neutral-500 lowercase">
                            total billed
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Add New Client Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700">
              <UserPlus className="h-5 w-5 text-neutral-500" />
              <h2 className="text-lg font-medium lowercase">add new client</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-neutral-500 lowercase">name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="client name"
                  value={newClient.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-transparent border border-neutral-300 dark:border-neutral-600 rounded-sm focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-neutral-500 lowercase">email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="client email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-transparent border border-neutral-300 dark:border-neutral-600 rounded-sm focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-neutral-500 lowercase">address</label>
                <textarea
                  name="address"
                  placeholder="client address"
                  value={newClient.address}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-transparent border border-neutral-300 dark:border-neutral-600 rounded-sm focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                  rows={3}
                  required
                />
              </div>
              
              {formError && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 rounded-sm">
                  <p className="text-red-800 dark:text-red-300 text-sm lowercase">{formError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 
                  px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 
                  transition-colors lowercase
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? 'adding...' : 'add client'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Delete Client Confirmation Dialog */}
      <Dialog open={isClientDeleteDialogOpen} onOpenChange={setIsClientDeleteDialogOpen}>
        <DialogContent className="rounded-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <DialogHeader>
            <DialogTitle className="lowercase">confirm client deletion</DialogTitle>
             <DialogDescription className="lowercase pt-1">
                are you sure you want to delete client <span className="font-medium text-neutral-800 dark:text-neutral-200">{clientToDelete?.name}</span>?
                this action cannot be undone. clients with assigned invoices cannot be deleted.
             </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
              {clientDeleteError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 rounded-sm">
                    <p className="text-red-800 dark:text-red-300 text-sm lowercase">{clientDeleteError}</p>
                  </div>
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