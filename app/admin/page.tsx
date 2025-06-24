"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedText } from "../components/AnimatedText";
import { useToast } from "../components/Toast";
import { staggerContainer, staggerItem } from "../../lib/animation-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InvoiceManagerDialog } from "../components/InvoiceManagerDialog";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Receipt,
  Plus,
  Bell,
  Pencil,
  Trash2,
  Eye,
  Download,
  PenTool,
  Mail,
} from "lucide-react";

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

type TabType = 'projects' | 'invoices' | 'clients' | 'legal';

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
  
  // Invoice manager dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  
  // Client management state
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    emails: [''],
    address: ''
  });

  // Project management state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    overview: '',
    fullDescription: '',
    image: '',
    mobileImage: '',
    images: [] as string[],
    mobileImages: [] as string[],
    technologies: [''] as string[],
    link: '',
    year: '',
    isVisible: true,
    priority: false,
    order: 0
  });

  // Legal document management state
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [legalFormData, setLegalFormData] = useState({
    clientId: '',
    title: '',
    projectDescription: '',
    estimatedValue: '',
    timeline: ''
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'PARTIALLY_PAID':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'UNPAID':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'DRAFT':
        return 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800';
      case 'SENT':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'SIGNED':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'EXPIRED':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      default:
        return 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800';
    }
  };

  // Project management functions
  const handleAddProject = () => {
    setProjectFormData({
      title: '',
      description: '',
      overview: '',
      fullDescription: '',
      image: '',
      mobileImage: '',
      images: [],
      mobileImages: [],
      technologies: [''],
      link: '',
      year: '',
      isVisible: true,
      priority: false,
      order: 0
    });
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectFormData({
      title: project.title,
      description: project.description,
      overview: project.overview || '',
      fullDescription: project.fullDescription || '',
      image: project.image,
      mobileImage: project.mobileImage || '',
      images: project.images || [],
      mobileImages: project.mobileImages || [],
      technologies: project.technologies || [],
      link: project.link,
      year: project.year || '',
      isVisible: project.isVisible,
      priority: project.priority,
      order: project.order
    });
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        showToast('Project deleted successfully');
        fetchData(); // Refresh projects
      } else {
        showToast(result.error || 'Failed to delete project');
      }
    } catch (error) {
      showToast('Error deleting project');
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectFormData.title || !projectFormData.description || !projectFormData.image || !projectFormData.link) {
      showToast('Title, description, image, and link are required');
      return;
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectFormData,
          technologies: projectFormData.technologies.filter(tech => tech.trim() !== ''),
          images: projectFormData.images.filter(img => img.trim() !== ''),
          mobileImages: projectFormData.mobileImages.filter(img => img.trim() !== ''),
        }),
      });

      const result = await response.json();
      if (result.success) {
        showToast(editingProject ? 'Project updated successfully' : 'Project created successfully');
        setShowProjectForm(false);
        fetchData(); // Refresh projects
      } else {
        showToast(result.error || 'Failed to save project');
      }
    } catch (error) {
      showToast('Error saving project');
      console.error('Error saving project:', error);
    }
  };

  const addTechnologyField = () => {
    setProjectFormData({ ...projectFormData, technologies: [...projectFormData.technologies, ''] });
  };

  const removeTechnologyField = (index: number) => {
    const newTechnologies = projectFormData.technologies.filter((_, i) => i !== index);
    setProjectFormData({ ...projectFormData, technologies: newTechnologies });
  };

  const updateTechnologyField = (index: number, value: string) => {
    const newTechnologies = [...projectFormData.technologies];
    newTechnologies[index] = value;
    setProjectFormData({ ...projectFormData, technologies: newTechnologies });
  };

  const addImageField = () => {
    setProjectFormData({ ...projectFormData, images: [...projectFormData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = projectFormData.images.filter((_, i) => i !== index);
    setProjectFormData({ ...projectFormData, images: newImages });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...projectFormData.images];
    newImages[index] = value;
    setProjectFormData({ ...projectFormData, images: newImages });
  };

  const addMobileImageField = () => {
    setProjectFormData({ ...projectFormData, mobileImages: [...projectFormData.mobileImages, ''] });
  };

  const removeMobileImageField = (index: number) => {
    const newMobileImages = projectFormData.mobileImages.filter((_, i) => i !== index);
    setProjectFormData({ ...projectFormData, mobileImages: newMobileImages });
  };

  const updateMobileImageField = (index: number, value: string) => {
    const newMobileImages = [...projectFormData.mobileImages];
    newMobileImages[index] = value;
    setProjectFormData({ ...projectFormData, mobileImages: newMobileImages });
  };

  const toggleProjectVisibility = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !project.isVisible }),
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Project ${!project.isVisible ? 'shown' : 'hidden'}`);
        fetchData(); // Refresh projects
      } else {
        showToast(result.error || 'Failed to update project');
      }
    } catch (error) {
      showToast('Error updating project');
      console.error('Error updating project:', error);
    }
  };

  const toggleProjectPriority = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: !project.priority }),
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Project ${!project.priority ? 'prioritized' : 'unprioritized'}`);
        fetchData(); // Refresh projects
      } else {
        showToast(result.error || 'Failed to update project');
      }
    } catch (error) {
      showToast('Error updating project');
      console.error('Error updating project:', error);
    }
  };

  // Client management functions
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

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`/api/clients/delete/${clientId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        showToast('Client deleted successfully');
        fetchData();
      } else {
        showToast(result.error || 'Failed to delete client');
      }
    } catch (error) {
      showToast('Error deleting client');
      console.error('Error deleting client:', error);
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
        fetchData();
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

  // Legal document management functions
  const handleAddLegalDocument = () => {
    setLegalFormData({
      clientId: '',
      title: '',
      projectDescription: '',
      estimatedValue: '',
      timeline: ''
    });
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
        fetchData(); // Refresh legal documents
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
        fetchData(); // Refresh to update status
      } else {
        showToast(result.error || 'Failed to send document');
      }
    } catch (error) {
      showToast('Error sending document');
      console.error('Error sending document:', error);
    }
  };

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
      <div className="max-w-7xl mx-auto px-6 py-8">
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
              className="text-3xl font-normal mb-4"
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
            manage your projects, invoices, clients, and legal documents.
          </motion.p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="border-b border-neutral-200 dark:border-neutral-800 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'projects', label: 'projects', icon: Briefcase },
              { id: 'invoices', label: 'invoices', icon: Receipt },
              { id: 'clients', label: 'clients', icon: Users },
              { id: 'legal', label: 'legal documents', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === id
                    ? 'border-neutral-800 dark:border-neutral-200 text-neutral-900 dark:text-neutral-100'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }
                `}
              >
                <Icon size={16} />
                {label}
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
                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-normal lowercase">project management</h2>
                      <button
                        onClick={handleAddProject}
                        className="flex items-center gap-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus size={16} />
                        add project
                      </button>
                    </div>
                    
                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-normal">{project.title}</h3>
                                <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                  #{project.order}
                                </span>
                                {project.year && (
                                  <span className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                                    {project.year}
                                  </span>
                                )}
                                {project.priority && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    priority
                                  </span>
                                )}
                                {!project.isVisible && (
                                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                    hidden
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 leading-relaxed">
                                {project.description}
                              </p>
                              
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {project.technologies.slice(0, 5).map((tech, index) => (
                                    <span
                                      key={index}
                                      className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                  {project.technologies.length > 5 && (
                                    <span className="text-xs px-2 py-0.5 text-neutral-500 dark:text-neutral-500">
                                      +{project.technologies.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="w-24 h-16 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 text-xs">
                            <button 
                              onClick={() => handleEditProject(project)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            >
                              edit
                            </button>
                            <button 
                              onClick={() => toggleProjectPriority(project)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {project.priority ? "remove priority" : "mark priority"}
                            </button>
                            <button 
                              onClick={() => toggleProjectVisibility(project)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            >
                              {project.isVisible ? "hide" : "show"}
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-normal lowercase">invoice management</h2>
                      <Link
                        href="/invoice/create"
                        target="_blank"
                        className="flex items-center gap-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus size={16} />
                        create invoice
                      </Link>
                    </div>
                    
                    <div className="bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-neutral-500 lowercase">
                              <th className="p-4">invoice #</th>
                              <th className="p-4">client</th>
                              <th className="p-4">amount</th>
                              <th className="p-4">paid</th>
                              <th className="p-4">status</th>
                              <th className="p-4">due date</th>
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
                                      <div className="text-sm text-neutral-500 lowercase">
                                        {(invoice.Client.emails && invoice.Client.emails.length > 0 ? invoice.Client.emails[0] : invoice.Client.email) || 'no email'}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-sm text-neutral-400 italic lowercase">unassigned</span>
                                  )}
                                </td>
                                <td className="p-4">{formatCurrency(invoice.total)}</td>
                                <td className="p-4">{formatCurrency(invoice.amountPaid || 0)}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium lowercase ${getStatusColor(invoice.status)}`}>
                                    {invoice.status.toLowerCase().replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                <td className="p-4 space-x-1 whitespace-nowrap">
                                  {invoice.status !== 'PAID' && (
                                    <button
                                      onClick={() => handleSendReminder(invoice)}
                                      className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5"
                                      title="send payment reminder"
                                    >
                                      <Bell size={14} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setSelectedInvoice(invoice);
                                      setIsInvoiceDialogOpen(true);
                                    }}
                                    className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5" 
                                    title="manage invoice"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 p-1.5" title="delete">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clients Tab */}
                {activeTab === 'clients' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-normal lowercase">client management</h2>
                      <button
                        onClick={handleAddClient}
                        className="flex items-center gap-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus size={16} />
                        add client
                      </button>
                    </div>
                    
                    <div className="grid gap-4">
                      {clients.map((client) => (
                        <div key={client.id} className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-normal lowercase mb-2">{client.name}</h3>
                              <div className="space-y-1 mb-3">
                                {(client.emails && client.emails.length > 0 ? client.emails : [client.email]).filter(Boolean).map((email, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Mail size={14} />
                                    {email}
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                                {client.address}
                              </p>
                              {client.invoiceCount !== undefined && (
                                <div className="mt-3 flex gap-4 text-sm">
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
                                className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5" 
                                title="edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 p-1.5" 
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
                )}

                {/* Legal Documents Tab */}
                {activeTab === 'legal' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-normal lowercase">legal documents</h2>
                      <button
                        onClick={handleAddLegalDocument}
                        className="flex items-center gap-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus size={16} />
                        create agreement
                      </button>
                    </div>
                    
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
                            {agreements.map((agreement) => (
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
                                      <div className="text-sm text-neutral-500 lowercase">
                                        {(agreement.Client.emails && agreement.Client.emails.length > 0 ? agreement.Client.emails[0] : agreement.Client.email) || 'no email'}
                                      </div>
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
                                  {new Date(agreement.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => handlePreviewDocument(agreement.id)}
                                      className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors" 
                                      title="preview"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadDocument(agreement.id)}
                                      className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors" 
                                      title="download"
                                    >
                                      <Download size={14} />
                                    </button>
                                    {agreement.status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handleSendDocument(agreement.id)}
                                        className="p-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors" 
                                        title="send for signature"
                                      >
                                        <PenTool size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
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
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-normal">
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
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    client name
                  </label>
                  <input
                    type="text"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    email addresses
                  </label>
                  {clientFormData.emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailField(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                        placeholder="client@example.com"
                        required={index === 0}
                      />
                      {clientFormData.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    + add another email
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    address
                  </label>
                  <textarea
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                    placeholder="123 Main Street&#10;City, Postcode&#10;Country"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <motion.button
                    type="submit"
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {editingClient ? 'update client' : 'create client'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowClientForm(false)}
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-normal">create service agreement</h2>
                <button
                  onClick={() => setShowLegalForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleLegalSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    client
                  </label>
                  <select
                    value={legalFormData.clientId}
                    onChange={(e) => setLegalFormData({ ...legalFormData, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
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
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    agreement title
                  </label>
                  <input
                    type="text"
                    value={legalFormData.title}
                    onChange={(e) => setLegalFormData({ ...legalFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    placeholder="e.g., website development service agreement"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    project description (optional)
                  </label>
                  <textarea
                    value={legalFormData.projectDescription}
                    onChange={(e) => setLegalFormData({ ...legalFormData, projectDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-24 resize-none"
                    placeholder="brief description of the project scope and deliverables"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      estimated value (optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={legalFormData.estimatedValue}
                      onChange={(e) => setLegalFormData({ ...legalFormData, estimatedValue: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      timeline (optional)
                    </label>
                    <input
                      type="text"
                      value={legalFormData.timeline}
                      onChange={(e) => setLegalFormData({ ...legalFormData, timeline: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="e.g., 4-6 weeks"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <motion.button
                    type="submit"
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    create agreement
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowLegalForm(false)}
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowProjectForm(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-normal">
                  {editingProject ? 'edit project' : 'add project'}
                </h2>
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleProjectSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      project title
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="e.g., surplush"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      project year (optional)
                    </label>
                    <input
                      type="text"
                      value={projectFormData.year}
                      onChange={(e) => setProjectFormData({ ...projectFormData, year: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    short description
                  </label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                    placeholder="brief description for project cards"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    overview (optional)
                  </label>
                  <textarea
                    value={projectFormData.overview}
                    onChange={(e) => setProjectFormData({ ...projectFormData, overview: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-24 resize-none"
                    placeholder="brief overview section for project pages"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    full description (optional)
                  </label>
                  <textarea
                    value={projectFormData.fullDescription}
                    onChange={(e) => setProjectFormData({ ...projectFormData, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-32 resize-none"
                    placeholder="detailed description with markdown support"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      main image
                    </label>
                    <input
                      type="text"
                      value={projectFormData.image}
                      onChange={(e) => setProjectFormData({ ...projectFormData, image: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="/project/main.png"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      mobile image (optional)
                    </label>
                    <input
                      type="text"
                      value={projectFormData.mobileImage}
                      onChange={(e) => setProjectFormData({ ...projectFormData, mobileImage: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      placeholder="/project/mobile-main.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    project link
                  </label>
                  <input
                    type="text"
                    value={projectFormData.link}
                    onChange={(e) => setProjectFormData({ ...projectFormData, link: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    placeholder="/work/project-slug"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    technologies
                  </label>
                  {projectFormData.technologies.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateTechnologyField(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                        placeholder="e.g., React, Next.js, TypeScript"
                      />
                      {projectFormData.technologies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTechnologyField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTechnologyField}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    + add technology
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      additional images (optional)
                    </label>
                    {projectFormData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                          placeholder="/project/detail1.png"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      + add image
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      mobile additional images (optional)
                    </label>
                    {projectFormData.mobileImages.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => updateMobileImageField(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                          placeholder="/project/mobile-detail1.png"
                        />
                        <button
                          type="button"
                          onClick={() => removeMobileImageField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMobileImageField}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      + add mobile image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={projectFormData.isVisible}
                      onChange={(e) => setProjectFormData({ ...projectFormData, isVisible: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isVisible" className="text-sm text-neutral-600 dark:text-neutral-400">
                      visible on site
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="priority"
                      checked={projectFormData.priority}
                      onChange={(e) => setProjectFormData({ ...projectFormData, priority: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="priority" className="text-sm text-neutral-600 dark:text-neutral-400">
                      priority project
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      display order
                    </label>
                    <input
                      type="number"
                      value={projectFormData.order}
                      onChange={(e) => setProjectFormData({ ...projectFormData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <motion.button
                    type="submit"
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {editingProject ? 'update project' : 'create project'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 