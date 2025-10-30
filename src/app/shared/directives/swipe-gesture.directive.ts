import { Directive, ElementRef, EventEmitter, HostListener, Output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appSwipe]',
  standalone: true
})
export class SwipeGestureDirective implements OnInit, OnDestroy {
  @Output() swipeLeft = new EventEmitter<void>();
  @Output() swipeRight = new EventEmitter<void>();
  @Output() swipeUp = new EventEmitter<void>();
  @Output() swipeDown = new EventEmitter<void>();

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private readonly minSwipeDistance = 50;
  private readonly maxSwipeTime = 500;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Prevent default touch behaviors that might interfere
    this.el.nativeElement.style.touchAction = 'pan-y';
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
      this.startTime = Date.now();
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 1) {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;
      const deltaTime = endTime - this.startTime;

      // Check if it's a valid swipe
      if (deltaTime <= this.maxSwipeTime) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine if it's a horizontal or vertical swipe
        if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.swipeRight.emit();
          } else {
            this.swipeLeft.emit();
          }
        } else if (absDeltaY > absDeltaX && absDeltaY > this.minSwipeDistance) {
          // Vertical swipe
          if (deltaY > 0) {
            this.swipeDown.emit();
          } else {
            this.swipeUp.emit();
          }
        }
      }
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    // Prevent scrolling during horizontal swipes
    if (event.touches.length === 1) {
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = Math.abs(currentX - this.startX);
      const deltaY = Math.abs(currentY - this.startY);

      // If horizontal movement is greater than vertical, prevent default
      if (deltaX > deltaY && deltaX > 10) {
        event.preventDefault();
      }
    }
  }
}
