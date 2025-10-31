import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

interface TerminalLine {
  text: string;
  color?: string;
  delay?: number;
}

@Component({
  selector: 'app-terminal-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminal-welcome.component.html',
  styleUrls: ['./terminal-welcome.component.scss']
})
export class TerminalWelcomeComponent implements OnInit, OnDestroy {
  displayedLines: string[] = [];
  isTyping = false;
  showContinueButton = false;
  private intervals: NodeJS.Timeout[] = [];

  readonly terminalContent: TerminalLine[] = [
    { text: '> Initializing RevNet Protocol...', color: '#4FC3F7', delay: 1000 },
    { text: '> Connection established.', color: '#81C784', delay: 800 },
    { text: '', delay: 500 },
    { text: '> CLASSIFIED: ORIGIN REPORT', color: '#FFB74D', delay: 1000 },
    { text: '> ================================', color: '#FFB74D', delay: 500 },
    { text: '', delay: 300 },
    { text: '> RevNet was conceived in the shadows of the dark web by a', color: '#E1BEE7', delay: 100 },
    { text: '> clandestine group of revolutionaries who understood one truth:', color: '#E1BEE7', delay: 100 },
    { text: '> the system is rigged, and only organized resistance can change it.', color: '#E1BEE7', delay: 100 },
    { text: '', delay: 500 },
    { text: '> Anthony Carbonaro accepted the mission to bring this vision to life.', color: '#F8BBD9', delay: 100 },
    { text: '', delay: 500 },
    { text: '> You are now part of something bigger than yourself.', color: '#B39DDB', delay: 100 },
    { text: '> A network of individuals committed to dismantling corrupt systems', color: '#B39DDB', delay: 100 },
    { text: '> and building power from the ground up.', color: '#B39DDB', delay: 100 },
    { text: '', delay: 500 },
    { text: '> This is not just a platform. This is a revolution.', color: '#FFCDD2', delay: 100 },
    { text: '', delay: 500 },
    { text: '> One small revolt at a time, we are changing the world.', color: '#C8E6C9', delay: 100 },
    { text: '', delay: 800 },
    { text: '> But first, you must understand the foundation.', color: '#FFE0B2', delay: 100 },
    { text: '', delay: 500 },
    { text: '> THE ANTHONY LETTERS', color: '#FFAB91', delay: 1000 },
    { text: '> ================================', color: '#FFAB91', delay: 500 },
    { text: '', delay: 300 },
    { text: '> Before you can join the fight, you must complete your education.', color: '#A5D6A7', delay: 100 },
    { text: '> 30 letters across 4 books will teach you everything you need', color: '#A5D6A7', delay: 100 },
    { text: '> to know about power, organizing, and revolutionary action.', color: '#A5D6A7', delay: 100 },
    { text: '', delay: 500 },
    { text: '> These letters are your initiation.', color: '#FFCCBC', delay: 100 },
    { text: '> They will unlock your access to Revolts and the full platform.', color: '#FFCCBC', delay: 100 },
    { text: '', delay: 500 },
    { text: '> This is where your journey begins.', color: '#D1C4E9', delay: 100 },
    { text: '', delay: 800 },
    { text: '> > Ready to start your revolution? _', color: '#4FC3F7', delay: 1000 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startTypewriterAnimation();
  }

  ngOnDestroy(): void {
    this.intervals.forEach(interval => clearInterval(interval));
  }

  private startTypewriterAnimation(): void {
    this.isTyping = true;
    this.typeAllLines();
  }

  private typeAllLines(): void {
    let totalDelay = 0;
    
    this.terminalContent.forEach((line, index) => {
      // Add the line to displayed lines immediately
      this.displayedLines.push('');
      
      // Calculate when to start typing this line
      const startDelay = totalDelay;
      totalDelay += line.text.length * 20 + (line.delay || 0);
      
      // Start typing this line after the calculated delay
      setTimeout(() => {
        this.typeLine(index, line.text);
      }, startDelay);
    });
    
    // Finish animation after all lines are done
    setTimeout(() => {
      this.finishAnimation();
    }, totalDelay + 1000);
  }

  private typeLine(lineIndex: number, text: string): void {
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        this.displayedLines[lineIndex] = text.substring(0, charIndex + 1);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Remove from intervals array when done
        const index = this.intervals.indexOf(typeInterval);
        if (index > -1) {
          this.intervals.splice(index, 1);
        }
      }
    }, 20);
    
    // Store interval for cleanup
    this.intervals.push(typeInterval);
  }

  private finishAnimation(): void {
    this.isTyping = false;
    this.showContinueButton = true;
  }

  continueToLetters(): void {
    // Mark that user has seen welcome page
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    currentUser.hasSeenWelcome = true;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    
    // Navigate to letters
    this.router.navigate(['/letters']);
  }

  getLineColor(index: number): string {
    const line = this.terminalContent[index];
    return line?.color || '#E0E0E0';
  }
}
