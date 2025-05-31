"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedText } from "../../components/AnimatedText";
import { useToast } from "../../components/Toast";
import { staggerContainer, staggerItem } from "../../../lib/animation-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface ProjectFormData {
  title: string;
  description: string;
  overview: string;
  fullDescription: string;
  image: string;
  mobileImage: string;
  images: string;
  mobileImages: string;
  technologies: string;
  link: string;
  year: string;
  isVisible: boolean;
  priority: boolean;
}

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    overview: "",
    fullDescription: "",
    image: "",
    mobileImage: "",
    images: "",
    mobileImages: "",
    technologies: "",
    link: "",
    year: "",
    isVisible: true,
    priority: false,
  });
  const { showToast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      console.log('All cookies:', document.cookie);
      const cookies = document.cookie.split(';');
      console.log('Cookie array:', cookies);
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('invoice-auth='));
      
      if (!authCookie) {
        console.log('No auth cookie found');
        router.push('/');
        return;
      }

      const authValue = decodeURIComponent(authCookie.split('=')[1]);
      console.log('Auth value from cookie:', authValue);
      
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: authValue }),
        });
        const data = await response.json();
        console.log('Verify response:', data);
        
        if (!data.success) {
          console.log('Authentication failed');
          router.push('/');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Error in auth check:', error);
        router.push('/');
        return;
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      overview: "",
      fullDescription: "",
      image: "",
      mobileImage: "",
      images: "",
      mobileImages: "",
      technologies: "",
      link: "",
      year: "",
      isVisible: true,
      priority: false,
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data.success) {
        setProjects(data.data.sort((a: Project, b: Project) => a.order - b.order));
      } else {
        showToast("Failed to fetch projects");
      }
    } catch {
      showToast("Error fetching projects");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PUT" : "POST";
      
      // Process the form data to convert string arrays
      const processedData = {
        ...formData,
        mobileImage: formData.mobileImage || formData.image,
        images: formData.images ? formData.images.split(',').map(url => url.trim()).filter(url => url) : [],
        mobileImages: formData.mobileImages ? formData.mobileImages.split(',').map(url => url.trim()).filter(url => url) : [],
        technologies: formData.technologies ? formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : [],
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      const data = await response.json();
      if (data.success) {
        showToast(editingProject ? "Project updated" : "Project created");
        resetForm();
        fetchProjects();
      } else {
        showToast(data.error || "Failed to save project");
      }
    } catch {
      showToast("Error saving project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      overview: project.overview || "",
      fullDescription: project.fullDescription || "",
      image: project.image,
      mobileImage: project.mobileImage || "",
      images: (project.images || []).join(","),
      mobileImages: (project.mobileImages || []).join(","),
      technologies: (project.technologies || []).join(","),
      link: project.link,
      year: project.year || "",
      isVisible: project.isVisible,
      priority: project.priority,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        showToast("Project deleted");
        fetchProjects();
      } else {
        showToast("Failed to delete project");
      }
    } catch {
      showToast("Error deleting project");
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isVisible: !project.isVisible,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(`Project ${!project.isVisible ? "shown" : "hidden"}`);
        fetchProjects();
      } else {
        showToast("Failed to update project");
      }
    } catch {
      showToast("Error updating project");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

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
    return null; // This will be handled by the redirect
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
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
              className="text-2xl font-normal mb-4"
              type="words"
              animationType="slide"
              direction="up"
            >
              project management
            </AnimatedText>
          </motion.div>
          
          <motion.p
            className="text-neutral-600 dark:text-neutral-400 text-sm mb-8"
            variants={staggerItem}
          >
            manage your portfolio projects.
          </motion.p>

          <motion.button
            onClick={() => setShowForm(true)}
            className="text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            add project
          </motion.button>
        </motion.div>

        {/* Projects List */}
        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6"
                variants={staggerItem}
                layout
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start gap-6">
                  {/* Project Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-normal">{project.title}</h3>
                      {project.year && (
                        <span className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                          {project.year}
                        </span>
                      )}
                      {project.priority && (
                        <span className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                          priority
                        </span>
                      )}
                      {!project.isVisible && (
                        <span className="text-xs px-2 py-1 bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400">
                          hidden
                        </span>
                      )}
                    </div>
                    
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {project.overview && (
                      <p className="text-neutral-500 dark:text-neutral-500 text-xs mb-3 leading-relaxed italic">
                        {project.overview.length > 100 ? project.overview.substring(0, 100) + "..." : project.overview}
                      </p>
                    )}
                    
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
                    
                    {project.images && project.images.length > 0 && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-3">
                        {project.images.length} gallery image{project.images.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors underline"
                    >
                      {project.link}
                    </a>
                  </div>

                  {/* Project Image */}
                  <div className="w-24 h-16 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 text-xs">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(project)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    {project.isVisible ? "hide" : "show"}
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {projects.length === 0 && (
            <motion.div
              className="text-center py-12 text-neutral-500 dark:text-neutral-400 text-sm"
              variants={staggerItem}
            >
              no projects yet. add your first project to get started.
            </motion.div>
          )}
        </motion.div>

        {/* Project Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && resetForm()}
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
                    {editingProject ? "edit project" : "add project"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          year
                        </label>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                          placeholder="e.g., 2024 - 2025"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        short description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                        placeholder="Brief description for project cards"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        overview
                      </label>
                      <textarea
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                        placeholder="Brief project overview section"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        detailed description
                      </label>
                      <textarea
                        value={formData.fullDescription}
                        onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-32 resize-none"
                        placeholder="Full project description with details about challenges, solutions, etc."
                      />
                    </div>
                  </div>

                  {/* Media & Assets */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">Media & Assets</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          main image url
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          mobile main image url (optional)
                        </label>
                        <input
                          type="url"
                          value={formData.mobileImage}
                          onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        gallery images (comma-separated urls)
                      </label>
                      <textarea
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        mobile gallery images (comma-separated urls, optional)
                      </label>
                      <textarea
                        value={formData.mobileImages}
                        onChange={(e) => setFormData({ ...formData, mobileImages: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                        placeholder="https://example.com/mobile-img1.jpg, https://example.com/mobile-img2.jpg"
                      />
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">Technical Details</h3>
                    
                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        technologies (comma-separated)
                      </label>
                      <textarea
                        value={formData.technologies}
                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 h-20 resize-none"
                        placeholder="next.js, typescript, tailwind css, prisma, postgresql"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        project link
                      </label>
                      <input
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">Settings</h3>
                    
                    <div className="flex gap-6 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-neutral-600 dark:text-neutral-400">visible on portfolio</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-neutral-600 dark:text-neutral-400">priority project</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <motion.button
                      type="submit"
                      className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {editingProject ? "update project" : "create project"}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={resetForm}
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
    </div>
  );
} 