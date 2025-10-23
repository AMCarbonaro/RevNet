import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel, ProjectModel } from '@/lib/models';
import { predictionEngine } from '@/lib/ml/predictions';
import { mlModelManager } from '@/lib/ml/models';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { type, data } = await req.json();

    if (!type || !data) {
      return NextResponse.json({ message: 'Type and data are required' }, { status: 400 });
    }

    let predictionResult;

    switch (type) {
      case 'project-success':
        // Get project data
        const project = await ProjectModel.findById(data.projectId).lean();
        if (!project) {
          return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }
        predictionResult = await predictionEngine.makePrediction({
          type: 'project-success',
          data: project,
          userId: session.user.id
        });
        break;

      case 'user-segmentation':
        // Get users data
        const users = await UserModel.find({}).lean();
        predictionResult = await predictionEngine.makePrediction({
          type: 'user-segmentation',
          data: users,
          userId: session.user.id
        });
        break;

      case 'churn-prediction':
        // Get user data
        const user = await UserModel.findById(data.userId || session.user.id).lean();
        if (!user) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        predictionResult = await predictionEngine.makePrediction({
          type: 'churn-prediction',
          data: user,
          userId: session.user.id
        });
        break;

      case 'recommendations':
        // Get available projects for recommendations
        const availableProjects = await ProjectModel.find({ status: 'active' }).lean();
        predictionResult = await predictionEngine.makePrediction({
          type: 'recommendations',
          data: availableProjects,
          userId: session.user.id
        });
        break;

      default:
        return NextResponse.json({ message: 'Invalid prediction type' }, { status: 400 });
    }

    logger.info('ML prediction completed', {
      userId: session.user.id,
      type,
      success: predictionResult.success
    });

    return NextResponse.json(predictionResult);
  } catch (error) {
    logger.error('Error making ML prediction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Get available ML models
    const models = mlModelManager.getAllModels();

    if (type) {
      const model = mlModelManager.getModel(type);
      if (!model) {
        return NextResponse.json({ message: 'Model not found' }, { status: 404 });
      }
      return NextResponse.json({ model });
    }

    return NextResponse.json({ models });
  } catch (error) {
    logger.error('Error fetching ML models:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
