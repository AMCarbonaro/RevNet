import mongoose from 'mongoose';
import { UserModel, LetterModel } from './models';
import { lettersData } from '@/data/letters';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Initialize database with seed data
export async function initializeDatabase() {
  try {
    await connectDB();
    
    // Check if letters already exist
    const existingLetters = await LetterModel.countDocuments();
    if (existingLetters === 0) {
      console.log('Seeding letters data...');
      await LetterModel.insertMany(lettersData);
      console.log('Letters data seeded successfully');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Database utility functions
export async function createUser(userData: Partial<any>) {
  try {
    await connectDB();
    const user = new UserModel(userData);
    return await user.save();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    await connectDB();
    return await UserModel.findOne({ email });
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function updateUserProgress(userId: string, letterId: number) {
  try {
    await connectDB();
    const user = await UserModel.findOne({ id: userId });
    if (!user) throw new Error('User not found');
    
    // Update letter progress
    if (!user.letterProgress.completedLetters.includes(letterId)) {
      user.letterProgress.completedLetters.push(letterId);
      user.letterProgress.totalProgress = user.letterProgress.completedLetters.length;
      user.letterProgress.lastCompletedAt = new Date();
      
      // Update stats
      user.stats.totalLettersRead = user.letterProgress.completedLetters.length;
      user.stats.lastActiveAt = new Date();
      
      // Check for revolutionary badge (30 letters completed)
      if (user.letterProgress.completedLetters.length >= 30) {
        user.stats.revolutionaryBadge = true;
      }
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}

export async function getLetterById(letterId: number) {
  try {
    await connectDB();
    return await LetterModel.findOne({ id: letterId });
  } catch (error) {
    console.error('Error fetching letter:', error);
    throw error;
  }
}

export async function getAllLetters() {
  try {
    await connectDB();
    return await LetterModel.find().sort({ book: 1, id: 1 });
  } catch (error) {
    console.error('Error fetching letters:', error);
    throw error;
  }
}

// Global type declaration for mongoose cache
declare global {
  var mongoose: any;
}
