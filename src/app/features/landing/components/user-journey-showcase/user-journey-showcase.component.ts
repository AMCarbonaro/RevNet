import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type JourneyStage = 'terminal' | 'letters' | 'revnet';

@Component({
  selector: 'app-user-journey-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-journey-showcase.component.html',
  styleUrls: ['./user-journey-showcase.component.scss']
})
export class UserJourneyShowcaseComponent implements OnInit {
  currentStage: JourneyStage = 'terminal';
  stages: JourneyStage[] = ['terminal', 'letters', 'revnet'];
  stageNames = {
    terminal: '1. Terminal Welcome',
    letters: '2. Anthony Letters',
    revnet: '3. Join Revolution Network'
  };
  stageDescriptions = {
    terminal: 'Begin your journey with a revolutionary terminal interface that introduces you to the mission',
    letters: 'Complete progressive educational letters to unlock platform features and build your knowledge',
    revnet: 'Access the full collaboration platform and join revolutionary communities'
  };

  ngOnInit(): void {
    // Auto-rotate stages for demo
    this.startAutoRotation();
  }

  selectStage(stage: JourneyStage): void {
    this.currentStage = stage;
  }

  nextStage(): void {
    const currentIndex = this.stages.indexOf(this.currentStage);
    if (currentIndex < this.stages.length - 1) {
      this.currentStage = this.stages[currentIndex + 1];
    }
  }

  previousStage(): void {
    const currentIndex = this.stages.indexOf(this.currentStage);
    if (currentIndex > 0) {
      this.currentStage = this.stages[currentIndex - 1];
    }
  }

  private startAutoRotation(): void {
    // Auto-rotate every 8 seconds
    setInterval(() => {
      this.nextStage();
      if (this.currentStage === 'terminal') {
        // Reset to beginning
        this.currentStage = 'terminal';
      }
    }, 8000);
  }
}



