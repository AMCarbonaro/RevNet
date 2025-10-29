export interface Letter {
  id: number;
  title: string;
  content: string;
  book: 'awakening' | 'foundation' | 'arsenal' | 'revolution';
  order: number;
  prerequisites: number[];
  unlocks: string[];
  estimatedReadTime: number;
  isUnlocked: boolean;
}

export interface LetterProgress {
  completedLetters: number[];
  currentLetter: number;
  totalLetters: number;
  canAccessDiscord: boolean;
  assignments: any[];
}
