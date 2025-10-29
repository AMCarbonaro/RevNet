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
  
  addSwipeListener(element: HTMLElement): void {
    element.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
      this.endX = e.changedTouches[0].clientX;
      this.endY = e.changedTouches[0].clientY;
      this.handleSwipe(element);
    }, { passive: true });
  }
  
  private handleSwipe(element: HTMLElement): void {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.minSwipeDistance) {
      return;
    }
    
    let direction: 'left' | 'right' | 'up' | 'down';
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    this.swipeSubject.next({
      direction,
      element,
      distance
    });
  }
  
  removeSwipeListener(element: HTMLElement): void {
    element.removeEventListener('touchstart', () => {});
    element.removeEventListener('touchend', () => {});
  }
}
