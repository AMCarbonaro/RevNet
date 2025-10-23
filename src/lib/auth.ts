import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';
import { createUser, getUserByEmail } from './db';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Demo mode provider for development
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Mode',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@revolution.network' },
        name: { label: 'Name', type: 'text', placeholder: 'Demo User' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.name) {
          return null;
        }

        // Create or get demo user
        let user = await getUserByEmail(credentials.email);
        if (!user) {
          user = await createUser({
            id: `demo_${Date.now()}`,
            name: credentials.name,
            email: credentials.email,
            userType: 'supporter',
            letterProgress: {
              completedLetters: [],
              currentBook: 1,
              currentLetter: 1,
              totalProgress: 0,
              assignmentsCompleted: []
            },
            stats: {
              totalDonations: 0,
              totalProjects: 0,
              totalLettersRead: 0,
              totalAssignmentsCompleted: 0,
              revolutionaryBadge: false,
              lastActiveAt: new Date()
            },
            achievements: []
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          userType: user.userType
        };
      }
    }),
    
    // OAuth providers (optional - work without setup)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET ? [
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
      })
    ] : [])
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow demo mode
      if (account?.provider === 'demo') {
        return true;
      }
      
      // For OAuth providers, create or update user
      if (account?.provider && user.email) {
        try {
          let dbUser = await getUserByEmail(user.email);
          
          if (!dbUser) {
            // Create new user
            dbUser = await createUser({
              id: user.id,
              name: user.name || 'Anonymous',
              email: user.email,
              image: user.image,
              userType: 'supporter',
              letterProgress: {
                completedLetters: [],
                currentBook: 1,
                currentLetter: 1,
                totalProgress: 0,
                assignmentsCompleted: []
              },
              stats: {
                totalDonations: 0,
                totalProjects: 0,
                totalLettersRead: 0,
                totalAssignmentsCompleted: 0,
                revolutionaryBadge: false,
                lastActiveAt: new Date()
              },
              achievements: []
            });
          } else {
            // Update existing user
            dbUser.stats.lastActiveAt = new Date();
            await dbUser.save();
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      // Persist user data in JWT
      if (user) {
        token.userType = user.userType;
        token.userId = user.id;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;
        session.user.userType = token.userType as 'creator' | 'supporter';
      }
      
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};

// Demo mode helper function
export async function createDemoUser(email: string, name: string) {
  try {
    const user = await createUser({
      id: `demo_${Date.now()}`,
      name,
      email,
      userType: 'supporter',
      letterProgress: {
        completedLetters: [],
        currentBook: 1,
        currentLetter: 1,
        totalProgress: 0,
        assignmentsCompleted: []
      },
      stats: {
        totalDonations: 0,
        totalProjects: 0,
        totalLettersRead: 0,
        totalAssignmentsCompleted: 0,
        revolutionaryBadge: false,
        lastActiveAt: new Date()
      },
      achievements: []
    });
    
    return user;
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}
