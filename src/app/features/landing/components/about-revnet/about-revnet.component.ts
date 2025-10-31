import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface UseCase {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about-revnet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-revnet.component.html',
  styleUrls: ['./about-revnet.component.scss']
})
export class AboutRevNetComponent {
  benefits: Benefit[] = [
    {
      icon: '📚',
      title: 'Education-First Approach',
      description: 'Progressive unlocking ensures users understand revolutionary principles before organizing'
    },
    {
      icon: '🔒',
      title: 'Secure Communication',
      description: 'Encrypted, private channels protected from surveillance'
    },
    {
      icon: '💰',
      title: 'Funding Transparency',
      description: 'Per-Revolt fundraising with FEC compliance tracking'
    },
    {
      icon: '💬',
      title: 'Real-Time Collaboration',
      description: 'Voice/video chat, instant messaging, file sharing for organizing'
    },
    {
      icon: '🌐',
      title: 'Community Building',
      description: 'Connect with like-minded activists across causes and regions'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access from anywhere, any device - organize on the go'
    },
    {
      icon: '🛡️',
      title: 'Privacy Focused',
      description: 'Anonymous donation options, secure messaging, no data harvesting'
    },
    {
      icon: '⚡',
      title: 'Built for Activists',
      description: 'Purpose-built platform designed by organizers, for organizers'
    }
  ];

  useCases: UseCase[] = [
    {
      title: 'Climate Action',
      description: 'Organize climate action campaigns and environmental movements',
      icon: '🌍'
    },
    {
      title: 'Tenant Rights',
      description: 'Build tenant rights movements and coordinate rent strikes',
      icon: '🏠'
    },
    {
      title: 'Labor Organizing',
      description: 'Coordinate labor strikes and union organizing efforts',
      icon: '👷'
    },
    {
      title: 'Social Justice',
      description: 'Plan protests, direct actions, and social justice campaigns',
      icon: '⚖️'
    },
    {
      title: 'Mutual Aid',
      description: 'Create community mutual aid networks and support systems',
      icon: '🤝'
    },
    {
      title: 'Education',
      description: 'Facilitate revolutionary study groups and educational programs',
      icon: '📖'
    }
  ];

  onGetStarted(): void {
    window.location.href = '/register';
  }

  onTryDemo(): void {
    window.location.href = '/welcome';
  }
}



