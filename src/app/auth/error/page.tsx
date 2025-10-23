'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
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
            <span className="ml-2">Authentication Error</span>
          </div>
        </div>
        
        <div className="terminal-body text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-terminal-red mb-4">
            Authentication Failed
          </h1>
          <p className="text-terminal-cyan mb-6">
            {getErrorMessage(error)}
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full btn-neon"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded hover:bg-terminal-cyan hover:text-black transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
