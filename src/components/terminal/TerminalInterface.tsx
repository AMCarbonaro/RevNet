'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalInterfaceProps {
  onComplete: () => void;
}

const TerminalInterface = ({ onComplete }: TerminalInterfaceProps) => {
  const [currentText, setCurrentText] = useState('');
  const [showPills, setShowPills] = useState(false);
  const [selectedPill, setSelectedPill] = useState<'red' | 'blue' | null>(null);
  const [isTyping, setIsTyping] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const terminalText = [
    "> Initializing Revolution Network...",
    "> Loading system protocols...",
    "> Establishing secure connection...",
    "",
    "Welcome to the Revolution Network",
    "A platform for grassroots political activism",
    "",
    "You are about to enter a world where",
    "ordinary citizens become agents of change.",
    "Where ideas become movements.",
    "Where democracy is not just a word.",
    "",
    "But first, you must choose...",
    "",
    "This is your last chance.",
    "After this, there is no turning back.",
    "",
    "You take the blue pill...",
    "the story ends, you wake up in your bed",
    "and believe whatever you want to believe.",
    "",
    "You take the red pill...",
    "you stay in Wonderland",
    "and I show you how deep the rabbit hole goes.",
    "",
    "Remember... all I'm offering is the truth.",
    "Nothing more.",
    ""
  ];

  useEffect(() => {
    let currentIndex = 0;
    let currentLineIndex = 0;
    let isDeleting = false;

    const typeText = () => {
      if (currentLineIndex >= terminalText.length) {
        setIsTyping(false);
        setShowPills(true);
        return;
      }

      const currentLine = terminalText[currentLineIndex];
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
        if (currentText.length === 0) {
          isDeleting = false;
          currentLineIndex++;
          if (currentLineIndex < terminalText.length) {
            setCurrentText(prev => prev + '\n');
          }
        }
      } else {
        if (currentIndex < currentLine.length) {
          setCurrentText(prev => prev + currentLine[currentIndex]);
          currentIndex++;
        } else {
          isDeleting = true;
          currentIndex = 0;
        }
      }

      setTimeout(typeText, isDeleting ? 50 : 100);
    };

    const timer = setTimeout(typeText, 1000);
    return () => clearTimeout(timer);
  }, [currentText, terminalText]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPills) {
        setSelectedPill('blue');
        handlePillSelection('blue');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPills]);

  const handlePillSelection = (pill: 'red' | 'blue') => {
    setSelectedPill(pill);
    
    // Play knock sound (Web Audio API)
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Store completion in localStorage
    localStorage.setItem('terminal-completed', 'true');
    localStorage.setItem('pill-choice', pill);

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="terminal w-full max-w-4xl">
        <div className="terminal-header">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-2">Revolution Network Terminal</span>
          </div>
        </div>
        
        <div className="terminal-body">
          <pre className="text-terminal-green text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {currentText}
            {isTyping && <span className="animate-pulse">█</span>}
          </pre>
          
          {showPills && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-8">
              <button
                onClick={() => handlePillSelection('blue')}
                className={`group relative p-6 rounded-lg transition-all duration-300 ${
                  selectedPill === 'blue' 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">💊</div>
                  <div className="text-xl font-bold mb-2">Blue Pill</div>
                  <div className="text-sm opacity-80">
                    Ignorance is bliss
                  </div>
                </div>
                {selectedPill === 'blue' && (
                  <div className="absolute inset-0 rounded-lg border-2 border-white animate-pulse"></div>
                )}
              </button>
              
              <button
                onClick={() => handlePillSelection('red')}
                className={`group relative p-6 rounded-lg transition-all duration-300 ${
                  selectedPill === 'red' 
                    ? 'bg-red-500 text-white scale-110' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">💊</div>
                  <div className="text-xl font-bold mb-2">Red Pill</div>
                  <div className="text-sm opacity-80">
                    Welcome to the revolution
                  </div>
                </div>
                {selectedPill === 'red' && (
                  <div className="absolute inset-0 rounded-lg border-2 border-white animate-pulse"></div>
                )}
              </button>
            </div>
          )}
          
          {showPills && (
            <div className="mt-4 text-center text-sm text-terminal-cyan">
              Press ESC to take the blue pill
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalInterface;
