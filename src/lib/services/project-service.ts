import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ProjectModel, UserModel } from '@/lib/models';

export interface ProjectRequest {
  action: 'create' | 'get' | 'update' | 'delete' | 'list' | 'search';
  data?: any;
  filters?: any;
}

export interface ProjectResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Project Service
 * Handles project creation, management, and operations
 */
export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(projectData: any, userId: string): Promise<NextResponse> {
    try {
      await connectDB();
      
      const project = new ProjectModel({
        ...projectData,
        creatorId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await project.save();

      // Update user stats
      await UserModel.findOneAndUpdate(
        { id: userId },
        { $inc: { 'stats.totalProjects': 1 } }
      );

      return NextResponse.json({
        success: true,
        data: project
      }, { status: 201 });
    } catch (error: any) {
      console.error('Project service create error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create project'
      }, { status: 500 });
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<NextResponse> {
    try {
      await connectDB();
      
      const project = await ProjectModel.findOne({ id: projectId })
        .populate('creatorId', 'name email image');

      if (!project) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: project
      });
    } catch (error: any) {
      console.error('Project service get error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve project'
      }, { status: 500 });
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updateData: any, userId: string): Promise<NextResponse> {
    try {
      await connectDB();
      
      const project = await ProjectModel.findOne({ id: projectId });
      if (!project) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 });
      }

      // Check if user is the creator or admin
      if (project.creatorId !== userId) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized to update this project'
        }, { status: 403 });
      }

      const updatedProject = await ProjectModel.findOneAndUpdate(
        { id: projectId },
        { 
          ...updateData,
          updatedAt: new Date()
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: updatedProject
      });
    } catch (error: any) {
      console.error('Project service update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update project'
      }, { status: 500 });
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<NextResponse> {
    try {
      await connectDB();
      
      const project = await ProjectModel.findOne({ id: projectId });
      if (!project) {
        return NextResponse.json({
          success: false,
          error: 'Project not found'
        }, { status: 404 });
      }

      // Check if user is the creator or admin
      if (project.creatorId !== userId) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized to delete this project'
        }, { status: 403 });
      }

      await ProjectModel.deleteOne({ id: projectId });

      // Update user stats
      await UserModel.findOneAndUpdate(
        { id: userId },
        { $inc: { 'stats.totalProjects': -1 } }
      );

      return NextResponse.json({
        success: true,
        data: { message: 'Project deleted successfully' }
      });
    } catch (error: any) {
      console.error('Project service delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete project'
      }, { status: 500 });
    }
  }

  /**
   * List projects with filtering
   */
  async listProjects(filters: any = {}): Promise<NextResponse> {
    try {
      await connectDB();
      
      const {
        status,
        category,
        creatorId,
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const query: any = {};
      
      if (status) query.status = status;
      if (category) query.category = category;
      if (creatorId) query.creatorId = creatorId;

      const projects = await ProjectModel.find(query)
        .populate('creatorId', 'name email image')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip(offset);

      const total = await ProjectModel.countDocuments(query);

      return NextResponse.json({
        success: true,
        data: {
          projects,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      });
    } catch (error: any) {
      console.error('Project service list error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve projects'
      }, { status: 500 });
    }
  }

  /**
   * Search projects
   */
  async searchProjects(searchTerm: string, filters: any = {}): Promise<NextResponse> {
    try {
      await connectDB();
      
      const query: any = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      };

      // Apply additional filters
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;

      const projects = await ProjectModel.find(query)
        .populate('creatorId', 'name email image')
        .limit(filters.limit || 20);

      return NextResponse.json({
        success: true,
        data: projects
      });
    } catch (error: any) {
      console.error('Project service search error:', error);
      return NextResponse.json({
        success: false,
        error: 'Search failed'
      }, { status: 500 });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<NextResponse> {
    try {
      await connectDB();
      
      const projectCount = await ProjectModel.countDocuments();
      
      return NextResponse.json({
        success: true,
        data: {
          service: 'project-service',
          status: 'healthy',
          database: 'connected',
          projectCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Project service health check error:', error);
      return NextResponse.json({
        success: false,
        error: 'Health check failed',
        data: {
          service: 'project-service',
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      }, { status: 503 });
    }
  }
}

// Service routes
export async function POST(req: NextRequest) {
  const projectService = new ProjectService();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized'
    }, { status: 401 });
  }

  const body = await req.json();
  
  switch (body.action) {
    case 'create':
      return projectService.createProject(body.data, session.user.id);
    case 'get':
      return projectService.getProject(body.projectId);
    case 'update':
      return projectService.updateProject(body.projectId, body.updateData, session.user.id);
    case 'delete':
      return projectService.deleteProject(body.projectId, session.user.id);
    case 'list':
      return projectService.listProjects(body.filters);
    case 'search':
      return projectService.searchProjects(body.searchTerm, body.filters);
    default:
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const projectService = new ProjectService();
  const { searchParams } = new URL(req.url);
  
  if (searchParams.get('health') === 'true') {
    return projectService.healthCheck();
  }
  
  // Handle GET requests for listing projects
  const filters = {
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    creatorId: searchParams.get('creatorId') || undefined,
    limit: parseInt(searchParams.get('limit') || '10'),
    offset: parseInt(searchParams.get('offset') || '0'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  };

  return projectService.listProjects(filters);
}
