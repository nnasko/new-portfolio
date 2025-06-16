'use client';

import { useEffect, useState, FormEvent } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Eye, 
  Download, 
  Plus,
  Briefcase,
  PenTool
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
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

interface CreateAgreementFormData {
  clientId: string;
  title: string;
  projectDescription?: string;
  estimatedValue?: number;
  timeline?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800';
    case 'SENT':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    case 'ACKNOWLEDGED':
      return 'text-green-600 bg-green-100 dark:bg-green-900';
    case 'EXPIRED':
      return 'text-red-600 bg-red-100 dark:bg-red-900';
    default:
      return 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800';
  }
};

export default function ServiceAgreementsPage() {
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateAgreementFormData>({
    clientId: '',
    title: '',
    projectDescription: '',
    estimatedValue: undefined,
    timeline: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, agreementsRes] = await Promise.all([
        fetch('/api/clients/list'),
        fetch('/api/legal/list'),
      ]);

      const [clientsData, agreementsData] = await Promise.all([
        clientsRes.json(),
        agreementsRes.json(),
      ]);

      setClients(clientsData.clients || []);
      setAgreements(agreementsData.documents || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAgreementFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate title based on client
    if (field === 'clientId') {
      const client = clients.find(c => c.id === value);
      if (client) {
        setFormData(prev => ({
          ...prev,
          title: `Service Agreement - ${client.name} - ${format(new Date(), 'dd/MM/yyyy')}`
        }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/legal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateDialog(false);
        setFormData({
          clientId: '',
          title: '',
          projectDescription: '',
          estimatedValue: undefined,
          timeline: '',
        });
        // Refresh the data to get the new agreement
        await fetchData();
      } else {
        setError(data.error || 'Failed to create service agreement');
      }
    } catch (err) {
      setError('Failed to create service agreement');
      console.error('Error creating agreement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAgreement = async (agreementId: string) => {
    try {
      window.open(`/api/legal/preview/${agreementId}`, '_blank');
    } catch (err) {
      console.error('Error previewing agreement:', err);
    }
  };

  const downloadAgreement = async (agreementId: string) => {
    try {
      const response = await fetch(`/api/legal/preview/${agreementId}?download=true`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `service-agreement-${agreementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading agreement:', err);
    }
  };

  const sendForSignature = async (agreementId: string) => {
    try {
      const response = await fetch('/api/legal/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: agreementId }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success message
        setError(null);
        alert(`Service agreement sent successfully!\n\nThe client will receive an email with a secure signing link.`);
        // Refresh data to get updated status
        await fetchData();
      } else {
        setError(data.error || 'Failed to send agreement');
      }
    } catch (err) {
      console.error('Error sending agreement:', err);
      setError('Failed to send agreement');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen lowercase">loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-light lowercase">service agreements</h1>
          <p className="text-neutral-500 text-sm mt-1 lowercase">
            create and manage digital service agreements
          </p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/invoice"
            className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
          >
            back to dashboard
          </Link>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase flex items-center gap-2"
          >
            <Plus size={16} />
            create agreement
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 mb-6">
          <p className="text-red-800 dark:text-red-300 text-sm lowercase">{error}</p>
        </div>
      )}

      <div className="bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-neutral-500 lowercase border-b border-neutral-200 dark:border-neutral-700">
                <th className="p-4">agreement</th>
                <th className="p-4">client</th>
                <th className="p-4">status</th>
                <th className="p-4">created</th>
                <th className="p-4">actions</th>
              </tr>
            </thead>
            <tbody>
              {agreements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 lowercase">
                    no service agreements created yet. click &quot;create agreement&quot; to get started.
                  </td>
                </tr>
              ) : (
                agreements.map((agreement) => (
                  <tr key={agreement.id} className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-neutral-500" />
                        <div>
                          <div className="font-medium lowercase">{agreement.title}</div>
                          <div className="text-sm text-neutral-500 font-mono">{agreement.documentNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {agreement.Client ? (
                        <div>
                          <div className="lowercase">{agreement.Client.name}</div>
                          <div className="text-sm text-neutral-500 lowercase">{agreement.Client.email}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic lowercase">no client assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium lowercase ${getStatusColor(agreement.status)}`}>
                        {agreement.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {format(new Date(agreement.createdAt), 'PP').toLowerCase()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => previewAgreement(agreement.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          title="preview agreement"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => downloadAgreement(agreement.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          title="download pdf"
                        >
                          <Download size={14} />
                        </button>
                        {agreement.status === 'DRAFT' && (
                          <button
                            onClick={() => sendForSignature(agreement.id)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                            title="send for signature"
                          >
                            <PenTool size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Agreement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="lowercase">create service agreement</DialogTitle>
            <DialogDescription className="lowercase pt-1">
              generate a professional service agreement for client services.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-500 lowercase">client</label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                required
              >
                <option value="">select client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-neutral-100 dark:bg-neutral-800">
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-500 lowercase">agreement title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                placeholder="agreement title..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-500 lowercase">service description (optional)</label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase resize-none"
                rows={3}
                placeholder="describe the services to be provided..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-500 lowercase">estimated value (£)</label>
                <input
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-500 lowercase">timeline</label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors lowercase"
                disabled={isSubmitting}
              >
                cancel
              </button>
              <button
                type="submit"
                className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'creating...' : 'create agreement'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 