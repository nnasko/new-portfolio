'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react';

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

interface ProjectsTabProps {
  projects: Project[];
  onRefresh: () => void;
  showToast: (message: string) => void;
}

export function ProjectsTab({ projects, onRefresh, showToast }: ProjectsTabProps) {
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
        onRefresh();
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
        onRefresh();
      } else {
        showToast(result.error || 'Failed to save project');
      }
    } catch (error) {
      showToast('Error saving project');
      console.error('Error saving project:', error);
    }
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
        onRefresh();
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
        onRefresh();
      } else {
        showToast(result.error || 'Failed to update project');
      }
    } catch (error) {
      showToast('Error updating project');
      console.error('Error updating project:', error);
    }
  };

  // Helper functions for form handling
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light">project management</h2>
          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            add project
          </button>
        </div>
        
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 p-6 rounded-md">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-medium">{project.title}</h3>
                    <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">
                      #{project.order}
                    </span>
                    {project.year && (
                      <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">
                        {project.year}
                      </span>
                    )}
                    {project.priority && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                        priority
                      </span>
                    )}
                    {!project.isVisible && (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
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
                          className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded"
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

                <div className="w-24 h-16 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 rounded">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleEditProject(project)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded"
                >
                  <Pencil size={12} />
                  edit
                </button>
                <button 
                  onClick={() => toggleProjectPriority(project)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded"
                >
                  <Star size={12} />
                  {project.priority ? "remove priority" : "priority"}
                </button>
                <button 
                  onClick={() => toggleProjectVisibility(project)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded"
                >
                  {project.isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                  {project.isVisible ? "hide" : "show"}
                </button>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors rounded"
                >
                  <Trash2 size={12} />
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      project title
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="e.g., surplush"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      project year (optional)
                    </label>
                    <input
                      type="text"
                      value={projectFormData.year}
                      onChange={(e) => setProjectFormData({ ...projectFormData, year: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    short description
                  </label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors h-20 resize-none rounded"
                    placeholder="brief description for project cards"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    overview (optional)
                  </label>
                  <textarea
                    value={projectFormData.overview}
                    onChange={(e) => setProjectFormData({ ...projectFormData, overview: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors h-24 resize-none rounded"
                    placeholder="brief overview section for project pages"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    full description (optional)
                  </label>
                  <textarea
                    value={projectFormData.fullDescription}
                    onChange={(e) => setProjectFormData({ ...projectFormData, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors h-32 resize-none rounded"
                    placeholder="detailed description with markdown support"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      main image
                    </label>
                    <input
                      type="text"
                      value={projectFormData.image}
                      onChange={(e) => setProjectFormData({ ...projectFormData, image: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="/project/main.png"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      mobile image (optional)
                    </label>
                    <input
                      type="text"
                      value={projectFormData.mobileImage}
                      onChange={(e) => setProjectFormData({ ...projectFormData, mobileImage: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      placeholder="/project/mobile-main.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    project link
                  </label>
                  <input
                    type="text"
                    value={projectFormData.link}
                    onChange={(e) => setProjectFormData({ ...projectFormData, link: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                    placeholder="/work/project-slug"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    technologies
                  </label>
                  {projectFormData.technologies.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateTechnologyField(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                        placeholder="e.g., React, Next.js, TypeScript"
                      />
                      {projectFormData.technologies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTechnologyField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTechnologyField}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded"
                  >
                    + add technology
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      additional images (optional)
                    </label>
                    {projectFormData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                          placeholder="/project/detail1.png"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded"
                    >
                      + add image
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      mobile additional images (optional)
                    </label>
                    {projectFormData.mobileImages.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => updateMobileImageField(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                          placeholder="/project/mobile-detail1.png"
                        />
                        <button
                          type="button"
                          onClick={() => removeMobileImageField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMobileImageField}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded"
                    >
                      + add mobile image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={projectFormData.isVisible}
                      onChange={(e) => setProjectFormData({ ...projectFormData, isVisible: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
                    />
                    <label htmlFor="isVisible" className="text-sm text-neutral-700 dark:text-neutral-300">
                      visible on site
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="priority"
                      checked={projectFormData.priority}
                      onChange={(e) => setProjectFormData({ ...projectFormData, priority: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
                    />
                    <label htmlFor="priority" className="text-sm text-neutral-700 dark:text-neutral-300">
                      priority project
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      display order
                    </label>
                    <input
                      type="number"
                      value={projectFormData.order}
                      onChange={(e) => setProjectFormData({ ...projectFormData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors rounded"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="submit"
                    className="flex-1 text-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    {editingProject ? 'update project' : 'create project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
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