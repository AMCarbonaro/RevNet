import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LettersService } from '../../../../core/services/letters.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Letter } from '../../../../core/models/letter.model';

interface BookData {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

interface FilterOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-letters-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './letters-dashboard.component.html',
  styleUrls: ['./letters-dashboard.component.scss']
})
export class LettersDashboardComponent implements OnInit {
  letters: Letter[] = [];
  user: User | null = null;
  progress = 0;
  isLoading = true;
  selectedFilter = 'all';
  filteredLetters: Letter[] = [];

  bookData: BookData[] = [
    {
      id: 'awakening',
      name: 'The Awakening',
      description: 'Understanding the system and finding your voice',
      icon: '🌅',
      gradient: 'linear-gradient(45deg, #00ff88, #00d4ff)'
    },
    {
      id: 'foundation',
      name: 'The Foundation',
      description: 'Building knowledge and strategic thinking',
      icon: '🏗️',
      gradient: 'linear-gradient(45deg, #00d4ff, #8b5cf6)'
    },
    {
      id: 'arsenal',
      name: 'The Arsenal',
      description: 'Tools and tactics for effective action',
      icon: '⚔️',
      gradient: 'linear-gradient(45deg, #8b5cf6, #ff6b9d)'
    },
    {
      id: 'revolution',
      name: 'The Revolution',
      description: 'Leading change and building movements',
      icon: '🔥',
      gradient: 'linear-gradient(45deg, #ff6b9d, #ff9a56)'
    }
  ];

  letterFilters: FilterOption[] = [
    { id: 'all', name: 'All Letters' },
    { id: 'unlocked', name: 'Available' },
    { id: 'completed', name: 'Completed' },
    { id: 'awakening', name: 'Awakening' },
    { id: 'foundation', name: 'Foundation' },
    { id: 'arsenal', name: 'Arsenal' },
    { id: 'revolution', name: 'Revolution' }
  ];

  constructor(
    private lettersService: LettersService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.progress = (user.letterProgress.completedLetters.length / 30) * 100;
        this.applyFilter();
      } else {
        // Demo mode - create a mock user for testing (completed all letters)
        this.user = {
          id: 'demo-user',
          email: 'demo@revnet.local',
          username: 'DemoUser',
          discriminator: '0001',
          status: 'online',
          letterProgress: {
            completedLetters: Array.from({length: 30}, (_, i) => i + 1), // All 30 letters completed
            currentLetter: 31, // Past the last letter
            totalLetters: 30,
            canAccessDiscord: true, // Can access Discord after completing all letters
            assignments: []
          },
          revoltMemberships: [],
          createdAt: new Date(),
          lastActive: new Date()
        };
        this.progress = 100; // 100% complete for demo user
        this.applyFilter();
      }
    });
  }

  ngOnInit(): void {
    // Enhanced fix: always refresh on letters dashboard to ensure navigation works
    if (!sessionStorage.getItem('letters_dashboard_loaded')) {
      sessionStorage.setItem('letters_dashboard_loaded', 'true');
      // Clear any previous letter page flags
      sessionStorage.removeItem('letters_page_loaded');
      window.location.reload();
      return;
    }
    
    this.loadLetters();
  }

  loadLetters(): void {
    this.lettersService.getLetters().subscribe({
      next: (letters) => {
        this.letters = letters;
        this.isLoading = false;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading letters:', error);
        this.isLoading = false;
      }
    });
  }

  isLetterUnlocked(letter: Letter): boolean {
    if (!this.user) return false;
    return this.lettersService.isLetterUnlocked(letter, this.user.letterProgress);
  }

  isLetterCompleted(letterId: number): boolean {
    return this.user?.letterProgress.completedLetters.includes(letterId) || false;
  }

  onLetterClick(letter: Letter): void {
    if (this.isLetterUnlocked(letter)) {
      this.router.navigate(['/letters', letter.id]);
    }
  }

  getBookProgress(bookId: string): number {
    const bookLetters = this.letters.filter(l => l.book === bookId);
    const completedInBook = bookLetters.filter(l => this.isLetterCompleted(l.id)).length;
    return bookLetters.length > 0 ? (completedInBook / bookLetters.length) * 100 : 0;
  }

  getCompletedInBook(bookId: string): number {
    const bookLetters = this.letters.filter(l => l.book === bookId);
    return bookLetters.filter(l => this.isLetterCompleted(l.id)).length;
  }

  getTotalInBook(bookId: string): number {
    return this.letters.filter(l => l.book === bookId).length;
  }

  getBookColor(book: string): string {
    switch (book) {
      case 'awakening': return '#00ff88';
      case 'foundation': return '#00d4ff';
      case 'arsenal': return '#8b5cf6';
      case 'revolution': return '#ff6b9d';
      default: return '#72767D';
    }
  }

  setFilter(filterId: string): void {
    this.selectedFilter = filterId;
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.letters.length) return;

    switch (this.selectedFilter) {
      case 'unlocked':
        this.filteredLetters = this.letters.filter(letter => this.isLetterUnlocked(letter));
        break;
      case 'completed':
        this.filteredLetters = this.letters.filter(letter => this.isLetterCompleted(letter.id));
        break;
      case 'awakening':
      case 'foundation':
      case 'arsenal':
      case 'revolution':
        this.filteredLetters = this.letters.filter(letter => letter.book === this.selectedFilter);
        break;
      default:
        this.filteredLetters = this.letters;
    }
  }

  trackByLetterId(index: number, letter: Letter): number {
    return letter.id;
  }

  enterRevolution(): void {
    // Navigate to the Discord dashboard after completing all letters
    this.router.navigate(['/discord']);
  }
}