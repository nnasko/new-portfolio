"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedText } from "../components/AnimatedText";
import { useToast } from "../components/Toast";
import { staggerContainer, staggerItem } from "../../lib/animation-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InvoiceManagerDialog } from "../components/InvoiceManagerDialog";
import { Navigation } from "../components/Navigation";
import { ScrollProgress } from "../components/ScrollProgress";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Receipt,
  MessageSquare,
} from "lucide-react";

// Import tab components
import { ProjectsTab } from "./components/ProjectsTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";
import { LegalTab } from "./components/LegalTab";
import { InquiriesTab } from "./components/InquiriesTab";

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  overview?: string;
  fullDescription?: string;
  image: string;
  mobileImage?: string;
  images: string[];
  mobileImages: string[];
  technologies: string[];
  link: string;
  year?: string;
  isVisible: boolean;
  priority: boolean;
  order: number;
  createdAt: string;  
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string; // Still exists in schema
  emails: string[]; // New array field
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
  amountPaid?: number; // May not exist in current schema
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE';
  clientId: string | null;
  Client: Client | null;
  createdAt?: string;
  updatedAt?: string;
  lastReminder?: string | null;
  reminderCount?: number;
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

type TabType = 'projects' | 'invoices' | 'clients' | 'legal' | 'inquiries';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inquiry integration states
  const [prefilledInquiry, setPrefilledInquiry] = useState<Inquiry | undefined>(undefined);
  
  // Invoice manager dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('invoice-auth='));
      
      if (!authCookie) {
        router.push('/admin/login');
        return;
      }

      const authValue = decodeURIComponent(authCookie.split('=')[1]);
      
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: authValue }),
        });
        const data = await response.json();
        
        if (!data.success) {
          router.push('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/admin/login');
        return;
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'projects':
          const projectsRes = await fetch("/api/projects");
          const projectsData = await projectsRes.json();
          if (projectsData.success) {
            setProjects(projectsData.data.sort((a: Project, b: Project) => {
              if (a.priority !== b.priority) return b.priority ? 1 : -1;
              return a.order - b.order;
            }));
          }
          break;
          
        case 'invoices':
          const invoicesRes = await fetch('/api/invoice/list');
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.invoices || []);
          break;
          
        case 'clients':
          const clientsRes = await fetch('/api/clients/list');
          const clientsData = await clientsRes.json();
          setClients(clientsData.clients || []);
          break;
          
        case 'legal':
          const [clientsListRes, agreementsRes] = await Promise.all([
            fetch('/api/clients/list'),
            fetch('/api/legal/list'),
          ]);
          const [clientsList, agreementsData] = await Promise.all([
            clientsListRes.json(),
            agreementsRes.json(),
          ]);
          setClients(clientsList.clients || []);
          setAgreements(agreementsData.documents || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Invoice management functions
  const handleSendReminder = async (invoice: Invoice) => {
    if (!invoice.Client) {
      showToast('Cannot send reminder: No client assigned to this invoice');
      return;
    }

    try {
      const clientEmails = invoice.Client.emails && invoice.Client.emails.length > 0 
        ? invoice.Client.emails 
        : [invoice.Client.email].filter(Boolean);

      if (clientEmails.length === 0) {
        showToast('Cannot send reminder: No email addresses found for client');
        return;
      }

      const response = await fetch('/api/invoice/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          selectedEmails: clientEmails, // Send to all client emails
        }),
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Reminder sent to ${result.sentTo?.length || clientEmails.length} email address(es)`);
        fetchData(); // Refresh to update reminder count
      } else {
        showToast(result.error || 'Failed to send reminder');
      }
    } catch (error) {
      showToast('Error sending reminder');
      console.error('Error sending reminder:', error);
    }
  };

  const handleManageInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };

  // Inquiry integration handlers
  const handleCreateInvoiceFromInquiry = (inquiry: Inquiry) => {
    // Set the prefilled inquiry data and switch to invoices tab
    setPrefilledInquiry(inquiry);
    setActiveTab('invoices');
    showToast(`Creating invoice for ${inquiry.name} with estimated value £${inquiry.estimateMin} - £${inquiry.estimateMax}`);
  };

  const handleCreateLegalDocumentFromInquiry = (inquiry: Inquiry) => {
    // Set the prefilled inquiry data and switch to legal tab
    setPrefilledInquiry(inquiry);
    setActiveTab('legal');
    showToast(`Creating service agreement for ${inquiry.name} - ${inquiry.projectType} project`);
  };

  // Clear prefilled data when switching tabs manually
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab) {
      setPrefilledInquiry(undefined);
    }
    setActiveTab(newTab);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="w-6 h-6 border border-neutral-300 dark:border-neutral-700 border-t-neutral-800 dark:border-t-neutral-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <ScrollProgress />
      <Navigation variant="simple" />
      
      <div className="pt-24 px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
              <Link 
                href="/"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                ← back to portfolio
              </Link>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <AnimatedText
                className="text-3xl font-light mb-4"
                type="words"
                animationType="slide"
                direction="up"
              >
                admin dashboard
              </AnimatedText>
            </motion.div>
            
            <motion.p
              className="text-neutral-600 dark:text-neutral-400 text-sm mb-8"
              variants={staggerItem}
            >
              manage your projects, invoices, clients, legal documents, and inquiries.
            </motion.p>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            className="border-b border-neutral-200 dark:border-neutral-800 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Workflow indicator */}
            {prefilledInquiry && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Workflow: Creating {activeTab === 'legal' ? 'service agreement' : 'invoice'} for {prefilledInquiry.name}
                  </div>
                  <button
                    onClick={() => setPrefilledInquiry(undefined)}
                    className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xs"
                  >
                    ✕ Cancel workflow
                  </button>
                </div>
              </div>
            )}
            
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'projects', label: 'projects', icon: Briefcase },
                { id: 'invoices', label: 'invoices', icon: Receipt },
                { id: 'clients', label: 'clients', icon: Users },
                { id: 'legal', label: 'legal documents', icon: FileText },
                { id: 'inquiries', label: 'inquiries', icon: MessageSquare }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id as TabType)}
                  className={`
                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap relative
                    ${activeTab === id
                      ? 'border-neutral-800 dark:border-neutral-200 text-neutral-900 dark:text-neutral-100'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }
                    ${prefilledInquiry && (id === 'legal' || id === 'invoices') ? 'ring-2 ring-blue-300 dark:ring-blue-700 ring-opacity-50 rounded-t' : ''}
                  `}
                >
                  <Icon size={16} />
                  {label}
                  {prefilledInquiry && (id === 'legal' || id === 'invoices') && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    className="w-6 h-6 border border-neutral-300 dark:border-neutral-700 border-t-neutral-800 dark:border-t-neutral-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <>
                  {activeTab === 'projects' && (
                    <ProjectsTab 
                      projects={projects} 
                      onRefresh={fetchData} 
                      showToast={showToast} 
                    />
                  )}

                  {activeTab === 'invoices' && (
                    <InvoicesTab 
                      invoices={invoices}
                      showToast={showToast}
                      onSendReminder={handleSendReminder}
                      onManageInvoice={handleManageInvoice}
                      onRefresh={fetchData}
                      prefilledInquiry={prefilledInquiry}
                    />
                  )}

                  {activeTab === 'clients' && (
                    <ClientsTab 
                      clients={clients}
                      onRefresh={fetchData}
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'legal' && (
                    <LegalTab
                      agreements={agreements}
                      clients={clients}
                      onRefresh={fetchData}
                      showToast={showToast}
                      prefilledInquiry={prefilledInquiry}
                    />
                  )}

                  {activeTab === 'inquiries' && (
                    <InquiriesTab 
                      showToast={showToast}
                      onCreateInvoice={handleCreateInvoiceFromInquiry}
                      onCreateLegalDocument={handleCreateLegalDocumentFromInquiry}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Invoice Manager Dialog */}
      <InvoiceManagerDialog
        invoice={selectedInvoice}
        isOpen={isInvoiceDialogOpen}
        onClose={() => {
          setIsInvoiceDialogOpen(false);
          setSelectedInvoice(null);
        }}
        onUpdate={() => {
          fetchData();
        }}
      />
    </div>
  );
} 