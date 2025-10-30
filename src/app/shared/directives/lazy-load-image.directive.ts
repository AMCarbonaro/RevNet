import { Directive, ElementRef, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNDA0NDRCIi8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjNzI3NjdEIi8+Cjwvc3ZnPgo=';
  
  private observer?: IntersectionObserver;
  private loaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupLazyLoading(): void {
    // Set placeholder initially
    this.el.nativeElement.src = this.placeholder;
    this.el.nativeElement.style.opacity = '0.5';
    this.el.nativeElement.style.transition = 'opacity 0.3s ease';

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.loaded) {
              this.loadImage();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before the image comes into view
          threshold: 0.1
        }
      );

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }

  private loadImage(): void {
    if (this.loaded || !this.appLazyLoad) return;

    const img = new Image();
    img.onload = () => {
      this.el.nativeElement.src = this.appLazyLoad;
      this.el.nativeElement.style.opacity = '1';
      this.loaded = true;
      this.cdr.markForCheck();
    };

    img.onerror = () => {
      // Keep placeholder on error
      this.el.nativeElement.style.opacity = '1';
      this.loaded = true;
      this.cdr.markForCheck();
    };

    img.src = this.appLazyLoad;
  }
}
