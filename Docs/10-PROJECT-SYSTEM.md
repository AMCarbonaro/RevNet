# Project Management System Documentation

## Overview

Revolution Network features a comprehensive project management system that enables users to create, fund, and collaborate on revolutionary projects. The system includes a 4-step creation wizard, funding mechanisms, team collaboration, and progress tracking.

## 🚀 Project Creation System

### 4-Step Creation Wizard

#### Step 1: Project Basics
```typescript
interface ProjectBasics {
  title: string;
  description: string;
  shortDescription: string;
  category: ProjectCategory;
  tags: string[];
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

// Project categories
type ProjectCategory = 
  | 'mural'           // Public art projects
  | 'projection'      // Digital projection displays
  | 'community'       // Community organizing
  | 'education'       // Educational initiatives
  | 'protest'         // Protest organization
  | 'documentary'     // Media projects
  | 'research'        // Research initiatives
  | 'legal'           // Legal challenges
  | 'other';          // Other revolutionary acts
```

#### Step 2: Funding & Timeline
```typescript
interface ProjectFunding {
  fundingGoal: number;        // Target amount in cents
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  budgetBreakdown: BudgetItem[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

interface BudgetItem {
  category: string;
  amount: number;
  description: string;
}
```

#### Step 3: Team & Roles
```typescript
interface ProjectRoles {
  roles: ProjectRole[];
  requirements: string[];
  skills: string[];
}

interface ProjectRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  timeCommitment: 'part-time' | 'full-time' | 'volunteer';
  compensation?: number;
  filled: boolean;
  assignedUser?: User;
  createdAt: Date;
}
```

#### Step 4: Review & Launch
```typescript
interface ProjectReview {
  project: Project;
  validation: {
    titleValid: boolean;
    descriptionValid: boolean;
    fundingGoalValid: boolean;
    timelineValid: boolean;
    rolesValid: boolean;
  };
  warnings: string[];
  recommendations: string[];
}
```

### Creation Wizard Component

```typescript
// Project creation wizard component
export function ProjectCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<Partial<Project>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Project Basics', component: ProjectBasicsStep },
    { id: 2, title: 'Funding & Timeline', component: FundingStep },
    { id: 3, title: 'Team & Roles', component: TeamStep },
    { id: 4, title: 'Review & Launch', component: ReviewStep }
  ];

  const handleStepComplete = (stepData: any) => {
    setProjectData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const project = await response.json();
        router.push(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="project-creation-wizard">
      <div className="wizard-header">
        <h1>Create Revolutionary Project</h1>
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
            >
              <span className="step-number">{step.id}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wizard-content">
        {steps.map(step => (
          step.id === currentStep && (
            <step.component
              key={step.id}
              data={projectData}
              onComplete={handleStepComplete}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )
        ))}
      </div>
    </div>
  );
}
```

## 💰 Funding System

### Funding Progress Tracking

```typescript
interface ProjectFunding {
  projectId: string;
  fundingGoal: number;        // Target amount in cents
  currentFunding: number;     // Current amount raised
  backers: number;            // Number of backers
  averageDonation: number;    // Average donation amount
  fundingProgress: number;    // Percentage of goal reached
  daysRemaining: number;      // Days until deadline
  fundingTrends: FundingTrend[];
}

interface FundingTrend {
  date: Date;
  amount: number;
  donations: number;
  cumulative: number;
}

// Funding status calculation
export function calculateFundingStatus(project: Project): ProjectFunding {
  const now = new Date();
  const endDate = new Date(project.timeline.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const fundingProgress = (project.currentFunding / project.fundingGoal) * 100;
  const averageDonation = project.currentFunding / project.backers;

  return {
    projectId: project.id,
    fundingGoal: project.fundingGoal,
    currentFunding: project.currentFunding,
    backers: project.backers,
    averageDonation,
    fundingProgress,
    daysRemaining,
    fundingTrends: project.fundingTrends || []
  };
}
```

### Donation Processing

```typescript
// Donation processing system
export class DonationProcessor {
  async processDonation(donation: DonationRequest): Promise<DonationResult> {
    try {
      // Validate donation
      const validation = await this.validateDonation(donation);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create Stripe payment intent
      const paymentIntent = await this.createPaymentIntent(donation);
      
      // Store donation record
      const donationRecord = await this.storeDonation({
        ...donation,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending'
      });

      // Update project funding
      await this.updateProjectFunding(donation.projectId, donation.amount);

      // Check FEC compliance
      await this.checkFECCompliance(donation.projectId);

      return {
        success: true,
        donation: donationRecord,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Donation processing failed:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  private async validateDonation(donation: DonationRequest): Promise<ValidationResult> {
    // Check minimum/maximum amounts
    if (donation.amount < 100) {
      return { valid: false, error: 'Minimum donation is $1.00' };
    }
    
    if (donation.amount > 1000000) {
      return { valid: false, error: 'Maximum donation is $10,000.00' };
    }

    // Check project exists and is active
    const project = await getProjectById(donation.projectId);
    if (!project || project.status !== 'active') {
      return { valid: false, error: 'Project not found or not active' };
    }

    return { valid: true };
  }
}
```

