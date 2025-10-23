'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Letter {
  id: number;
  book: number;
  title: string;
  content: string;
  assignment: string;
  theme: string;
  unlocks: string[];
  requiredLetters: number[];
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'creator' | 'supporter';
  letterProgress: {
    completedLetters: number[];
    currentBook: number;
    currentLetter: number;
    totalProgress: number;
    lastCompletedAt?: Date;
    assignmentsCompleted: number[];
  };
  stats: {
    totalDonations: number;
    totalProjects: number;
    totalLettersRead: number;
    totalAssignmentsCompleted: number;
    revolutionaryBadge: boolean;
    lastActiveAt: Date;
  };
  achievements: any[];
}

export default function LetterPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchLetter();
    fetchUser();
  }, [session, status, router, params.id]);

  const fetchLetter = async () => {
    try {
      const response = await fetch(`/api/letters/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setLetter(data.data);
      }
    } catch (error) {
      console.error('Error fetching letter:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/letters/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterId: parseInt(params.id),
          assignment: assignment.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssignment('');
        fetchUser(); // Refresh user data
        alert('Assignment submitted successfully!');
      } else {
        alert('Error submitting assignment: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isLetterCompleted = (letterId: number) => {
    if (!user) return false;
    return user.letterProgress.completedLetters.includes(letterId);
  };

  const getBookTitle = (book: number) => {
    switch (book) {
      case 1: return 'The Awakening';
      case 2: return 'The Foundation';
      case 3: return 'The Arsenal';
      case 4: return 'The Revolution';
      default: return 'Unknown Book';
    }
  };

  const getBookColor = (book: number) => {
    switch (book) {
      case 1: return 'text-terminal-green';
      case 2: return 'text-terminal-cyan';
      case 3: return 'text-terminal-purple';
      case 4: return 'text-terminal-pink';
      default: return 'text-terminal-green';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  if (!letter || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-red text-xl">Letter not found</div>
      </div>
    );
  }

  const completed = isLetterCompleted(letter.id);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/letters"
            className="text-terminal-cyan hover:text-terminal-green transition-colors mb-4 inline-block"
          >
            ← Back to Letters
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-sm ${getBookColor(letter.book)}`}>
                Book {letter.book}: {getBookTitle(letter.book)}
              </span>
              <h1 className="text-3xl font-bold text-terminal-green neon-glow mt-2">
                {letter.title}
              </h1>
            </div>
            {completed && (
              <div className="text-terminal-green text-2xl">✓</div>
            )}
          </div>
        </div>

        {/* Letter Content */}
        <div className="card-holographic p-6 mb-6">
          <div className="prose prose-invert max-w-none">
            <div className="text-terminal-green whitespace-pre-wrap leading-relaxed">
              {letter.content}
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="card-holographic p-6">
          <h2 className="text-xl font-bold text-terminal-cyan mb-4">
            Your Assignment
          </h2>
          
          <div className="text-terminal-green mb-6">
            {letter.assignment}
          </div>

          {!completed ? (
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-terminal-cyan mb-2">
                  Submit Your Assignment
                </label>
                <textarea
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  rows={6}
                  placeholder="Write your response here..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !assignment.trim()}
                className="btn-neon"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          ) : (
            <div className="text-terminal-green">
              ✓ Assignment completed! You can now proceed to the next letter.
            </div>
          )}
        </div>

        {/* Unlocks */}
        {letter.unlocks.length > 0 && (
          <div className="card-holographic p-6 mt-6">
            <h3 className="text-lg font-bold text-terminal-purple mb-2">
              Unlocks
            </h3>
            <ul className="text-terminal-cyan">
              {letter.unlocks.map((unlock, index) => (
                <li key={index} className="mb-1">
                  • {unlock}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
