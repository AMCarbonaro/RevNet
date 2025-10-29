import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Letter } from '../models/letter.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LettersService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getLetters(): Observable<Letter[]> {
    return this.http.get<{ data: Letter[] }>(`${environment.apiUrl}/letters`)
      .pipe(map(response => response.data));
  }

  getLetter(id: number): Observable<Letter> {
    return this.http.get<{ data: Letter }>(`${environment.apiUrl}/letters/${id}`)
      .pipe(map(response => response.data));
  }

  async completeLetter(letterId: number): Promise<void> {
    try {
      await this.http.post(`${environment.apiUrl}/letters/progress`, {
        letterId,
        completed: true
      }).toPromise();

      // Update user's letter progress
      const user = this.authService.getCurrentUser();
      if (user) {
        user.letterProgress.completedLetters.push(letterId);
        user.letterProgress.currentLetter = letterId + 1;
        user.letterProgress.canAccessDiscord = letterId === 30;
        // Update user in auth service (when NgRx is implemented, this will be handled by store)
        // this.authService.userSubject.next({ ...user });
      }
    } catch (error) {
      console.error('Error completing letter:', error);
      throw error;
    }
  }

  getUnlockedFeatures(completedLetters: number[]): string[] {
    const features = [];
    
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

  isLetterUnlocked(letter: Letter, userProgress: any): boolean {
    // First letter is always unlocked
    if (letter.id === 1) return true;
    
    // Check if previous letter is completed
    return userProgress.completedLetters.includes(letter.id - 1);
  }

  canAccessDiscordInterface(userProgress: any): boolean {
    return userProgress.completedLetters.length >= 30;
  }

  getNextAvailableLetter(userProgress: any): number | null {
    const completedCount = userProgress.completedLetters.length;
    if (completedCount >= 30) return null; // All letters completed
    return completedCount + 1;
  }
}
