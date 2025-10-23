'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('demo', {
        email,
        name,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        console.error('Demo sign in failed:', result?.error);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="terminal w-full max-w-md">
        <div className="terminal-header">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-2">Revolution Network - Authentication</span>
          </div>
        </div>
        
        <div className="terminal-body">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-terminal-green neon-glow mb-2">
              Welcome to the Revolution
            </h1>
            <p className="text-terminal-cyan">
              Choose your entry point
            </p>
          </div>

          {/* Demo Mode */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-terminal-green mb-4">
              Demo Mode
            </h2>
            <form onSubmit={handleDemoSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-neon"
              >
                {isLoading ? 'Entering...' : 'Enter Demo Mode'}
              </button>
            </form>
          </div>

          {/* OAuth Providers */}
          <div className="border-t border-terminal-green pt-6">
            <h2 className="text-lg font-semibold text-terminal-green mb-4">
              OAuth Providers
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Sign in with GitHub
              </button>
              <button
                onClick={() => handleOAuthSignIn('discord')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Sign in with Discord
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-terminal-cyan">
            <p>Demo mode works without any setup</p>
            <p>OAuth providers require configuration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
