'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, User, Building, Target, MessageSquare, Star, FileText, Receipt } from 'lucide-react';

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
  breakdown?: { item: string; price: string | number }[];
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

interface InquiriesTabProps {
  showToast: (message: string) => void;
  onCreateInvoice?: (inquiry: Inquiry) => void;
  onCreateLegalDocument?: (inquiry: Inquiry) => void;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  CONTACTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  IN_DISCUSSION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  QUOTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  CONVERTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export function InquiriesTab({ showToast, onCreateInvoice, onCreateLegalDocument }: InquiriesTabProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    finalPrice: '',
    notes: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries');
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      const data = await response.json();
      setInquiries(data.inquiries || []);
    } catch {
      showToast('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry');
      }

      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
        )
      );
      
      showToast('Status updated successfully');
    } catch {
      showToast('Failed to update inquiry status');
    }
  };

  const updateInquiryNotes = async (id: string, newNotes: string) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, notes: newNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry');
      }

      showToast('Notes updated successfully');
      fetchInquiries(); // Refresh data
    } catch {
      showToast('Failed to update notes');
    }
  };

  const openDetailView = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || '');
    setStatus(inquiry.status || 'NEW');
    setShowDetailView(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'QUOTED' && selectedInquiry) {
      // Pre-fill the quote form with inquiry data
      setQuoteFormData({
        firstName: selectedInquiry.name.split(' ')[0] || '',
        lastName: selectedInquiry.name.split(' ').slice(1).join(' ') || '',
        company: selectedInquiry.company || '',
        email: selectedInquiry.email,
        phone: selectedInquiry.phone || '',
        address: '',
        finalPrice: selectedInquiry.estimateMin ? selectedInquiry.estimateMin.toString() : '',
        notes: ''
      });
      setShowQuoteModal(true);
      return;
    }
    
    setStatus(newStatus);
    if (selectedInquiry) {
      updateInquiryStatus(selectedInquiry.id, newStatus);
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const handleNotesUpdate = () => {
    if (selectedInquiry) {
      updateInquiryNotes(selectedInquiry.id, notes);
      setSelectedInquiry({ ...selectedInquiry, notes });
    }
  };

  const filteredInquiries = selectedStatus === 'all' 
    ? inquiries 
    : inquiries.filter(inquiry => inquiry.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-6 h-6 border border-neutral-300 dark:border-neutral-700 border-t-neutral-800 dark:border-t-neutral-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light">project inquiries</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <MessageSquare size={16} />
            {inquiries.length} total inquiries
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'NEW', 'CONTACTED', 'IN_DISCUSSION', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CONVERTED'].map((statusFilter) => (
            <button
              key={statusFilter}
              onClick={() => setSelectedStatus(statusFilter)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedStatus === statusFilter
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {statusFilter === 'all' ? 'all' : statusFilter.toLowerCase().replace('_', ' ')}
              {statusFilter !== 'all' && (
                <span className="ml-1 text-xs">
                  ({inquiries.filter(i => i.status === statusFilter).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {selectedStatus === 'all' ? 'No inquiries found' : `No ${selectedStatus.toLowerCase().replace('_', ' ')} inquiries`}
              </p>
            </div>
          ) : (
            filteredInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-md p-6 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{inquiry.name}</h3>
                      {inquiry.priority && (
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {inquiry.email} {inquiry.company && `• ${inquiry.company}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {inquiry.estimateMin && inquiry.estimateMax && (
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          £{inquiry.estimateMin.toLocaleString()} - £{inquiry.estimateMax.toLocaleString()}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-500">
                          estimated
                        </div>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {inquiry.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">project type</div>
                    <div className="text-sm font-medium">{inquiry.projectType}</div>
                  </div>
                  {inquiry.businessType && (
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">business type</div>
                      <div className="text-sm">{inquiry.businessType}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">timeline</div>
                    <div className="text-sm">{inquiry.timeline}</div>
                  </div>
                  {inquiry.designPreference && (
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">design preference</div>
                      <div className="text-sm">{inquiry.designPreference}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">submitted</div>
                    <div className="text-sm">{new Date(inquiry.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {inquiry.projectGoal && (
                  <div className="mb-4">
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">success goal</div>
                    <div className="text-sm line-clamp-2">{inquiry.projectGoal}</div>
                  </div>
                )}

                {(inquiry.selectedFeatures.length > 0 || inquiry.selectedAdditionalServices.length > 0) && (
                  <div className="mb-4">
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">selected options</div>
                    <div className="flex flex-wrap gap-2">
                      {inquiry.selectedFeatures.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {inquiry.selectedAdditionalServices.slice(0, 2).map((service) => (
                        <span key={service} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                          {service}
                        </span>
                      ))}
                      {(inquiry.selectedFeatures.length + inquiry.selectedAdditionalServices.length) > 5 && (
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded">
                          +{inquiry.selectedFeatures.length + inquiry.selectedAdditionalServices.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Workflow Status - show next steps based on inquiry status */}
                {inquiry.status === 'QUOTED' && (
                  <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        quote sent - awaiting client response
                      </div>
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      {inquiry.finalPrice && `Final price: £${(inquiry.finalPrice / 100).toLocaleString()}`}
                      {inquiry.convertedToClientId && ` • Client created`}
                    </div>
                  </div>
                )}
                
                {inquiry.status === 'ACCEPTED' && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">
                        inquiry accepted - ready for next steps
                      </div>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Create service agreement and invoice to begin project
                                             {inquiry.finalPrice && ` • Final price: £${(inquiry.finalPrice / 100).toLocaleString()}`}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <select
                    value={inquiry.status}
                    onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded"
                  >
                    <option value="NEW">new</option>
                    <option value="CONTACTED">contacted</option>
                    <option value="IN_DISCUSSION">in discussion</option>
                    <option value="QUOTED">quoted</option>
                    <option value="ACCEPTED">accepted</option>
                    <option value="REJECTED">rejected</option>
                    <option value="CONVERTED">converted</option>
                    <option value="ARCHIVED">archived</option>
                  </select>
                  
                  <a
                    href={`mailto:${inquiry.email}?subject=Re: Your Project Inquiry&body=Hi ${inquiry.name},%0D%0A%0D%0AThank you for your interest in working with me on your ${inquiry.projectType} project.%0D%0A%0D%0A`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Mail size={12} />
                    email
                  </a>
                  
                  {inquiry.phone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Phone size={12} />
                      call
                    </a>
                  )}
                  
                  <button
                    onClick={() => openDetailView(inquiry)}
                    className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    view details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetailView && selectedInquiry && (
          <motion.div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowDetailView(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <button
                    onClick={() => setShowDetailView(false)}
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4"
                  >
                    <ArrowLeft size={16} />
                    back to inquiries
                  </button>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-light mb-2">{selectedInquiry.name}</h1>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {selectedInquiry.company && `${selectedInquiry.company} • `}
                        {selectedInquiry.projectType} project
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {selectedInquiry.estimateMin && selectedInquiry.estimateMax && (
                    <div className="text-right">
                      <div className="text-lg font-medium">
                        £{selectedInquiry.estimateMin.toLocaleString()} - £{selectedInquiry.estimateMax.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500">
                        estimated value
                      </div>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[selectedInquiry.status] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedInquiry.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <User size={20} />
                      contact information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">email</div>
                        <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {selectedInquiry.email}
                        </a>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">phone</div>
                          <a href={`tel:${selectedInquiry.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {selectedInquiry.phone}
                          </a>
                        </div>
                      )}
                      {selectedInquiry.company && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">company</div>
                          <div>{selectedInquiry.company}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">submitted</div>
                        <div>{new Date(selectedInquiry.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Building size={20} />
                      business information
                    </h3>
                    <div className="space-y-4">
                      {selectedInquiry.businessType && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">business type</div>
                          <div>{selectedInquiry.businessType}</div>
                        </div>
                      )}
                      {selectedInquiry.currentChallenge && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">current challenge</div>
                          <div>{selectedInquiry.currentChallenge}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">success goal</div>
                        <div>{selectedInquiry.projectGoal}</div>
                      </div>
                      {selectedInquiry.targetAudience && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">target audience</div>
                          <div>{selectedInquiry.targetAudience}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Requirements */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Target size={20} />
                      project requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">timeline</div>
                        <div>{selectedInquiry.timeline}</div>
                      </div>
                      {selectedInquiry.designPreference && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">design preference</div>
                          <div>{selectedInquiry.designPreference}</div>
                        </div>
                      )}
                      {selectedInquiry.contentReady && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">content ready</div>
                          <div>{selectedInquiry.contentReady}</div>
                        </div>
                      )}
                      {selectedInquiry.hasExistingWebsite && (
                        <div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-1">existing website</div>
                          <div>{selectedInquiry.hasExistingWebsite}</div>
                        </div>
                      )}
                    </div>

                    {(selectedInquiry.selectedFeatures.length > 0 || selectedInquiry.selectedAdditionalServices.length > 0) && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500 mb-2">selected options</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedInquiry.selectedFeatures.map((feature) => (
                            <span key={feature} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                          {selectedInquiry.selectedAdditionalServices.map((service) => (
                            <span key={service} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  {selectedInquiry.message && (
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                      <h3 className="text-lg font-medium mb-4">additional information</h3>
                      <div className="whitespace-pre-wrap">{selectedInquiry.message}</div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {selectedInquiry.breakdown && selectedInquiry.breakdown.length > 0 && (
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                      <h3 className="text-lg font-medium mb-4">price breakdown</h3>
                      <div className="space-y-2">
                        {selectedInquiry.breakdown.map((item, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.item}</span>
                            <span className="font-medium">
                              {typeof item.price === 'number' ? `£${item.price}` : item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Actions */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4">actions</h3>
                    <div className="space-y-3">
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: Your Project Inquiry&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThank you for your interest in working with me on your ${selectedInquiry.projectType} project.%0D%0A%0D%0A`}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <Mail size={16} />
                        send email
                      </a>
                      {selectedInquiry.phone && (
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <Phone size={16} />
                          call
                        </a>
                      )}
                      
                      {/* Show business workflow actions when inquiry is accepted */}
                      {selectedInquiry.status === 'ACCEPTED' && (
                        <>
                          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-3">
                              next steps
                            </p>
                          </div>
                          
                          {onCreateLegalDocument && (
                            <button
                              onClick={() => onCreateLegalDocument(selectedInquiry)}
                              className="flex items-center gap-2 w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              <FileText size={16} />
                              create service agreement
                            </button>
                          )}
                          
                          {onCreateInvoice && (
                            <button
                              onClick={() => onCreateInvoice(selectedInquiry)}
                              className="flex items-center gap-2 w-full px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                            >
                              <Receipt size={16} />
                              create invoice
                              {selectedInquiry.finalPrice ? (
                                <span className="text-xs ml-auto">
                                  £{(selectedInquiry.finalPrice / 100).toLocaleString()}
                                </span>
                              ) : selectedInquiry.estimateMin && selectedInquiry.estimateMax && (
                                <span className="text-xs ml-auto">
                                  £{selectedInquiry.estimateMin.toLocaleString()} - £{selectedInquiry.estimateMax.toLocaleString()}
                                </span>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4">status</h3>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 rounded"
                    >
                      <option value="NEW">new</option>
                      <option value="CONTACTED">contacted</option>
                      <option value="IN_DISCUSSION">in discussion</option>
                      <option value="QUOTED">quoted</option>
                      <option value="ACCEPTED">accepted</option>
                      <option value="REJECTED">rejected</option>
                      <option value="CONVERTED">converted</option>
                      <option value="ARCHIVED">archived</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4">internal notes</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 rounded resize-none"
                      placeholder="Add internal notes..."
                    />
                    <button
                      onClick={handleNotesUpdate}
                      className="mt-3 w-full px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                    >
                      save notes
                    </button>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-md">
                    <h3 className="text-lg font-medium mb-4">additional details</h3>
                    <div className="space-y-3 text-sm">
                      {selectedInquiry.hearAboutUs && (
                        <div>
                          <div className="text-neutral-500 dark:text-neutral-500">heard about us</div>
                          <div>{selectedInquiry.hearAboutUs}</div>
                        </div>
                      )}
                      {selectedInquiry.budget && (
                        <div>
                          <div className="text-neutral-500 dark:text-neutral-500">budget</div>
                          <div>{selectedInquiry.budget}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-neutral-500 dark:text-neutral-500">inquiry id</div>
                        <div className="font-mono text-xs">{selectedInquiry.id}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Creation Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedInquiry && (
          <motion.div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowQuoteModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Create Quote & Client</h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Setting status to &quot;QUOTED&quot; will create a client record and finalize the project price.
                </p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // Validate required fields
                if (!quoteFormData.firstName.trim() || !quoteFormData.lastName.trim() || !quoteFormData.email.trim() || !quoteFormData.address.trim() || !quoteFormData.finalPrice.trim()) {
                  showToast('Please fill in all required fields');
                  return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(quoteFormData.email)) {
                  showToast('Please enter a valid email address');
                  return;
                }
                
                // Validate price
                const price = parseFloat(quoteFormData.finalPrice);
                if (isNaN(price) || price <= 0) {
                  showToast('Please enter a valid price');
                  return;
                }
                
                try {
                  // Create client first
                  const clientResponse = await fetch('/api/clients/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: `${quoteFormData.firstName} ${quoteFormData.lastName}`.trim(),
                      emails: [quoteFormData.email],
                      address: quoteFormData.address,
                      company: quoteFormData.company
                    }),
                  });

                  if (!clientResponse.ok) {
                    const errorText = await clientResponse.text();
                    console.error('Client creation failed:', errorText);
                    showToast(`Failed to create client: ${errorText}`);
                    return;
                  }

                  const clientResult = await clientResponse.json();
                  console.log('Client creation response:', clientResult);
                  
                  if (clientResponse.ok && clientResult.client) {
                    // Update inquiry with quote details and client ID
                    const inquiryResponse = await fetch('/api/inquiries', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: selectedInquiry.id,
                        status: 'QUOTED',
                                                 finalPrice: Math.round(parseFloat(quoteFormData.finalPrice) * 100), // Convert pounds to pence
                        convertedToClientId: clientResult.client.id,
                        quotedAt: new Date().toISOString(),
                        notes: quoteFormData.notes ? `${selectedInquiry.notes || ''}\n\nQuote Notes: ${quoteFormData.notes}` : selectedInquiry.notes
                      }),
                    });

                    const inquiryResult = await inquiryResponse.json();
                    
                                        if (inquiryResult.success) {
                      // Send the quote email
                      const quoteResponse = await fetch('/api/inquiries/send-quote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          inquiryId: selectedInquiry.id,
                          clientId: clientResult.client.id,
                          finalPrice: Math.round(parseFloat(quoteFormData.finalPrice) * 100), // Convert pounds to pence
                          notes: quoteFormData.notes
                        }),
                      });

                      const quoteResult = await quoteResponse.json();
                      
                      if (quoteResult.success) {
                        showToast(`Client created and quote sent to ${quoteFormData.firstName} ${quoteFormData.lastName} for £${parseFloat(quoteFormData.finalPrice).toLocaleString()}`);
                      } else {
                        showToast(`Client created but failed to send quote email: ${quoteResult.error}`);
                      }
                      
                       setShowQuoteModal(false);
                       setStatus('QUOTED');
                       setSelectedInquiry({
                         ...selectedInquiry,
                         status: 'QUOTED',
                         finalPrice: Math.round(parseFloat(quoteFormData.finalPrice) * 100), // Convert pounds to pence
                         convertedToClientId: clientResult.client.id,
                         quotedAt: new Date().toISOString()
                       });
                      fetchInquiries(); // Refresh the list
                    } else {
                      showToast('Failed to update inquiry with quote details');
                    }
                  } else {
                    showToast(`Failed to create client record: ${clientResult.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('Error creating quote and client:', error);
                  showToast(`Error creating quote and client: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      first name
                    </label>
                    <input
                      type="text"
                      value={quoteFormData.firstName}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      last name
                    </label>
                    <input
                      type="text"
                      value={quoteFormData.lastName}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    company (optional)
                  </label>
                  <input
                    type="text"
                    value={quoteFormData.company}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      email
                    </label>
                    <input
                      type="email"
                      value={quoteFormData.email}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={quoteFormData.phone}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    address
                  </label>
                  <textarea
                    value={quoteFormData.address}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none rounded"
                    placeholder="123 Main Street&#10;City, Postcode&#10;Country"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    final project price (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteFormData.finalPrice}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, finalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    placeholder="1400.00"
                    required
                  />
                                                        {selectedInquiry.estimateMin && selectedInquiry.estimateMax && (
                     <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                       Original estimate: £{selectedInquiry.estimateMin.toLocaleString()} - £{selectedInquiry.estimateMax.toLocaleString()}
                     </p>
                   )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    quote notes (optional)
                  </label>
                  <textarea
                    value={quoteFormData.notes}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none rounded"
                    placeholder="Additional notes about the quote, timeline, or terms..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="submit"
                    className="flex-1 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    create client & send quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
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
    </>
  );
} 