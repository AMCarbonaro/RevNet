import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Revolt {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  fundingGoal: number;
  currentFunding: number;
  category: string;
  status: 'active' | 'funding' | 'completed';
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-revolts-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revolts-page.component.html',
  styleUrls: ['./revolts-page.component.scss']
})
export class RevoltsPageComponent implements OnInit {
  revolts: Revolt[] = [];
  isLoading = true;
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'All Revolts', icon: '🌍' },
    { id: 'climate', name: 'Climate Action', icon: '🌱' },
    { id: 'social', name: 'Social Justice', icon: '⚖️' },
    { id: 'community', name: 'Community', icon: '🏘️' },
    { id: 'political', name: 'Political', icon: '🗳️' },
    { id: 'tech', name: 'Technology', icon: '💻' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadRevolts();
  }

  loadRevolts() {
    // Simulate API call
    setTimeout(() => {
      this.revolts = [
        {
          id: '1',
          name: 'Climate Action Now',
          description: 'Fighting for immediate climate action and environmental justice. Join us in demanding policy changes and corporate accountability.',
          memberCount: 1247,
          fundingGoal: 50000,
          currentFunding: 32400,
          category: 'climate',
          status: 'active',
          image: '/assets/revolts/climate-action.jpg',
          tags: ['environment', 'policy', 'activism']
        },
        {
          id: '2',
          name: 'Social Justice Warriors',
          description: 'Advocating for equality, diversity, and inclusion across all sectors. Building a more just and equitable society.',
          memberCount: 892,
          fundingGoal: 30000,
          currentFunding: 18750,
          category: 'social',
          status: 'funding',
          image: '/assets/revolts/social-justice.jpg',
          tags: ['equality', 'diversity', 'inclusion']
        },
        {
          id: '3',
          name: 'Community Organizers United',
          description: 'Strengthening local communities through grassroots organizing and mutual aid networks.',
          memberCount: 2103,
          fundingGoal: 25000,
          currentFunding: 25000,
          category: 'community',
          status: 'completed',
          image: '/assets/revolts/community.jpg',
          tags: ['grassroots', 'mutual-aid', 'local']
        },
        {
          id: '4',
          name: 'Tech for Good',
          description: 'Using technology to solve social problems and create positive change in the world.',
          memberCount: 456,
          fundingGoal: 40000,
          currentFunding: 12300,
          category: 'tech',
          status: 'active',
          image: '/assets/revolts/tech.jpg',
          tags: ['technology', 'innovation', 'social-impact']
        },
        {
          id: '5',
          name: 'Political Reform Movement',
          description: 'Working to reform political systems and increase civic engagement in democratic processes.',
          memberCount: 1789,
          fundingGoal: 60000,
          currentFunding: 45600,
          category: 'political',
          status: 'active',
          image: '/assets/revolts/political.jpg',
          tags: ['democracy', 'civic-engagement', 'reform']
        },
        {
          id: '6',
          name: 'Housing Justice Coalition',
          description: 'Fighting for affordable housing and tenant rights across the nation.',
          memberCount: 634,
          fundingGoal: 35000,
          currentFunding: 8900,
          category: 'social',
          status: 'funding',
          image: '/assets/revolts/housing.jpg',
          tags: ['housing', 'tenant-rights', 'affordable']
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  get filteredRevolts() {
    if (this.selectedCategory === 'all') {
      return this.revolts;
    }
    return this.revolts.filter(revolt => revolt.category === this.selectedCategory);
  }

  getFundingProgress(revolt: Revolt): number {
    return (revolt.currentFunding / revolt.fundingGoal) * 100;
  }

  onRevoltClick(revolt: Revolt) {
    console.log('Revolt clicked:', revolt);
    // Navigate to revolt details page
  }

  onJoinRevolt(revolt: Revolt) {
    console.log('Join revolt:', revolt);
    // Handle join revolt logic
  }

  onDonateToRevolt(revolt: Revolt) {
    console.log('Donate to revolt:', revolt);
    // Handle donation logic
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
