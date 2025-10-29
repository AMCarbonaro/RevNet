import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LettersService } from '../../../../core/services/letters.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Letter } from '../../../../core/models/letter.model';

@Component({
  selector: 'app-letter-reader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-reader.component.html',
  styleUrls: ['./letter-reader.component.scss']
})
export class LetterReaderComponent implements OnInit, OnDestroy {
  letter: Letter | null = null;
  isLoading = true;
  progress = 0;
  letterId = 0;
  isCompleted = false;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private lettersService: LettersService,
    private authService: AuthService,
    private router: Router,
    private store: Store<any>
  ) {}

  ngOnInit(): void {
    // Load the initial letter
    this.loadInitialLetter();
    
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const newLetterId = Number(id);
        console.log('Route parameter changed to:', newLetterId, 'Current letterId:', this.letterId);
        
        // Always reload when route changes, even if same ID
        this.letterId = newLetterId;
        this.isLoading = true;
        this.letter = null; // Reset letter to force reload
        this.isCompleted = false; // Reset completion state
        this.loadLetter(this.letterId);
      }
    });
  }

  private loadInitialLetter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.letterId = Number(id);
      this.loadLetter(this.letterId);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadLetter(id: number): void {
    console.log('Loading letter with ID:', id);
    this.lettersService.getLetter(id).subscribe({
      next: (letter) => {
        console.log('Letter loaded successfully:', letter.title);
        this.letter = letter;
        this.isLoading = false;
        this.calculateProgress();
        this.checkCompletion();
      },
      error: (error) => {
        console.error('Error loading letter:', error);
        this.isLoading = false;
      }
    });
  }

  calculateProgress(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.progress = (user.letterProgress.completedLetters.length / 30) * 100;
    }
  }

  checkCompletion(): void {
    const user = this.authService.getCurrentUser();
    
    if (user && this.letter) {
      this.isCompleted = user.letterProgress.completedLetters.includes(this.letter.id);
    } else {
      // In demo mode, assume not completed
      this.isCompleted = false;
    }
  }

  goToNextLetter(): void {
    if (!this.letter) {
      console.log('No letter loaded, cannot navigate to next');
      return;
    }
    
    console.log('Current letter ID:', this.letter.id);
    
    const currentLetterId = this.letter.id;
    const nextLetterId = this.letter.id + 1;
    console.log('Navigating to next letter ID:', nextLetterId);
    
    // Mark current letter as completed first
    this.markLetterAsCompleted(currentLetterId);
    
    // Check if there's a next letter (assuming 30 total letters)
    if (nextLetterId <= 30) {
      console.log('Navigating to next letter:', nextLetterId);
      
      // Force reload by directly loading the next letter
      this.letterId = nextLetterId;
      this.isLoading = true;
      this.letter = null;
      this.isCompleted = false;
      
      // Load the next letter directly
      this.loadLetter(nextLetterId);
      
      // Update the URL without triggering navigation
      this.router.navigate(['/letters', nextLetterId], { replaceUrl: true });
    } else {
      // All letters completed, go back to dashboard
      console.log('All letters completed, navigating to dashboard');
      this.router.navigate(['/letters']);
    }
  }

  private markLetterAsCompleted(letterId: number): void {
    const user = this.authService.getCurrentUser();
    if (user && !user.letterProgress.completedLetters.includes(letterId)) {
      // Add letter to completed list
      user.letterProgress.completedLetters.push(letterId);
      
      // Update current letter
      user.letterProgress.currentLetter = letterId + 1;
      
      // Check if all letters are completed
      if (user.letterProgress.completedLetters.length >= 30) {
        user.letterProgress.canAccessDiscord = true;
      }
      
      // Update the user in the service
      this.authService.updateUser(user);
      
      // Update local completion state
      this.isCompleted = true;
    }
  }

  goBack(): void {
    this.router.navigate(['/letters']);
  }


  getBookColor(book: string): string {
    switch (book) {
      case 'awakening': return 'var(--neon-green)';
      case 'foundation': return 'var(--neon-cyan)';
      case 'arsenal': return 'var(--neon-purple)';
      case 'revolution': return 'var(--neon-pink)';
      default: return 'var(--text-secondary)';
    }
  }
}

