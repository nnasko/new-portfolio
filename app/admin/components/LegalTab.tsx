'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Download, PenTool, Briefcase, Trash2 } from 'lucide-react';
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

interface ServiceAgreement {
  id: string;
  documentNumber: string;
  title: string;
  status: 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED';
  clientId: string;
  Client?: Client;
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
}

interface LegalTabProps {
  agreements: ServiceAgreement[];
  clients: Client[];
  onRefresh: () => void;
  showToast: (message: string) => void;
  prefilledInquiry?: Inquiry; // Inquiry data to prefill form
}

export function LegalTab({ agreements, clients, onRefresh, showToast, prefilledInquiry }: LegalTabProps) {
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [legalFormData, setLegalFormData] = useState({
    clientId: '',
    title: '',
    projectDescription: '',
    estimatedValue: '',
    timeline: ''
  });
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    agreement: ServiceAgreement | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    agreement: null,
    isLoading: false
  });

  // Auto-open form and prefill when inquiry data is provided
  useEffect(() => {
    if (prefilledInquiry) {
      handleAddLegalDocument();
    }
  }, [prefilledInquiry]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/20 dark:text-neutral-400';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SIGNED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/20 dark:text-neutral-400';
    }
  };

  const handleAddLegalDocument = () => {
    // Check if we have prefilled inquiry data
    if (prefilledInquiry) {
              setLegalFormData({
          clientId: prefilledInquiry.convertedToClientId || '', // Use the created client ID
          title: `${prefilledInquiry.projectType} development service agreement`,
          projectDescription: prefilledInquiry.projectGoal || '',
          estimatedValue: prefilledInquiry.finalPrice ? (prefilledInquiry.finalPrice / 100).toString() : (prefilledInquiry.estimateMin ? (prefilledInquiry.estimateMin / 100).toString() : ''),
          timeline: prefilledInquiry.timeline || ''
        });
    } else {
      setLegalFormData({
        clientId: '',
        title: '',
        projectDescription: '',
        estimatedValue: '',
        timeline: ''
      });
    }
    setShowLegalForm(true);
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!legalFormData.clientId || !legalFormData.title) {
      showToast('Client and title are required');
      return;
    }

    try {
      const response = await fetch('/api/legal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: legalFormData.clientId,
          title: legalFormData.title,
          projectDescription: legalFormData.projectDescription || undefined,
          estimatedValue: legalFormData.estimatedValue ? parseFloat(legalFormData.estimatedValue) : undefined,
          timeline: legalFormData.timeline || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        showToast('Legal document created successfully');
        setShowLegalForm(false);
        onRefresh();
      } else {
        showToast(result.error || 'Failed to create legal document');
      }
    } catch (error) {
      showToast('Error creating legal document');
      console.error('Error creating legal document:', error);
    }
  };

  const handlePreviewDocument = (documentId: string) => {
    window.open(`/api/legal/preview/${documentId}`, '_blank');
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/legal/preview/${documentId}?download=true`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast('Error downloading document');
      console.error('Error downloading document:', error);
    }
  };

  const handleSendDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/legal/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      const result = await response.json();
      if (result.success) {
        showToast('Document sent successfully');
        onRefresh();
      } else {
        showToast(result.error || 'Failed to send document');
      }
    } catch (error) {
      showToast('Error sending document');
      console.error('Error sending document:', error);
    }
  };

  const handleDeleteClick = (agreement: ServiceAgreement) => {
    setDeleteDialog({
      isOpen: true,
      agreement,
      isLoading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.agreement) return;

    setDeleteDialog(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/legal/delete/${deleteDialog.agreement.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        showToast('Legal document deleted successfully');
        onRefresh();
        setDeleteDialog({ isOpen: false, agreement: null, isLoading: false });
      } else {
        showToast(result.error || 'Failed to delete legal document');
        setDeleteDialog(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      showToast('Error deleting legal document');
      console.error('Error deleting legal document:', error);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light">legal documents</h2>
          <div className="flex items-center gap-3">
            {prefilledInquiry && (
              <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded">
                Creating for: {prefilledInquiry.name}
              </div>
            )}
            <button
              onClick={handleAddLegalDocument}
              className="flex items-center gap-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus size={16} />
              {prefilledInquiry ? 'create agreement from inquiry' : 'create agreement'}
            </button>
          </div>
        </div>
        
        <div className="bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-4 font-medium">agreement</th>
                  <th className="p-4 font-medium">client</th>
                  <th className="p-4 font-medium">status</th>
                  <th className="p-4 font-medium">created</th>
                  <th className="p-4 font-medium">actions</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-neutral-500" />
                        <div>
                          <div className="font-medium">{agreement.title}</div>
                          <div className="text-sm text-neutral-500 font-mono">{agreement.documentNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {agreement.Client ? (
                        <div>
                          <div className="font-medium">{agreement.Client.name}</div>
                          <div className="text-sm text-neutral-500">
                            {(agreement.Client.emails && agreement.Client.emails.length > 0 ? agreement.Client.emails[0] : agreement.Client.email) || 'no email'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">no client assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(agreement.status)}`}>
                        {agreement.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(agreement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handlePreviewDocument(agreement.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors" 
                          title="preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => handleDownloadDocument(agreement.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors" 
                          title="download"
                        >
                          <Download size={14} />
                        </button>
                        {agreement.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleSendDocument(agreement.id)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors" 
                            title="send for signature"
                          >
                            <PenTool size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteClick(agreement)}
                          className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" 
                          title="delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legal Document Form Modal */}
      <AnimatePresence>
        {showLegalForm && (
          <motion.div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowLegalForm(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">create service agreement</h2>
                <button
                  onClick={() => setShowLegalForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleLegalSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    client
                  </label>
                  <select
                    value={legalFormData.clientId}
                    onChange={(e) => setLegalFormData({ ...legalFormData, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    required
                  >
                    <option value="">select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    agreement title
                  </label>
                  <input
                    type="text"
                    value={legalFormData.title}
                    onChange={(e) => setLegalFormData({ ...legalFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    placeholder="e.g., website development service agreement"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    project description (optional)
                  </label>
                  <textarea
                    value={legalFormData.projectDescription}
                    onChange={(e) => setLegalFormData({ ...legalFormData, projectDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors h-24 resize-none rounded"
                    placeholder="brief description of the project scope and deliverables"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      estimated value (optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={legalFormData.estimatedValue}
                      onChange={(e) => setLegalFormData({ ...legalFormData, estimatedValue: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      timeline (optional)
                    </label>
                    <input
                      type="text"
                      value={legalFormData.timeline}
                      onChange={(e) => setLegalFormData({ ...legalFormData, timeline: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="e.g., 4-6 weeks"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="submit"
                    className="flex-1 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    create agreement
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLegalForm(false)}
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
        onClose={() => setDeleteDialog({ isOpen: false, agreement: null, isLoading: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Legal Document"
        description="Are you sure you want to delete this legal document? This action cannot be undone."
        itemName={deleteDialog.agreement ? `${deleteDialog.agreement.title} (${deleteDialog.agreement.documentNumber})` : ''}
        itemType="legal document"
        isLoading={deleteDialog.isLoading}
      />
    </>
  );
} 