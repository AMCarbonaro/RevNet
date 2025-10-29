import { Injectable } from '@nestjs/common';

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

@Injectable()
export class LettersService {
  private letters: Letter[] = [
    // The Awakening (Letters 1-7)
    {
      id: 1,
      title: "The System is Broken",
      content: "Welcome to your revolutionary journey. The system we live under is fundamentally broken, designed to keep you powerless while enriching the few at the top...",
      book: 'awakening',
      order: 1,
      prerequisites: [],
      unlocks: ['join_existing_revolts'],
      estimatedReadTime: 5,
      isUnlocked: true
    },
    {
      id: 2,
      title: "Finding Your Voice",
      content: "Every revolutionary starts with a single voice. Your voice matters, even when it feels like no one is listening...",
      book: 'awakening',
      order: 2,
      prerequisites: [1],
      unlocks: [],
      estimatedReadTime: 4,
      isUnlocked: false
    },
    {
      id: 3,
      title: "The Power of Community",
      content: "Revolution is not a solo act. It requires community, solidarity, and collective action...",
      book: 'awakening',
      order: 3,
      prerequisites: [2],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 4,
      title: "Understanding the Enemy",
      content: "To fight the system effectively, you must understand how it works, who benefits, and how it maintains power...",
      book: 'awakening',
      order: 4,
      prerequisites: [3],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 5,
      title: "The Art of Resistance",
      content: "Resistance takes many forms. From peaceful protest to strategic disruption, every action counts...",
      book: 'awakening',
      order: 5,
      prerequisites: [4],
      unlocks: [],
      estimatedReadTime: 5,
      isUnlocked: false
    },
    {
      id: 6,
      title: "Building Alliances",
      content: "No movement succeeds alone. Building bridges with other groups and communities is essential...",
      book: 'awakening',
      order: 6,
      prerequisites: [5],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 7,
      title: "The Long Game",
      content: "Revolution is not won overnight. It requires patience, persistence, and a long-term vision...",
      book: 'awakening',
      order: 7,
      prerequisites: [6],
      unlocks: ['create_local_revolts'],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    // The Foundation (Letters 8-15)
    {
      id: 8,
      title: "Strategic Thinking",
      content: "Every successful movement requires strategy. Learn to think like a revolutionary strategist...",
      book: 'foundation',
      order: 8,
      prerequisites: [7],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 9,
      title: "Organizing Principles",
      content: "How do you organize people for maximum impact? The principles of effective organizing...",
      book: 'foundation',
      order: 9,
      prerequisites: [8],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 10,
      title: "Communication Strategy",
      content: "Your message is only as powerful as your ability to communicate it effectively...",
      book: 'foundation',
      order: 10,
      prerequisites: [9],
      unlocks: [],
      estimatedReadTime: 5,
      isUnlocked: false
    },
    {
      id: 11,
      title: "Resource Mobilization",
      content: "Every movement needs resources. Learn how to mobilize people, money, and materials...",
      book: 'foundation',
      order: 11,
      prerequisites: [10],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 12,
      title: "Building Infrastructure",
      content: "Sustainable movements require infrastructure. How to build lasting organizational capacity...",
      book: 'foundation',
      order: 12,
      prerequisites: [11],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 13,
      title: "Legal Strategy",
      content: "Understanding the legal landscape and how to work within and around it...",
      book: 'foundation',
      order: 13,
      prerequisites: [12],
      unlocks: [],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 14,
      title: "Digital Organizing",
      content: "The internet has revolutionized organizing. How to use digital tools effectively...",
      book: 'foundation',
      order: 14,
      prerequisites: [13],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 15,
      title: "Coalition Building",
      content: "Building broad coalitions that can create real change...",
      book: 'foundation',
      order: 15,
      prerequisites: [14],
      unlocks: ['create_national_revolts'],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    // The Arsenal (Letters 16-22)
    {
      id: 16,
      title: "Direct Action Tactics",
      content: "When traditional methods fail, direct action becomes necessary...",
      book: 'arsenal',
      order: 16,
      prerequisites: [15],
      unlocks: [],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 17,
      title: "Economic Disruption",
      content: "How to use economic pressure to force change...",
      book: 'arsenal',
      order: 17,
      prerequisites: [16],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 18,
      title: "Media Manipulation",
      content: "How to use the media to amplify your message and pressure targets...",
      book: 'arsenal',
      order: 18,
      prerequisites: [17],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 19,
      title: "Political Pressure",
      content: "How to pressure politicians and government officials effectively...",
      book: 'arsenal',
      order: 19,
      prerequisites: [18],
      unlocks: [],
      estimatedReadTime: 6,
      isUnlocked: false
    },
    {
      id: 20,
      title: "Corporate Campaigns",
      content: "How to target corporations and force them to change their practices...",
      book: 'arsenal',
      order: 20,
      prerequisites: [19],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 21,
      title: "International Solidarity",
      content: "Building international connections and support for your cause...",
      book: 'arsenal',
      order: 21,
      prerequisites: [20],
      unlocks: [],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 22,
      title: "Advanced Tactics",
      content: "The most advanced tactics for experienced revolutionaries...",
      book: 'arsenal',
      order: 22,
      prerequisites: [21],
      unlocks: [],
      estimatedReadTime: 9,
      isUnlocked: false
    },
    // The Revolution (Letters 23-30)
    {
      id: 23,
      title: "Leading Change",
      content: "How to become an effective leader in the revolutionary movement...",
      book: 'revolution',
      order: 23,
      prerequisites: [22],
      unlocks: [],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 24,
      title: "Building Movements",
      content: "How to build and sustain large-scale movements for change...",
      book: 'revolution',
      order: 24,
      prerequisites: [23],
      unlocks: [],
      estimatedReadTime: 9,
      isUnlocked: false
    },
    {
      id: 25,
      title: "Systemic Change",
      content: "How to create lasting, systemic change rather than surface-level reforms...",
      book: 'revolution',
      order: 25,
      prerequisites: [24],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 26,
      title: "Power Structures",
      content: "Understanding and dismantling existing power structures...",
      book: 'revolution',
      order: 26,
      prerequisites: [25],
      unlocks: [],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 27,
      title: "New Systems",
      content: "Building new systems to replace the old ones...",
      book: 'revolution',
      order: 27,
      prerequisites: [26],
      unlocks: [],
      estimatedReadTime: 9,
      isUnlocked: false
    },
    {
      id: 28,
      title: "Sustaining Revolution",
      content: "How to keep the revolutionary spirit alive and maintain momentum...",
      book: 'revolution',
      order: 28,
      prerequisites: [27],
      unlocks: ['discord_interface_access'],
      estimatedReadTime: 8,
      isUnlocked: false
    },
    {
      id: 29,
      title: "The Next Generation",
      content: "Passing the torch to the next generation of revolutionaries...",
      book: 'revolution',
      order: 29,
      prerequisites: [28],
      unlocks: [],
      estimatedReadTime: 7,
      isUnlocked: false
    },
    {
      id: 30,
      title: "The Revolutionary's Oath",
      content: "Your final letter - the oath that binds all revolutionaries together...",
      book: 'revolution',
      order: 30,
      prerequisites: [29],
      unlocks: ['revolutionary_badge', 'full_platform_access'],
      estimatedReadTime: 10,
      isUnlocked: false
    }
  ];

  async getLetters(limit?: number): Promise<{ data: Letter[] }> {
    const letters = limit ? this.letters.slice(0, limit) : this.letters;
    return { data: letters };
  }

  async getLetter(id: number): Promise<{ data: Letter }> {
    const letter = this.letters.find(l => l.id === id);
    if (!letter) {
      throw new Error('Letter not found');
    }
    return { data: letter };
  }

  async getLetterProgress(userId: string): Promise<{ data: any }> {
    // For now, return mock progress data
    // In a real app, this would come from the database
    return {
      data: {
        userId,
        completedLetters: [],
        currentLetter: 1,
        totalLetters: 30,
        canAccessDiscord: false
      }
    };
  }

  async updateLetterProgress(letterId: number, completed: boolean): Promise<{ data: any }> {
    // For now, return mock response
    // In a real app, this would update the database
    return {
      data: {
        letterId,
        completed,
        unlockedFeatures: this.getUnlockedFeatures([letterId]),
        canAccessDiscord: letterId === 30,
        nextLetter: letterId < 30 ? letterId + 1 : null
      }
    };
  }

  private getUnlockedFeatures(completedLetters: number[]): string[] {
    const features: string[] = [];
    
    if (completedLetters.length >= 7) {
      features.push('join_existing_revolts');
    }
    
    if (completedLetters.length >= 15) {
      features.push('create_local_revolts');
    }
    
    if (completedLetters.length >= 28) {
      features.push('create_national_revolts');
    }
    
    if (completedLetters.length >= 30) {
      features.push('discord_interface_access', 'revolutionary_badge');
    }
    
    return features;
  }
}