## 👥 Team Collaboration

### Role Management System

```typescript
// Role management interface
export function ProjectRoles({ projectId }: { projectId: string }) {
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const { user } = useAuth();

  const createRole = async (roleData: Omit<ProjectRole, 'id' | 'createdAt'>) => {
    const response = await fetch(`/api/projects/${projectId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });

    if (response.ok) {
      const newRole = await response.json();
      setRoles(prev => [...prev, newRole]);
    }
  };

  const applyForRole = async (roleId: string, application: RoleApplication) => {
    const response = await fetch(`/api/projects/${projectId}/roles/${roleId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application)
    });

    if (response.ok) {
      setApplications(prev => [...prev, application]);
    }
  };

  const assignRole = async (roleId: string, userId: string) => {
    const response = await fetch(`/api/projects/${projectId}/roles/${roleId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { ...role, assignedUser: { id: userId }, filled: true } : role
      ));
    }
  };

  return (
    <div className="project-roles">
      <h3>Team Roles</h3>
      
      {/* Role creation (for project creators) */}
      {user?.userType === 'creator' && (
        <RoleCreationForm onCreateRole={createRole} />
      )}

      {/* Available roles */}
      <div className="roles-list">
        {roles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            onApply={applyForRole}
            onAssign={assignRole}
            canAssign={user?.userType === 'creator'}
          />
        ))}
      </div>

      {/* Role applications (for project creators) */}
      {user?.userType === 'creator' && (
        <RoleApplications
          applications={applications}
          onAssign={assignRole}
        />
      )}
    </div>
  );
}
```

### Role Application System

```typescript
interface RoleApplication {
  id: string;
  roleId: string;
  userId: string;
  user: User;
  coverLetter: string;
  portfolio?: string[];
  experience: string;
  availability: string;
  submittedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

// Role application component
export function RoleApplicationForm({ roleId, onSubmit }: { roleId: string; onSubmit: (application: RoleApplication) => void }) {
  const [application, setApplication] = useState<Partial<RoleApplication>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/roles/${roleId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      if (response.ok) {
        const result = await response.json();
        onSubmit(result);
        setApplication({});
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="role-application-form">
      <h3>Apply for Role</h3>
      
      <div className="form-group">
        <label>Cover Letter</label>
        <textarea
          value={application.coverLetter || ''}
          onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
          placeholder="Why are you interested in this role?"
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label>Experience</label>
        <textarea
          value={application.experience || ''}
          onChange={(e) => setApplication(prev => ({ ...prev, experience: e.target.value }))}
          placeholder="Describe your relevant experience"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label>Availability</label>
        <input
          type="text"
          value={application.availability || ''}
          onChange={(e) => setApplication(prev => ({ ...prev, availability: e.target.value }))}
          placeholder="When are you available to work on this project?"
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

## 📊 Project Analytics

### Project Metrics Dashboard

```typescript
interface ProjectMetrics {
  projectId: string;
  views: number;
  uniqueViews: number;
  donations: number;
  totalRaised: number;
  averageDonation: number;
  conversionRate: number;
  topDonors: TopDonor[];
  fundingTrends: FundingTrend[];
  engagement: EngagementMetrics;
  demographics: DemographicsData;
}

interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  clickThroughRate: number;
}

interface DemographicsData {
  ageGroups: { [key: string]: number };
  locations: { [key: string]: number };
  userTypes: { [key: string]: number };
}

// Project analytics component
export function ProjectAnalytics({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchMetrics();
  }, [projectId, timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/projects/${projectId}?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  if (!metrics) return <LoadingSpinner />;

  return (
    <div className="project-analytics">
      <div className="analytics-header">
        <h2>Project Analytics</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Total Views"
          value={metrics.views.toLocaleString()}
          change={+12.5}
          icon="👁️"
        />
        <MetricCard
          title="Donations"
          value={metrics.donations.toLocaleString()}
          change={+8.3}
          icon="💰"
        />
        <MetricCard
          title="Total Raised"
          value={`$${(metrics.totalRaised / 100).toLocaleString()}`}
          change={+15.2}
          icon="📈"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={+2.1}
          icon="🎯"
        />
      </div>

      <div className="charts-section">
        <FundingChart data={metrics.fundingTrends} />
        <DemographicsChart data={metrics.demographics} />
        <EngagementChart data={metrics.engagement} />
      </div>
    </div>
  );
}
```

## 🔄 Project Updates System

### Project Update Management

```typescript
interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: User;
  images?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  shares: number;
}

// Project updates component
export function ProjectUpdates({ projectId }: { projectId: string }) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const createUpdate = async (updateData: Omit<ProjectUpdate, 'id' | 'author' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`/api/projects/${projectId}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const newUpdate = await response.json();
      setUpdates(prev => [newUpdate, ...prev]);
    }
  };

  const likeUpdate = async (updateId: string) => {
    const response = await fetch(`/api/projects/${projectId}/updates/${updateId}/like`, {
      method: 'POST'
    });

    if (response.ok) {
      setUpdates(prev => prev.map(update => 
        update.id === updateId ? { ...update, likes: update.likes + 1 } : update
      ));
    }
  };

  return (
    <div className="project-updates">
      <div className="updates-header">
        <h3>Project Updates</h3>
        {user?.userType === 'creator' && (
          <button onClick={() => setIsCreating(true)}>
            Create Update
          </button>
        )}
      </div>

      {isCreating && (
        <UpdateCreationForm
          projectId={projectId}
          onSubmit={createUpdate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="updates-list">
        {updates.map(update => (
          <UpdateCard
            key={update.id}
            update={update}
            onLike={likeUpdate}
          />
        ))}
      </div>
    </div>
  );
}
```

## 🎯 Project Discovery

### Project Search and Filtering

```typescript
interface ProjectFilters {
  category?: ProjectCategory;
  status?: ProjectStatus;
  location?: string;
  fundingRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: 'newest' | 'popular' | 'funding' | 'deadline';
}

// Project discovery component
export function ProjectDiscovery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchProjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/projects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.items);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchProjects();
  }, [filters, searchQuery]);

