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

export default function LettersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchLetters();
    fetchUser();
  }, [session, status, router]);

  const fetchLetters = async () => {
    try {
      const response = await fetch('/api/letters');
      const data = await response.json();
      if (data.success) {
        setLetters(data.data);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
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

  const isLetterUnlocked = (letter: Letter) => {
    if (!user) return false;
    
    // First letter is always unlocked
    if (letter.id === 1) return true;
    
    // Check if required letters are completed
    return letter.requiredLetters.every(requiredId => 
      user.letterProgress.completedLetters.includes(requiredId)
    );
  };

  const isLetterCompleted = (letterId: number) => {
    if (!user) return false;
    return user.letterProgress.completedLetters.includes(letterId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-red text-xl">Error loading user data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-4">
            THE ANTHONY LETTERS
          </h1>
          <p className="text-terminal-cyan text-lg mb-4">
            A Practical Guide to Revolutionary Action
          </p>
          <div className="text-terminal-green">
            Progress: {user.letterProgress.totalProgress}/30 Letters Completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-4 mb-2">
            <div 
              className="bg-terminal-green h-4 rounded-full transition-all duration-500"
              style={{ width: `${(user.letterProgress.totalProgress / 30) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-terminal-cyan text-sm">
            {user.letterProgress.totalProgress}/30 Letters Completed
          </div>
        </div>

        {/* Books */}
        {[1, 2, 3, 4].map(book => {
          const bookLetters = letters.filter(letter => letter.book === book);
          if (bookLetters.length === 0) return null;

          return (
            <div key={book} className="mb-8">
              <h2 className={`text-2xl font-bold ${getBookColor(book)} neon-glow mb-4`}>
                Book {book}: {getBookTitle(book)}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookLetters.map(letter => {
                  const unlocked = isLetterUnlocked(letter);
                  const completed = isLetterCompleted(letter.id);
                  
                  return (
                    <div
                      key={letter.id}
                      className={`card-holographic p-4 transition-all duration-300 ${
                        !unlocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-terminal-cyan">
                          Letter {letter.id}
                        </span>
                        {completed && (
                          <span className="text-terminal-green">✓</span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-terminal-green mb-2">
                        {letter.title}
                      </h3>
                      
                      <p className="text-sm text-terminal-cyan mb-4 line-clamp-3">
                        {letter.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${getBookColor(letter.book)}`}>
                          {letter.theme}
                        </span>
                        
                        {unlocked ? (
                          <Link
                            href={`/letters/${letter.id}`}
                            className="btn-neon text-xs px-3 py-1"
                          >
                            {completed ? 'Review' : 'Read'}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Revolutionary Badge */}
        {user.stats.revolutionaryBadge && (
          <div className="text-center mt-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-terminal-pink neon-glow mb-2">
              Revolutionary Badge Unlocked!
            </h2>
            <p className="text-terminal-cyan">
              You have completed all 30 letters and earned the Revolutionary badge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
