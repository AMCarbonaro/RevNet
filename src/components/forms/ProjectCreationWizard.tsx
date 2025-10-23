'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProjectData {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      title: string;
      description: string;
      targetDate: string;
    }>;
  };
  team: Array<{
    title: string;
    description: string;
    requirements: string[];
  }>;
}

const categories = [
  'Political Campaign',
  'Community Organization',
  'Grassroots Movement',
  'Educational Initiative',
  'Media Project',
  'Legal Action',
  'Research Project',
  'Other'
];

export default function ProjectCreationWizard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    tags: [],
    fundingGoal: 0,
    timeline: {
      startDate: '',
      endDate: '',
      milestones: []
    },
    team: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!projectData.title.trim()) newErrors.title = 'Title is required';
        if (!projectData.description.trim()) newErrors.description = 'Description is required';
        if (!projectData.longDescription.trim()) newErrors.longDescription = 'Long description is required';
        if (!projectData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        if (projectData.fundingGoal <= 0) newErrors.fundingGoal = 'Funding goal must be greater than 0';
        if (!projectData.timeline.startDate) newErrors.startDate = 'Start date is required';
        if (!projectData.timeline.endDate) newErrors.endDate = 'End date is required';
        if (new Date(projectData.timeline.startDate) >= new Date(projectData.timeline.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 3:
        // Team step is optional
        break;
      case 4:
        // Review step - no validation needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/projects/${data.data.id}`);
      } else {
        console.error('Error creating project:', data.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectData = (updates: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !projectData.tags.includes(tag.trim())) {
      updateProjectData({ tags: [...projectData.tags, tag.trim()] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateProjectData({ tags: projectData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addMilestone = () => {
    updateProjectData({
      timeline: {
        ...projectData.timeline,
        milestones: [
          ...projectData.timeline.milestones,
          { title: '', description: '', targetDate: '' }
        ]
      }
    });
  };

  const updateMilestone = (index: number, updates: Partial<ProjectData['timeline']['milestones'][0]>) => {
    const updatedMilestones = [...projectData.timeline.milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], ...updates };
    updateProjectData({
      timeline: { ...projectData.timeline, milestones: updatedMilestones }
    });
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = projectData.timeline.milestones.filter((_, i) => i !== index);
    updateProjectData({
      timeline: { ...projectData.timeline, milestones: updatedMilestones }
    });
  };

  const addTeamRole = () => {
    updateProjectData({
      team: [
        ...projectData.team,
        { title: '', description: '', requirements: [] }
      ]
    });
  };

  const updateTeamRole = (index: number, updates: Partial<ProjectData['team'][0]>) => {
    const updatedTeam = [...projectData.team];
    updatedTeam[index] = { ...updatedTeam[index], ...updates };
    updateProjectData({ team: updatedTeam });
  };

  const removeTeamRole = (index: number) => {
    const updatedTeam = projectData.team.filter((_, i) => i !== index);
    updateProjectData({ team: updatedTeam });
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-terminal-green neon-glow mb-4">
            Create New Project
          </h1>
          <div className="flex justify-center space-x-4">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep
                    ? 'bg-terminal-green text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Basics */}
        {currentStep === 1 && (
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Step 1: Project Basics
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => updateProjectData({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Enter your project title"
                />
                {errors.title && <p className="text-terminal-red text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  value={projectData.description}
                  onChange={(e) => updateProjectData({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Brief description of your project"
                />
                {errors.description && <p className="text-terminal-red text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={projectData.longDescription}
                  onChange={(e) => updateProjectData({ longDescription: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Detailed description of your project, goals, and impact"
                />
                {errors.longDescription && <p className="text-terminal-red text-sm mt-1">{errors.longDescription}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Category *
                </label>
                <select
                  value={projectData.category}
                  onChange={(e) => updateProjectData({ category: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-terminal-red text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {projectData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-terminal-green text-black rounded text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-black hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Add tags (press Enter to add)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Funding & Timeline */}
        {currentStep === 2 && (
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Step 2: Funding & Timeline
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Funding Goal ($) *
                </label>
                <input
                  type="number"
                  value={projectData.fundingGoal}
                  onChange={(e) => updateProjectData({ fundingGoal: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Enter funding goal"
                />
                {errors.fundingGoal && <p className="text-terminal-red text-sm mt-1">{errors.fundingGoal}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-terminal-cyan mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={projectData.timeline.startDate}
                    onChange={(e) => updateProjectData({
                      timeline: { ...projectData.timeline, startDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  />
                  {errors.startDate && <p className="text-terminal-red text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-terminal-cyan mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={projectData.timeline.endDate}
                    onChange={(e) => updateProjectData({
                      timeline: { ...projectData.timeline, endDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  />
                  {errors.endDate && <p className="text-terminal-red text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-terminal-cyan">
                    Milestones
                  </label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="btn-neon text-sm px-3 py-1"
                  >
                    Add Milestone
                  </button>
                </div>
                
                <div className="space-y-4">
                  {projectData.timeline.milestones.map((milestone, index) => (
                    <div key={index} className="p-4 bg-black/20 rounded border border-terminal-green">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-terminal-green font-semibold">
                          Milestone {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-terminal-red hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                          placeholder="Milestone title"
                        />
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                          placeholder="Milestone description"
                        />
                        <input
                          type="date"
                          value={milestone.targetDate}
                          onChange={(e) => updateMilestone(index, { targetDate: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Team & Roles */}
        {currentStep === 3 && (
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Step 3: Team & Roles
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-terminal-cyan">
                    Team Roles
                  </label>
                  <button
                    type="button"
                    onClick={addTeamRole}
                    className="btn-neon text-sm px-3 py-1"
                  >
                    Add Role
                  </button>
                </div>
                
                <div className="space-y-4">
                  {projectData.team.map((role, index) => (
                    <div key={index} className="p-4 bg-black/20 rounded border border-terminal-green">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-terminal-green font-semibold">
                          Role {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeTeamRole(index)}
                          className="text-terminal-red hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={role.title}
                          onChange={(e) => updateTeamRole(index, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                          placeholder="Role title"
                        />
                        <textarea
                          value={role.description}
                          onChange={(e) => updateTeamRole(index, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                          placeholder="Role description"
                        />
                        <input
                          type="text"
                          value={role.requirements.join(', ')}
                          onChange={(e) => updateTeamRole(index, { 
                            requirements: e.target.value.split(',').map(req => req.trim()).filter(req => req)
                          })}
                          className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                          placeholder="Requirements (comma-separated)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {currentStep === 4 && (
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Step 4: Review & Launch
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Project Title</h3>
                <p className="text-terminal-green">{projectData.title}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Description</h3>
                <p className="text-terminal-green">{projectData.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Category</h3>
                <p className="text-terminal-green">{projectData.category}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Funding Goal</h3>
                <p className="text-terminal-green">${projectData.fundingGoal.toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Timeline</h3>
                <p className="text-terminal-green">
                  {projectData.timeline.startDate} to {projectData.timeline.endDate}
                </p>
              </div>
              
              {projectData.timeline.milestones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Milestones</h3>
                  <ul className="text-terminal-green space-y-2">
                    {projectData.timeline.milestones.map((milestone, index) => (
                      <li key={index}>
                        {index + 1}. {milestone.title} - {milestone.targetDate}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {projectData.team.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-terminal-cyan mb-2">Team Roles</h3>
                  <ul className="text-terminal-green space-y-2">
                    {projectData.team.map((role, index) => (
                      <li key={index}>
                        {index + 1}. {role.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="btn-neon"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-neon"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
