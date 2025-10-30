import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VirtualScrollItem {
  id: string;
  height?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div 
      #scrollContainer
      class="virtual-scroll-container"
      [style.height]="containerHeight + 'px'"
      (scroll)="onScroll($event)"
    >
      <div 
        class="virtual-scroll-spacer"
        [style.height]="totalHeight + 'px'"
        [style.transform]="'translateY(' + offsetY + 'px)'"
      >
        <div 
          *ngFor="let item of visibleItems; trackBy: trackByFn; let i = index"
          class="virtual-scroll-item"
          [style.height]="itemHeight + 'px'"
        >
        <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }
    
    .virtual-scroll-spacer {
      position: relative;
      will-change: transform;
    }
    
    .virtual-scroll-item {
      position: relative;
    }
  `]
})
export class VirtualScrollComponent implements OnInit, OnDestroy {
  @Input() items: VirtualScrollItem[] = [];
  @Input() itemHeight: number = 40;
  @Input() containerHeight: number = 400;
  @Input() bufferSize: number = 5;
  @Input() trackByFn: (index: number, item: VirtualScrollItem) => any = (index, item) => item.id;
  @Input() itemTemplate: any;

  @Output() itemClick = new EventEmitter<VirtualScrollItem>();
  @Output() scrollEnd = new EventEmitter<void>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  visibleItems: VirtualScrollItem[] = [];
  startIndex = 0;
  endIndex = 0;
  offsetY = 0;
  totalHeight = 0;

  private scrollTimeout: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateVisibleItems();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    
    // Debounce scroll events for better performance
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      this.updateVisibleItems(scrollTop);
      
      // Check if scrolled to bottom
      if (scrollTop + this.containerHeight >= this.totalHeight - 10) {
        this.scrollEnd.emit();
      }
    }, 16); // ~60fps
  }

  private updateVisibleItems(scrollTop: number = 0): void {
    if (!this.items.length) {
      this.visibleItems = [];
      return;
    }

    this.totalHeight = this.items.length * this.itemHeight;
    
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const bufferCount = this.bufferSize;
    
    this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - bufferCount);
    this.endIndex = Math.min(
      this.items.length - 1,
      this.startIndex + visibleCount + (bufferCount * 2)
    );
    
    this.offsetY = this.startIndex * this.itemHeight;
    this.visibleItems = this.items.slice(this.startIndex, this.endIndex + 1);
    
    this.cdr.markForCheck();
  }

  scrollToItem(index: number): void {
    if (this.scrollContainer) {
      const scrollTop = index * this.itemHeight;
      this.scrollContainer.nativeElement.scrollTop = scrollTop;
      this.updateVisibleItems(scrollTop);
    }
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.totalHeight;
      this.updateVisibleItems(this.totalHeight);
    }
  }

  getScrollPosition(): number {
    return this.scrollContainer?.nativeElement.scrollTop || 0;
  }
}
