import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProjectModel } from '@/lib/models';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const projects = await ProjectModel.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    await connectDB();
    
    const project = new ProjectModel({
      id: `project_${Date.now()}`,
      title: body.title,
      description: body.description,
      longDescription: body.longDescription,
      category: body.category,
      tags: body.tags || [],
      creatorId: session.user.id,
      creatorName: session.user.name || 'Anonymous',
      creatorEmail: session.user.email || '',
      fundingGoal: body.fundingGoal,
      currentFunding: 0,
      backers: 0,
      status: 'draft',
      timeline: {
        startDate: new Date(body.timeline.startDate),
        endDate: new Date(body.timeline.endDate),
        milestones: body.timeline.milestones || []
      },
      team: body.team || [],
      updates: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedProject = await project.save();
    
    return NextResponse.json({
      success: true,
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
