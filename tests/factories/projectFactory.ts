import { Project } from '@/types';

export class ProjectFactory {
  static create(overrides: Partial<Project> = {}): Project {
    const defaultProject: Project = {
      _id: Math.random().toString(36).substr(2, 9),
      title: 'Test Project',
      description: 'This is a test project description',
      story: 'This is the project story',
      fundingGoal: 10000,
      currentFunding: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'draft',
      category: 'Political Campaign',
      tags: ['test', 'project'],
      creator: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      completedAt: null,
      completedBy: null,
      media: [],
      updates: [],
      faqs: [],
      risks: [],
      rewards: []
    };

    return { ...defaultProject, ...overrides };
  }

  static createActive(overrides: Partial<Project> = {}): Project {
    return this.create({
      status: 'active',
      approvedAt: new Date(),
      approvedBy: 'admin-user-id',
      ...overrides
    });
  }

  static createCompleted(overrides: Partial<Project> = {}): Project {
    return this.create({
      status: 'completed',
      approvedAt: new Date(),
      approvedBy: 'admin-user-id',
      completedAt: new Date(),
      completedBy: 'admin-user-id',
      currentFunding: 10000,
      ...overrides
    });
  }

  static createCancelled(overrides: Partial<Project> = {}): Project {
    return this.create({
      status: 'cancelled',
      rejectionReason: 'Project cancelled by admin',
      ...overrides
    });
  }

  static createFunded(overrides: Partial<Project> = {}): Project {
    return this.create({
      status: 'active',
      currentFunding: 15000,
      fundingGoal: 10000,
      ...overrides
    });
  }

  static createExpired(overrides: Partial<Project> = {}): Project {
    return this.create({
      status: 'active',
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      ...overrides
    });
  }

  static createMany(count: number, overrides: Partial<Project> = {}): Project[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        title: `Test Project ${index + 1}`,
        description: `This is test project ${index + 1} description`,
        ...overrides
      })
    );
  }

  static createByCategory(category: string, overrides: Partial<Project> = {}): Project {
    return this.create({
      category,
      tags: [category.toLowerCase()],
      ...overrides
    });
  }

  static createWithFunding(fundingAmount: number, overrides: Partial<Project> = {}): Project {
    return this.create({
      currentFunding: fundingAmount,
      ...overrides
    });
  }
}
