'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TerminalInterface from '@/components/terminal/TerminalInterface';
import MatrixRain from '@/components/effects/MatrixRain';

export default function Home() {
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    // Check if user has already completed the terminal experience
    const hasCompleted = localStorage.getItem('terminal-completed');
    if (hasCompleted) {
      // Redirect to dashboard or main app
      // window.location.href = '/dashboard';
    } else {
      setShowTerminal(true);
    }
  }, []);

  if (showTerminal) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <MatrixRain />
        <TerminalInterface onComplete={() => setShowTerminal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-4">
          REVOLUTION NETWORK
        </h1>
        <p className="text-terminal-cyan text-lg mb-8">
          Welcome to the resistance
        </p>
        <Link href="/auth/signin" className="btn-neon">
          Enter the Matrix
        </Link>
      </div>
    </div>
  );
}
