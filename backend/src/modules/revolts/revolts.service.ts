import { Injectable } from '@nestjs/common';

export interface Revolt {
  _id: string;
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFull: boolean;
  memberCount: number;
  channelCount: number;
  messageCount: number;
  acceptDonations: boolean;
  currentFunding: number;
  fundingGoal?: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RevoltsService {
  private revolts: Revolt[] = [
    {
      _id: 'revolt1',
      id: 'revolt1',
      name: 'Climate Action Network',
      description: 'Fighting climate change through collective action',
      shortDescription: 'Climate action for the planet',
      category: 'environment',
      tags: ['climate', 'environment', 'activism'],
      isPublic: true,
      isFull: false,
      memberCount: 1200,
      channelCount: 5,
      messageCount: 15230,
      acceptDonations: true,
      currentFunding: 50000,
      fundingGoal: 100000,
      isFeatured: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      _id: 'revolt2',
      id: 'revolt2',
      name: 'Social Justice Movement',
      description: 'Working towards equality and justice for all',
      shortDescription: 'Fighting for social justice',
      category: 'social',
      tags: ['justice', 'equality', 'civil-rights'],
      isPublic: true,
      isFull: false,
      memberCount: 856,
      channelCount: 4,
      messageCount: 8930,
      acceptDonations: true,
      currentFunding: 35000,
      fundingGoal: 75000,
      isFeatured: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date()
    },
    {
      _id: 'revolt3',
      id: 'revolt3',
      name: 'Community Organizing Hub',
      description: 'Local community organizing and mutual aid',
      shortDescription: 'Community organizing and support',
      category: 'community',
      tags: ['community', 'organizing', 'mutual-aid'],
      isPublic: true,
      isFull: false,
      memberCount: 2100,
      channelCount: 6,
      messageCount: 23450,
      acceptDonations: true,
      currentFunding: 80000,
      fundingGoal: 150000,
      isFeatured: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date()
    }
  ];

  async getFeaturedRevolts(): Promise<{ data: Revolt[] }> {
    return {
      data: this.revolts.filter(r => r.isFeatured && r.isPublic).slice(0, 3)
    };
  }

  async getPublicRevolts(filters: any = {}): Promise<{ data: { items: Revolt[]; total: number } }> {
    let filtered = [...this.revolts].filter(r => r.isPublic);

    if (filters.category) {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        if (filters.sortBy === 'popular') {
          return b.memberCount - a.memberCount;
        }
        if (filters.sortBy === 'funding') {
          return b.currentFunding - a.currentFunding;
        }
        if (filters.sortBy === 'recent') {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });
    }

    const limit = filters.limit ? parseInt(filters.limit) : 100;
    const offset = filters.offset ? parseInt(filters.offset) : 0;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: {
        items: paginated,
        total: filtered.length
      }
    };
  }

  async getRevoltById(id: string): Promise<{ data: Revolt }> {
    const revolt = this.revolts.find(r => r.id === id);
    if (!revolt) {
      throw new Error('Revolt not found');
    }
    return { data: revolt };
  }

  async getRevoltChannels(id: string): Promise<{ data: any[] }> {
    // Mock channel data
    return {
      data: [
        {
          id: 'channel1',
          name: 'general',
          type: 'text',
          description: 'General discussion',
          position: 0
        },
        {
          id: 'channel2',
          name: 'announcements',
          type: 'text',
          description: 'Important announcements',
          position: 1
        },
        {
          id: 'channel3',
          name: 'voice-chat',
          type: 'voice',
          description: 'Voice discussion',
          position: 2
        }
      ]
    };
  }
}