  return (
    <div className="project-discovery">
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={searchProjects}>Search</button>
        </div>

        <div className="filters">
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ProjectCategory }))}
          >
            <option value="">All Categories</option>
            <option value="mural">Murals</option>
            <option value="projection">Projections</option>
            <option value="community">Community</option>
            <option value="education">Education</option>
            <option value="protest">Protest</option>
            <option value="documentary">Documentary</option>
            <option value="research">Research</option>
            <option value="legal">Legal</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="funding">Most Funded</option>
            <option value="deadline">Ending Soon</option>
          </select>
        </div>
      </div>

      <div className="projects-grid">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/projects/${project.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

## 🚀 Project Launch System

### Launch Checklist

```typescript
interface LaunchChecklist {
  projectId: string;
  items: ChecklistItem[];
  completed: string[];
  isReady: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

// Launch checklist component
export function LaunchChecklist({ projectId }: { projectId: string }) {
  const [checklist, setChecklist] = useState<LaunchChecklist | null>(null);

  const defaultChecklist: ChecklistItem[] = [
    {
      id: 'title-description',
      title: 'Project Title & Description',
      description: 'Clear, compelling title and detailed description',
      required: true,
      completed: false
    },
    {
      id: 'funding-goal',
      title: 'Funding Goal Set',
      description: 'Realistic funding goal with budget breakdown',
      required: true,
      completed: false
    },
    {
      id: 'timeline',
      title: 'Project Timeline',
      description: 'Clear start and end dates with milestones',
      required: true,
      completed: false
    },
    {
      id: 'images',
      title: 'Project Images',
      description: 'High-quality images that showcase the project',
      required: true,
      completed: false
    },
    {
      id: 'team-roles',
      title: 'Team Structure',
      description: 'Defined roles and responsibilities',
      required: false,
      completed: false
    },
    {
      id: 'legal-compliance',
      title: 'Legal Compliance',
      description: 'Review FEC requirements and legal considerations',
      required: true,
      completed: false
    }
  ];

  const checkItem = async (itemId: string) => {
    const response = await fetch(`/api/projects/${projectId}/checklist/${itemId}`, {
      method: 'PUT'
    });

    if (response.ok) {
      setChecklist(prev => prev ? {
        ...prev,
        completed: [...prev.completed, itemId],
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, completed: true } : item
        )
      } : null);
    }
  };

  const launchProject = async () => {
    if (!checklist?.isReady) return;

    const response = await fetch(`/api/projects/${projectId}/launch`, {
      method: 'POST'
    });

    if (response.ok) {
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    <div className="launch-checklist">
      <h3>Launch Checklist</h3>
      
      <div className="checklist-items">
        {checklist?.items.map(item => (
          <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => checkItem(item.id)}
              disabled={!item.required}
            />
            <div className="item-content">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              {item.required && <span className="required">Required</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="launch-actions">
        <button
          onClick={launchProject}
          disabled={!checklist?.isReady}
          className="launch-button"
        >
          Launch Project
        </button>
      </div>
    </div>
  );
}
```

This comprehensive project management system provides the foundation for creating, funding, and managing revolutionary projects while maintaining collaboration, transparency, and legal compliance.
