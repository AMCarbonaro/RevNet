import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  element: HTMLElement;
  distance: number;
}

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  private swipeSubject = new BehaviorSubject<SwipeEvent | null>(null);
  public swipe$ = this.swipeSubject.asObservable();
  
  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  private minSwipeDistance = 50;
  private maxVerticalSwipeDistance = 100; // Prevent accidental vertical swipes
  
  // Store event handlers to properly remove them
  private touchStartHandler?: (e: TouchEvent) => void;
  private touchMoveHandler?: (e: TouchEvent) => void;
  private touchEndHandler?: (e: TouchEvent) => void;
  
  addSwipeListener(element: HTMLElement): void {
    console.log('Adding swipe listener to element:', element);
    
    // Create bound event handlers
    this.touchStartHandler = (e: TouchEvent) => {
      console.log('Touch start detected');
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    };
    
    this.touchMoveHandler = (e: TouchEvent) => {
      // Prevent scrolling during horizontal swipes
      if (e.touches.length === 1) {
        const deltaX = Math.abs(e.touches[0].clientX - this.startX);
        const deltaY = Math.abs(e.touches[0].clientY - this.startY);
        
        // If horizontal movement is greater than vertical, prevent default scrolling
        if (deltaX > deltaY) {
          e.preventDefault();
        }
      }
    };
    
    this.touchEndHandler = (e: TouchEvent) => {
      console.log('Touch end detected');
      this.endX = e.changedTouches[0].clientX;
      this.endY = e.changedTouches[0].clientY;
      this.handleSwipe(element);
    };
    
    // Add event listeners
    element.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    element.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    element.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }
  
  private handleSwipe(element: HTMLElement): void {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    console.log('Swipe calculation:', {
      deltaX,
      deltaY,
      distance,
      minSwipeDistance: this.minSwipeDistance,
      maxVerticalSwipeDistance: this.maxVerticalSwipeDistance
    });
    
    if (distance < this.minSwipeDistance) {
      console.log('Swipe distance too small:', distance);
      return;
    }
    
    // Only handle horizontal swipes for letter navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaY) < this.maxVerticalSwipeDistance) {
      const direction = deltaX > 0 ? 'right' : 'left';
      console.log('Valid swipe detected:', direction);
      
      this.swipeSubject.next({
        direction,
        element,
        distance
      });
    } else {
      console.log('Swipe not horizontal enough or too vertical');
    }
  }
  
  removeSwipeListener(element: HTMLElement): void {
    if (this.touchStartHandler) {
      element.removeEventListener('touchstart', this.touchStartHandler);
    }
    if (this.touchMoveHandler) {
      element.removeEventListener('touchmove', this.touchMoveHandler);
    }
    if (this.touchEndHandler) {
      element.removeEventListener('touchend', this.touchEndHandler);
    }
  }
}
